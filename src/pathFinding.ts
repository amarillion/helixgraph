import { assert } from "./assert.js";
import { AdjacencyFunc, Step, WeightFunc } from "./definitions.js";
import { Stream } from "./iterableUtils.js";
import { PriorityQueue } from "./PriorityQueue.js";

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

function spliceLowest<T>(queue: Set<T>, comparator: (a: T, b: T) => number) {
	let minElt: T | null = null;
	for (const elt of queue) {
		if (minElt === null || comparator(elt, minElt) < 0) {
			minElt = elt;
		}
	}
	if (minElt) queue.delete(minElt);
	return minElt;
}

function toSet<T>(value: T[] | T) {
	if (Array.isArray(value)) {
		return new Set(value);
	}
	else {
		return new Set([ value ]);
	}
}

/**
 * Given a weighted graph, find all paths from one source to one or more destinations
 * @param {*} source
 * @param {*} dest - the search destination node, or an array of destinations that must all be found
 * @param {*} getAdjacent
 * @param {*}
 *
 * @returns Map(to, { edge, from, to, cost })
 */
export function dijkstra<N, E>(source: N, dest: N | N[], getAdjacent: AdjacencyFunc<N, E>,
	{
		maxIterations = 0,
		getWeight = () => 1,
	}: {
		maxIterations?: number,
		getWeight?: WeightFunc<N, E>,
	} = {}
) {
	// Mark all nodes unvisited. Create a set of all the unvisited nodes called the unvisited set.
	// Assign to every node a tentative distance value: set it to zero for our initial node and to infinity for all other nodes. Set the initial node as current.[13]
	const dist = new Map<N, number>();
	const visited = new Set<N>();
	const prev = new Map<N, Step<N, E>>();
	const remain = toSet(dest);
	
	// TODO: more efficient to use a priority queue here
	const open = new Set<N>();

	open.add(source);
	dist.set(source, 0);

	let i = maxIterations;
	while (open.size) {
		i--; // 0 -> -1 means Infinite.
		if (i === 0) break;

		// extract the element from Q with the lowest dist. Open is modified in-place.
		// TODO: optionally use PriorityQueue
		// O(N^2) like this, O(log N) with priority queue. But in my tests, priority queues only start pulling ahead in large graphs
		const current = spliceLowest(open, (a, b) => dist.get(a) - dist.get(b))!;

		// check adjacents, calculate distance, or  - if it already had one - check if new path is shorter
		for (const [ edge, sibling ] of getAdjacent(current)) {
			if (!(visited.has(sibling))) {
				const alt = dist.get(current) + getWeight(edge, current);
				
				// any node that is !visited and has a distance assigned should be in open set.
				open.add (sibling); // may be already in there, that is OK.

				const oldDist = dist.has(sibling) ? dist.get(sibling) : Infinity;

				if (alt < oldDist) {
					// set or update distance
					dist.set(sibling, alt);
					// build back-tracking map
					prev.set(sibling, { edge, from: current, to: sibling, cost: alt });
				}
			}
		}

		// A visited node will never be checked again.
		visited.add(current);

		if (remain.has(current)) {
			remain.delete(current);
			if (remain.size === 0) break;
		}
	}

	return prev;
}

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

/**
 * Utility that takes the 'prev' data from any of astar, dijkstra, or breadthFirstSearch, and turns it in a sequence of edges forming a path.
 *
 * @param {*} source start node
 * @param {*} dest destination node
 * @param {*} prev Map (node, [dir, srcNode]) - result from astar, dijkstra, or breadthFirstSearch
 */
export function trackbackEdges<N, E>(source: N, dest: N, prev: Map<N, Step<N, E>>, maxIterations = 1e6) {
	const path: E[] = [];
	const isValid = trackback (source, dest, prev, (from, edge /* , to */) => {
		path.unshift(edge);
	}, maxIterations);
	return isValid ? path : null;
}

export function trackbackNodes<N>(source: N, dest: N, prev: Map<N, Step<N, unknown>>, maxIterations = 1e6) {
	const path = [];
	const isValid = trackback (source, dest, prev, (from, edge, to) => {
		path.unshift(to);
	}, maxIterations);
	path.unshift(source);
	return isValid ? path : null;
}

/**
 *
 * @callback trackbackFun
 * @param {*} fromNode
 * @param {*} edge
 * @param {*} toNode
 *
 * Creates a path from the results of dijsktra, bfs or astar, by tracking back using a prev map.
 * @param {*} source starting node
 * @param {*} dest target node
 * @param {Map} prev is a Map(destNode, { edge, from }) as returned bij `dijkstra`, `astar` or `breadthFirstSearch`)
 * @param {trackbackFun} callback called for each step of the path from source to dest, but in reverse order
 *
 * @returns: an array of [ edge ], or `null` if there is no path possible, i.e. dest is unreachable from source.
 *
 * TODO: for some applications, better to return an array of [ 'node' ] or an array of both?
 */
export function trackback<N, E>(
	source: N,
	dest: N,
	prev: Map<N, Step<N, E>>,
	callback: (from: N | undefined, edge: E | undefined, to: N) => void,
	maxIterations = 1e6
) {
	let current: N = dest;

	// set a maximum no of iterations to prevent infinite loop
	for (let i = 0; i < maxIterations; ++i) {
		const step = prev.get(current);
		if (!step) {
			return false; // no valid path
		}

		callback(step.from, step.edge, current);
		current = step.from;
		
		if (current === source) {
			// path finished!
			return true; // valid path
		}
	}

	assert (false, "Reached iteration limit when constructing path");
}

export function shortestPathsFromSource<N, E>(
	source: N,
	destinations: N[],
	prev: Map<N, Step<N, E>>
) {
	// Now backtrack from each destination to the source
	const result = [];
	for (const dest of destinations) {
		const path = trackbackEdges(source, dest, prev);
		if (path !== null) {
			result.push(path);
		}
	}

	return result;
}

/**
all shortest paths from sources to sinks .
Returns an array of arrays of steps.
*/
export function allShortestPaths<N, E>(
	sources: N[],
	sinks: N[],
	algorithm: (source: N, sinks: N[]) => Map<N, Step<N, E>>
) {
	const allPaths = new Map<N, E[][]>();
	for (const source of sources) {
		const prev = algorithm(source, sinks);
		const paths = shortestPathsFromSource(source, sinks, prev);
		// note that it's possible that some source->sink paths are NOT possible.
		// they will be omitted from the result
		allPaths.set(source, paths);
	}
	return allPaths;
}

/**
 * Utility function.
 * given an adjacency func, find the first edge that goes from one node to another.
 */
export function edgeBetween<N, E>(getAdjacent: AdjacencyFunc<N, E>, from: N, to: N) {
	return Stream.of(getAdjacent(from))
		.find(step => step[1] === to)?.[0];
}

/**
 * Utility function.
 * given an adjacency func, find all edges that go from one node to another.
 */
export function edgesBetween<N, E>(getAdjacent: AdjacencyFunc<N, E>, from: N, to: N) {
	return Stream.of(getAdjacent(from))
		.filter(step => step[1] === to)
		.map(step => step[0])
		.collect();
}
