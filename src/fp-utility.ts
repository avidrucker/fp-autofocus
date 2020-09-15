// TODO: relocate to utility.ts
export const isEmptyArr = <T>(arr: T[]): boolean =>
	arr.length === 0;

	export const createGreeting = (greeting: string) => (appName: string): string =>
	`${greeting} ${appName}`;

export const isPluralFromCount = (count: number): boolean =>
	count === 1 ? false : true;

export const getPluralS = (isPlural: boolean): string =>
	isPlural ? 's' : '';

export const pluralizeIfPlural = (word: string) => (count: number) =>
	`${word}${getPluralS(isPluralFromCount(count))}`

export const notEmptyString = (strInput: string): boolean =>
	strInput === "" ? false : true;

export const isNegOne = (n: number): boolean =>
	n === -1;

export const isNeg = (n: number): boolean =>
	n < 0;

export const getPositiveMin = (x: number) => (y: number): number =>
  isNeg(x) && isNeg(y)
    ? -1
    : !isNeg(x) && isNeg(y)
			? x
			: isNeg(x) && !isNeg(y)
				? y
				: Math.min(x, y);

export const existsInArr = (arr: any) => (target: any): boolean =>
	!isNegOne(arr.indexOf(target));

export const doNothing = () => {};

export const deepCopy = <T>(x: T): T =>
	JSON.parse(JSON.stringify(x));

