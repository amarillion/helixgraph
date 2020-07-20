import { assert } from "./assert.js";
import PriorityQueue from "./PriorityQueue.js";

export function bfsVisit(source, listNeighbors, callback) {
	assert(typeof(listNeighbors) === "function");
	assert(typeof(callback) === "function");

	for (const node of bfsGenerator(source, listNeighbors)) {
		callback(node);
	}
}

export function *bfsGenerator(source, listNeighbors) {
	assert(typeof(listNeighbors) === "function");
	
	let open = [];
	let visited = new Set();

	open.push(source);
	visited.add(source);

	while (open.length > 0) {
		const current = open.shift();

		yield current;

		for (const [, destNode] of listNeighbors(current)) {
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
 * It checks nodes if they are target as a side-effect, to avoid one extra graph traversal...
 * (TODO: maybe this should be factored out)
 * 
 * @param {*} source starting node
 * @param distinations Single node or Array of nodes. Search will continue until all destinations are reached.
 * @param {function} listNeighbors function(node) that return the neighbors of given node as an array of [dir, destNode] 
 *             dir is a value that distinguishes edges on the same node. 
 *             I.e. it could be an edge, but on a grid, a compass direction would also suffice.
 * 
 * @returns Map(to, { edge, from, to, cost })
 *
 * Input graph may be undirected or directed (listNeighbors should act correspondingly)
 * 
 * Guaranteed to return shortest paths for unweighted networks.
 * Complexity: O(V + E)
 * Faster than dijkstra, because it accesses the open list with O(1) instead of O(N) (or dijkstra with priorityQ: O(log N))
 * But unlike dijkstra, this can't handle weighted edges.
 * 
 * For more discussion, see: https://stackoverflow.com/questions/25449781/what-is-difference-between-bfs-and-dijkstras-algorithms-when-looking-for-shorte
 */
export function breadthFirstSearch(source, dest, listNeighbors, 
	{ maxIterations = 0 } = {}
) {
	assert(typeof(listNeighbors) === "function");

	let open = [];
	const dist = new Map();
	const prev = new Map();
	const remain = toSet(dest);

	open.push(source);
	dist.set(source, 0);
	// prev.set(source, { edge: null, from: null, to: source, cost } );

	let i = maxIterations;
	while (open.length > 0) {
		
		i--; // 0 -> -1 means Infinite.
		if (i === 0) break;

		const current = open.shift();
		const distance = dist.get(current);

		if (remain.has(current)) {
			remain.delete(current);
			if (remain.size === 0) break;
		}

		for (const [edge, destNode] of listNeighbors(current)) {
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

function spliceLowest (queue, comparator) {
	let minElt = null;
	for (const elt of queue) {
		if (minElt === null || comparator(elt, minElt) < 0) {
			minElt = elt;
		}
	}
	queue.delete(minElt);
	return minElt;
}

function toSet(value) {
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
 * @param {*} getNeighbors 
 * @param {*} getWeight 
 * 
 * @returns Map(to, { edge, from, to, cost })
 */
export function dijkstra(source, dest, getNeighbors, getWeight, 
	{ maxIterations = 0 } = {}
) {
	assert(typeof(getNeighbors) === "function");
	assert(typeof(getWeight) === "function");

	// Mark all nodes unvisited. Create a set of all the unvisited nodes called the unvisited set.
	// Assign to every node a tentative distance value: set it to zero for our initial node and to infinity for all other nodes. Set the initial node as current.[13]
	const dist = new Map();
	const visited = new Set();
	const prev = new Map();
	let remain = toSet(dest);
	
	// TODO: more efficient to use a priority queue here
	const open = new Set();

	open.add(source);
	dist.set(source, 0);

	let i = maxIterations;
	while (open.size > 0) {
		
		i--; // 0 -> -1 means Infinite.
		if (i === 0) break;

		// extract the element from Q with the lowest dist. Open is modified in-place.
		// TODO: optionally use PriorityQueue
		// O(N^2) like this, O(log N) with priority queue. But in my tests, priority queues only start pulling ahead in large graphs
		const current = spliceLowest( open, (a, b) => dist.get(a) - dist.get(b) );

		// check neighbors, calculate distance, or  - if it already had one - check if new path is shorter
		for (const [edge, sibling] of getNeighbors(current)) {
			
			if (!(visited.has(sibling))) {
				const alt = dist.get(current) + getWeight(edge);
				
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
 * @param {*} getNeighbors 
 * @param {*} getWeight 
 * 
 * @returns Map(to, { edge, from, to, cost })
 */
export function astar(source, dest, getNeighbors, getWeight, heuristicFunc, { maxIterations = 0 } = {}) {
	assert(typeof(getNeighbors) === "function");
	assert(typeof(getWeight) === "function");
	assert(typeof(heuristicFunc) === "function");

	const dist = new Map();
	const prev = new Map();
	
	const priority = new Map();
	const open = new PriorityQueue((a, b) => priority.get(a) < priority.get(b));

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
		
		for (const [edge, sibling] of getNeighbors(current)) {
			
			const cost = dist.get(current) + getWeight(edge);
			const oldCost = dist.has(sibling) ? dist.get(sibling) : Infinity;
			if (cost < oldCost) {

				dist.set(sibling, cost);
				priority.set(sibling, cost + heuristicFunc(sibling));
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
export function trackbackEdges(source, dest, prev) {
	const path = [];
	const isValid = trackback (source, dest, prev, (from, edge /*, to */ ) => {
		path.unshift( edge );
	});
	return isValid ? path : null;
}

export function trackbackNodes(source, dest, prev) {
	const path = [];
	const isValid = trackback (source, dest, prev, (from, edge, to ) => {
		path.unshift( to );
	});
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
export function trackback(source, dest, prev, callback) {
	let current = dest;

	// set a maximum no of iterations to prevent infinite loop
	for(let i = 0; i < 1000; ++i) {
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

export function shortestPathsFromSource(source, destinations, getNeighbors /*, getWeight */) {

	// const prev = dijkstra(source, destinations, getNeighbors, getWeight);
	const prev = breadthFirstSearch(source, destinations, getNeighbors);

	// Now backtrack from each destination to the source
	const result = [];
	for (let dest of destinations) {
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
export function allShortestPaths(sources, sinks, getNeighbors, getWeight) {
	let allPaths = new Map();
	for (const source of sources) {
		const paths = shortestPathsFromSource(source, sinks, getNeighbors, getWeight);
		// note that it's possible that some source->sink paths are NOT possible.
		// they will be omitted from the result
		allPaths.set(source, paths);
	}
	return allPaths;
}

/** 
 * Utility function.
 * given a neighbour func, find the first edge that goes from one node to another.
 */
export function edgeBetween(neighborFunc, from, to) {
	return neighborFunc(from).find(step => step[1] === to)[0];
}

/** 
 * Utility function.
 * given a neighbour func, find all edges that go from one node to another.
 */
export function edgesBetween(neighborFunc, from, to) {
	return neighborFunc(from).filter(step => step[1] === to).map(step => step[0]);
}
