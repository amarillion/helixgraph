export function randomInt(max : number) {
	return Math.floor(Math.random() * Math.floor(max));
}

export function pickOne<T>(list : Array<T>) {
	const idx = randomInt(list.length);
	return list[idx];
}

/**
Knuth-Fisher-Yates shuffle algorithm.
*/
export function shuffle(array: unknown[]) {
	const len = array.length;
	for (let i = len - 1; i > 0; i--) {
		const n = randomInt(i + 1);
		
		[array[n], array[i]] = [array[i], array[n]];
	}
	return array;
}
