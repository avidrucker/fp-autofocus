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

// question: How may I ask the user a question?
// question: May I pass an argument into
// rl.question via a Task parameter?
const read: Task<string> = () =>
  new Promise<string>(resolve => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question(`Am parameterizable question???`, answer => {
      rl.close()
      resolve(answer)
    })
  })

const printAnswer = (s: string): void => {
	console.log(`Thank you, you said: ${s}`);
}

const main = async () => {
	greet();

	// let myList: IItem[] = []; // initialize empty list
	let myList: IItem[] = populateDemoList();
	// let lastDone: string = '';
	// let currentState: AppState = 'menu';

	printList(stringifyList(myList));

	printAnswer(await read());
	// sampleQuestion('What is your name?'); // BUG: this does not get called, it seems
}

main();