import readline from 'readline';

import { createGreeting, isEmptyArr, isNegOne, existsInArr, deepCopy, inRangeInclusive } from './fp-utility';
import { emptyList, enterNewItem, readAboutApp, errorReadingState, makeMenuSelection, 
	cantMarkOrReviewBecauseNoItems, notMarkableOrReviewable, skippingReview, doneFocusing, 
	cantFocus, wantToHideCompleted, noHideableFound, confirmHiding, nothingToSave, listHeader, byeMessage, fence, menuHeader } from './af-strings';
import { createBlankData, IAppData, stringifyList, genNextID, addItem, createNewItem, IItem, 
	TAppState, Tindex, isMarkableList, markFirstMarkableIfPossible, isReviewableList, 
	getFirstReviewableIndex, inBounds, dotIndex, getStatusByIndex, getTextByIndex, getCMWTDstring, 
	hasFocusableList, getCMWTDindex, markCMWTDindexComplete, duplicateLastDoneandAddToList, 
	hasHideableItems, hideAllCompletedInAppData, UNSET_LASTDONE, hideAllCompleted, countHidden, hasAllHidden, showAllCompletedInAppData, toggleHideAllInAppData } from '.';

import { exit } from 'process';
import { returnJSONblogFromFile } from './af-load';
import { serializeAppDataToCSV } from './af-save';
// import { logJSONitem } from './af-debug';

export const returnAppDataBackToMenu = (appData: IAppData): IAppData =>
	({ currentState: 'menu',
	myList: appData.myList,
	lastDone: appData.lastDone });

export const printList = (nameTexts: string[]): void =>
	nameTexts.forEach(x => console.log(x));

export const printEmptyList = (): void =>
	console.log(emptyList);

export const printListOrStatus = (xs: string[]): void =>
	isEmptyArr(xs)
		? printEmptyList()
		: printList(xs);

const greetIO = (): void =>
	console.log(createGreeting('Welcome to')('FP AutoFocus!'));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// export const getNameIO = () =>
// 	new Promise<string>((resolve) => {
// 		rl.question('hi, what's your name?', (name: string) => { resolve(name)})
// 	});

export const askOpenEndedIO = (q: string) =>
	new Promise<string>((resolve) => {
		rl.question(q, (answer: string) => { resolve(answer)})
	});

// ISSUE: Dev implements fluture implementation instead of Promise based #16
// export const askOptionalIO = (q: string) =>
// 	new Promise<string>((resolve) => {
// 		rl.question(q, (answer: string) => { 
// 			answer.toLowerCase() === 'q'
// 				? resolve('q')
// 				: resolve(answer)	
// 		})
// 	});

const askOptionalYNio = (question: string): Promise<string> =>
	new Promise<string>((resolve) => {
		rl.question(question, (answer: string) => { 
			answer.toLowerCase() === 'q'
				? resolve('q')
				: answer.toLowerCase() === 'y'
					? resolve('y')
					: answer.toLowerCase() === 'n'
						? resolve('n')
						: resolve(askOptionalYNio(question));
		})
	});

const printMenuItemAtIndex = (x: TAppState) => (i: Tindex): void =>
	console.log(`${i+1}: ${x}`)

export const printMenu = (menuList: TAppState[]) => (menuTexts: any): (() => void) =>
	() => (console.log(menuHeader),
	menuList.map(x => menuTexts[x]).forEach((x, i) => printMenuItemAtIndex(x)(i)));

// note: this function can stay in console.ts for now,
// as it doesn't seem to be used elsewhere.
const createNumRangePrompt = (a: number) => (b: number): string =>
	`Please choose a number from ${a} to ${b}: `;

// queries user for a number between `first` and `last` (inclusive)
export const getNumberFromUser = (first: number) => (last: number): Promise<number> =>
	new Promise<number>((resolve) => {
		rl.question(createNumRangePrompt(first)(last), (num: string) => {
			inRangeInclusive(first)(last)(Number(num))
				? resolve(Number(num))
				: resolve(getNumberFromUser(first)(last));
		})
	});

// export const printBlankLine = (): void =>
// 	console.log();

////////////////////////////////////////////
// STATE TRANSITION LOGIC
////////////////////////////////////////////
export interface IOneToManyMap<T> {
	[key: string]: T[];
}

// APP STATES
// Map<TAppState, TAppState[]>
export const possibleStates: IOneToManyMap<TAppState> = {
	'menu': ['see', 'add', 'mark', 'do', 'hide', 'save', 'load', 'read-about'],
	'see': ['menu'],
	'add': ['menu'],
	'mark': ['menu'],
	'do': ['menu'],
	'hide': ['menu'],
	'save': ['menu'],
	'load': ['menu'],
	'read-about': ['menu'],
	'quit': []
}

// APP STATES
// ISSUE: User can always see their to-do list #23
export const menuTexts: any = {
	'see':'View List',
	'add':'Add New To-Do',
	'mark':'Mark & Review List',
	'do':'Focus on To-Do',
	'hide': 'Toggle Hiding of Completed',
	'save': 'Save to CSV',
	'load': 'Load from CSV',
	'read-about':'Read About AutoFocus',
	'quit': 'Exit Program'
};

export const transitionalble = (current: TAppState) => (next: TAppState) => (states: any): boolean =>
	existsInArr(Object.keys(states))(current) && 
		existsInArr(possibleStates[current])(next);

export const changeState = (current: TAppState) => (next: TAppState): TAppState =>
	transitionalble(current)(next) ? next : current;

export const sayState = (state: TAppState): void =>
	console.log(`Current state is now: '${state}'.`);

// APP STATES
export const menuList: TAppState[] = 
	['see', 'add', 'mark', 'do', 'hide', 'save', 'load', 'read-about', 'quit'];

export const promptUserAtMenuToChangeState = 
	async (s: TAppState): Promise<TAppState> =>
	changeState(s)(menuList[await promptUserForMenuOption(menuList)]);

const promptUserForMenuOption = async (menuList: TAppState[]): Promise<number> =>
	(
		wrapPrintWithLines(printMenu(menuList)(menuTexts)),
		console.log(makeMenuSelection),
		await getNumberFromUser(1)(menuList.length) - 1 // printAndReturn() // LOG
	);

// CRITICAL
// ISSUE: Dev clarifies native API for item creation,
//    enforces strict usage of ~~combined~~ myList, ~~myArchive~~ count for ID generation #22
// TODO: implement ask first, return appData as is (for 'unhappy path') or
// 				appData with a new item appended
// TODO: implement with askOptional to cancel to-do input
// TODO: implement fallback return of empty array 'box' to signify nothing was created
export const createAndAddNewItemViaPromptIO = 
	async (appData: IAppData): Promise<IAppData> => ({
		currentState: 'menu',
		myList: addItem(appData.myList)(createNewItem(
			await askOpenEndedIO(enterNewItem)
			)(genNextID(appData))),
		lastDone: appData.lastDone
	});

const printFence = (): void =>
	console.log(fence);

// wrapper higher order function
const wrapPrintWithLines = (f: () => void): void =>
	(printFence(),
	f(),
	printFence());

const printListHeader = (): void =>
	console.log(listHeader);

const resolveSeeState = (arr: IItem[]): number =>
	(//console.log(`RESOLVING SEE STATE...`),
		printFence(),
		printListHeader(),
		printListOrStatus(stringifyList(arr)),
		//// smartLog('myList')(arr)(true), // UNCOMMENT TO LOG: VERY USEFUL
		0);

const resolveQuitState = (appData: IAppData): IAppData =>
	(console.log(byeMessage),
		// smartLogAll(appData), // TODO: COMMENT THIS OUT FOR APP PUBLISHING
		appData);

const resolveAddState = async (appData: IAppData): Promise<IAppData> =>
	await createAndAddNewItemViaPromptIO(appData);

export const generateWhichQuestion = (current: string) => (cmwtd: string) =>
	`Do you want to '${current}' more than '${cmwtd}'? [Y]es, [N]o, [Q]uit: `;

// i === index
const askWhich = (arr: IItem[]) => async (i: Tindex): Promise<string> =>
	await askOptionalYNio(
		generateWhichQuestion(getTextByIndex(arr)(i))(getCMWTDstring(arr)));

// TODO: rename function to clarify intent & goal, such as 'answerCharToAnswerString'
const interpretWhich = (textInput: string): TAnswerState =>
	textInput.toLowerCase()  === 'q'
	? (//console.log('Quitting mid-review...'),
		'quit')
	: textInput.toLowerCase() === 'y'
		? (//console.log(`Answered 'yes': Dotting current index ...`),
			'yes')
		: textInput.toLowerCase() === 'n'
			? (//console.log(`Answered 'no': Returning back array...`),
			'no')
			:  (//console.log(`Error has occured, returning original array...`),
				 'error');

interface IListRepeater {
	willRepeat: boolean;
	arr: IItem[];
	lastDone: Tindex;
	currentIndex: Tindex;
}

export type TAnswerState = 'quit' | 'yes' | 'no' | 'skip' | 'error';

const calcWillRepeat = (a: TAnswerState) =>
	a === 'quit' || a ==='error' ? false : true;

const calcWillMark = (a: TAnswerState) =>
	a === 'yes';

// b === boolean conditional, i === index
// TODO: rename function to getNextIndexIf
const getNextIfTrue = (b: boolean) => (i: Tindex) =>
	b ? i + 1 : i;

// TODO: refactor spagetti code
// TODO: rename function to clarify function intent & goal
// TODO: add documentation to clarify inputs, or, better yet...
// BONUS: TODO: ... modify function to take in one input & give one output
// i === current index
const handleWhich = (arr: IItem[]) => (lastDone: Tindex) => (i: Tindex) =>
 (a: TAnswerState): IListRepeater =>
	(
		// (a === 'skip' ? console.log(`Skipping index ${i}...`) : doNothing()),
		(// console.log(`HANDLING...`),
			({willRepeat: calcWillRepeat(a),
				arr: calcWillMark(a)
					? (//console.log(`DOTTING...`),
						dotIndex(arr)(i))
					: arr,
				lastDone: lastDone,
				currentIndex: getNextIfTrue(calcWillRepeat(a))(i)
			})));

const repeatIf = async (x: IListRepeater): Promise<IItem[]> =>
	await commenceReview(x.arr)(x.lastDone)(x.currentIndex)(x.willRepeat);

// TODO: refactor spagetti code
// i === current index
const commenceReview = (arr: IItem[]) => (lastDone: Tindex) => 
	(i: Tindex) => async (willRepeat: boolean): Promise<IItem[]> =>
	(//smartLog('DUP ARRAY:')(arr)(true), // uncomment to see list state
	willRepeat && !isNegOne(i) && inBounds(arr)(i)
		? (//console.log(`Reading index ${i}... `),
			repeatIf(handleWhich(arr)(lastDone)(i)
				(getStatusByIndex(arr)(i) === 'complete'
					? 'skip' 
					: interpretWhich(await askWhich(arr)(i)))))
		: (//console.log(`Final array is ready to be returned:`),
				//console.table(arr),
				arr));
	
const reviewIfPossible = (arr: IItem[]) => async (lastDone: Tindex): Promise<IItem[]> =>
	isReviewableList(arr)(lastDone)
		? (//console.log(`Commencing review from index ${getFirstReviewableIndex(arr)(lastDone)}...`),
			await commenceReview(deepCopy(arr))(lastDone)(getFirstReviewableIndex(arr)(lastDone))(true))
		: (console.log(skippingReview),
			arr);

const resolveMarkStateAndReviewState = async (appData: IAppData): Promise<IAppData> => {
	if( appData.myList.length === 0) {
		console.log(cantMarkOrReviewBecauseNoItems);
		returnAppDataBackToMenu(appData)
	};

	const markable = isMarkableList(appData.myList)(appData.lastDone);
	
	// TODO: refactor to not use access mutation assignment, rather, return new appData object
	appData.myList = markFirstMarkableIfPossible(appData.myList)(appData.lastDone);

	const reviewableAfterAutoMark = isReviewableList(appData.myList)(appData.lastDone);

	// if not markable from the start of attemting to resolve
	// and also not reviewable even after attempting to automark
	// say so
	!markable && !reviewableAfterAutoMark &&
			console.log(notMarkableOrReviewable);

	return reviewableAfterAutoMark
	? ({currentState: 'menu',
		myList: await reviewIfPossible(appData.myList)(appData.lastDone),
		lastDone: appData.lastDone})
	: returnAppDataBackToMenu(appData);
}

// CRITICAL: TODO: add IO suffix to signal this function requires user interaction/input
const promptUserForAnyKey = async () =>
	askOpenEndedIO(doneFocusing);

// CRITICAL: TODO: add IO suffix to signal this function requires user interaction/input
const displayCMWTDandWaitForUser = async (appData: IAppData): Promise<IAppData> =>
	(await promptUserForAnyKey(),
	// TODO: implement 'do you have work remaining on this task? (y/n)'
	//   follow-up question to quick-create a new item
	{currentState: 'menu',
		lastDone: getCMWTDindex(appData.myList), // uses (soon-to-be) old CMWTD as the new last done 
		myList: markCMWTDindexComplete(appData)
	});

// TODO: assess whether this is a 'leaky abstraction' (?) in the
//    sense of whether this is needed only for console, testing, or core, & rescope accordingly
export type TValidAnswer = 'y' | 'n' | 'q';

// s === item textName string
const queryIsWorkLeftIO = async (itemText: string): Promise<string> =>
	askOptionalYNio(`Is there work remaining to do on item '${itemText}'? [Y]es/[N]o `);


const enterFocusStateIO = async (appData: IAppData): Promise<IAppData> => {
	const focusResult = await displayCMWTDandWaitForUser(appData);
	const answer = queryIsWorkLeftIO(getTextByIndex(focusResult.myList)(focusResult.lastDone));
	return (await answer).toLowerCase() === 'y'
		? (focusResult.myList = duplicateLastDoneandAddToList(focusResult.myList)(focusResult.lastDone), focusResult)
		: focusResult;
}

const resolveFocusState = async (appData: IAppData): Promise<IAppData> =>
	// console.log(`This is a stub for Focus Mode...`); 
	hasFocusableList(appData)
		? (console.clear(),
			console.log(`Focusing on '${getCMWTDstring(appData.myList)}'...`),
			enterFocusStateIO(appData)
		 )
		: (console.log(cantFocus),
			returnAppDataBackToMenu(appData));

const resolveReadAboutState = (): number =>
	(console.log(readAboutApp), 0); // TODO: implement stub

const resolveNonMutatingErrorState = (): number =>
	(console.log(errorReadingState), -1)

// https://hackernoon.com/rethinking-javascript-eliminate-the-switch-statement-for-better-code-5c81c044716d
// TODO: refactor with switchcaseF
const enterNonMutatingState = (appData: IAppData): number =>
	appData.currentState === 'see'
		// TODO: make clear to user that list has been split into hidden and visible
		? resolveSeeState(appData.myList) // .filter(x => !x.isHidden)
		: appData.currentState === 'read-about'
			? resolveReadAboutState()
			: resolveNonMutatingErrorState();

const resolveMutatingErrorState = (appData: IAppData): IAppData =>
	(console.log(enterMutatingState),
	returnAppDataBackToMenu(appData))

const resolveMenuState = async (appData: IAppData): Promise<IAppData> =>
	({ currentState: await promptUserAtMenuToChangeState(appData.currentState),
		myList: appData.myList,
		lastDone: appData.lastDone });

// OLD ALGORITHM
// 1. see if there are any hide-able (completed, non-hidden) items
// 2. if yes to 1, give the user a choice: 'Do you want to hide completed items?'
// NEW ALGORITHM
// 1. see if there are any hide-able (non-hidden, completed) items
// 2. if yes to 1, hide all hide-able items (all completed items)
// 3. if no to 1 because all items are hidden, show all hide-able items (all completed items)
// 3. if no to 1 because there are no hide-able items, say that there are no hideable items 
const resolveToggleHideState = (appData: IAppData): IAppData =>
	toggleHideAllInAppData(appData);
	// hasHideableItems(appData.myList)
	// 	? hideAllCompletedInAppData(appData)
	// 	: hasAllHidden(appData)
	// 		? showAllCompletedInAppData(appData)
	// 		: (console.log(noHideableFound),
	// 			returnAppDataBackToMenu(appData));

const appIsSaveable = (appData: IAppData): boolean =>
	appData.myList.length > 0;

const resolveSaveState = async (appData: IAppData): Promise<IAppData> =>
	!appIsSaveable(appData)
		? (console.log(nothingToSave),
			returnAppDataBackToMenu(appData))
		: (console.log(`Saving ${appData.myList.length} item(s) to local directory...`),
			serializeAppDataToCSV(appData),
			returnAppDataBackToMenu(appData)
		);

const itemifyJSONitem = (x: any) => (
	// logJSONitem(x),
	({
		id: Number(x.id),
		status: x.status,
		textName: x.textName,
		isHidden: Number(x.isHidden)
	}));

// TODO: confirm that blank data is loaded when there are any issues
//   loading (load data is bad or missing)
const resolveLoadState = async (appData: IAppData): Promise<IAppData> =>
	(// console.log(`Loading...`),
		({currentState: 'menu',
			myList: (await returnJSONblogFromFile('save.csv')).map(x => itemifyJSONitem(x)),
			lastDone: UNSET_LASTDONE }));

const enterMutatingState = async (appData: IAppData): Promise<IAppData> =>
	appData.currentState === 'menu'
		? resolveMenuState(appData)
		: appData.currentState === 'add'
			? resolveAddState(appData)
			: appData.currentState === 'mark'
				? resolveMarkStateAndReviewState(appData)
				: appData.currentState === 'do'
					? resolveFocusState(appData)
					: appData.currentState === 'hide'
						? resolveToggleHideState(appData)
						: appData.currentState === 'save'
							? resolveSaveState(appData)
							: appData.currentState === 'load'
								? resolveLoadState(appData)
								: resolveMutatingErrorState(appData);

// APP STATES
const mutatorStates: TAppState[] = ['menu', 'add', 'mark', 'do', 'hide', 'save', 'load']; // 

// s === state, mss === mutator states
const stateIsMutator = (s: TAppState) => (mss: TAppState[]) =>
	!isNegOne(mss.indexOf(s));

const wrapNonMutatingStateEntry = (appData: IAppData): IAppData =>
	(enterNonMutatingState(appData),
	returnAppDataBackToMenu(appData))

const enterMenu = async (appData: IAppData): Promise<IAppData> =>
	appData.currentState === 'quit'
		? resolveQuitState(appData)
		: enterMenu(
			stateIsMutator(appData.currentState)(mutatorStates)
				? await enterMutatingState(appData)
				: wrapNonMutatingStateEntry(appData));

const runProgram = (running: boolean) => 
	async (appData: IAppData): Promise<IAppData> =>
	running === false ? appData : await enterMenu(appData) // display menu choices

export const main = async () => {
	console.clear();
	greetIO();
	await runProgram(true)(createBlankData());
	// await runProgram(true)(createDemoData());
	//// await runProgram(true)(createLongE2Edata());
	exit(0);
}

main();