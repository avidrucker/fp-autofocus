const readline = require('readline')
// const Future = require('fluture')
// const fs = require('fs');
// import { createInterface } from 'readline'
// import { Task } from 'fp-ts/lib/Task'
// import { resolve } from 'path';
import { exit } from 'process';

type ItemStatus =  'unmarked' | 'dotted' | 'complete';

const marks = {
	unmarked: ' ',
	dotted: 'o',
	complete: 'x'
};

export type IItem = {
	index: number,
	status: ItemStatus,
	textName: string,
	//isHidden: boolean
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

export type TAppState = 'menu' | 'see' | 'add' | 'mark' | 'do' | 'read-about' | 'quit';

const pushToAndReturnArr = <T>(arr: T[]) => (newItem: T) => {
	arr.push(newItem);
	console.log(`New item added successfully!`);
	return arr;
}

const addItem = (arr: IItem[]) => (newItem: IItem) =>
	(console.log(`Adding new item to list...`),
	pushToAndReturnArr(arr)(newItem));

const createNewItem = (s: string) => (nextIndex: number): IItem =>
	(console.log(`New item '${s}' successfully created`),
	{index: nextIndex, status: 'unmarked', textName: s}); // isHidden: false

// a kind of pretty print
const stringifyVerbose = (i: IItem): string =>
	`Item: '${i.textName}', status: ${i.status}` // , ${i.isHidden ? 'hidden' : 'not hidden'}

const dotItem = (i: IItem): IItem =>
	({index: i.index, status: 'dotted', textName: i.textName})

const completeItem = (i: IItem): IItem =>
	({index: i.index, status: 'complete', textName: i.textName})

const statusToMark = (x: ItemStatus): string =>
	`${marks[x]}`

// another kind of pretty print
const stringifyConcise = (i: IItem): string =>
	`[${marks[i.status]}] ${i.textName}`

const demoList: string[] = ['make coffee',
	'go for jog', 'watch The Incredibles'];

export const populateDemoList = (arr: IItem[]): IItem[] =>
	demoList.map(x => createNewItem(x)(arr.length))

export const stringifyList = (xs: IItem[]): string[] =>
	xs.map(x => stringifyConcise(x)) // stringifyVerbose(x)

const isEmptyArr = <T>(arr: T[]): boolean =>
	arr.length === 0;

export const printList = (xs: string[]): void =>
	xs.forEach(x => console.log(x));

export const printEmptyList = () =>
	console.log("There are no items in your to-do list.");

export const printListOrStatus = (xs: string[]): void =>
	isEmptyArr(xs) ? printEmptyList() : printList(xs);

export const createGreeting = (greeting: string) => (appName: string): string =>
	`${greeting} ${appName}`;

export const isPluralFromCount = (count: number): boolean =>
	count === 1 ? false : true;

export const getPluralS = (isPlural: boolean): string =>
	isPlural ? 's' : '';

const pluralizeIfNotZero = (s: string) => (count: number) =>
	`${s}${getPluralS(isPluralFromCount(count))}`

export const notEmptyString = (s: string): boolean =>
	s === "" ? false : true;

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

const greet = (): void =>
	console.log(createGreeting('Welcome to')('FP AutoFocus!'));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

export const getName = () => {
	return new Promise<string>((resolve) => {
		rl.question("hi, what's your name?", (name: string) => { resolve(name)})
	})
}

export const askOpenEnded = (q: string) => {
	return new Promise<string>((resolve) => {
		rl.question(q, (answer: string) => { resolve(answer)})
	})
}

// TODO: refactor with fluture
export const askOptional = (q: string) => {
	return new Promise<string>((resolve) => {
		rl.question(q, (answer: string) => { 
			answer.toLowerCase() === 'q'
				? resolve('q')
				: resolve(answer)	
		})
	})
}

const askOptionalYN = (q: string) => {
	return new Promise<string>((resolve) => {
		rl.question(q, (answer: string) => { 
			answer.toLowerCase() === 'q'
				? resolve('q')
				: answer.toLowerCase() === 'y'
					? resolve('y')
					: answer.toLowerCase() === 'n'
						? resolve('n')
						: resolve(answer)
		})
	})
}

interface IOneToManyMap<T> {
	[key: string]: T[];
}

// Map<TAppState, TAppState[]>
export const possibleStates: IOneToManyMap<TAppState> = {
	'menu': ['see', 'add', 'mark', 'do', 'read-about'],
	'see': ['menu'],
	'add': ['menu'],
	'mark': ['menu'],
	'do': ['menu'],
	'read-about': ['menu'],
	'quit': []
}

export const menuTexts: any = {
	'see':'View List', // TODO: make list visible at all times for command line app
	'add':'Add New To-Do',
	'mark':'Review & Dot List',
	'do':'Focus on To-Do',
	'read-about':'Read About AutoFocus',
	'quit': 'Exit Program'
};

export const menuList: TAppState[] = ['see', 'add', 'mark', 'do', 'read-about', 'quit'];

const printMenuItem = (x: TAppState) => (i: number) =>
	console.log(`${i+1}: ${x}`)

export const printMenu = (menuList: TAppState[]) => (menuTexts: any): number => {
	console.log(`----------`);
	console.log('MAIN MENU');
	menuList.map(x => menuTexts[x]).forEach((x, i) => printMenuItem(x)(i));
	// console.log(`----------`);
	return 0;
}

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
export const getNumberFromUser = (first: number) => (last: number) => {
	return new Promise<number>((resolve) => {
		rl.question(`Please choose a number from ${first} to ${last}: `, (num: string) => {
			inRangeInclusive(first)(last)(Number(num))
				? resolve(Number(num))
				: resolve(getNumberFromUser(first)(last));
		})
	})
};

export const printBlankLine = (): void =>
	console.log();

export const promptUserAtMenuToChangeState = async (s: TAppState) =>
	changeState(s)(menuList[await promptUserForMenuOption(menuList)]);

const promptUserForMenuOption = async (menuList: TAppState[]): Promise<number> => {
	printMenu(menuList)(menuTexts);
	console.log(`Please make a menu selection.`);
	return await getNumberFromUser(1)(menuList.length) - 1;
}

// TODO: implement with askOptional to cancel to-do input
export const createAndAddNewItemViaPrompt = async (arr: IItem[]): Promise<IItem[]> =>
	addItem(arr)(createNewItem(
		await askOpenEnded(`Please enter a to-do item: `)
		)(arr.length));

const filterOnMarked = (arr: IItem[]) =>
	arr.filter(x => x.status === "dotted")

const dotIndex = (arr: IItem[]) => (i: number): IItem[] => {
	arr[i].status = 'dotted';
	return arr;
}

const filterOnUnmarked = (arr: IItem[]) =>
	arr.filter(x => x.status === "unmarked")

const hasUnmarked = (arr: IItem[]): boolean =>
	isPositive(filterOnUnmarked(arr).length);

const getLastIndexOf = (arr: IItem[]) => (s: ItemStatus): number =>
	arr.map(x => x.status).lastIndexOf(s);

// typically after index of lastDone but could be CMWTD index also
const listHasUnmarkedAfterIndex = (arr: IItem[]) => (i: number) =>
	getLastIndexOf(arr)("unmarked") > i;

const hasMarked = (arr: IItem[]): boolean =>
	isPositive(countMarked(arr))

// TODO: transfer unit tests for this from old autofocus
const isMarkableList = (arr: IItem[]) => (lastDone: number): boolean =>
	isEmptyArr(arr) // array must have items in it
		? false
			: hasMarked(arr) // there may not be any marked items already
				? false
				: hasUnmarked(arr) && listHasUnmarkedAfterIndex(arr)(lastDone) // there must be unmarked items AFTER last done
					? true
					: false;

// TODO: implement stub
// const updateLastDone = (arr: IItem[]) => (lastDone: number) =>
// 	[arr, lastDone];

const countUnmarked = (arr: IItem[]): number =>
	filterOnUnmarked(arr).length

const countMarked = (arr: IItem[]): number =>
	filterOnMarked(arr).length

const mapUnmarkedToIndexAndFilter = (arr: IItem[]): number[] =>
	arr.filter(x => x.status === "unmarked").map(x => x.index)

// eg: lastDone is 1, unmarked are [2, 3], we want to return 2
const getFirstUnmarkedAfterIndex = (arr: IItem[]) => (i: number): number =>
	mapUnmarkedToIndexAndFilter(arr).filter(x => x > i)[0];

// dotIndex(arr)(0)
const	findFirstMarkable = (arr: IItem[]) => (lastDone: number): number => {
	return isEmptyArr(arr)
		? -1
		: hasUnmarked(arr) && listHasUnmarkedAfterIndex(arr)(lastDone)
			? getFirstUnmarkedAfterIndex(arr)(lastDone)
			: -1;
}

export const markFirstMarkableIfPossible = (arr: IItem[]) => (lastDone: number): IItem[] => {
	return isMarkableList(arr)(lastDone)
		? (
				console.log(`Auto-marking first markable item...`),
				dotIndex(arr)(findFirstMarkable(arr)(lastDone))
			)
		: (
				console.log(`Unable to auto-mark. Returning list as is...`),
				arr
		);
}

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

// TODO: Implement stub
// 1. marked items exist
// 2. there are unmarked items that exist after the last marked item
const isReviewableList = (arr: IItem[]) => (lastDone: number): boolean =>
	hasMarked(arr) && (
		(!isNegOne(lastDone) && listHasUnmarkedAfterIndex(arr)(lastDone))
		|| (isNegOne(lastDone) && listHasUnmarkedAfterIndex(arr)(getCMWTDindex(arr)))
	);

const getFirstReviewableIndex = (arr: IItem[]) => (lastDone: number): number =>
	isEmptyArr(arr)
	? -1
	: isNegOne(getCMWTDindex(arr))
		? -1
		: isNeg(lastDone)
			? getFirstUnmarkedAfterIndex(arr)(getCMWTDindex(arr))
			: getFirstUnmarkedAfterIndex(arr)(lastDone);

const generateWhichQuestion = (current: string) => (cmwtd: string) =>
	`Which do want to do '${current}' more than '${cmwtd}'?`;



const getCMWTDstring = (arr: IItem[]): string =>
	!isNegOne(getCMWTDindex(arr))
		? arr[getCMWTDindex(arr)].textName
		: "undefined";

// returns -1 if there is no CMWTD
const getCMWTDindex = (arr: IItem[]): number =>
	isEmptyArr(arr)
		? -1
		: hasMarked(arr)
			? getLastIndexOf(arr)('dotted')
			: -1

const printCMWTDdata = (arr: IItem[]): void =>
	isNegOne(getCMWTDindex(arr))
		? console.log(`CMWTD is not yet set!`)
		: console.log(`CMWTD is, at index ${getCMWTDindex(arr)}: '${getCMWTDstring(arr)}'`)

// TODO: implement wrapper higher order function
// const wrapPrintWithLines = (f: () => void) => {
// 	console.log(`----------`);
// 	f();
// 	console.log(`----------`);
// }

const returnAppDataBackToMenu = (appData: IAppData): IAppData =>
	({ currentState: 'menu', myList: appData.myList, lastDone: appData.lastDone }); // TODO: remove temp placeholder

const resolveSeeState = (arr: IItem[]): number => {
	console.log(`----------`);
	console.log('AUTOFOCUS LIST')
	printListOrStatus(stringifyList(arr));
	//console.log(`----------`);
	return 0;
}

const resolveQuitState = (appData: IAppData): IAppData => {
	console.log(`See you!`);
	return appData;
}

// should only return IItem[], should only take arr, lastDone
const resolveAddState = async (appData: IAppData): Promise<IAppData> =>
	returnAppDataBackToMenu({currentState: appData.currentState,
		myList: await createAndAddNewItemViaPrompt(appData.myList),
		lastDone: appData.lastDone});

const reviewIfPossible = (arr: IItem[]) => (lastDone: number): IItem[] =>
	isReviewableList(arr)(lastDone)
		? (console.log(`Commencing review from index ${getFirstReviewableIndex(arr)(lastDone)}...`), arr)
		: (console.log(`Skipping review (list is not reviewable)...`), arr);

const getNonReviewableSegment = (arr: IItem[]) => (i: number) =>
		arr.slice(0, i);

const getReviewableSegment = (arr: IItem[]) => (i: number) =>
	arr.slice(i)

// should only return IItem[], should only take arr, lastDone
const resolveMarkState = (appData: IAppData): IAppData =>
	returnAppDataBackToMenu({currentState: appData.currentState,
		myList: reviewIfPossible(markFirstMarkableIfPossible(appData.myList)(appData.lastDone))(appData.lastDone),
		lastDone: appData.lastDone});

// should only return IItem[] and lastDone
const resolveDoState = (appData: IAppData): IAppData => {
	console.log(`This is a stub for Focus Mode...`); // TODO: implement stub
	return returnAppDataBackToMenu(appData);
}

const resolveReadAboutState = (): number => {
	console.log(`This is a stub for About AutoFocus...`); // TODO: implement stub
	return 0;
}

const resolveNonMutatingErrorState = (): number => {
	console.log(`It appears there was an error reading state...`);
	return -1;
}

// https://hackernoon.com/rethinking-javascript-eliminate-the-switch-statement-for-better-code-5c81c044716d
// TODO: refactor with switchcaseF
const enterNonMutatingState = (appData: IAppData): number =>
	appData.currentState === 'see'
		? resolveSeeState(appData.myList)
		: appData.currentState === 'read-about'
			? resolveReadAboutState()
			: resolveNonMutatingErrorState();

const resolveMutatingErrorState = (appData: IAppData): IAppData => {
	console.log(`It appears there was an error mutating state...`);
	return returnAppDataBackToMenu(appData)
}

const resolveMenuState = async (appData: IAppData): Promise<IAppData> =>
	({ currentState: await promptUserAtMenuToChangeState(appData.currentState),
		myList: appData.myList,
		lastDone: appData.lastDone });

// default: { currentState: 'menu', myList: arr, lastDone: lastDone }
// TODO: implement app stub
const enterMutatingState = async (appData: IAppData): Promise<IAppData> =>
	appData.currentState === 'menu'
		? resolveMenuState(appData)
		: appData.currentState === 'add'
			? resolveAddState(appData)
			: appData.currentState === 'mark'
				? resolveMarkState(appData)
				: appData.currentState === 'do'
					? resolveDoState(appData)
					: resolveMutatingErrorState(appData)

const mutatorStates: TAppState[] = ['menu', 'add', 'mark', 'do'];

// s === state, mss === mutator states
const stateIsMutator = (s: TAppState) => (mss: TAppState[]) =>
	!isNegOne(mss.indexOf(s));

// TODO: evalute efficacy/necessity of this wrapper function
const wrapNonMutatingStateEntry = (appData: IAppData): IAppData =>
	enterNonMutatingState(appData) === 0
	? returnAppDataBackToMenu(appData)
	: returnAppDataBackToMenu(appData)

const enterMenu = async (appData: IAppData): Promise<IAppData> => {
	// sayState(appData.currentState);
	return appData.currentState === 'quit'
		? resolveQuitState(appData)
		: enterMenu(
			stateIsMutator(appData.currentState)(mutatorStates)
				? await enterMutatingState(appData)
				: wrapNonMutatingStateEntry(appData));
}

const runProgram = (running: boolean) => async (appData: IAppData): Promise<IAppData> =>
	running === false ? appData : await enterMenu(appData) // display menu choices


export const main = async () => {
	// TODO: implement command line (console) clear()
	greet();
	await runProgram(true)({ currentState: 'menu', myList: [], lastDone: -1 }); // await runAdhocTests();
	exit(0);
}

main();