const readline = require('readline')

import { createGreeting, isEmptyArr, isNegOne, existsInArr, deepCopy } from "./fp-utility";
import { emptyList, enterNewItem, readAboutApp, errorReadingState, makeMenuSelection, cantMarkOrReviewBecauseNoItems, notMarkableOrReviewable, skippingReview, doneFocusing, cantFocus, wantToHideCompleted } from "./af-strings";
import { createBlankData, IAppData, stringifyList, genNextID, addItem, createNewItem, IItem, TAppState, Tindex, isMarkableList, markFirstMarkableIfPossible, isReviewableList, getFirstReviewableIndex, inBounds, dotIndex, getStatusByIndex, getTextByIndex, getCMWTDstring, isFocusableList, getCMWTDindex, markCMWTDindexComplete, duplicateLastDoneandAddToList, hasHideableItems, moveHiddenToArchive, hideAllCompletedInAppData } from ".";

// import { exit } from 'process';

export const returnAppDataBackToMenu = (appData: IAppData): IAppData =>
	({ currentState: 'menu',
	myList: appData.myList,
	myArchive: appData.myArchive,
	lastDone: appData.lastDone });

// https://stackoverflow.com/questions/57086672/element-implicitly-has-an-any-type-because-expression-of-type-string-cant-b
// export const getKeyValue = <U extends keyof T, T extends object>(key: U) => (obj: T) =>
// 	obj[key];

// note: not currently (RAM) safe for arrays
// export const head = (xs: IItem[]): IItem[] =>
// 	xs.length === 0
// 	? []
// 	: [xs[0]];

// export const tail = (xs: IItem[]): IItem[] =>
// 	xs.length === 0
// 		? []
// 		: [xs[xs.length - 1]];

// a kind of pretty print
// , ${i.isHidden ? 'hidden' : 'not hidden'}
// const stringifyVerbose = (i: IItem): string =>
// 	`Item: '${i.textName}', status: ${i.status}`;



// TODO: relocate to console.ts
export const printList = (nameTexts: string[]): void =>
	nameTexts.forEach(x => console.log(x));

// TODO: relocate to console.ts
export const printEmptyList = (): void =>
	console.log(emptyList);

// TODO: relocate to console.ts
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
// 		rl.question("hi, what's your name?", (name: string) => { resolve(name)})
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

const askOptionalYNio = (q: string): Promise<string> =>
	new Promise<string>((resolve) => {
		rl.question(q, (answer: string) => { 
			answer.toLowerCase() === 'q'
				? resolve('q')
				: answer.toLowerCase() === 'y'
					? resolve('y')
					: answer.toLowerCase() === 'n'
						? resolve('n')
						: resolve(askOptionalYNio(q));
		})
	});

const printMenuItem = (x: TAppState) => (i: Tindex): void =>
	console.log(`${i+1}: ${x}`)

const printMenuHeader = (): void =>
	console.log('MAIN MENU');

export const printMenu = (menuList: TAppState[]) => (menuTexts: any): (() => void) =>
	() => (printMenuHeader(),
	menuList.map(x => menuTexts[x]).forEach((x, i) => printMenuItem(x)(i)));

const inRangeInclusive = (lower: number) => (upper: number) => (x: number): boolean =>
	x >= lower && x <= upper

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

export interface IOneToManyMap<T> {
	[key: string]: T[];
}

// Map<TAppState, TAppState[]>
export const possibleStates: IOneToManyMap<TAppState> = {
	'menu': ['see', 'add', 'mark', 'do', 'hide', 'read-about'],
	'see': ['menu'],
	'add': ['menu'],
	'mark': ['menu'],
	'do': ['menu'],
	'hide': ['menu'],
	'read-about': ['menu'],
	'quit': []
}

// ISSUE: User can always see their to-do list #23
export const menuTexts: any = {
	'see':'View List',
	'add':'Add New To-Do',
	'mark':'Mark & Review List',
	'do':'Focus on To-Do',
	'hide': 'Hide Completed',
	'read-about':'Read About AutoFocus',
	'quit': 'Exit Program'
};


// STATE TRANSITION LOGIC
export const transitionalble = (current: TAppState) => (next: TAppState) => (states: any): boolean =>
	existsInArr(Object.keys(states))(current) && 
		existsInArr(possibleStates[current])(next);

export const changeState = (current: TAppState) => (next: TAppState): TAppState =>
	transitionalble(current)(next) ? next : current;

export const sayState = (state: TAppState): void =>
	console.log(`Current state is now: '${state}'.`);

export const menuList: TAppState[] = 
	['see', 'add', 'mark', 'do', 'hide', 'read-about', 'quit'];

export const promptUserAtMenuToChangeState = 
	async (s: TAppState): Promise<TAppState> =>
	changeState(s)(menuList[await promptUserForMenuOption(menuList)]);

// TODO: add IO suffix to function name
const promptUserToHide = async (): Promise<boolean> => 
	(await askOptionalYNio(wantToHideCompleted))
		.toLowerCase() === 'y';

const promptUserForMenuOption = async (menuList: TAppState[]): Promise<number> =>
	(
		wrapPrintWithLines(printMenu(menuList)(menuTexts)),
		console.log(makeMenuSelection),
		await getNumberFromUser(1)(menuList.length) - 1 // printAndReturn() // LOG
	);

// CRITICAL
// ISSUE: Dev clarifies native API for item creation,
//    enforces strict usage of combined myList, myArchive count for ID generation #22
// TODO: implement ask first, return appData as is (for "unhappy path") or
// 				appData with a new item appended
// TODO: implement with askOptional to cancel to-do input
// TODO: implement fallback return of empty array "box" to signify nothing was created
export const createAndAddNewItemViaPromptIO = 
	async (appData: IAppData): Promise<IAppData> => ({
		currentState: 'menu',
		myList: addItem(appData.myList)(createNewItem(
			await askOpenEndedIO(enterNewItem)
			)(genNextID(appData))),
		myArchive: appData.myArchive,
		lastDone: appData.lastDone
	});

// const logGet1stUnmarkedAfter = (arr: IItem[]) => (i: Tindex): void =>
// 	(
// 		console.log(`   Getting first unmarked index after index ${i}`
// 			+ ` where ARRAY LEN is ${arr.length}...`),
// 		console.log(`... it appears to be `
// 			+ `${mapUnmarkedToIDAndFilter(arr).filter(x => x > i)[0]}`)
// 	);

// ISSUE: Dev replaces custom prints with `smartLog()()()` #25
// const printIsMarkableList = (arr: IItem[]) => (lastDone: Tindex): void =>
// 	console.log(`It is ${boolToTFstring(isMarkableList(arr)(lastDone))} that this is a markable list.`)

// ISSUE: Dev replaces custom prints with `smartLog()()()` #25
// const printMarkedCount = (arr: IItem[]): void =>
// 	console.log(`The # of marked items is now ${countMarked(arr)}`)

// ISSUE: Dev replaces custom prints with `smartLog()()()` #25
// export const printStatsBlock = (arr: IItem[]) => (lastDone: Tindex) => {
// 	printIsMarkableList(arr)(lastDone);
// 	printCMWTDdata(arr);
// 	printMarkedCount(arr)
// }

// ISSUE: Dev replaces custom prints with `smartLog()()()` #25
// const printCMWTDdata = (arr: IItem[]): void =>
// 	isNegOne(getCMWTDindex(arr))
// 		? console.log(`CMWTD is not set yet.`)
// 		: console.log(`CMWTD is, at index ${getCMWTDindex(arr)}: '${getCMWTDstring(arr)}'`)

const printFence = (): void =>
	console.log(`----------`);

// wrapper higher order function
const wrapPrintWithLines = (f: () => void): void =>
	(printFence(),
	f(),
	printFence());


// TODO: move string literals to top of program
const printListHeader = (): void =>
	console.log('AUTOFOCUS LIST');

const resolveSeeState = (arr: IItem[]): number =>
	(//console.log(`RESOLVING SEE STATE...`),
		printFence(),
		printListHeader(),
		printListOrStatus(stringifyList(arr)),
		//// smartLog("myList")(arr)(true), // UNCOMMENT TO LOG: VERY USEFUL
		0);

const resolveQuitState = (appData: IAppData): IAppData =>
	(console.log(`See you!`),
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

// TODO: rename function to clarify intent & goal, such as "answerCharToAnswerString"
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

// TODO: refactor to note use state mutation
// TODO: refactor to not use forloop and instead use fp
// export const SIMcommenceReview = (arr: IItem[]) => (lastDone: Tindex) => (answerAbbrevs: TValidAnswer[]): IItem[] => {
// 	let answerIndex = 0;
// 	let doneReviewing = false;
// 	for(let i = getFirstReviewableIndex(arr)(lastDone);
// 		i < arr.length && !isNegOne(i) && inBounds(arr)(i) && !doneReviewing; i++ ) {
// 		// console.log(`Reviewing index ${i}...`)
// 		doneReviewing = answerAbbrevs[answerIndex] === 'q';
// 		doneReviewing
// 			? (// console.log(`Quitting review early...`),
// 				doNothing())
// 			: isComplete(arr[i])
// 				? (// console.log(`Skipping completed item at index ${i}`),
// 					doNothing())
// 				: !doneReviewing && answerAbbrevs[answerIndex] === 'y'
// 					? (//console.log(`Marking item at index ${i} because YES answer`),
// 						(arr = dotIndex(arr)(i)), // WARNING: state mutation
// 						answerIndex++)
// 					: (//console.log(`Skipping item at index ${i} because NO answer`),
// 						answerIndex++)
// 	}
// 	return arr;
// }



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
		myArchive: appData.myArchive,
		lastDone: appData.lastDone})
	: returnAppDataBackToMenu(appData);
}

// CRITICAL: TODO: add IO suffix to signal this function requires user interaction/input
const promptUserForAnyKey = async () =>
	askOpenEndedIO(doneFocusing);

// CRITICAL: TODO: add IO suffix to signal this function requires user interaction/input
const displayCMWTDandWaitForUser = async (appData: IAppData): Promise<IAppData> =>
	(await promptUserForAnyKey(),
	// TODO: implement "do you have work remaining on this task? (y/n)"
	//   follow-up question to quick-create a new item
	{currentState: 'menu',
		lastDone: getCMWTDindex(appData.myList), // uses (soon-to-be) old CMWTD as the new last done 
		myList: markCMWTDindexComplete(appData),
		myArchive: appData.myArchive
	});

// export type TValidAnswer = 'y' | 'n' | 'q';

// "reviewByNumbers", modeled after reviewIfPossible function
// export const markByAnswerList = (arr: IItem[]) => (lastDone: Tindex) => (answerAbbrevs: TValidAnswer[]): IItem[] =>
// 	isReviewableList(arr)(lastDone)
// 	? (//console.log(`Commencing review from index ${getFirstReviewableIndex(arr)(lastDone)}...`),
// 		SIMcommenceReview(deepCopy(arr))(lastDone)(answerAbbrevs))
// 	: (console.log(skippingReview),
// 		arr);

// export const SIMenterMarkAndReviewState = (appData: IAppData) =>
// 	(answers: TValidAnswer[]): IAppData => {

// 	const markable = isMarkableList(appData.myList)(appData.lastDone);
	
// 	// smartLog("isMarkable")(markable)(false);
// 	// TODO: refactor to return appData in its entirety
// 	//   instead of using the assignment operator to mutate
// 	appData.myList = markFirstMarkableIfPossible(appData.myList)(appData.lastDone);
// 	// smartLog("isReviewable")(reviewable)(false);

// 	const reviewableAfterAutoMark = isReviewableList(appData.myList)(appData.lastDone);

// 	// if not markable from the start of attemting to resolve
// 	// and also not reviewable even after attempting to automark
// 	// say so
// 	!markable && !reviewableAfterAutoMark &&
// 			console.log(notMarkableOrReviewable);

// 	return reviewableAfterAutoMark
// 		? ({currentState: 'menu',
// 		myList: markByAnswerList(appData.myList)(appData.lastDone)(answers),
// 		myArchive: appData.myArchive,
// 		lastDone: appData.lastDone})
// 		: returnAppDataBackToMenu(appData);
// 		// TODO: confirm last branch activates, and prevents erroneous
// 		// data modification / mutation
// 	};

// CRITICAL: TODO: add IO suffix to signal this function requires user interaction/input
// s === item textName string
const queryUserIsThereMoreWorkLeft = async (itemText: string): Promise<string> =>
	askOptionalYNio(`Is there work remaining to do on item '${itemText}'? [Y]es/[N]o `);

// CRITICAL: TODO: add IO suffix to signal this function requires user interaction/input
const enterFocusState = async (appData: IAppData): Promise<IAppData> => {
	const focusResult = await displayCMWTDandWaitForUser(appData);
	const answer = queryUserIsThereMoreWorkLeft(getTextByIndex(focusResult.myList)(focusResult.lastDone));
	return (await answer).toLowerCase() === 'y'
		? (focusResult.myList = duplicateLastDoneandAddToList(focusResult.myList)(focusResult.lastDone), focusResult)
		: focusResult;
}

// should only return IItem[] and lastDone
const resolveDoState = async (appData: IAppData): Promise<IAppData> =>
	// console.log(`This is a stub for Focus Mode...`); 
	isFocusableList(appData)
		? (console.clear(),
			console.log(`Focusing on '${getCMWTDstring(appData.myList)}'...`),
			enterFocusState(appData)
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
		? resolveSeeState(appData.myList.filter(x => !x.isHidden))
		: appData.currentState === 'read-about'
			? resolveReadAboutState()
			: resolveNonMutatingErrorState();

const resolveMutatingErrorState = (appData: IAppData): IAppData =>
	(console.log(enterMutatingState),
	returnAppDataBackToMenu(appData))

const resolveMenuState = async (appData: IAppData): Promise<IAppData> =>
	({ currentState: await promptUserAtMenuToChangeState(appData.currentState),
		myList: appData.myList,
		myArchive: appData.myArchive,
		lastDone: appData.lastDone });

// 1. see if there are any hide-able (completed, non-hidden) items
// 2. if yes to 1, give the user a choice: "Do you want to hide completed items?"
const resolveHideAndArchiveState = async (appData: IAppData): Promise<IAppData> =>
	!hasHideableItems(appData.myList)
	? (console.log(`No hideable items found. First, focus on items to complete them.`),
		returnAppDataBackToMenu(appData))
	: await promptUserToHide()
		? (console.log(`Hiding hideable items...`),
			moveHiddenToArchive(hideAllCompletedInAppData(appData)))
		: (//console.log(`Deciding not to hide...`),
			returnAppDataBackToMenu(appData));

const enterMutatingState = async (appData: IAppData): Promise<IAppData> =>
	appData.currentState === 'menu'
		? resolveMenuState(appData)
		: appData.currentState === 'add'
			? resolveAddState(appData)
			: appData.currentState === 'mark'
				? resolveMarkStateAndReviewState(appData)
				: appData.currentState === 'do'
					? resolveDoState(appData)
					: appData.currentState === 'hide'
						? resolveHideAndArchiveState(appData)
						: resolveMutatingErrorState(appData);

const mutatorStates: TAppState[] = ['menu', 'add', 'mark', 'do', 'hide'];

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
	//// await runProgram(true)(createDemoData());
	//// await runProgram(true)(createLongE2Edata());
	// exit(0);
}

main();