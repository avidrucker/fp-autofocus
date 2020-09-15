import fs from 'fs';
import { IAppData } from '.';

// TODO: firstly, implement a stub here in the CLA `console.ts` to serialize app data to CSV
//   once that is done, you can experiment by moving it into the core `index.ts` & get it working there
//   once that is done, attempt to implement serialize to CSV in the PWA project
// WARNING: this function will use file system and therefore will be impure (it has side effects)
export const serializeAppDataToCSV = (appData: IAppData): void => {
	const data = JSON.stringify(appData);
	console.table(data);
};