"use strict";

const readline = require('readline')

import { exit } from 'process';

export type TItemStatus =  'unmarked' | 'dotted' | 'complete';

const doneFocusing = 'Once you have finished focusing on this task, tap the enter key.';
const skippingReview = `Skipping review (list is not reviewable)...`;
const emptyList = "There are no items in your to-do list.";
const makeMenuSelection = `Please make a menu selection.`;
const automarkingFirstMarkable = `Auto-marking first markable item...`;
const cantAutomark = `Unable to auto-mark. Returning list as is...`;
const cantFocus = `Cannot focus at this time, mark (dot) an item first.`;
const readAboutApp = `This is a stub for About AutoFocus...`;
const errorReadingState = `It appears there was an error reading state...`;
const errorMutatingState = `It appears there was an error mutating state...`;
const setupDemoData = `Setting up starting demo data...`;
const demoDataComplete = `... demo data setup is complete.`;

const marks = {
	unmarked: ' ',
	dotted: 'o',
	complete: 'x'
};

export type IItem = {
	index: number,
	status: TItemStatus,
	textName: string,
	isHidden: boolean
	//created: Date,
	//dottedOn: Date,
	//completedOn: Date,
	//hiddenOn: Date
}

export interface IAppData {
	currentState: TAppState,
	myList: IItem[],
	lastDone: number
}

export type TAppState = 'menu' | 'see' | 'add' | 'mark' | 'do' | 'hide' | 'read-about' | 'quit';

const pushToAndReturnArr = <T>(arr: T[]) => (newItem: T): T[] =>
	(arr.push(newItem),
	// console.log(`New item added successfully!`),
	arr);

export const addItem = (arr: IItem[]) => (newItem: IItem) =>
	(//console.log(`Adding new item '${newItem.textName}' to list...`),
	pushToAndReturnArr(arr)(newItem));

export const createNewItem = (nameInput: string) => (nextIndex: number): IItem =>
	(//console.log(`New item '${s}' successfully created`),
	{index: nextIndex, status: 'unmarked', textName: nameInput, isHidden: false}); // isHidden: false

// a kind of pretty print
const stringifyVerbose = (i: IItem): string =>
	`Item: '${i.textName}', status: ${i.status}` // , ${i.isHidden ? 'hidden' : 'not hidden'}

const dotItem = (i: IItem): IItem =>
	({index: i.index, status: 'dotted', textName: i.textName, isHidden: i.isHidden})

const completeItem = (i: IItem): IItem =>
	({index: i.index, status: 'complete', textName: i.textName, isHidden: i.isHidden})

export const statusToMark = (x: TItemStatus): string =>
	`${marks[x]}`

// another kind of pretty print
const stringifyConcise = (i: IItem): string =>
	`[${marks[i.status]}] ${i.textName}`

const demoList: string[] = ['make coffee',
	'go for jog', 'watch The Incredibles'];

// fixed a pesky bug here where createNewItem took a static
// demoList.length, rather than index i
export const populateDemoList = (arr: IItem[]): IItem[] =>
	demoList.map((x, i) => createNewItem(x)(i))

export const stringifyList = (xs: IItem[]): string[] =>
	xs.map(x => stringifyConcise(x)) // stringifyVerbose(x)

const isEmptyArr = <T>(arr: T[]): boolean =>
	arr.length === 0;

export const printList = (nameTexts: string[]): void =>
	nameTexts.forEach(x => console.log(x));

export const printEmptyList = () =>
	console.log(emptyList);

export const printListOrStatus = (xs: string[]): void =>
	isEmptyArr(xs) ? printEmptyList() : printList(xs);

export const createGreeting = (greeting: string) => (appName: string): string =>
	`${greeting} ${appName}`;

export const isPluralFromCount = (count: number): boolean =>
	count === 1 ? false : true;

export const getPluralS = (isPlural: boolean): string =>
	isPlural ? 's' : '';

const pluralizeIfNotZero = (word: string) => (count: number) =>
	`${word}${getPluralS(isPluralFromCount(count))}`

export const notEmptyString = (strInput: string): boolean =>
	strInput === "" ? false : true;

export const isNegOne = (n: number): boolean =>
	n === -1;

const isNeg = (n: number): boolean =>
	n < 0;

export const getPositiveMin = (x: number) => (y: number): number =>
  isNeg(x) && isNeg(y)
    ? -1
    : !isNeg(x) && isNeg(y)
			? x
			: isNeg(x) && !isNeg(y)
				? y
				: Math.min(x, y);

const greetIO = (): void =>
	console.log(createGreeting('Welcome to')('FP AutoFocus!'));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

export const getNameIO = () =>
	new Promise<string>((resolve) => {
		rl.question("hi, what's your name?", (name: string) => { resolve(name)})
	});

export const askOpenEndedIO = (q: string) =>
	new Promise<string>((resolve) => {
		rl.question(q, (answer: string) => { resolve(answer)})
	});

// TODO: refactor with fluture
export const askOptionalIO = (q: string) =>
	new Promise<string>((resolve) => {
		rl.question(q, (answer: string) => { 
			answer.toLowerCase() === 'q'
				? resolve('q')
				: resolve(answer)	
		})
	});

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

interface IOneToManyMap<T> {
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

export const menuTexts: any = {
	'see':'View List', // TODO: make list visible at all times for command line app
	'add':'Add New To-Do',
	'mark':'Review & Dot List',
	'do':'Focus on To-Do',
	'hide': 'Hide Completed',
	'read-about':'Read About AutoFocus',
	'quit': 'Exit Program'
};

export const menuList: TAppState[] = ['see', 'add', 'mark', 'do', 'hide', 'read-about', 'quit'];

const printMenuItem = (x: TAppState) => (i: number) =>
	console.log(`${i+1}: ${x}`)

const printMenuHeader = () =>
	(console.log(`----------`),
	console.log('MAIN MENU'));

export const printMenu = (menuList: TAppState[]) => (menuTexts: any): number =>
	(printMenuHeader(),
	menuList.map(x => menuTexts[x]).forEach((x, i) => printMenuItem(x)(i)),
	0)

const existsInArr = (arr: any) => (target: any) =>
	!isNegOne(arr.indexOf(target));

const transitionalble = (current: TAppState) => (next: TAppState) => (states: any) =>
	existsInArr(Object.keys(states))(current) && existsInArr(possibleStates[current])(next)

export const changeState = (current: TAppState) => (next: TAppState) =>
	transitionalble(current)(next) ? next : current;

export const sayState = (state: TAppState): void =>
	console.log(`Current state is now: '${state}'.`);

const inRangeInclusive = (lower: number) => (upper: number) => (x: number) =>
	x >= lower && x <= upper

// queries user for a number between `first` and `last` (inclusive)
export const getNumberFromUser = (first: number) => (last: number) =>
	new Promise<number>((resolve) => {
		rl.question(`Please choose a number from ${first} to ${last}: `, (num: string) => {
			inRangeInclusive(first)(last)(Number(num))
				? resolve(Number(num))
				: resolve(getNumberFromUser(first)(last));
		})
	});

export const printBlankLine = (): void =>
	console.log();

export const promptUserAtMenuToChangeState = 
	async (s: TAppState): Promise<TAppState> =>
	changeState(s)(menuList[await promptUserForMenuOption(menuList)]);

const promptUserToHide = async (): Promise<boolean> => 
	(await askOptionalYNio("Do you want to hide completed items?"))
		.toLowerCase() === 'y';

const promptUserForMenuOption = async (menuList: TAppState[]): Promise<number> =>
	(printMenu(menuList)(menuTexts),
	console.log(makeMenuSelection),
	await getNumberFromUser(1)(menuList.length) - 1);

// TODO: implement with askOptional to cancel to-do input
export const createAndAddNewItemViaPrompt = async (arr: IItem[]): Promise<IItem[]> =>
	addItem(arr)(createNewItem(
		await askOpenEndedIO(`Please enter a to-do item: `)
		)(arr.length));

const filterOnMarked = (arr: IItem[]) =>
	arr.filter(x => x.status === "dotted")

// TODO: refactor to not mutate state, and instead return a newly constructed array of items
const dotIndex = (arr: IItem[]) => (i: number): IItem[] =>
	arr.map((x, current) => (current === i
		? (// console.log(`Modifying item at index ${i} to be dotted...`),
			dotItem(x))
		: x ));

// arr === item list, i === index
const markComplete = (arr: IItem[]) => (i: number): IItem[] =>
	arr.map((x, current) => (current === i
		? (// console.log(`Modifying item at index ${i} to be complete...`),
			completeItem(x))
		: x ));

const filterOnUnmarked = (arr: IItem[]) =>
	arr.filter(x => x.status === "unmarked")

const hasUnmarked = (arr: IItem[]): boolean =>
	isPositive(filterOnUnmarked(arr).length);

const getLastIndexOf = (arr: IItem[]) => (s: TItemStatus): number =>
	arr.map(x => x.status).lastIndexOf(s);

// typically after index of lastDone but could be CMWTD index also
const listHasUnmarkedAfterIndex = (arr: IItem[]) => (i: number) =>
	getLastIndexOf(arr)("unmarked") > i;

const hasMarked = (arr: IItem[]): boolean =>
	isPositive(countMarked(arr))

// TODO: attempt to simplify this logic... it appears that lastDone is not necessary to evaluate
export const isMarkableList = (arr: IItem[]) => (lastDone: number): boolean =>
	isEmptyArr(arr) // array must have items in it
		? false
			: isNegOne(lastDone) && !hasMarked(arr) && hasUnmarked(arr) // there may not be any marked items already
				? true
				: isNegOne(lastDone) && hasMarked(arr)
					? false
					: !isNegOne(lastDone) && hasUnmarked(arr) && !hasMarked(arr) && listHasUnmarkedAfterIndex(arr)(lastDone) // there must be unmarked items AFTER last done
						? true
						: false;

const countUnmarked = (arr: IItem[]): number =>
	filterOnUnmarked(arr).length

const countMarked = (arr: IItem[]): number =>
	filterOnMarked(arr).length

export const mapUnmarkedToIndexAndFilter = (arr: IItem[]): number[] =>
	arr.filter(x => x.status === "unmarked").map(x => x.index)

// eg: lastDone is 1, unmarked are [2, 3], we want to return 2
export const getFirstUnmarkedAfterIndex = (arr: IItem[]) => (i: number): number =>
	arr.length < i + 1
		? (//console.log(`Out of bounds error...`),
			-1)
		: arr.length === i + 1
			? (//console.log(`Index is at the end of the array, returning not found...`),
				-1)
			: (//console.log(`   Getting first unmarked index after index ${i} where ARRAY LEN is ${arr.length}...`),
				//console.log(`... it appears to be ${mapUnmarkedToIndexAndFilter(arr).filter(x => x > i)[0]}`),
				mapUnmarkedToIndexAndFilter(arr).filter(x => x > i)[0]);

// if there are marked items and no lastDone (-1) OR
// lastDone is set (not -1) and there ar marked items after
// return -1 (not auto-markable)
export const findFirstMarkable = (arr: IItem[]) => (lastDone: number): number =>
	isEmptyArr(arr) || !hasUnmarked(arr)
		? (//console.log(`Empty array or no unmarked items, no markable items found.`),
			-1) // empty lists and lists without unmarked items have no auto-markable items
		: isNegOne(lastDone) && !hasMarked(arr)
			? (//console.log(`Auto-markable index FOUND at index zero.`),
				0) // lists with only unmarked items can return the first item as auto-markable
			: isNegOne(lastDone) && hasMarked(arr)
				? (//console.log(`List already marked and lastDone not set, leaving list as is...`),
				-1) // already marked lists with no lastDone cannot be auto-marked further
				: !isNegOne(lastDone) && !hasMarked(arr) && !isNegOne(getFirstUnmarkedAfterIndex(arr)(lastDone))
					? (//console.log(`First markable FOUND after lastDone.`),
						getFirstUnmarkedAfterIndex(arr)(lastDone))
					: (//console.log(`First markable not found...`),
						-1);

export const markFirstMarkableIfPossible = (arr: IItem[]) => (lastDone: number): IItem[] =>
	isMarkableList(arr)(lastDone)
		? (console.log(automarkingFirstMarkable),
			dotIndex(arr)(findFirstMarkable(arr)(lastDone)))
		: (// console.log(cantAutomark),
			arr);

const boolToTFstring = (b: boolean): string =>
	b ? 'TRUE' : 'FALSE';

const printIsMarkableList = (arr: IItem[]) => (lastDone: number): void =>
	console.log(`It is ${boolToTFstring(isMarkableList(arr)(lastDone))} that this is a markable list.`)

const printMarkedCount = (arr: IItem[]): void =>
	console.log(`The # of marked items is now ${countMarked(arr)}`)

export const printStatsBlock = (arr: IItem[]) => (lastDone: number) => {
	printIsMarkableList(arr)(lastDone);
	printCMWTDdata(arr);
	printMarkedCount(arr)
}

const isPositive = (n: number): boolean =>
	n > 0;

// a. there is at least one marked item
// b. there is at least one unmarked item after the last marked item
export const isReviewableList = (arr: IItem[]) => (lastDone: number): boolean =>
	hasMarked(arr) && (
		(//console.log(`... lastDone is undefined, and there ARE unmarked after CMWTD.`),
			isNegOne(lastDone) && listHasUnmarkedAfterIndex(arr)(getCMWTDindex(arr)))
		|| (//console.log(`... lastDone IS defined, and there ARE unmarked after CMWTD *and* lastDone.`),
			!isNegOne(lastDone) && (listHasUnmarkedAfterIndex(arr)(lastDone) && listHasUnmarkedAfterIndex(arr)(getCMWTDindex(arr))))
		|| (//console.log(`... lastDone IS defined, and there ARE unmarked after CMWTD *but NOT* after lastDone`),
			!isNegOne(lastDone) && (!listHasUnmarkedAfterIndex(arr)(lastDone) && listHasUnmarkedAfterIndex(arr)(getCMWTDindex(arr))))
		);

export const getFirstReviewableIndex = (arr: IItem[]) => (lastDone: number): number =>
	isEmptyArr(arr)
	? (//console.log(`Empty array, not reviewable...`),
		-1) // empty lists have no reviewable indecies
	: isNegOne(getCMWTDindex(arr))
		? (//console.log(`No CMWTD found, not reviewable...`),
			-1) // lists without a cmwtd cannot be reviewed
		: isNeg(lastDone) && !isNegOne(getFirstUnmarkedAfterIndex(arr)(getCMWTDindex(arr)))
			? getFirstUnmarkedAfterIndex(arr)(getCMWTDindex(arr)) // returns first unmarked after last marked
			: !isNeg(lastDone) && !isNegOne(getFirstUnmarkedAfterIndex(arr)(lastDone))
				? getFirstUnmarkedAfterIndex(arr)(lastDone)
				: !isNeg(lastDone) && !isNegOne(getFirstUnmarkedAfterIndex(arr)(getCMWTDindex(arr)))
					? (//console.log(`Resolves very unusual case "[o] [ ] [x] ready for review" ...`),
						getFirstUnmarkedAfterIndex(arr)(getCMWTDindex(arr))) // returns first unmarked after last marked
					: (//console.log(`First reviewable index not found...`),
					-1);

const generateWhichQuestion = (current: string) => (cmwtd: string) =>
	`Do you want to '${current}' more than '${cmwtd}'? [Y]es, [N]o, [Q]uit: `;

export const getCMWTDstring = (arr: IItem[]): string =>
	!isNegOne(getCMWTDindex(arr))
		? arr[getCMWTDindex(arr)].textName
		: "undefined";

// returns -1 if there is no CMWTD
export const getCMWTDindex = (arr: IItem[]): number =>
	isEmptyArr(arr)
		? -1
		: hasMarked(arr)
			? getLastIndexOf(arr)('dotted')
			: -1

const printCMWTDdata = (arr: IItem[]): void =>
	isNegOne(getCMWTDindex(arr))
		? console.log(`CMWTD is not set yet.`)
		: console.log(`CMWTD is, at index ${getCMWTDindex(arr)}: '${getCMWTDstring(arr)}'`)

// TODO: implement wrapper higher order function
// const wrapPrintWithLines = (f: () => void) => {
// 	console.log(`----------`);
// 	f();
// 	console.log(`----------`);
// }

const returnAppDataBackToMenu = (appData: IAppData): IAppData =>
	({ currentState: 'menu', myList: appData.myList, lastDone: appData.lastDone });

const printListHeader = () =>
	(console.log(`----------`),
	console.log('AUTOFOCUS LIST'));

const resolveSeeState = (arr: IItem[]): number =>
	(printListHeader(),
	printListOrStatus(stringifyList(arr)),
	0);

const resolveQuitState = (appData: IAppData): IAppData =>
	(console.log(`See you!`),
	appData);

// should only return IItem[], should only take arr, lastDone
const resolveAddState = async (appData: IAppData): Promise<IAppData> =>
	returnAppDataBackToMenu({currentState: appData.currentState,
		myList: await createAndAddNewItemViaPrompt(appData.myList),
		lastDone: appData.lastDone});

export const getStatusByIndex = (arr: IItem[]) => (i: number): string =>
		arr[i].status;

export const getTextByIndex = (arr: IItem[]) => (i: number): string =>
	(//console.log(`Accessing index ${i} of array of length ${arr.length}...`),
		arr[i].textName);

const deepCopy = <T>(x: T): T =>
	JSON.parse(JSON.stringify(x));

// s === string label
const printListData = (arr: IItem[]) => (labelText: string): void => {
	console.log()
	console.log(`${labelText}`)
	console.log(arr);
	console.log()
}

type TAnswerState = 'quit' | 'yes' | 'no' | 'skip' | 'error';

// i === index
const askWhich = (arr: IItem[]) => async (i: number): Promise<string> =>
	await askOptionalYNio(
		generateWhichQuestion(getTextByIndex(arr)(i))(getCMWTDstring(arr)));

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
	lastDone: number;
	currentIndex: number;
}

const calcWillRepeat = (a: TAnswerState) =>
	a === 'quit' || a ==='error' ? false : true;

const calcWillMark = (a: TAnswerState) =>
	a === 'yes';

// b === boolean conditional, i === index
const getNextIfTrue = (b: boolean) => (i: number) =>
	b ? i + 1 : i;

// i === current index
const handleWhich = (arr: IItem[]) => (lastDone: number) => (i: number) =>
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

const inBounds = (arr: IItem[]) => (i: number) =>
	i < arr.length;
		// LOGGING
		// ? (//console.log(`... still in bounds!`),
		// 	true)
		// : (//console.log(`... going out of bounds.`),
		// 	false);

const isComplete = (x: IItem) =>
	x.status === 'complete';

const doNothing = () => {};

// TODO: refactor to note use state mutation
// TODO: refactor to not use forloop and instead use fp
const SIMcommenceReview = (arr: IItem[]) => (lastDone: number) => (answerAbbrevs: TValidAnswer[]): IItem[] => {
	let answerIndex = 0;
	let doneReviewing = false;
	for(let i = getFirstReviewableIndex(arr)(lastDone);
		i < arr.length && !isNegOne(i) && inBounds(arr)(i) && !doneReviewing; i++ ) {
		// console.log(`Reviewing index ${i}...`)
		doneReviewing = answerAbbrevs[answerIndex] === 'q';
		doneReviewing
			? (// console.log(`Quitting review early...`),
				doNothing())
			: isComplete(arr[i])
				? (// console.log(`Skipping completed item at index ${i}`),
					doNothing())
				: !doneReviewing && answerAbbrevs[answerIndex] === 'y'
					? (//console.log(`Marking item at index ${i} because YES answer`),
						(arr = dotIndex(arr)(i)), // WARNING: state mutation
						answerIndex++)
					: (//console.log(`Skipping item at index ${i} because NO answer`),
						answerIndex++)
	}
	return arr;
}



// i === current index
const commenceReview = (arr: IItem[]) => (lastDone: number) => 
	(i: number) => async (willRepeat: boolean): Promise<IItem[]> =>
	// printListData(arr)('DUP ARRAY:'); // uncomment to see list state
	willRepeat && !isNegOne(i) && inBounds(arr)(i)
		? (//console.log(`Reading index ${i}... `),
			repeatIf(handleWhich(arr)(lastDone)(i)
				(getStatusByIndex(arr)(i) === 'complete'
					? 'skip' 
					: interpretWhich(await askWhich(arr)(i)))))
		: (//console.log(`Final array is ready to be returned:`),
				//console.table(arr),
				arr);
	
const reviewIfPossible = (arr: IItem[]) => async (lastDone: number): Promise<IItem[]> =>
	isReviewableList(arr)(lastDone)
		? (//console.log(`Commencing review from index ${getFirstReviewableIndex(arr)(lastDone)}...`),
			await commenceReview(deepCopy(arr))(lastDone)(getFirstReviewableIndex(arr)(lastDone))(true))
		: (console.log(skippingReview),
			arr);

// refactor to remove returnAppDataBackToMenu, new promise wrapping
// should only return IItem[], should only take arr, lastDone
const resolveMarkState = async (appData: IAppData): Promise<IAppData> =>
	({currentState: 'menu',
		myList: await reviewIfPossible(
				markFirstMarkableIfPossible(appData.myList)(appData.lastDone)
			)(appData.lastDone),
		lastDone: appData.lastDone});

const isFocusableList = (appData: IAppData): boolean =>
	!isNegOne(getCMWTDindex(appData.myList))

const promptUserForAnyKey = async () =>
	askOpenEndedIO(doneFocusing);

const markCMWTDindexComplete = (appData: IAppData): IItem[] =>
	(//console.log(`Marking as complete index ${getCMWTDindex(appData.myList)}...`),
	markComplete(appData.myList)(getCMWTDindex(appData.myList)))

const displayCMWTDandWaitForUser = async (appData: IAppData): Promise<IAppData> =>
	(await promptUserForAnyKey(),
	// TODO: implement "do you have work remaining on this task? (y/n)"
	//   follow-up question to quick-create a new item
	{currentState: 'menu',
		lastDone: getCMWTDindex(appData.myList), // uses (soon-to-be) old CMWTD as the new last done 
		myList: markCMWTDindexComplete(appData)}
	);

export type TValidAnswer = 'y' | 'n' | 'q';

// "reviewByNumbers", modeled after reviewIfPossible function
const markByAnswerList = (arr: IItem[]) => (lastDone: number) => (answerAbbrevs: TValidAnswer[]): IItem[] =>
	isReviewableList(arr)(lastDone)
	? (//console.log(`Commencing review from index ${getFirstReviewableIndex(arr)(lastDone)}...`),
		SIMcommenceReview(deepCopy(arr))(lastDone)(answerAbbrevs))
	: (console.log(skippingReview),
		arr);

export const SIMenterReviewState = (appData: IAppData) =>
	(answers: TValidAnswer[]): IAppData =>
	({currentState: 'menu',
	myList: markByAnswerList(appData.myList)(appData.lastDone)(answers),
	lastDone: appData.lastDone});

// if list is focusable, it will update the CMWTD item to be marked complete,
// and update lastDone to be the index of the (now former) CMWTD
// else, returns app data back as-is
export const SIMenterFocusState = (appData: IAppData): IAppData =>
	!isFocusableList(appData)
			? returnAppDataBackToMenu(appData)
			: ({currentState: 'menu',
					lastDone: getCMWTDindex(appData.myList), // uses (soon-to-be) former CMWTD as the new last done 
					myList: markCMWTDindexComplete(appData)});

// s === item textName string
const queryUserIsThereMoreWorkLeft = async (itemText: string): Promise<string> =>
	askOptionalYNio(`Is there work remaining to do on item '${itemText}'? [Y]es/[N]o `);

const duplicateLastDoneandAddToList = (arr: IItem[]) => (lastDone: number): IItem[] =>
	(arr.push(
		{ textName: arr[lastDone].textName, status: 'unmarked', index: arr.length, isHidden: false} ),
		arr);

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
		? resolveSeeState(appData.myList.filter(x => !x.isHidden))
		: appData.currentState === 'read-about'
			? resolveReadAboutState()
			: resolveNonMutatingErrorState();

const resolveMutatingErrorState = (appData: IAppData): IAppData =>
	(console.log(errorMutatingState),
	returnAppDataBackToMenu(appData))

const resolveMenuState = async (appData: IAppData): Promise<IAppData> =>
	({ currentState: await promptUserAtMenuToChangeState(appData.currentState),
		myList: appData.myList,
		lastDone: appData.lastDone });

const isHideable = (x: IItem): boolean =>
	x.status === 'complete' && x.isHidden === false;

const hasHideableItems = (xs: IItem[]): boolean =>
	xs
		.filter(x => isHideable(x))
		.length > 0;

export const countHideable = (xs: IItem[]): number =>
	xs
		.filter(x => isHideable(x))
		.length;
		
const hideItem = (i: IItem): IItem =>
	({index: i.index, status: i.status, textName: i.textName, isHidden: true});
		
export const hideAllCompleted = (xs: IItem[]): IItem[] => {
	// console.log(`BEFORE:`)
	xs = xs.map(x => !x.isHidden && x.status === 'complete'
		? hideItem(x)
		: x);
		// console.log(`AFTER:`)
	return xs;
}

const resetLastDone = (appData: IAppData): number => 
	(console.log(`Resetting lastDone....`),
	UNSET_LASTDONE);

// 1. see if there are any hide-able (completed, non-hidden) items
// 2. if yes to 1, give the user a choice: "Do you want to hide completed items?"
const resolveHideState = async (appData: IAppData): Promise<IAppData> =>
	!hasHideableItems(appData.myList)
	? (console.log(`No hideable items found. Focus on items to complete them first.`),
		returnAppDataBackToMenu(appData))
	: await promptUserToHide()
		? (//console.log(`Hiding hideable items...`),
			{ currentState: 'menu',
				myList: hideAllCompleted(appData.myList),
				lastDone: resetLastDone(appData) })
		: (//console.log(`Deciding not to hide...`),
			returnAppDataBackToMenu(appData));

// default: { currentState: 'menu', myList: arr, lastDone: lastDone }
// TODO: implement app stub
const enterMutatingState = async (appData: IAppData): Promise<IAppData> =>
	appData.currentState === 'menu'
		? resolveMenuState(appData)
		: appData.currentState === 'add'
			? resolveAddState(appData)
			: appData.currentState === 'mark'
				? resolveMarkState(appData)
					.then(x => returnAppDataBackToMenu(x))
				: appData.currentState === 'do'
					? resolveDoState(appData)
					: appData.currentState === 'hide'
						? resolveHideState(appData)
						: resolveMutatingErrorState(appData)

const mutatorStates: TAppState[] = ['menu', 'add', 'mark', 'do', 'hide'];

// s === state, mss === mutator states
const stateIsMutator = (s: TAppState) => (mss: TAppState[]) =>
	!isNegOne(mss.indexOf(s));

// TODO: evalute efficacy/necessity of this wrapper function
const wrapNonMutatingStateEntry = (appData: IAppData): IAppData =>
	enterNonMutatingState(appData) === 0
	? returnAppDataBackToMenu(appData)
	: returnAppDataBackToMenu(appData)

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

const UNSET_LASTDONE: number = -1;

export const createStarterData = () => {
	console.log(setupDemoData)
	const myAppDemo1: IAppData = {currentState: 'menu', myList: populateDemoList([]), lastDone: -1};
	const demoAnswers: TValidAnswer[] = ['n', 'y']; // ['y', 'n']; was good
	let myAppDemo2: IAppData = {
		currentState: 'menu',
		myList: markFirstMarkableIfPossible(myAppDemo1.myList)(myAppDemo1.lastDone),
		lastDone: UNSET_LASTDONE
	};
	myAppDemo2 = SIMenterReviewState(myAppDemo2)(demoAnswers);
	myAppDemo2 = SIMenterFocusState(myAppDemo2);
	console.log(demoDataComplete)
	return myAppDemo2;
}

export const createBlankData = (): IAppData =>
	({ currentState: 'menu', myList: [], lastDone: UNSET_LASTDONE });

export const main = async () => {
	// TODO: implement command line (console) clear()
	greetIO();
	await runProgram(true)(createBlankData()); // await runAdhocTests();
	// await runProgram(true)(createStarterData());
	exit(0);
}

main();