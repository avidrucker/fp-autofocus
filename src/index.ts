const readline = require('readline')
const Future = require('fluture')

// const fs = require('fs');
// import { createInterface } from 'readline'
// import { Task } from 'fp-ts/lib/Task'
// import { resolve } from 'path';
import { exit } from 'process';

type ItemStatus =  'noDot' | 'dotted' | 'done';

const marks = {
	noDot: ' ',
	dotted: 'o',
	done: 'x'
};

type IItem = {
	status: ItemStatus,
	textName: string,
	//isHidden: boolean
	//created: Date,
	//dottedOn: Date,
	//completedOn: Date,
	//hiddenOn: Date
}

type AppState = 'menu' | 'see' | 'add' | 'mark' | 'do' | 'read-about';

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

const newItem = (s: string): IItem =>
	({status: 'noDot', textName: s}); // isHidden: false

const stringifyVerbose = (i: IItem): string =>
	`Item: '${i.textName}', status: ${i.status}` // , ${i.isHidden ? 'hidden' : 'not hidden'}

const dotItem = (i: IItem): IItem =>
	({status: 'dotted', textName: i.textName})

const completeItem = (i: IItem): IItem =>
	({status: 'done', textName: i.textName})

const statusToMark = (x: ItemStatus): string =>
	`${x}`

const prettyPrintItem = (i: IItem): string =>
	`[${marks[i.status]}] ${i.textName}`

const demoList: string[] = ['make coffee',
	'go for jog', 'watch The Incredibles'];

const populateDemoList = (): IItem[] =>
	demoList.map(x => newItem(x))

const stringifyList = (xs: IItem[]): string[] =>
	xs.map(x => prettyPrintItem(x)) // stringifyVerbose(x)

const printList = (xs: string[]): void =>
	xs.forEach(x => console.log(x));

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
			answer.toLowerCase() !== 'q' ?
			resolve(answer) :
			resolve('q')
		})
	})
}

const possibleStates: any = {
	'menu': ['see', 'add', 'mark', 'do', 'read-about'],
	'see': ['menu'],
	'add': ['menu'],
	'mark': ['menu'],
	'do': ['menu'],
	'read-about': ['menu']
}

const menuTexts: any = {
	// 'menu':'',
	'see':'Print List', // TODO: make list visible at all times for command line app
	'add':'Add New To-Do',
	'mark':'Review List',
	'do':'Focus on To-Do',
	'read-about':'Read About AutoFocus'
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

const printBlankLine = (): void =>
	console.log();

// const main = async () => {
const main = () => {
	greet();
	printBlankLine();

	// let myList: IItem[] = []; // initialize empty list
	let myList: IItem[] = populateDemoList();
	// let lastDone: string = '';
	// let currentState: AppState = 'menu';

	console.log('AUTOFOCUS LIST')
	printList(stringifyList(myList));

	printBlankLine();
	// await doIOtest();
	// doStateTest();
	// await doIOtest2();
	printMenu(menuList)(menuTexts);

	exit(0);
}

main();