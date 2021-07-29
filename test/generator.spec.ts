import { dijkstra, trackbackNodes, astar, breadthFirstSearch } from "../src/pathFinding.js";
import { assert } from "../src/assert.js";

// generates an infinite binary tree
function *getNeighborsGenerator(node: number) : Iterable<[string, number]> {
	assert(Number.isInteger(node));
	assert(node > 0);

	// node is interpreted as an integer
	yield [ "left", node * 2 ];
	yield [ "right", node * 2 + 1 ];
}

test("dijkstra with a generator function", () => {
	const prev = dijkstra(1, 11, getNeighborsGenerator);
	const path = trackbackNodes(1, 11, prev);
	expect(path).toEqual([1, 2, 5, 11 ] );
});

test("astar with a generator function", () => {
	const prev = astar(1, 7, getNeighborsGenerator, { getWeight: () => 1, getHeuristic: () => 0 });
	const path = trackbackNodes(1, 7, prev);
	expect(path).toEqual([1, 3, 7 ] );
});

test("bfs with a generator function", () => {
	const prev = breadthFirstSearch(1, 18, getNeighborsGenerator);
	const path = trackbackNodes(1, 18, prev);
	expect(path).toEqual([1, 2, 4, 9, 18 ] );
});
