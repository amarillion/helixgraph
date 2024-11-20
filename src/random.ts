/**
 * Pick a random number between `0` (inclusive) and `n` (exclusive).
 * In other words, pick a non-negative number below `n`.
 */
export const randomInt = (n: number, prng = Math.random) => Math.floor(prng() * n);

/**
 * Randomly pick one item from an array of items.
 */
export const pickOne = <T>(array: T[], prng = Math.random) => array[randomInt(array.length, prng)];

/**
Knuth-Fisher-Yates shuffle algorithm.

Array is shuffled in-place.
Reference to array is returned.
*/
export function shuffle<T>(array: T[], prng = Math.random) {
	const len = array.length;
	for (let i = len - 1; i > 0; i--) {
		const n = randomInt(i + 1, prng);
		
		[ array[n], array[i] ] = [ array[i], array[n] ];
	}
	return array;
}
