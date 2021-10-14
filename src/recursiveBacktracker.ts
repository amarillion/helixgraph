import { LinkFunc, AdjacencyFunc } from "./definitions.js";
import { Stream } from "./iterableUtils.js";
import { pickOne } from "./random.js";

export function recursiveBackTracker<N, E>(start : N, listAdjacent : AdjacencyFunc<N, E>, linkNodes: LinkFunc<N, E>) {
	const stack : N[] = [];
	stack.push(start);
	const visited = new Set();
	visited.add(start);

	while (stack.length > 0) {
		const current = stack[stack.length - 1];
		
		const unvisitedAdjacents = Stream
			.of(listAdjacent(current))
			.filter(([, node]) => !visited.has(node))
			.collect();

		if (unvisitedAdjacents.length === 0) {
			stack.pop();
		}
		else {
			const [dir, node] = pickOne(unvisitedAdjacents);
			
			linkNodes(current, dir, node);
			stack.push(node); 
			visited.add(node);
		}
	}
}
