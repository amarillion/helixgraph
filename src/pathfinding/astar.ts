import { AdjacencyFunc, Step, WeightFunc } from "../definitions.js";
import { PriorityQueue } from "../PriorityQueue.js";
import { toSet } from "./pathFinding.js";

/**
 * Given a weighted graph, find all paths from one source to one or more destinations
 * @param {*} source
 * @param {*} destinations
 * @param {*} getAdjacent
 * @param {Object} options containing getHeuristic(node), maxIterations, getWeight(edge)
 *
 * @returns Map(to, { edge, from, to, cost })
 */
export function astar<N, E>(source: N, dest: N, getAdjacent: AdjacencyFunc<N, E>,
	// see: https://mariusschulz.com/blog/typing-destructured-object-parameters-in-typescript
	{
		maxIterations = 0,
		getWeight = () => 1,
		getHeuristic = () => 0
	}: {
		maxIterations?: number,
		getWeight?: WeightFunc<N, E>,
		getHeuristic?: (node: N) => number,
	} = {}
) {
	const dist = new Map<N, number>();
	const prev = new Map<N, Step<N, E>>();
	
	const priority = new Map();
	const open = new PriorityQueue<N>((a, b) => priority.get(b) - priority.get(a));

	open.push(source);
	dist.set(source, 0);

	const remain = toSet(dest);

	let i = maxIterations;
	while (open.size() > 0) {
		i--; // 0 -> -1 means Infinite.
		if (i === 0) break;

		const current = open.pop();

		if (remain.has(current)) {
			remain.delete(current);
			if (remain.size === 0) break; // reached all destiniations!
		}
		
		for (const [ edge, sibling ] of getAdjacent(current)) {
			const cost = dist.get(current) + getWeight(edge, current);
			const oldCost = dist.has(sibling) ? dist.get(sibling) : Infinity;
			if (cost < oldCost) {
				dist.set(sibling, cost);
				priority.set(sibling, cost + getHeuristic(sibling));
				open.push(sibling);
				
				// build back-tracking map
				prev.set(sibling, { edge, from: current, to: sibling, cost });
			}
		}
	}

	return prev;
}
