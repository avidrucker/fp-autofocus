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

type AppState = 'menu' | 'see' | 'add' | 'mark' | 'do' | 'read-about' | 'quit';

// const makeChoice = (x: AppState[]) => 'viewing'; // TODO: implement this stub

// const AppStateMachine = {
// 	state: 'menu',
// 	transitions: {
// 		'menu': () => makeChoice(['viewing', 'marking', 'doing', 'adding']),
// 		'viewing': () => 'menu',
// 		'marking': () => 'menu',
// 		'doing': () => 'menu',
// 		'adding': () => 'menu'
// 	},
// 	dispatch: function (actionName: any) {
// 		const action: any = this.transitions[this.state][actionName];

// 		if (action) {
// 				action.call(this);
// 		} else {
// 				console.log('invalid action');
// 		}
// 	}
// }

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

const possibleStates: any = {
	'menu': ['see', 'add', 'mark', 'do', 'read-about'],
	'see': ['menu'],
	'add': ['menu'],
	'mark': ['menu'],
	'do': ['menu'],
	'read-about': ['menu'],
	'quit': []
}

const menuTexts: any = {
	// 'menu':'',
	'see':'Print List', // TODO: make list visible at all times for command line app
	'add':'Add New To-Do',
	'mark':'Review List',
	'do':'Focus on To-Do',
	'read-about':'Read About AutoFocus',
	'quit': 'Exit Program'
};

const menuList: AppState[] = ['see', 'add', 'mark', 'do', 'read-about'];

const printMenuItem = (x: AppState) => (i: number) =>
	console.log(`${i+1}: ${x}`)

const printMenu = (menuList: AppState[]) => (menuTexts: any) => {
	console.log('MAIN MENU');
	menuList.map(x => menuTexts[x]).forEach((x, i) => printMenuItem(x)(i));
}

const existsInArr = (arr: any) => (target: any) =>
	arr.indexOf(target) !== -1;

const transitionalble = (current: AppState) => (next: AppState) => (states: any) =>
	existsInArr(Object.keys(states))(current) && existsInArr(possibleStates[current])(next)

const changeState = (current: AppState) => (next: AppState) =>
	transitionalble(current)(next) ? next : current;

const doIOtest = async () => {
	const myName = await getName();
	console.log(`Hi ${myName}!`);

	const myAnswer = await askOpenEnded("How are you feeling right now?");
	console.log(`Oh, I see you are feeling ${myAnswer}.`);
}

const doIOtest2 = async () => {
	const myAnswer = await askOptional("Can you tell me what your name is?");
	myAnswer.toLowerCase() !== 'q' ?
		console.log(`Oh, your name is ${myAnswer}.`) :
		console.log('Hmm, I see you don\'t want to answer now.');
}

const sayState = (state: AppState): void =>
	console.log(`Current state is now: '${state}'.`);

const doStateTest = (): void => {
	let currentState: AppState = 'menu';
	sayState(currentState);
	currentState = changeState(currentState)('add');
	console.log(`Atttempting to change state...`)
	sayState(currentState);
}

// TODO: what about empty array error handling?
const getHead = <T>(arr: T[]) =>
	arr[0];

// TODO: what about empty array error handling?
const getTail = <T>(arr: T[]) =>
	arr[arr.length - 1];

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

const doMenuStateChangeViaInputTest = async () => {
	let currentState: AppState = 'menu';
	console.log(`Please make a menu selection.`);
	const menuNum = (await getNumberFromUser(1)(menuList.length)) - 1;
	currentState = changeState(currentState)(menuList[menuNum]);
	console.log(`State is now: '${currentState}'`);
}

const doNewItemInputTest = async () => {
	let myList: IItem[] = [];
	myList = populateDemoList(myList);
	myList = addItem(myList)(createNewItem(await askOpenEnded(`Please enter a to-do item: `))(myList.length));
	console.log('AUTOFOCUS LIST')
	printList(stringifyList(myList));
	printBlankLine();
} 

// const runMenu = async () => {
// 	let currentState: AppState = 'menu';
// 	console.log(`Please make a menu selection.`);
// 	const menuNum = (await getNumberFromUser(1)(menuList.length)) - 1;
// 	currentState = changeState(currentState)(menuList[menuNum]);
// 	console.log(`State is now: '${currentState}'`);
// }

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
	isEmptyArr(arr)
		? false
		: countUnmarked(arr) === 0
			? false
			: countMarked(arr) > 0
				? false
				: listHasUnmarkedAfterLastDone(arr)(lastDone)
					? true
					: false;

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

const printIsMarkableList = (arr: IItem[]) => (lastDone: number): void =>
	console.log(`It is ${isMarkableList(arr)(lastDone) ? 'TRUE' : 'FALSE'} that this is a markable list.`)

const printMarkedCount = (arr: IItem[]): void =>
	console.log(`The # of marked items is now ${filterOnMarked(arr).length}`)

const printStatsBlock = (arr: IItem[]) => (lastDone: number) => {
	printIsMarkableList(arr)(lastDone);
	printCMWTD(arr);
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

const getCMWTD = (arr: IItem[]): number =>
	isEmptyArr(arr)
		? -1
		: hasMarked(arr)
			? getLastIndexOf(arr)('dotted')
			: -1

const printCMWTD = (arr: IItem[]): void =>
	getCMWTD(arr) === -1
		? console.log(`CMWTD is not yet set!`)
		: console.log(`CMWTD is, at index ${getCMWTD(arr)}: '${arr[getCMWTD(arr)].textName}'`)

// const main = async () => {
// const main = () => {
const main = async () => {
	// TODO: implement command line (console) clear()
	greet();
	printBlankLine();

	// let myList: IItem[] = []; // initialize empty list
	// let myList: IItem[] = [];
	// myList = populateDemoList(myList);
	// let lastDone: number = -1; // originally a string
	// let currentState: AppState = 'menu';

	// await doIOtest(); // TEST: uncomment this line, and add 'async' just after 'const main ='
	// doStateTest(); // TEST: uncomment this line
	// await doIOtest2(); // TEST: uncomment this line, and add 'async' just after 'const main ='
	printMenu(menuList)(menuTexts); // TODO: print menu conditionally depending on current app state

	doAutoMarkingTest();
	
	// await doNumInRangeTest();
	// await doMenuStateChangeViaInputTest();
	// await doNewItemInputTest();
	
	exit(0);
}

main();