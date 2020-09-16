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

export const printSaveFile = async (csvFilePath: string) =>
	await csv()
		.fromFile(csvFilePath)
		.then((jsonObj)=>{
			console.log(jsonObj);
			/**
			 * [
			 * 	{a:"1", b:"2", c:"3"},
			 * 	{a:"4", b:"5". c:"6"}
			 * ]
			 */ 
		});

// export const getJSONfromSave = ()

// const jsonArray=await csv().fromFile(csvFilePath);