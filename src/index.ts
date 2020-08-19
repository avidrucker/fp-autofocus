"use strict";

const readline = require('readline')

import { exit } from 'process';

export type TItemStatus =  'unmarked' | 'dotted' | 'complete';

const doneFocusing = 'Once you finish focusing on this task, tap the enter key.';
const skippingReview = `Skipping review (list is not reviewable)...`;
const emptyList = "There are no items in your to-do list.";
const makeMenuSelection = `Please make a menu selection.`;
const automarkingFirstMarkable = `Auto-marking first markable item...`;
const cantAutomark = `Unable to auto-mark. Returning list as is...`;
const cantFocus = `Cannot focus at this time. Mark (dot) an item first.`;
const readAboutApp = `This is a stub for About AutoFocus...`;
const errorReadingState = `It appears there was an error reading state...`;
const errorMutatingState = `It appears there was an error mutating state...`;
const setupDemoData = `Setting up starting demo data...`;
const demoDataComplete = `... demo data setup is complete.`;
const wantToHideCompleted = "Do you want to hide completed items? ";
const enterNewItem = `Please enter a to-do item: `;
const indexAtEndOfArr = `Index is at the end of the array: returning not found...`;
const notMarkableOrReviewable = `List is neither markable nor reviewable.`;
const cantMarkOrReviewBecauseNoItems = "Your list is empty. First, add some items.";

export const UNSET_LASTDONE: Tindex = -1;

const marks = {
	unmarked: ' ',
	dotted: 'o',
	complete: 'x'
};

export type Tid = number;
export type Tindex = number;

export type IItem = {
	id: Tid,
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
	myArchive: IItem[],
	lastDone: Tindex
}

export type TAppState = 'menu' | 'see' | 'add' | 'mark' | 'do' | 
	'hide' | 'read-about' | 'quit';

// https://stackoverflow.com/questions/57086672/element-implicitly-has-an-any-type-because-expression-of-type-string-cant-b
export const getKeyValue = <U extends keyof T, T extends object>(key: U) => (obj: T) =>
	obj[key];

// note: not currently (RAM) safe for arrays
export const head = (xs: IItem[]): IItem[] =>
	xs.length === 0
	? []
	: [xs[0]];

export const tail = (xs: IItem[]): IItem[] =>
	xs.length === 0
		? []
		: [xs[xs.length - 1]];

const pushToAndReturnArr = <T>(arr: T[]) => (newItem: T): T[] =>
	(arr.push(newItem),
	// console.log(`New item added successfully!`),
	arr);

/** @type {Function} inbetween API which prevents newItems with invalid nameInput text from being added */
export const addItem = (arr: IItem[]) => (newItem: IItem): IItem[] =>
	newItem.textName !== ""
	? (//console.log(`Adding new item '${newItem.textName}' to list...`),
		pushToAndReturnArr(arr)(newItem))
	: (console.log(`Missing item text: Please try again with text input.`),
		arr);

/** @type {Function} internal API which allows for invalid nextIDs and invalid nameInputs */
export const createNewItem = (nameInput: string) => (nextID: Tid): IItem =>
	(//console.log(`New item '${s}' successfully created`),
	{id: nextID,
		status: 'unmarked',
		textName: nameInput,
		isHidden: false}); // isHidden: false

// a kind of pretty print
// , ${i.isHidden ? 'hidden' : 'not hidden'}
const stringifyVerbose = (i: IItem): string =>
	`Item: '${i.textName}', status: ${i.status}`;

const dotItem = (i: IItem): IItem =>
	({id: i.id,
		status: 'dotted',
		textName: i.textName,
		isHidden: i.isHidden})

const completeItem = (i: IItem): IItem =>
	({id: i.id,
		status: 'complete',
		textName: i.textName,
		isHidden: i.isHidden})

export const statusToMark = (x: TItemStatus): string =>
	`${marks[x]}`

// another kind of pretty print
const stringifyConcise = (i: IItem): string =>
	`[${marks[i.status]}] ${i.textName}`

const demoList: string[] = ['make coffee',
	'go for jog', 'watch The Incredibles'];

	export const FRUITS = [
		"apple",
		"banana",
		"cherry",
		"dragonfruit",
		"elderberry",
		"fig",
		"grape"
	];
	
const getDemoFruitFromID = (id: number) =>
		FRUITS[id % FRUITS.length];

export const populateDemoAppByLength = (appData: IAppData) => (nLength: number): IAppData => {
	for(let i = 0; i < nLength; i++) {
		appData = SIMcreateAndAddNewItem(appData)(getDemoFruitFromID(i));
	}
	return appData;
}

export const populateDemoAppByList = (appData: IAppData) => (listIn: string[]): IAppData => {
	listIn.forEach(x => {
		appData = SIMcreateAndAddNewItem(appData)(x);
	})
	return appData;
}
export const stringifyList = (xs: IItem[]): string[] =>
	xs.map(x => stringifyConcise(x)) // ALT: stringifyVerbose(x)

const isEmptyArr = <T>(arr: T[]): boolean =>
	arr.length === 0;

export const printList = (nameTexts: string[]): void =>
	nameTexts.forEach(x => console.log(x));

export const printEmptyList = (): void =>
	console.log(emptyList);

export const printListOrStatus = (xs: string[]): void =>
	isEmptyArr(xs)
		? printEmptyList()
		: printList(xs);

export const createGreeting = (greeting: string) => (appName: string): string =>
	`${greeting} ${appName}`;

export const isPluralFromCount = (count: number): boolean =>
	count === 1 ? false : true;

export const getPluralS = (isPlural: boolean): string =>
	isPlural ? 's' : '';

const pluralizeIfPlural = (word: string) => (count: number) =>
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

// ISSUE: Dev implements fluture implementation instead of Promise based #16
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

export const menuList: TAppState[] = 
	['see', 'add', 'mark', 'do', 'hide', 'read-about', 'quit'];

const printMenuItem = (x: TAppState) => (i: Tindex): void =>
	console.log(`${i+1}: ${x}`)

const printMenuHeader = (): void =>
	console.log('MAIN MENU');

export const printMenu = (menuList: TAppState[]) => (menuTexts: any): (() => void) =>
	() => (printMenuHeader(),
	menuList.map(x => menuTexts[x]).forEach((x, i) => printMenuItem(x)(i)));

const existsInArr = (arr: any) => (target: any): boolean =>
	!isNegOne(arr.indexOf(target));

const transitionalble = (current: TAppState) => (next: TAppState) => (states: any): boolean =>
	existsInArr(Object.keys(states))(current) && 
		existsInArr(possibleStates[current])(next);

export const changeState = (current: TAppState) => (next: TAppState): TAppState =>
	transitionalble(current)(next) ? next : current;

export const sayState = (state: TAppState): void =>
	console.log(`Current state is now: '${state}'.`);

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

export const printBlankLine = (): void =>
	console.log();

export const promptUserAtMenuToChangeState = 
	async (s: TAppState): Promise<TAppState> =>
	changeState(s)(menuList[await promptUserForMenuOption(menuList)]);

const promptUserToHide = async (): Promise<boolean> => 
	(await askOptionalYNio(wantToHideCompleted))
		.toLowerCase() === 'y';

const printAndReturn = <T>(x: T): T => {
	console.log(`X is ${x}, now returning it...`);
	return x;
}

const promptUserForMenuOption = async (menuList: TAppState[]): Promise<number> =>
	(
		wrapPrintWithLines(printMenu(menuList)(menuTexts)),
		console.log(makeMenuSelection),
		await getNumberFromUser(1)(menuList.length) - 1 // printAndReturn() // LOG
	);

const genNextID = (appData: IAppData): Tid =>
  appData.myList.length + appData.myArchive.length;

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

export const SIMcreateAndAddNewItem = (appData: IAppData) => 
	(textInput: string): IAppData =>
	({
		currentState: 'menu',
		myList: addItem(appData.myList)(createNewItem(
			textInput)(genNextID(appData))),
		myArchive: appData.myArchive,
		lastDone: appData.lastDone
	});

const filterOnMarked = (arr: IItem[]) =>
	arr.filter(x => x.status === "dotted")

// TODO: refactor to not mutate state, and instead
// return a newly constructed array of items
const dotIndex = (arr: IItem[]) => (i: Tindex): IItem[] =>
	arr.map((x, current) => (current === i
		? (// console.log(`Modifying item at index ${i} to be dotted...`),
			dotItem(x))
		: x ));

// arr === item list, i === index
const markComplete = (arr: IItem[]) => (i: Tindex): IItem[] =>
	arr.map((x, current) => (current === i
		? (// console.log(`Modifying item at index ${i} to be complete...`),
			completeItem(x))
		: x ));

const filterOnUnmarked = (arr: IItem[]) =>
	arr.filter(x => x.status === "unmarked")

const hasUnmarked = (arr: IItem[]): boolean =>
	isPositive(filterOnUnmarked(arr).length);

const getLastIndexOf = (arr: IItem[]) => (s: TItemStatus): Tindex =>
	arr.map(x => x.status).lastIndexOf(s);

// typically after index of lastDone but could be CMWTD index also
const listHasUnmarkedAfterIndex = (arr: IItem[]) => (i: Tindex): boolean =>
	i === -1
	? hasUnmarked(arr)
	: getLastIndexOf(arr)("unmarked") > i;

const hasMarked = (arr: IItem[]): boolean =>
	isPositive(countMarked(arr));

export const isMarkableList = (arr: IItem[]) => (lastDone: Tindex): boolean =>
	isEmptyArr(arr) || !hasUnmarked(arr) // array must have items in it // there must be unmarked items
		? (//console.log(`1. EMPTY LIST OR NO UNMARKED!`),
			false)
			: hasMarked(arr) // there may not be any marked items already
				? (//console.log(`2. ALREADY MARKED!`),
					false)
					: !isNegOne(lastDone) && listHasUnmarkedAfterIndex(arr)(lastDone)
						? (//console.log(`3. USING LAST DONE AS CMWTD, WONT MARK`),
							false) // there must be unmarked items AFTER last done
						: isNegOne(lastDone);
							// UNCOMMENT TO LOG
							// ? (//console.log(`4. WILL MARK FIRST UNMARKED!`),
							// 	true) 
							// : (//console.log(`5. ERROR???`),
							// 	false);

const countUnmarked = (arr: IItem[]): number =>
	filterOnUnmarked(arr).length;

const countMarked = (arr: IItem[]): number =>
	filterOnMarked(arr).length;

export const mapUnmarkedToIDAndFilter = (arr: IItem[]): Tid[] =>
	arr.filter(x => x.status === "unmarked").map(x => x.id);

const logGet1stUnmarkedAfter = (arr: IItem[]) => (i: Tindex): void =>
	(
		console.log(`   Getting first unmarked index after index ${i}`
			+ ` where ARRAY LEN is ${arr.length}...`),
		console.log(`... it appears to be `
			+ `${mapUnmarkedToIDAndFilter(arr).filter(x => x > i)[0]}`)
	);

// eg: lastDone is 1, unmarked are [2, 3], we want to return 2
export const get1stUnmarkedIDAfterIndex = (arr: IItem[]) =>
	(i: Tindex): Tid =>
	arr.length < i + 1
		? (//console.log(`Out of bounds error...`),
			-1)
		: arr.length === i + 1
			? (//console.log(indexAtEndOfArr),
				-1)
			: (//logGet1stUnmarkedAfter(arr)(i),
				mapUnmarkedToIDAndFilter(arr).filter(x => x > i)[0]);

export const findFirstMarkable = (arr: IItem[]) => (lastDone: Tindex): Tindex =>
	isEmptyArr(arr) || !hasUnmarked(arr)
		? (//console.log(`AA. Empty array or no unmarked items, no markable items found.`),
			-1) // empty lists and lists without unmarked items have no auto-markable items
		: hasMarked(arr)
			? (//console.log(`BB. List already marked, leaving list as is...`),
				-1) // already marked lists cannot be auto-marked further
			: !isNegOne(lastDone) && !isNegOne(get1stUnmarkedIndexAfter(arr)(lastDone))
				? (// console.log(`CC. First markable FOUND after lastDone.`),
					get1stUnmarkedIndexAfter(arr)(lastDone))
				: (// console.log(`DD. Returning first markable in list w/o lastDone...`),
					get1stUnmarkedIndexAfter(arr)(-1));

export const markFirstMarkableIfPossible = (arr: IItem[]) => (lastDone: Tindex): IItem[] =>
	isMarkableList(arr)(lastDone)
		? (console.log(automarkingFirstMarkable),
			// console.log(`(It will be item ID of ${findFirstMarkable(arr)(lastDone)})`), // UNCOMMENT TO LOG
			dotIndex(arr)(findFirstMarkable(arr)(lastDone)))
		: (// console.log(cantAutomark),
			arr);

const boolToTFstring = (b: boolean): string =>
	b ? 'TRUE' : 'FALSE';

// ISSUE: Dev replaces custom prints with `smartLog()()()` #25
const printIsMarkableList = (arr: IItem[]) => (lastDone: Tindex): void =>
	console.log(`It is ${boolToTFstring(isMarkableList(arr)(lastDone))} that this is a markable list.`)

// ISSUE: Dev replaces custom prints with `smartLog()()()` #25
const printMarkedCount = (arr: IItem[]): void =>
	console.log(`The # of marked items is now ${countMarked(arr)}`)

// ISSUE: Dev replaces custom prints with `smartLog()()()` #25
export const printStatsBlock = (arr: IItem[]) => (lastDone: Tindex) => {
	printIsMarkableList(arr)(lastDone);
	printCMWTDdata(arr);
	printMarkedCount(arr)
}

const isPositive = (n: number): boolean =>
	n > 0;

// a. CMWTD is defined ~~there is at least one marked item~~
// b. there is at least one unmarked item after the last marked item
export const isReviewableList = (arr: IItem[]) => (lastDone: Tindex): boolean =>
	!hasUnmarked(arr)
		? (//console.log("... A: no unmarked"),
			false)
		: isNegOne(getCMWTDindex(arr)) && isNegOne(lastDone) 
			? (//console.log("... B: neither CMWTD nor lastDone exist"),
				false)
			: !isNegOne(lastDone) && listHasUnmarkedAfterIndex(arr)(lastDone)
				? (//console.log(`... C. using lastDone as substitute CMWTD`),
					true)
				: (//console.log(`... D: no unmarked after lastDone index ${lastDone}`),
					!isNegOne(getCMWTDindex(arr)) && listHasUnmarkedAfterIndex(arr)(getCMWTDindex(arr))
						? (//console.log(`... E. CMWTD exists and there are unmarked after it`),
							true)
						: (//console.log(`... F: no unmarked after CMWTD index ${getCMWTDindex(arr)}`),
							false));

export const get1stUnmarkedIndexAfter = (arr: IItem[]) => (afterIndex: Tindex): Tindex =>
	getIndexOfID(arr)(get1stUnmarkedIDAfterIndex(arr)(afterIndex));

export const getIndexOfID = (arr: IItem[] ) => (id: Tid): Tindex =>
	arr.map(x => x.id).indexOf(id);

export const getFirstReviewableIndex = (arr: IItem[]) => (lastDone: Tindex): Tindex =>
	isEmptyArr(arr) || !hasUnmarked(arr)
		? (//console.log(`Empty array, not reviewable...`),
			-1) // empty lists have no reviewable indecies
		: !isNeg(lastDone) && !isNegOne(get1stUnmarkedIndexAfter(arr)(lastDone))
			? get1stUnmarkedIndexAfter(arr)(lastDone)
			: !isNegOne(getCMWTDindex(arr)) && !isNegOne(get1stUnmarkedIndexAfter(arr)(getCMWTDindex(arr)))
				? get1stUnmarkedIndexAfter(arr)(getCMWTDindex(arr))
				: (//console.log(`First reviewable index not found...`),
					-1);

const generateWhichQuestion = (current: string) => (cmwtd: string) =>
	`Do you want to '${current}' more than '${cmwtd}'? [Y]es, [N]o, [Q]uit: `;

export const getCMWTDstring = (arr: IItem[]): string =>
	!isNegOne(getCMWTDindex(arr))
		? arr[getCMWTDindex(arr)].textName
		: "undefined";

// returns -1 if there is no CMWTD
export const getCMWTDindex = (arr: IItem[]): Tindex =>
	isEmptyArr(arr)
		? -1
		: hasMarked(arr)
			? getLastIndexOf(arr)('dotted')
			: -1

// ISSUE: Dev replaces custom prints with `smartLog()()()` #25
const printCMWTDdata = (arr: IItem[]): void =>
	isNegOne(getCMWTDindex(arr))
		? console.log(`CMWTD is not set yet.`)
		: console.log(`CMWTD is, at index ${getCMWTDindex(arr)}: '${getCMWTDstring(arr)}'`)

const printFence = (): void =>
	console.log(`----------`);

// wrapper higher order function
const wrapPrintWithLines = (f: () => void): void =>
	(printFence(),
	f(),
	printFence());

const returnAppDataBackToMenu = (appData: IAppData): IAppData =>
	({ currentState: 'menu',
	myList: appData.myList,
	myArchive: appData.myArchive,
	lastDone: appData.lastDone });

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

export const getStatusByIndex = (arr: IItem[]) => (i: Tindex): string =>
		arr[i].status;

export const getTextByIndex = (arr: IItem[]) => (i: Tindex): string =>
	(//console.log(`Accessing index ${i} of array of length ${arr.length}...`),
		arr[i].textName);

const deepCopy = <T>(x: T): T =>
	JSON.parse(JSON.stringify(x));

type TAnswerState = 'quit' | 'yes' | 'no' | 'skip' | 'error';

// i === index
const askWhich = (arr: IItem[]) => async (i: Tindex): Promise<string> =>
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
	lastDone: Tindex;
	currentIndex: Tindex;
}

const calcWillRepeat = (a: TAnswerState) =>
	a === 'quit' || a ==='error' ? false : true;

const calcWillMark = (a: TAnswerState) =>
	a === 'yes';

// b === boolean conditional, i === index
// TODO: rename function to getNextIndexIf
const getNextIfTrue = (b: boolean) => (i: Tindex) =>
	b ? i + 1 : i;

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

// TODO: consider making this the catch all funtion with lower bound (including 0, not including -1)
const inBounds = (arr: IItem[]) => (i: Tindex) =>
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
const SIMcommenceReview = (arr: IItem[]) => (lastDone: Tindex) => (answerAbbrevs: TValidAnswer[]): IItem[] => {
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
	const reviewable = isReviewableList(appData.myList)(appData.lastDone);
	appData.myList = markFirstMarkableIfPossible(appData.myList)(appData.lastDone);
	//!markable && !reviewable &&
	//		console.log(notMarkableOrReviewable);

	return isReviewableList(appData.myList)(appData.lastDone)
	? ({currentState: 'menu',
		myList: await reviewIfPossible(appData.myList)(appData.lastDone),
		myArchive: appData.myArchive,
		lastDone: appData.lastDone})
	: returnAppDataBackToMenu(appData);
}

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
		myList: markCMWTDindexComplete(appData),
		myArchive: appData.myArchive
	});

export type TValidAnswer = 'y' | 'n' | 'q';

// "reviewByNumbers", modeled after reviewIfPossible function
const markByAnswerList = (arr: IItem[]) => (lastDone: Tindex) => (answerAbbrevs: TValidAnswer[]): IItem[] =>
	isReviewableList(arr)(lastDone)
	? (//console.log(`Commencing review from index ${getFirstReviewableIndex(arr)(lastDone)}...`),
		SIMcommenceReview(deepCopy(arr))(lastDone)(answerAbbrevs))
	: (console.log(skippingReview),
		arr);

export const SIMenterMarkAndReviewState = (appData: IAppData) =>
	(answers: TValidAnswer[]): IAppData => {

	const markable = isMarkableList(appData.myList)(appData.lastDone);
	const reviewable = isReviewableList(appData.myList)(appData.lastDone);
	// smartLog("isMarkable")(markable)(false);
	appData.myList = markFirstMarkableIfPossible(appData.myList)(appData.lastDone);
	// smartLog("isReviewable")(reviewable)(false);
	!markable && !reviewable &&
		console.log(notMarkableOrReviewable);

	return ({currentState: 'menu',
		myList: markByAnswerList(appData.myList)(appData.lastDone)(answers),
		myArchive: appData.myArchive,
		lastDone: appData.lastDone});
	};

// ISSUE: Dev implements SIMenterFocusState which takes 'y'/'n' to indicate 'workLeft' #21
// if list is focusable, it will update the CMWTD item to be marked complete,
// and update lastDone to be the index of the (now former) CMWTD
// else, returns app data back as-is
export const SIMenterFocusState = (appData: IAppData): IAppData =>
	!isFocusableList(appData)
			? returnAppDataBackToMenu(appData)
			: ({currentState: 'menu',
					lastDone: getCMWTDindex(appData.myList), // uses (soon-to-be) former CMWTD as the new last done 
					myList: markCMWTDindexComplete(appData),
					myArchive: appData.myArchive});

// s === item textName string
const queryUserIsThereMoreWorkLeft = async (itemText: string): Promise<string> =>
	askOptionalYNio(`Is there work remaining to do on item '${itemText}'? [Y]es/[N]o `);

// CRITICAL
// ISSUE: Dev clarifies native API for item creation, enforces strict usage of combined myList,
//    myArchive count for ID generation #22
const duplicateLastDoneandAddToList = (arr: IItem[]) => (lastDone: Tindex): IItem[] =>
	(arr.push(
		{ textName: arr[lastDone].textName, status: 'unmarked', id: arr.length, isHidden: false} ),
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
		// TODO: make clear to user that list has been split into hidden and visible
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
		myArchive: appData.myArchive,
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
		
export const countHidden = (xs: IItem[]): number =>
	xs.filter(x => x.isHidden).length;

const hideItem = (i: IItem): IItem =>
	({id: i.id, status: i.status, textName: i.textName, isHidden: true});

export const hideAllCompleted = (xs: IItem[]): IItem[] => {
	// console.log(`BEFORE:`)
	xs = xs.map(x => !x.isHidden && x.status === 'complete'
		? hideItem(x)
		: x);
		// console.log(`AFTER:`)
	return xs;
};

export const hideAllCompletedInAppData = (appData: IAppData): IAppData =>
	({ currentState: 'menu',
	myList: hideAllCompleted(appData.myList),
	myArchive: appData.myArchive,
	lastDone: appData.lastDone });

const resetLastDone = (appData: IAppData): number => 
	(//console.log(`Resetting lastDone....`),
	UNSET_LASTDONE);

const filterNotHidden = (xs: IItem[]): IItem[] =>
	xs.filter(x => !x.isHidden)

const filterHiddenAndConcatToArchive = (xs: IItem[]) => (ys: IItem[]) =>
	xs.filter(x => x.isHidden).concat(deepCopy(ys));

// note: hiding items is a three step process
// first, items are marked as hidden.
// second, they are copied over to the archive list
// third, they are "removed" from the original list (via replacement w/ a filtered copy)
export const moveHiddenToArchive = (appData: IAppData): IAppData =>
	({currentState: 'menu',
		myArchive: filterHiddenAndConcatToArchive(appData.myList)(appData.myArchive),
		myList: filterNotHidden(appData.myList),
		lastDone: resetLastDone(appData)});

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

export const SIMresolveHideAndArchiveState = (appData: IAppData): IAppData =>
	(console.log(`Hiding hideable items...`),
	// smartLogAll(appData), // note: use smartLogAll() to log
	moveHiddenToArchive(hideAllCompletedInAppData(appData)));

export const smartLog = (label: string) => <T>(val: T) => (tabular: boolean) =>
	tabular
		? (console.log(`${label}:`), console.table(val))
		: console.log(`${label}: ${val}`);

export const smartLogAll = (appData: IAppData): void =>
	(smartLog("currentState")(appData.currentState)(false),
	smartLog("myList")(appData.myList)(true),
	smartLog("myArchive")(appData.myArchive)(true),
	smartLog("lastDone")(appData.lastDone)(false));

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
						: resolveMutatingErrorState(appData)

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


/** @type {Function} returns IAppData with myList `[o] [ ] [x]` */
export const createDemoData = (): IAppData => {
	// console.log(setupDemoData)
	let myDemoApp: IAppData = createBlankData();
	myDemoApp = populateDemoAppByList(myDemoApp)(demoList);
	const demoAnswers: TValidAnswer[] = ['n', 'y']; // ['y', 'n']; was good
	myDemoApp = SIMenterMarkAndReviewState(myDemoApp)(demoAnswers);
	myDemoApp = SIMenterFocusState(myDemoApp);
	// console.log(demoDataComplete)
	return myDemoApp;
}

export const createBlankData = (): IAppData =>
	({ currentState: 'menu', myList: [],  myArchive: [], lastDone: UNSET_LASTDONE });

export const makeNewDemoDataOfLength = (nLength: number): IAppData =>
	nLength < 1
	? createBlankData()
	: populateDemoAppByLength(createBlankData())(nLength);

export const main = async () => {
	console.clear();
	greetIO();
	await runProgram(true)(createBlankData());
	//// await runProgram(true)(createDemoData());
	exit(0);
}
main();