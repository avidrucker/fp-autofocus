// function that focuses repeatedly until there are no more focusable items left

import { IAppData, isFocusableList, getCMWTDindex, markCMWTDindexComplete, 
	createBlankData, IItem, TItemStatus, statusToMark, isMarkableList, isReviewableList, 
	getFirstReviewableIndex, markFirstMarkableIfPossible, inBounds, isComplete, dotIndex, 
	Tindex, UNSET_LASTDONE, addItem, createNewItem, genNextID } from "../src";
import { returnAppDataBackToMenu, TValidAnswer } from "../src/console";
import { expect } from "chai";
import { notMarkableOrReviewable, skippingReview } from "../src/af-strings";
import { isNegOne, doNothing, deepCopy } from "../src/fp-utility";

// TODO: move to demo.ts
export const demoList: string[] = ['make coffee',
	'go for jog', 'watch The Incredibles'];

// TODO: move to demo.ts
export const FRUITS = [
	"apple",
	"banana",
	"cherry",
	"dragonfruit",
	"elderberry",
	"fig",
	"grape"
];

export const getDemoFruitFromID = (id: number) =>
	FRUITS[id % FRUITS.length];

// TODO: assess whether SIM prefix is appropriate for usage within app,
//    tests, console, PWA, etc. & rename as needed
export const SIMcreateAndAddNewItem = (appData: IAppData) => 
	(textInput: string): IAppData =>
	({
		currentState: 'menu',
		myList: addItem(appData.myList)(createNewItem(
			textInput)(genNextID(appData))),
		myArchive: appData.myArchive,
		lastDone: appData.lastDone
	});

export const populateDemoAppByLength = (appData: IAppData) => (nLength: number): IAppData => {
	for(let i = 0; i < nLength; i++) {
		appData = SIMcreateAndAddNewItem(appData)(getDemoFruitFromID(i));
	}
	return appData;
}

// TODO: assess whether this is necessary for PWA, console app, or what, then relocate as apppropriate
export const populateDemoAppByList = (appData: IAppData) => (listIn: string[]): IAppData => {
	listIn.forEach(x => {
		appData = SIMcreateAndAddNewItem(appData)(x);
	})
	return appData;
}

export const longE2Elist = [
	"Email",
	"In-Tray",
	"Voicemail",
	"Project X Report",
	"Tidy Desk",
	"Call Dissatisfied Customer",
	"Make Dental Appointment",
	"File Invoices",
	"Discuss Project Y with Bob",
	"Back Up",
];

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

/** @type {Function} returns IAppData with myList `[o] [ ] [x]` */
export const createLongE2Edata = (): IAppData => {
	let myDemoApp: IAppData = createBlankData();
	myDemoApp = populateDemoAppByList(myDemoApp)(longE2Elist);
	return myDemoApp;
}

export const makeNewDemoDataOfLength = (nLength: number): IAppData =>
	nLength < 1
	? createBlankData()
	: populateDemoAppByLength(createBlankData())(nLength);

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

// TODO: refactor imperative stub to use functional programming style (recursive loop)
export const SIMfocusAMAP = (appData: IAppData): IAppData => {
	while(isFocusableList(appData)) {
		appData = SIMenterFocusState(appData);
	}
	return appData;
}

// TODO: assess as one-use-only function (single appearance),
//     ought this function be refactored / removed?
// TODO: refactor to note use state mutation
// TODO: refactor to not use forloop and instead use fp
export const SIMcommenceReview = (arr: IItem[]) => (lastDone: Tindex) => (answerAbbrevs: TValidAnswer[]): IItem[] => {
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

// TODO: assess as one-use-only function (single appearance),
//     ought this function be refactored / removed?
// "reviewByNumbers", modeled after reviewIfPossible function
const markByAnswerList = (arr: IItem[]) => (lastDone: Tindex) => (answerAbbrevs: TValidAnswer[]): IItem[] =>
	isReviewableList(arr)(lastDone)
	? (//console.log(`Commencing review from index ${getFirstReviewableIndex(arr)(lastDone)}...`),
		SIMcommenceReview(deepCopy(arr))(lastDone)(answerAbbrevs))
	: (console.log(skippingReview),
		arr);

// TODO: assess as test-only function if this can be replaced, refactored to be generally useful,
//    then refactor or remove as needed
export const SIMenterMarkAndReviewState = (appData: IAppData) =>
	(answers: TValidAnswer[]): IAppData => {

	const markable = isMarkableList(appData.myList)(appData.lastDone);
	
	// smartLog("isMarkable")(markable)(false);
	// TODO: refactor to return appData in its entirety
	//   instead of using the assignment operator to mutate
	appData.myList = markFirstMarkableIfPossible(appData.myList)(appData.lastDone);
	// smartLog("isReviewable")(reviewable)(false);

	const reviewableAfterAutoMark = isReviewableList(appData.myList)(appData.lastDone);

	// if not markable from the start of attemting to resolve
	// and also not reviewable even after attempting to automark
	// say so
	!markable && !reviewableAfterAutoMark &&
			console.log(notMarkableOrReviewable);

	return reviewableAfterAutoMark
		? ({currentState: 'menu',
		myList: markByAnswerList(appData.myList)(appData.lastDone)(answers),
		myArchive: appData.myArchive,
		lastDone: appData.lastDone})
		: returnAppDataBackToMenu(appData);
		// TODO: confirm last branch activates, and prevents erroneous
		// data modification / mutation
	};

/////////////////////////////////////////////////////
// TEST ONLY FUNCTIONS
/////////////////////////////////////////////////////

// box operator === square brackets
export const wrapStrInBoxOp = (s: string): string => "[" + s + "]";

// TODO: replace markAllAs with native API implementation
//    that uses, for example, SIMreview and answerAllYes
export const markAllAs = (arr: IItem[]) => (s: TItemStatus): IItem[] =>
  arr.map((x) => ({ id: x.id, status: s, textName: x.textName, isHidden: x.isHidden }));

export const listToMarksString = (arr: IItem[]) =>
  arr
    .map((x) => x.status)
    .map((x) => statusToMark(x))
    .map((x) => wrapStrInBoxOp(x))
    .join(" ");

// test utility functions
export const expectNoCMWTD = (appData: IAppData): Chai.Assertion =>
  expect(getCMWTDindex(appData.myList)).equals(-1);

export const expectLastDoneUnset = (appData: IAppData): Chai.Assertion =>
  expect(appData.lastDone).equals(UNSET_LASTDONE);

export const expectMarkable = (appData: IAppData) => (b: boolean): Chai.Assertion =>
	expect(isMarkableList(appData.myList)(appData.lastDone)).equals(b);

export const expectReviewable = (appData: IAppData) => (b: boolean): Chai.Assertion =>
	expect(isReviewableList(appData.myList)(appData.lastDone)).equals(b);

export const expectMarksString = (appData: IAppData) => (s: string): Chai.Assertion =>
	expect(listToMarksString(appData.myList)).equals(s);

export const expectFirstReviewable = (appData: IAppData) => (n: number): Chai.Assertion =>
	expect(getFirstReviewableIndex(appData.myList)(appData.lastDone)).equals(n);