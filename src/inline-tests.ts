import { promptUserAtMenuToChangeState, getNumberFromUser, populateDemoList, 
	sayState, createAndAddNewItemViaPrompt, IItem, TAppState, changeState, 
	getNameIO, askOpenEndedIO, printMenu, menuList, menuTexts, printListOrStatus, 
	printBlankLine, stringifyList, printStatsBlock, markFirstMarkableIfPossible, 
	askOptionalIO, printList } from ".";

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

const doIOtest = async () => {
	const myName = await getNameIO();
	console.log(`Hi ${myName}!`);

	const myAnswer = await askOpenEndedIO("How are you feeling right now?");
	console.log(`Oh, I see you are feeling ${myAnswer}.`);
}
	
const doIOtest2 = async () => {
	const myAnswer = await askOptional("Can you tell me what your name is? ('q' to quit)");
	myAnswer.toLowerCase() !== 'q' ?
		console.log(`Oh, your name is ${myAnswer}.`) :
		console.log('Hmm, I see you don\'t want to answer now.');
}

const doStateTest = (): void => {
	let currentState: TAppState = 'menu';
	sayState(currentState);
	currentState = changeState(currentState)('add');
	console.log(`Atttempting to change state...`)
	sayState(currentState);
}

const doNumInRangeTest = async () => {
	const myNum = await getNumberFromUser(1)(5);
	console.log(`My number is ${myNum}`);
}

const doMenuStateChangeViaInputTest = async () => {
	let currentState: TAppState = 'menu';
	currentState = await promptUserAtMenuToChangeState(currentState);
	sayState(currentState);
}

const doNewItemInputTest = async () => {
	let myList: IItem[] = [];
	myList = populateDemoList(myList);
	myList = await createAndAddNewItemViaPrompt(myList);
	console.log('AUTOFOCUS LIST')
	printList(stringifyList(myList));
	printBlankLine();
}