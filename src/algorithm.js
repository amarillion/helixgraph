import { assert } from "./assert.js";
import PriorityQueue from "./PriorityQueue.js";

/**
 * Astar Heuristic with tie-breaker that prefers paths that follow the direct line
 * between start and goal, alternating horizontal/vertical for short steps, as much as needed
 * to approximate the direct line.
 * See: https://stackoverflow.com/questions/845626/how-do-i-find-the-most-naturally-direct-route-using-a-star-a/845630#845630
 * @param {*} sx start x
 * @param {*} sy start y
 * @param {*} cx current x
 * @param {*} cy current y
 * @param {*} gx goal x
 * @param {*} gy goal y
 */
export function manhattanCrossProductHeuristic(sx, sy, cx, cy, gx, gy) {
	const dx1 = cx - gx;
	const dy1 = cy - gy;
	const dx2 = sx - gx;
	const dy2 = sy - gy;
	const heuristic = Math.abs(dx1) + Math.abs(dy1);
	const cross = Math.abs(dx1*dy2 - dx2*dy1);
	return heuristic + cross * 0.001;
}

/**
 * Astar Heuristic with opposite behaviour of the manhattanCrossProductHeuristic:
 * the tie breaker prefers paths with long stretches of horizontal/vertical, with the fewest turns possible.
 */
export function manhattanStraightHeuristic(sx, sy, cx, cy, gx, gy) {
	const dx1 = cx - gx;
	const dy1 = cy - gy;
	const dx2 = sx - gx;
	const dy2 = sy - gy;

	// fx is fraction of the way between sx and gx
	const fx = dx2 === 0 ? 0.5 : dx1 / dx2 + 0.01; // 0.01 is to break tie between horizontal / vertical
	const fy = dy2 === 0 ? 0.5 : dy1 / dy2;
	const heuristic = Math.abs(dx1) + Math.abs(dy1);
	// Map x 0..1 into curve -(x(x-1))
	const tie = Math.abs ((fx * (fx - 1)) * (fy * (fy - 1)));
	return heuristic + tie;
}

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
 * @param {*} source starting node, (can be any object type)
 * @param {array} distinations function(node) that returns true or false if the given node is a target
 * @param {function} listNeighbors function(node) that return the neighBors of given node as an array of [dir, destNode] 
 *             dir is a value that distinguishes edges on the same node. 
 *             I.e. it could be an edge, but on a grid, a compass direction would also suffice.
 * 
 * 
 * @returns {
 *  dist: Map(node, steps)
 * 	prev: Map(node, [dir, srcNode])
 * }
 *
 * Input graph may be undirected or directed (listNeighbors should act correspondingly)
 * 
 * Guaranteed to return shortest paths for unweighted networks.
 * Complexity: O(V + E)
 * Faster than dijkstra, because it accesses the open list with O(1) instead of O(N) (or with priorityQ: O(log N))
 * But unlike dijkstra, this can't handle weighted edges.
 * 
 * For more discussion, see: https://stackoverflow.com/questions/25449781/what-is-difference-between-bfs-and-dijkstras-algorithms-when-looking-for-shorte
 * 
 */
export function breadthFirstSearch(source, destinations, listNeighbors) {
	assert(typeof(listNeighbors) === "function");

	let open = [];
	let dist = new Map();
	let prev = new Map();
	let distance = 0;
	let remain = new Set(destinations);

	open.push(source);
	dist.set(source, distance);
	prev.set(source, { edge: null, from: null } );

	while (open.length > 0) {
		const current = open.shift();
		distance = dist.get(current);

		if (remain.has(current)) {
			remain.delete(current);
			if (remain.size === 0) break;
		}

		for (const [dir, destNode] of listNeighbors(current)) {
			const visited = dist.has(destNode);
			if (!visited) {
				open.push(destNode);
				dist.set(destNode, distance + 1);
				prev.set(destNode, { edge: dir, from: current });
			}
		}
		
	}

	return {
		prev,
		dist
	};
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

export function dijkstra(source, destinations, getNeighbors, getWeight) {
	assert(typeof(getNeighbors) === "function");
	assert(typeof(getWeight) === "function");

	// Mark all nodes unvisited. Create a set of all the unvisited nodes called the unvisited set.
	// Assign to every node a tentative distance value: set it to zero for our initial node and to infinity for all other nodes. Set the initial node as current.[13]
	const dist = new Map();
	const visited = new Set();
	const prev = new Map();
	let remain = new Set(destinations);
	
	// TODO: more efficient to use a priority queue here
	const open = new Set();

	open.add(source);
	dist.set(source, 0);

	while (open.size > 0) {
		// extract the element from Q with the lowest dist. Open is modified in-place.
		// TODO: this is the part that is inefficient without a priority queue
		const current = spliceLowest( open, (a, b) => dist.get(a) - dist.get(b) );

		// For the current node, consider all of its unvisited neighBors and 
		//    calculate their tentative distances through the current node. 
		//    Compare the newly calculated tentative distance to the current assigned value and assign 
		//    the smaller one. For example, if the current node A is marked with a distance of 6, and the edge connecting it with a neighBor B has length 2, then 
		//    the distance to B through A will be 6 + 2 = 8. If B was previously marked with a distance greater than 8 then 
		//    change it to 8. Otherwise, keep the current value.
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
					prev.set(sibling, { edge, from: current, to: sibling });
				}
			}
		}

		// When we are done considering all of the unvisited neighBors of the current node, 
		//    mark the current node as visited and remove it from the unvisited set. 
		//    A visited node will never be checked again.
		visited.add(current);

		// If the destination node has been marked visited (when planning a route between two specific nodes) or 
		//    if the smallest tentative distance among the nodes in the unvisited set is infinity (when planning a complete traversal; 
		//    occurs when there is no connection between the initial node and remaining unvisited nodes), then stop. 
		//    The algorithm has finished.

		if (remain.has(current)) {
			remain.delete(current);
			if (remain.size === 0) break;
		}
	}

	return {
		prev,
		dist
	};
}


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

	let i = maxIterations;
	while (open.size() > 0) {
		
		i--; // 0 -> -1 means Infinite.
		if (i === 0) break;

		const current = open.pop();

		if (current === dest) {
			break;
			// reached destiniation!
		}
		
		for (const [edge, sibling] of getNeighbors(current)) {
			
			const cost = dist.get(current) + getWeight(edge);
			const oldCost = dist.has(sibling) ? dist.get(sibling) : Infinity;
			if (cost < oldCost) {

				dist.set(sibling, cost);
				priority.set(sibling, cost + heuristicFunc(sibling, dest));
				open.push(sibling);
				
				// build back-tracking map
				prev.set(sibling, { edge, from: current, to: sibling });
			}
		}
	}

	return {
		prev,
		dist
	};

}

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
 * @param {Map} prev is a Map(destNode, { edge, srcNode }) as returned bij `dijkstra`, `astar` or `breadthFirstSearch`)
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

	// const { prev } = dijkstra(source, destinations, getNeighbors, getWeight);
	const { prev } = breadthFirstSearch(source, destinations, getNeighbors);

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
