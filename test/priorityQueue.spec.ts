import { shuffle } from "../src/random.js";
import { PriorityQueue } from "../src/PriorityQueue.js";

test("Priority queue", () => {
	const NUM = 50;
	const array = [];

	// generate array, and shuffle it
	for (let i = 0; i < NUM; ++i) array.unshift(i);
	shuffle(array);

	const q = new PriorityQueue<number>((a, b) => b - a);
	
	q.push(...array);

	// check that the result is sorted
	for (let i = 0; i < NUM; ++i) {
		expect(i).toBe(q.pop());
	}
});
