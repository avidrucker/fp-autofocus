// var fs = require('fs');
// var parse = require('csv-parse');

// var parser = parse({delimiter: ';'}, function(err: any, data: any){
//   console.log(data);
// });

// fs.createReadStream(__dirname+'/save.csv').pipe(parser);

import csv from 'csvtojson';

export const returnJSONblogFromFile = async (csvFilePath: string): Promise<any[]> =>
	await csv().fromFile(csvFilePath).then(x => (
		console.log(`${x.length} items loaded.`), x)); // , console.log(x)

export const itemifyJSONitem = (x: any) => (
	// logJSONitem(x),
	({
		id: Number(x.id),
		status: x.status,
		textName: x.textName,
		isHidden: Number(x.isHidden)
	}));