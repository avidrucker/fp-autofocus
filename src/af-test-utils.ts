// function that focuses repeatedly until there are no more focusable items left

import { IAppData, isFocusableList, getCMWTDindex, markCMWTDindexComplete, createBlankData, SIMcreateAndAddNewItem } from ".";
import { returnAppDataBackToMenu } from "./console";

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
	// const demoAnswers: TValidAnswer[] = ['n', 'y']; // ['y', 'n']; was good
	// myDemoApp = SIMenterMarkAndReviewState(myDemoApp)(demoAnswers);
	// myDemoApp = SIMenterFocusState(myDemoApp);
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