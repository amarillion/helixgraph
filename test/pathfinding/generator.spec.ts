import { dijkstra, astar, breadthFirstSearch } from "../../src/index.js";
import { trackbackNodes } from "../../src/pathfinding/pathFinding.js";
import { assert } from "../../src/assert.js";
import { test, expect } from 'vitest';

// generates an infinite binary tree
function *getAdjacentGenerator(node: number): Iterable<[string, number]> {
	assert(Number.isInteger(node));
	assert(node > 0);

	// node is interpreted as an integer
	yield [ "left", node * 2 ];
	yield [ "right", node * 2 + 1 ];
}

test("dijkstra with a generator function", () => {
	const prev = dijkstra(1, 11, getAdjacentGenerator);
	const path = trackbackNodes(1, 11, prev);
	expect(path).toEqual([ 1, 2, 5, 11 ]);
});

test("astar with a generator function", () => {
	const prev = astar(1, 7, getAdjacentGenerator, { getWeight: () => 1, getHeuristic: () => 0 });
	const path = trackbackNodes(1, 7, prev);
	expect(path).toEqual([ 1, 3, 7 ]);
});

test("bfs with a generator function", () => {
	const prev = breadthFirstSearch(1, 18, getAdjacentGenerator);
	const path = trackbackNodes(1, 18, prev);
	expect(path).toEqual([ 1, 2, 4, 9, 18 ]);
});
