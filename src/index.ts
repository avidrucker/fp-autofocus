"use strict";

import { existsInArr, isEmptyArr, isNegOne, isNeg, deepCopy } from "./fp-utility";
import { automarkingFirstMarkable } from "./af-strings";

export type TItemStatus =  'unmarked' | 'dotted' | 'complete';

export const UNSET_LASTDONE: Tindex = -1;

export const marks = {
	unmarked: ' ',
	dotted: 'o',
	complete: 'x'
};

// TODO: rename Tid, Tindex to TId, TIndex
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

export const pushToAndReturnArr = <T>(arr: T[]) => (newItem: T): T[] =>
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

export const dotItem = (i: IItem): IItem =>
	({id: i.id,
		status: 'dotted',
		textName: i.textName,
		isHidden: i.isHidden})

export const completeItem = (i: IItem): IItem =>
	({id: i.id,
		status: 'complete',
		textName: i.textName,
		isHidden: i.isHidden})

export const statusToMark = (x: TItemStatus): string =>
	`${marks[x]}`

// another kind of pretty print
// TODO: rename to clarify usage
export const stringifyConcise = (i: IItem): string =>
	`[${marks[i.status]}] ${i.textName}`




export const stringifyList = (xs: IItem[]): string[] =>
	xs.map(x => stringifyConcise(x)) // ALT: stringifyVerbose(x)




export const genNextID = (appData: IAppData): Tid =>
  appData.myList.length + appData.myArchive.length;

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

export const filterOnMarked = (arr: IItem[]) =>
	arr.filter(x => x.status === "dotted")


// TODO: refactor to take in appData (see code exported from PWA)
// ~~TODO: refactor to not mutate state, and instead
// return a newly constructed array of items~~
export const dotIndex = (arr: IItem[]) => (i: Tindex): IItem[] =>
	arr.map((x, current) => (current === i
		? (// console.log(`Modifying item at index ${i} to be dotted...`),
			dotItem(x))
		: x ));

// arr === item list, i === index
export const markComplete = (arr: IItem[]) => (i: Tindex): IItem[] =>
	arr.map((x, current) => (current === i
		? (// console.log(`Modifying item at index ${i} to be complete...`),
			completeItem(x))
		: x ));

export const filterOnUnmarked = (arr: IItem[]) =>
	arr.filter(x => x.status === "unmarked")

export const hasUnmarked = (arr: IItem[]): boolean =>
	isPositive(filterOnUnmarked(arr).length);

export const getLastIndexOf = (arr: IItem[]) => (s: TItemStatus): Tindex =>
	arr.map(x => x.status).lastIndexOf(s);

// typically after index of lastDone but could be CMWTD index also
export const listHasUnmarkedAfterIndex = (arr: IItem[]) => (i: Tindex): boolean =>
	i === -1
	? hasUnmarked(arr)
	: getLastIndexOf(arr)("unmarked") > i;

export const hasMarked = (arr: IItem[]): boolean =>
	isPositive(countMarked(arr));

export const isMarkableList = (arr: IItem[]) => (lastDone: Tindex): boolean =>
	isEmptyArr(arr) || !hasUnmarked(arr) // array must have items in it // there must be unmarked items
		? (// console.log(`1. EMPTY LIST OR NO UNMARKED!`),
			false)
		: hasMarked(arr) // there may not be any marked items already
			? (// console.log(`2. ALREADY MARKED!`),
				false)
			: true; // !isNegOne(lastDone) && listHasUnmarkedAfterIndex(arr)(lastDone)
				// ? (console.log(`3. USING LAST DONE AS CMWTD, WONT MARK`),
				// 	false) // there must be unmarked items AFTER last done
				// : true; // isNegOne(lastDone)
				// UNCOMMENT TO LOG
				// ? (//console.log(`4. WILL MARK FIRST UNMARKED!`),
				// 	true) 
				// : (//console.log(`5. ERROR???`),
				// 	false);

export const countUnmarked = (arr: IItem[]): number =>
	filterOnUnmarked(arr).length;

export const countMarked = (arr: IItem[]): number =>
	filterOnMarked(arr).length;

export const mapUnmarkedToIDAndFilter = (arr: IItem[]): Tid[] =>
	arr.filter(x => x.status === "unmarked").map(x => x.id);



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

export const boolToTFstring = (b: boolean): string =>
	b ? 'TRUE' : 'FALSE';



export const isPositive = (n: number): boolean =>
	n > 0;

// a. CMWTD is defined ~~there is at least one marked item~~
// b. there is at least one unmarked item after the last marked item
export const isReviewableList = (arr: IItem[]) => (lastDone: Tindex): boolean =>
	!hasUnmarked(arr)
		? (// console.log("... A: no unmarked"),
			false)
		: isNegOne(getCMWTDindex(arr)) // && isNegOne(lastDone) 
			? (// console.log("... B: CMWTD does not exist"),
				// console.log("... B: neither CMWTD nor lastDone exist"),
				false)
			// : !isNegOne(lastDone) && listHasUnmarkedAfterIndex(arr)(lastDone)
			// 	? (console.log(`... C. using lastDone as substitute CMWTD`),
			// 		true)
				: (// console.log(`... D: no unmarked after lastDone index ${lastDone}`),
					!isNegOne(getCMWTDindex(arr)) && listHasUnmarkedAfterIndex(arr)(getCMWTDindex(arr))
						? (// console.log(`... E. CMWTD exists and there are unmarked after it`),
							true)
						: (// console.log(`... F: no unmarked after CMWTD index ${getCMWTDindex(arr)}`),
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


export const getCMWTDstring = (arr: IItem[]): string =>
	!isNegOne(getCMWTDindex(arr))
		? arr[getCMWTDindex(arr)].textName
		: "undefined";

// CRITICAL: TODO: clarify naming convention for functions that work with lists, vs with app data,
//    and, more specifically & concretely for getCMWTDindex, to either add "FromList" suffix or
//    modify to work with app data 
// returns -1 if there is no CMWTD
export const getCMWTDindex = (arr: IItem[]): Tindex =>
	isEmptyArr(arr)
		? -1
		: hasMarked(arr)
			? getLastIndexOf(arr)('dotted')
			: -1


export const getStatusByIndex = (arr: IItem[]) => (i: Tindex): string =>
		arr[i].status;

export const getTextByIndex = (arr: IItem[]) => (i: Tindex): string =>
	(//console.log(`Accessing index ${i} of array of length ${arr.length}...`),
		arr[i].textName);



// TODO: refactor to be type agnostic, relocate to fp-utility
// TODO: consider making this the catch all funtion with lower bound (including 0, not including -1)
export const inBounds = (arr: IItem[]) => (i: Tindex) =>
	i < arr.length;
		// LOGGING
		// ? (//console.log(`... still in bounds!`),
		// 	true)
		// : (//console.log(`... going out of bounds.`),
		// 	false);

// TODO: rename function to "isCompletedItem" to clarify inputs/outputs
export const isComplete = (x: IItem): boolean =>
	x.status === 'complete';

// CRITICAL: TODO: rename function to clarify "app data contains focusable list",
//    such as "appDataHasFocusableList", also, see imported functions from "autofocus-pwa"
export const isFocusableList = (appData: IAppData): boolean =>
	!isNegOne(getCMWTDindex(appData.myList))


export const markCMWTDindexComplete = (appData: IAppData): IItem[] =>
	(//console.log(`Marking as complete index ${getCMWTDindex(appData.myList)}...`),
	markComplete(appData.myList)(getCMWTDindex(appData.myList)))

// CRITICAL
// ISSUE: Dev clarifies native API for item creation, enforces strict usage of combined myList,
//    myArchive count for ID generation #22
export const duplicateLastDoneandAddToList = (arr: IItem[]) => (lastDone: Tindex): IItem[] =>
	(arr.push(
		{ textName: arr[lastDone].textName, status: 'unmarked', id: arr.length, isHidden: false} ),
		arr);

export const isHideable = (x: IItem): boolean =>
	x.status === 'complete' && x.isHidden === false;

export const hasHideableItems = (xs: IItem[]): boolean =>
	xs
		.filter(x => isHideable(x))
		.length > 0;

export const countHideable = (xs: IItem[]): number =>
	xs
		.filter(x => isHideable(x))
		.length;
		
export const countHidden = (xs: IItem[]): number =>
	xs.filter(x => x.isHidden).length;

export const hideItem = (i: IItem): IItem =>
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

// TODO: refactor to return new IAppData
export const resetLastDone = (appData: IAppData): number => 
	(//console.log(`Resetting lastDone....`),
	UNSET_LASTDONE);

export const filterNotHidden = (xs: IItem[]): IItem[] =>
	xs.filter(x => !x.isHidden)

export const filterHiddenAndConcatToArchive = (xs: IItem[]) => (ys: IItem[]) =>
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


// TODO: assess whether SIM functions are resolveable to "core" "pure" functions
//   or, if they would benefit from being strictly "demo" functions
export const SIMresolveHideAndArchiveState = (appData: IAppData): IAppData =>
	(console.log(`Hiding hideable items...`),
	// smartLogAll(appData), // note: use smartLogAll() to log
	moveHiddenToArchive(hideAllCompletedInAppData(appData)));


export const createBlankData = (): IAppData =>
	({ currentState: 'menu', myList: [],  myArchive: [], lastDone: UNSET_LASTDONE });