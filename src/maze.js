import { pickOne } from "./random.js";
import { assertFunctionType } from "./checkArgs.js";

export function recursiveBackTracker(start, listAdjacent, linkNodes) {
	assertFunctionType(listAdjacent);
	assertFunctionType(linkNodes);
	
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
