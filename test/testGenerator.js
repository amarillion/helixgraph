import test from "ava";
import { dijkstra, trackbackNodes, astar, breadthFirstSearch } from "../src/pathFinding.js";
import { assert } from "../src/assert.js";

// generates an infinite binary tree
function *getNeighborsGenerator(node) {
	assert(Number.isInteger(node));
	assert(node > 0);

	// node is interpreted as an integer
	yield [ "left", node * 2 ];
	yield [ "right", node * 2 + 1 ];
}

test("dijkstra with a generator function", t => {
	const prev = dijkstra(1, 11, getNeighborsGenerator, () => 1);
	const path = trackbackNodes(1, 11, prev);
	t.deepEqual (path, [1, 2, 5, 11 ] );
});

test("astar with a generator function", t => {
	const prev = astar(1, 7, getNeighborsGenerator, () => 1, () => 0);
	const path = trackbackNodes(1, 7, prev);
	t.deepEqual (path, [1, 3, 7 ] );
});

test("bfs with a generator function", t => {
	const prev = breadthFirstSearch(1, 18, getNeighborsGenerator);
	const path = trackbackNodes(1, 18, prev);
	t.deepEqual (path, [1, 2, 4, 9, 18 ] );
});
