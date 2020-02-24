import test from "ava";
import { shuffle } from "../src/random.js";
import PriorityQueue from "../src/PriorityQueue.js";

test("Priority queue", t => {

	const NUM = 50;
	const array = [];

	// generate array, and shuffle it
	for (let i = 0; i < NUM; ++i) array.unshift(i);
	shuffle(array);

	const q = new PriorityQueue((a,b) => a < b);
	
	q.push(...array);

	// check that the result is sorted
	for (let i = 0; i < NUM; ++i) {
		t.is(i, q.pop());
	}
	
});
