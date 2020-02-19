import { assert } from "./assert.js";
import { pickOne } from "./util.js";

export function recursiveBackTracker(start, listAdjacent, linkNodes) {
	assert(typeof(listAdjacent) === "function");
	assert(typeof(linkNodes) === "function");
	
	const stack = [];
	stack.push(start);
	const visited = new Set();
	visited.add(start);

	while (stack.length > 0) {
		const current = stack[stack.length - 1];
		const unvisitedNeighbors = listAdjacent(current).
			filter(([, node]) => !visited.has(node));

		if (unvisitedNeighbors.length === 0) {
			stack.pop();
		}
		else {
			const [dir, node] = pickOne(unvisitedNeighbors);
			
			linkNodes(current, dir, node);
			stack.push(node); 
			visited.add(node);
		}
	}
}
