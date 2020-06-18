const readline = require('readline')
const Future = require('fluture')

// const fs = require('fs');
import { createInterface } from 'readline'
import { Task } from 'fp-ts/lib/Task'

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

// type AppState = 'menu' | 'viewing' | 'marking' | 'doing' | 'adding';

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

const prettyPrint = (i: IItem): string =>
	`[${marks[i.status]}] ${i.textName}`

const demoList: string[] = ['make coffee',
	'go for jog', 'watch The Incredibles'];

const populateDemoList = (): IItem[] =>
	demoList.map(x => newItem(x))

const stringifyList = (xs: IItem[]): string[] =>
	xs.map(x => prettyPrint(x)) // stringifyVerbose(x)

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

// source: Petri Kola @pe3 Feb 15 2018 05:56
// https://gitter.im/fluture-js/Fluture?at=5a85605f5cc187264540d644
// const ask = (question: any) => Future ((rej: any, res: any) => {
//   rl.question (question + ' ', res)
// })

// Future.do(function*(){
// 	const firstName = yield ask('What is your first name?')
// 	const familyName = yield ask('What is your family name?')
// 	return 'Hello' + firstName + ' ' + familyName + '!'
// })
// .fork(console.error, console.log);

const getName = (): Promise<string> =>
	rl.question("hi, what's your name?");
		// .then((x: any) => "banana")
		// .catch((e: Error) => "cheese")

const main = async () => {
	greet();

	// let myList: IItem[] = []; // initialize empty list
	let myList: IItem[] = populateDemoList();
	// let lastDone: string = '';
	// let currentState: AppState = 'menu';

	printList(stringifyList(myList));

	// printAnswer("hello");
	// sampleQuestion('What is your name?'); // BUG: this does not get called, it seems

	// await ask("What is your name?");
	// .then((x: any) => console.log(x))
	// .catch((e: any) => console.error(e));
	getName().then(
		(x: any) => console.log(`Hey ${x}`)
	).catch(
		(e: Error) => console.error(e)
	)
}

main();