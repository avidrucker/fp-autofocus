const readline = require('readline')
const Future = require('fluture')

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

type IItem = {
	index: number,
	status: ItemStatus,
	textName: string,
	//isHidden: boolean
	//created: Date,
	//dottedOn: Date,
	//completedOn: Date,
	//hiddenOn: Date
}

interface IAppData {
	currentState: TAppState,
	myList: IItem[],
	lastDone: number
}

type TAppState = 'menu' | 'see' | 'add' | 'mark' | 'do' | 'read-about' | 'quit';

const pushToAndReturnArr = <T>(arr: T[]) => (newItem: T) => {
	arr.push(newItem);
	return arr;
}

const addItem = (arr: IItem[]) => (newItem: IItem) =>
	pushToAndReturnArr(arr)(newItem);

const createNewItem = (s: string) => (nextIndex: number): IItem =>
	({index: nextIndex, status: 'unmarked', textName: s}); // isHidden: false

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

const populateDemoList = (arr: IItem[]): IItem[] =>
	demoList.map(x => createNewItem(x)(arr.length))

const stringifyList = (xs: IItem[]): string[] =>
	xs.map(x => stringifyConcise(x)) // stringifyVerbose(x)

const isEmptyArr = <T>(arr: T[]): boolean =>
	arr.length === 0;

const printList = (xs: string[]): void =>
	xs.forEach(x => console.log(x));

const printEmptyList = () =>
	console.log("There are no items in your to-do list.");

const printListOrStatus = (xs: string[]): void =>
	isEmptyArr(xs) ? printEmptyList() : printList(xs);

const greet = (): void =>
	console.log('Welcome to FP AutoFocus!');

// const menuChoices: string[] = ['View To-Do\'s',
// 	'Add New To-Do', 'Review & Dot To-Do\'s',
// 	'Focus on To-Do', 'Quit Program']; // 'Read About AutoFocus'

// TODO: add Future here to get user IO for menu answer input (number 1 - 7, no enter needed)
// TODO: add Future here to get user IO for new todo input (any text or "Q" to quit, enter to submit)

const printAnswer = (s: string): void => {
	console.log(`Thank you, you said: ${s}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const getName = () => {
	return new Promise<string>((resolve) => {
		rl.question("hi, what's your name?", (name: string) => { resolve(name)})
	})
}

const askOpenEnded = (q: string) => {
	return new Promise<string>((resolve) => {
		rl.question(q, (answer: string) => { resolve(answer)})
	})
}

const askOptional = (q: string) => {
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
const possibleStates: IOneToManyMap<TAppState> = {
	'menu': ['see', 'add', 'mark', 'do', 'read-about'],
	'see': ['menu'],
	'add': ['menu'],
	'mark': ['menu'],
	'do': ['menu'],
	'read-about': ['menu'],
	'quit': []
}

const menuTexts: any = {
	'see':'Print List', // TODO: make list visible at all times for command line app
	'add':'Add New To-Do',
	'mark':'Review List',
	'do':'Focus on To-Do',
	'read-about':'Read About AutoFocus',
	'quit': 'Exit Program'
};

const menuList: TAppState[] = ['see', 'add', 'mark', 'do', 'read-about', 'quit'];

const printMenuItem = (x: TAppState) => (i: number) =>
	console.log(`${i+1}: ${x}`)

const printMenu = (menuList: TAppState[]) => (menuTexts: any): number => {
	console.log('MAIN MENU');
	console.log(`----------`);
	menuList.map(x => menuTexts[x]).forEach((x, i) => printMenuItem(x)(i));
	console.log(`----------`);
	return 0;
}

const existsInArr = (arr: any) => (target: any) =>
	arr.indexOf(target) !== -1;

const transitionalble = (current: TAppState) => (next: TAppState) => (states: any) =>
	existsInArr(Object.keys(states))(current) && existsInArr(possibleStates[current])(next)

const changeState = (current: TAppState) => (next: TAppState) =>
	transitionalble(current)(next) ? next : current;

const doIOtest = async () => {
	const myName = await getName();
	console.log(`Hi ${myName}!`);

	const myAnswer = await askOpenEnded("How are you feeling right now?");
	console.log(`Oh, I see you are feeling ${myAnswer}.`);
}

const doIOtest2 = async () => {
	const myAnswer = await askOptional("Can you tell me what your name is? ('q' to quit)");
	myAnswer.toLowerCase() !== 'q' ?
		console.log(`Oh, your name is ${myAnswer}.`) :
		console.log('Hmm, I see you don\'t want to answer now.');
}

const sayState = (state: TAppState): void =>
	console.log(`Current state is now: '${state}'.`);

const doStateTest = (): void => {
	let currentState: TAppState = 'menu';
	sayState(currentState);
	currentState = changeState(currentState)('add');
	console.log(`Atttempting to change state...`)
	sayState(currentState);
}

// TODO: what about empty array error handling?
// const getHead = <T>(arr: T[]) =>
// 	arr[0];

// // TODO: what about empty array error handling?
// const getTail = <T>(arr: T[]) =>
// 	arr[arr.length - 1];

const inRangeInclusive = (lower: number) => (upper: number) => (x: number) =>
	x >= lower && x <= upper

// queries user for a number between `first` and `last` (inclusive)
const getNumberFromUser = (first: number) => (last: number) => {
	return new Promise<number>((resolve) => {
		rl.question(`Please choose a number from ${first} to ${last}: `, (num: string) => {
			inRangeInclusive(first)(last)(Number(num))
				? resolve(Number(num))
				: resolve(getNumberFromUser(first)(last));
		})
	})
};

const printBlankLine = (): void =>
	console.log();

const doNumInRangeTest = async () => {
	const myNum = await getNumberFromUser(1)(5);
	console.log(`My number is ${myNum}`);
}

const promptUserAtMenuToChangeState = async (s: TAppState) =>
	changeState(s)(menuList[await promptUserForMenuOption(menuList)]);

const promptUserForMenuOption = async (menuList: TAppState[]): Promise<number> => {
	printMenu(menuList)(menuTexts);
	console.log(`Please make a menu selection.`);
	return await getNumberFromUser(1)(menuList.length) - 1;
}

const doMenuStateChangeViaInputTest = async () => {
	let currentState: TAppState = 'menu';
	currentState = await promptUserAtMenuToChangeState(currentState);
	sayState(currentState);
}

const createAndAddNewItemViaPrompt = async (arr: IItem[]): Promise<IItem[]> =>
	addItem(arr)(createNewItem(await askOpenEnded(`Please enter a to-do item: `))(arr.length));

const doNewItemInputTest = async () => {
	let myList: IItem[] = [];
	myList = populateDemoList(myList);
	myList = await createAndAddNewItemViaPrompt(myList);
	console.log('AUTOFOCUS LIST')
	printList(stringifyList(myList));
	printBlankLine();
}

const filterOnMarked = (arr: IItem[]) =>
	arr.filter(x => x.status === "dotted")

const dotIndex = (arr: IItem[]) => (i: number): IItem[] => {
	arr[i].status = 'dotted';
	return arr;
}

const filterOnUnmarked = (arr: IItem[]) =>
	arr.filter(x => x.status === "unmarked")

const hasUnmarked = (arr: IItem[]): boolean =>
	filterOnUnmarked(arr).length !== 0;

const getLastIndexOf = (arr: IItem[]) => (s: ItemStatus): number =>
	arr.map(x => x.status).lastIndexOf(s);

const listHasUnmarkedAfterLastDone = (arr: IItem[]) => (lastDone: number) =>
	getLastIndexOf(arr)("unmarked") > lastDone

const hasMarked = (arr: IItem[]): boolean =>
	countMarked(arr) > 0

// TODO: transfer unit tests for this from old autofocus
const isMarkableList = (arr: IItem[]) => (lastDone: number): boolean =>
	isEmptyArr(arr) // array must have items in it
		? false
		: countUnmarked(arr) === 0 // there must be at least 1 unmarked to mark things
			? false
			: countMarked(arr) > 0 // there may not be any marked items already
				? false
				: listHasUnmarkedAfterLastDone(arr)(lastDone) // there must be unmarked items AFTER last done
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
const getFirstUnmarkedAfterLastDone = (arr: IItem[]) => (lastDone: number): number =>
	mapUnmarkedToIndexAndFilter(arr).filter(x => x > lastDone)[0];

// dotIndex(arr)(0)
const	findFirstMarkable = (arr: IItem[]) => (lastDone: number): number => {
	return arr.length === 0
		? -1
		: hasUnmarked(arr) && listHasUnmarkedAfterLastDone(arr)(lastDone)
			? getFirstUnmarkedAfterLastDone(arr)(lastDone)
			: -1;
}

const markFirstMarkableIfPossible = (arr: IItem[]) => (lastDone: number): IItem[] => {
	return isMarkableList(arr)(lastDone)
		? dotIndex(arr)(findFirstMarkable(arr)(lastDone))
		: arr;
}

const boolToTFstring = (b: boolean): string =>
	b ? 'TRUE' : 'FALSE';

const printIsMarkableList = (arr: IItem[]) => (lastDone: number): void =>
	console.log(`It is ${boolToTFstring(isMarkableList(arr)(lastDone))} that this is a markable list.`)

const printMarkedCount = (arr: IItem[]): void =>
	console.log(`The # of marked items is now ${countMarked(arr)}`)

const printStatsBlock = (arr: IItem[]) => (lastDone: number) => {
	printIsMarkableList(arr)(lastDone);
	printCMWTDdata(arr);
	printMarkedCount(arr)
}

// TODO: Implement stub
// 1. marked items exist
// 2. there are unmarked items that exist after the last marked item
const isReviewableList = (arr: IItem[]) => (lastDone: number): boolean =>
	false;

const generateWhichQuestion = (current: string) => (cmwtd: string) =>
	`Which do want to do '${current}' more than '${cmwtd}'?`;

const doAutoMarkingTest = () => {
	let myList: IItem[] = [];
	let lastDone: number = -1;
	myList = populateDemoList(myList);

	printBlankLine();
	printListOrStatus(stringifyList(myList));
	printBlankLine();
	printStatsBlock(myList)(lastDone);
	printBlankLine();

	myList = markFirstMarkableIfPossible(myList)(lastDone);

	console.log('AUTOFOCUS LIST TEST')
	printListOrStatus(stringifyList(myList));
	printBlankLine();
	printStatsBlock(myList)(lastDone);
	printBlankLine();
}

const getCMWTDstring = (arr: IItem[]): string =>
	getCMWTDindex(arr) !== -1
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
	getCMWTDindex(arr) === -1
		? console.log(`CMWTD is not yet set!`)
		: console.log(`CMWTD is, at index ${getCMWTDindex(arr)}: '${getCMWTDstring(arr)}'`)

const runAdhocTests = async () => {
	// let myList: IItem[] = []; // initialize empty list
	// myList = populateDemoList(myList);
	// let lastDone: number = -1; // originally a string
	// let currentState: TAppState = 'menu';

	await doIOtest(); // TEST: uncomment this line, and add 'async' just after 'const main ='
	doStateTest(); // TEST: uncomment this line
	await doIOtest2(); // TEST: uncomment this line, and add 'async' just after 'const main ='
	
	printMenu(menuList)(menuTexts); // TODO: print menu conditionally depending on current app state

	doAutoMarkingTest();
	
	await doNumInRangeTest();
	await doMenuStateChangeViaInputTest();
	await doNewItemInputTest();
}

// TODO: implement wrapper higher order function
// const wrapPrintWithLines = (f: () => void) => {
// 	console.log(`----------`);
// 	f();
// 	console.log(`----------`);
// }

const returnAppDataBackToMenu = (appData: IAppData): IAppData =>
	({ currentState: 'menu', myList: appData.myList, lastDone: appData.lastDone }); // TODO: remove temp placeholder

const resolveSeeState = (arr: IItem[]): number => {
	console.log('AUTOFOCUS LIST')
	console.log(`----------`);
	printListOrStatus(stringifyList(arr));
	console.log(`----------`);
	return 0;
}

const resolveQuitState = (appData: IAppData): IAppData => {
	console.log(`See you!`);
	return appData;
}

// should only return IItem[], should only take arr, lastDone
const resolveAddState = (appData: IAppData): IAppData => {
	console.log(`Stub here to add new items...`); // TODO: implement stub
	return returnAppDataBackToMenu(appData);
}

// should only return IItem[], should only take arr, lastDone
const resolveMarkState = (appData: IAppData): IAppData => {
	console.log(`Stub here to review & mark items...`); // TODO: implement stub
	return returnAppDataBackToMenu(appData);
}

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
	mss.indexOf(s) !== -1;

// TODO: evalute efficacy/necessity of this wrapper function
const wrapNonMutatingStateEntry = (appData: IAppData): IAppData =>
	enterNonMutatingState(appData) === 0
	? returnAppDataBackToMenu(appData)
	: returnAppDataBackToMenu(appData)

// appData.currentState, appData.myList, appData.lastDone
// (state: TAppState) => (arr: IItem[]) => async (lastDone: number)
const enterMenu = async (appData: IAppData): Promise<IAppData> => {
	sayState(appData.currentState);
	return appData.currentState === 'quit'
		? resolveQuitState(appData)
		: enterMenu(
			stateIsMutator(appData.currentState)(mutatorStates)
				? await enterMutatingState(appData)
				: wrapNonMutatingStateEntry(appData));
}

const runProgram = (running: boolean) => async (appData: IAppData): Promise<IAppData> =>
	running === false ? appData : await enterMenu(appData) // display menu choices


const main = async () => {
	// TODO: implement command line (console) clear()
	greet();
	await runProgram(true)({ currentState: 'menu', myList: [], lastDone: -1 }); // await runAdhocTests();
	exit(0);
}

main();