import { AdjacencyFunc, Step } from "../definitions.js";
import { toSet } from "./pathFinding.js";

export function bfsVisit<N, E>(source: N, getAdjacent: AdjacencyFunc<N, E>, callback: (node: N) => void) {
	for (const node of bfsGenerator(source, getAdjacent)) {
		callback(node);
	}
}

export function *bfsGenerator<N, E>(source: N, getAdjacent: AdjacencyFunc<N, E>) {
	const open: N[] = [];
	const visited = new Set<N>();

	open.push(source);
	visited.add(source);

	while (open.length) {
		const current = open.shift()!;

		yield current;

		for (const [ , destNode ] of getAdjacent(current)) {
			if (!visited.has(destNode)) {
				open.push(destNode);
				visited.add(destNode);
			}
		}
	}
}

/**
 * Performs a breadth-first search on a graph.
 * Starting form the source node, expanding until all connected nodes are visited.
 * Nodes are treated as opaque data objects and are not modified. You can use any kind of
 * variable type to represent nodes: ints, strings, objects, ...
 *
 * @param source starting node
 * @param distinations Single node or Array of nodes. Search will continue until all destinations are reached.
 * @param getAdjacent adjacency function representing the graph. For this algorithm, edges do not need to be unique.
 *
 * @returns a map of examined nodes. Pass this to a backtracking function to extract a simple path.
 *
 * Input graph may be undirected or directed (getAdjacent should act correspondingly)
 *
 * Guaranteed to return shortest paths for unweighted networks.
 * Complexity: O(V + E)
 * Faster than dijkstra, because it accesses the open list with O(1) instead of O(N) (or dijkstra with priorityQ: O(log N))
 * But unlike dijkstra, this can't handle weighted edges.
 *
 * For more discussion, see: https://stackoverflow.com/questions/25449781/what-is-difference-between-bfs-and-dijkstras-algorithms-when-looking-for-shorte
 */
export function breadthFirstSearch<N, E>(source: N, dest: N | N[], getAdjacent: AdjacencyFunc<N, E>,
	{ maxIterations = 0 } = {}
) {
	const open: Array<N> = [];
	const dist = new Map<N, number>();
	const prev = new Map<N, Step<N, E>>();
	const remain = toSet(dest);

	open.push(source);
	dist.set(source, 0);

	// TODO: important to make sure distMap.get(source).cost === 0!
	prev.set(source, { to: source, cost: 0 });

	let i = maxIterations;
	while (open.length) {
		i--; // 0 -> -1 means Infinite.
		if (i === 0) break;

		const current = open.shift()!;
		const distance = dist.get(current) || 0;

		if (remain.has(current)) {
			remain.delete(current);
			if (remain.size === 0) break;
		}

		for (const [ edge, destNode ] of getAdjacent(current)) {
			const visited = prev.has(destNode);
			if (!visited) {
				open.push(destNode);
				dist.set(destNode, distance + 1);
				prev.set(destNode, {
					edge,
					from: current,
					to: destNode,
					cost: distance + 1,
				});
			}
		}
	}

	return prev;
}
