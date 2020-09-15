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

// const printAndReturn = <T>(x: T): T => {
// 	console.log(`X is ${x}, now returning it...`);
// 	return x;
// }