import { mmArrayPush, mmSetAdd } from "../src/multimap.js";
import { test, expect } from 'vitest';

test("mmArrayPush", () => {
	const mmap = new Map<number, number[]>();
	mmArrayPush(mmap, 3, 5);
	mmArrayPush(mmap, 3, 9);
	mmArrayPush(mmap, 3, 9);
	expect(mmap.get(3)).toStrictEqual([ 5, 9, 9 ]);
});

test("mmSetAdd", () => {
	const mmap = new Map<number, Set<number>>();
	mmSetAdd(mmap, 3, 5);
	mmSetAdd(mmap, 3, 9);
	mmSetAdd(mmap, 3, 9);
	
	const expectedSet = new Set();
	expectedSet.add(5);
	expectedSet.add(9);
	
	expect(mmap.get(3)).toStrictEqual(expectedSet);
});
