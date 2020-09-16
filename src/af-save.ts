'use strict'

import fs from 'fs';
// import neatCsv from 'neat-csv';

import { IAppData, createBlankData, UNSET_LASTDONE, IItem } from '.';
import { smartLog } from './af-debug';
import { returnAppDataBackToMenu } from './console';

// TODO: firstly, implement a stub here in the CLA `console.ts` to serialize app data to CSV
//   once that is done, you can experiment by moving it into the core `index.ts` & get it working there
//   once that is done, attempt to implement serialize to CSV in the PWA project
// WARNING: this function will use file system and therefore will be impure (it has side effects)
// TODO: resolve concurrency / async issue where console log occurs
//   (incorrectly) AFTER "make a menu selection" prompt
export const serializeAppDataToCSV = (appData: IAppData): void => {
	smartLog("CSVify my list")(appData.myList)(true);

	let csv = '';
	let header = Object.keys(appData.myList[0]).join(',');
	let values = appData.myList.map(o => Object.values(o).join(',')).join('\n');

	csv += header + '\n' + values;

	fs.writeFile('save.csv', csv, (err) => {
    if (err) {
        throw err;
    }
    console.log("CSV data is saved.");
	});
};

// export const serializeAppDataToJSON = (appData: IAppData): void => {
// 	const data = JSON.stringify(appData.myList);
// 	console.table(data);
// 	smartLog("JSONify my list:")(appData.myList)(true);

// 	fs.writeFile('save.json', data, (err) => {
//     if (err) {
//         throw err;
//     }
//     console.log("JSON data is saved.");
// 	});
// };

// TODO: remove myArchive from appState, as it is
//    not intended for (de)serialization
// const csvToIAppData = (objList: IItem[]): IAppData => {
// 	const appData: IAppData = createBlankData();
// 	// if(objList.length > 0) {
// 	// 	return {currentState: 'menu',
// 	// 		lastDone: UNSET_LASTDONE,
// 	// 		myArchive: [],
// 	// 		myList: objList.map(x => ({"id": x.id,
// 	// 			"status": x.status,
// 	// 			"textName": x.textName,
// 	// 			"isHidden": x.isHidden })),
// 	// 	}
// 	// }
// 	return returnAppDataBackToMenu(appData);
// }

// // TODO: implement stub: actual return type will be IAppData
// export const deserializeAppDataFromCSV = async (file: string): Promise<IAppData> => {
// 	// step 1: read CSV text data from file
// 	fs.readFile(`${file}.csv`, async (err, data) => {
// 		if (err) {
// 			console.error(err);
// 		}

// 		// step 2: convert CSV text data to IAppData object
// 		// console.log(`Data loading...`);
// 		console.log(await neatCsv(data));
// 		// step 3: return IAppData object
// 		// return (await neatCsv(data)).then((x: IItem[]) => csvToIAppData(x));
// 	});

// 	// step 4: catch return nothing if unsuccessful in loading
// 	return (console.log(`Data not found, creating blank data instead.`),
// 		createBlankData());
// };