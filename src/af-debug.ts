import { IAppData } from ".";

export const smartLog = (label: string) => <T>(val: T) => (tabular: boolean) =>
	tabular
		? (console.log(`${label}:`), console.table(val))
		: console.log(`${label}: ${val}`);

export const smartLogAll = (appData: IAppData): void =>
	(smartLog("currentState")(appData.currentState)(false),
	smartLog("myList")(appData.myList)(true),
	smartLog("myArchive")(appData.myArchive)(true),
	smartLog("lastDone")(appData.lastDone)(false));

export const logJSONitem = (x: any): void => (
		console.log(`Itemifying:`),
		console.log(x),
		console.log(`It'll look like:`),
		console.table(({
			id: Number(x.id),
			status: x.status,
			textName: x.textName,
			isHidden: Number(x.isHidden)
		})));

// const printAndReturn = <T>(x: T): T => {
// 	console.log(`X is ${x}, now returning it...`);
// 	return x;
// }

// const logGet1stUnmarkedAfter = (arr: IItem[]) => (i: Tindex): void =>
// 	(
// 		console.log(`   Getting first unmarked index after index ${i}`
// 			+ ` where ARRAY LEN is ${arr.length}...`),
// 		console.log(`... it appears to be `
// 			+ `${mapUnmarkedToIDAndFilter(arr).filter(x => x > i)[0]}`)
// 	);

// ISSUE: Dev replaces custom prints with `smartLog()()()` #25
// const printIsMarkableList = (arr: IItem[]) => (lastDone: Tindex): void =>
// 	console.log(`It is ${boolToTFstring(isMarkableList(arr)(lastDone))} that this is a markable list.`)

// ISSUE: Dev replaces custom prints with `smartLog()()()` #25
// const printMarkedCount = (arr: IItem[]): void =>
// 	console.log(`The # of marked items is now ${countMarked(arr)}`)

// ISSUE: Dev replaces custom prints with `smartLog()()()` #25
// export const printStatsBlock = (arr: IItem[]) => (lastDone: Tindex) => {
// 	printIsMarkableList(arr)(lastDone);
// 	printCMWTDdata(arr);
// 	printMarkedCount(arr)
// }

// ISSUE: Dev replaces custom prints with `smartLog()()()` #25
// const printCMWTDdata = (arr: IItem[]): void =>
// 	isNegOne(getCMWTDindex(arr))
// 		? console.log(`CMWTD is not set yet.`)
// 		: console.log(`CMWTD is, at index ${getCMWTDindex(arr)}: '${getCMWTDstring(arr)}'`)