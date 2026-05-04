/**
 * Pick a random number between `0` (inclusive) and `n` (exclusive).
 * In other words, pick a non-negative number below `n`.
 */
export declare const randomInt: (n: number, prng?: () => number) => number;
/**
 * Randomly pick one item from an array of items.
 */
export declare const pickOne: <T>(array: T[], prng?: () => number) => T;
/**
Knuth-Fisher-Yates shuffle algorithm.

Array is shuffled in-place.
Reference to array is returned.
*/
export declare function shuffle<T>(array: T[], prng?: () => number): T[];
