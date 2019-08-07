export const FORWARD = 'F';
export const REVERSE = 'R';

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
 * @param {*} isTarget function(node) that returns true or false if the given node is a target
 * @param {*} listNeighbours function(node) that return the neighbours of given node as an array of [dir, destNode] 
 *             dir is a value that distinguishes edges on the same node. 
 *             I.e. it could be an edge, but on a grid, a compass direction would also suffice.
 * 
 * 
 * @returns {
 *  dist: Map(node, steps)
 * 	prev: Map(node, [dir, srcNode])
 *  destinations: [ node, ... ]
 * }
 *
 * Input graph may be undirected or directed (listNeighbours should act correspondingly)
 * 
 * Guaranteed to return shortest paths for unweighted networks.
 * Complexity: O(V + E)
 * Faster than dijkstra, because it accesses the open list with O(1) instead of O(N) (or with priorityQ: O(log N))
 * But unlike dijkstra, this can't handle weighted edges.
 * 
 * For more discussion, see: https://stackoverflow.com/questions/25449781/what-is-difference-between-bfs-and-dijkstras-algorithms-when-looking-for-shorte
 * 
 */
function breadthFirstSearch(source, isTarget, listNeighbours) {

	let open = [];
	let dist = new Map();
	let prev = new Map();
	let distance = 0;
	let destinations = [];

	open.push(source);
	dist.set(source, distance);
	prev.set(source, [null, null] );

	while (open.length > 0)
	{
		let srcNode = open.pop();
		distance = dist.get(srcNode);

		if (isTarget(srcNode)) {
			// add to destination list...
			destinations.push(srcNode);
		}

		for (let [dir, destNode] of listNeighbours(srcNode)) {
			let firstVisit = !dist.has(destNode);
			let shorterPath = false;
			if (dist.has(destNode)) shorterPath = dist.get(destNode) > (distance + 1);
			if (firstVisit || shorterPath) {
				open.push(destNode);
				dist.set(destNode, distance + 1);
				prev.set(destNode, [ dir, srcNode ]);
			}
		}
	}

	return {
		destinations, 
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

export function shortestPathsFromSource(source, destinations, indexedUndirectedGraph, partialSolutionEdgeDirections) {

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
		const current = spliceLowest( open, (a, b) => dist.get(a) - dist.get(b) )

		// For the current node, consider all of its unvisited neighbours and 
		//    calculate their tentative distances through the current node. 
		//    Compare the newly calculated tentative distance to the current assigned value and assign 
		//    the smaller one. For example, if the current node A is marked with a distance of 6, and the edge connecting it with a neighbour B has length 2, then 
		//    the distance to B through A will be 6 + 2 = 8. If B was previously marked with a distance greater than 8 then 
		//    change it to 8. Otherwise, keep the current value.
		const edges = indexedUndirectedGraph.edgesByNode[current]
		if (edges) for (const [edge, dir, sibling] of edges) {
			
			// Skip edges that have a restriction and we're trying to go the wrong way
			if (partialSolutionEdgeDirections.has(edge) &&
				dir !== partialSolutionEdgeDirections.get(edge)
			) {
				continue;
			}

			if (!(visited.has(sibling))) {
				const alt = dist.get(current) + indexedUndirectedGraph.getWeight(edge);
				
				// any node that is !visited and has a distance assigned should be in open set.
				open.add (sibling); // may be already in there, that is OK.

				const oldDist = dist.has(sibling) ? dist.get(sibling) : Infinity;

				if (alt < oldDist) {
					// set or update distance
					dist.set(sibling, alt);
					// build back-tracking map
					prev.set(sibling, { edge, dir, from: current, to: sibling });
				}
			}
		}

		// When we are done considering all of the unvisited neighbours of the current node, 
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

	// Now backtrack from each destination to the source
	const result = [];
	for (let dest of destinations) {
		const path = [];

		let current = dest;

		// set a maximum no of iterations to prevent infinite loop
		for(let i = 0; i < 1000; ++i) {
			const step = prev.get(current);
			if (!step) {
				break; // no valid path
			}

			path.unshift({ edge: step.edge, dir: step.dir });
			current = step.from;
			
			if (current === source) {
				// path finished!
				result.push(path);
				break;
			}
		}
		
	}

	return result;
}

/** 

all shortest paths from sources to sinks .
Returns an array of arrays of steps.

*/
function allShortestPaths(sources, sinks, indexedUndirectedGraph, partialSolutionEdgeDirections) {
	let allPaths = [];
	for (let source of sources) {
		const morePaths = shortestPathsFromSource(source, sinks, indexedUndirectedGraph, partialSolutionEdgeDirections)
		// note that it's possible that some source->sink paths are NOT possible.
		// they will be omitted from the result
		allPaths = allPaths.concat(morePaths);
	}
	return allPaths;
}

/* build an index of which edges are used by shortest path steps. */
function calcEdgeUsage(allPaths) {
	const edgeUsage = new Map();
	for (let path of allPaths) {
		for (let step of path) {
			if (!edgeUsage.has(step.edge)) {
				edgeUsage.set(step.edge, new Set());
			}
			edgeUsage.get(step.edge).add(step.dir);
		}
	}
	return edgeUsage;
}

function suboptimalDirections(graph, partialSolutionEdgeDirections) {

	const newSolution = {
		contestedEdges: [],
		sumShortestPaths: 0,
		paths: null, // filled in at end
		edgeDirections: new Map()
	};

	// calculate the pairs of shortest paths from source to sink, taking into account the 
	// directions provided in the partial solution
	const allPaths = allShortestPaths(graph.sources, graph.sinks, graph, partialSolutionEdgeDirections);

	for (let path of allPaths) {
		newSolution.sumShortestPaths += path.length;
	}

	// build an index of which edges are used by shortest path steps.
	const edgeUsage = calcEdgeUsage(allPaths);

	// assign directions in a new partial solution given uncontested edges in the paths.
	for (let edge of graph.edges) {
		const dirs = edgeUsage.get(edge);
		if (dirs === undefined) {
			// this edge is not used at all
			// we give it a direction anyway to avoid messing up the algorithm further on
			newSolution.edgeDirections.set(edge, FORWARD)
		}
		else if (dirs.size > 1) {
			newSolution.contestedEdges.push(edge)
		}
		else {
			newSolution.edgeDirections.set(edge, dirs.keys().next().value);
		}
	}

	newSolution.paths = allPaths;
	return newSolution;
}

/* add indices to the graph to make further processing more efficient */
export function indexGraph(graphData) {

	const result = {
		...graphData,
		edgesByNode: {},
		sources: [],
		sinks: []
	}
	// add getAdjacent function

	for (const edge of graphData.edges) {

		const nodeLeft = graphData.getLeft(edge);
		const nodeRight = graphData.getRight(edge);
		const edgeLeft = [ edge, FORWARD, nodeRight ];
		const edgeRight = [ edge, REVERSE, nodeLeft ];
		
		if (nodeLeft in result.edgesByNode) {
			result.edgesByNode[nodeLeft].push(edgeLeft);
		}
		else {
			result.edgesByNode[nodeLeft] = [ edgeLeft ];
		}

		if (nodeRight in result.edgesByNode) {
			result.edgesByNode[nodeRight].push(edgeRight);
		}
		else {
			result.edgesByNode[nodeRight] = [ edgeRight ];
		}
	}

	for (let n of graphData.nodes) {
		if (graphData.isSource(n)) result.sources.push(n);
		if (graphData.isSink(n)) result.sinks.push(n);
	}

	return result;
}

/**  
Assign optimal directions to an undirected graph

Main algorithm:

assign directions to each edge in an undirected graph,
including cycles, minimizing all source->sink paths. 
Some parts of the graph may remain undirected to make this possible.

Step 1. 
Identify sources & sinks

Step 2.
Given current undirected graph, determine all shortest paths (from all sources to all sinks)

Step 3.
Fix all directions that are uncontested.
	If there are no remaining contested edges -> we are done

Step 4.
For each contested edge
	For each direction (forward and reverse)
		Set edge to direction on new temp graph
		Calculate sum(all shortest paths) and num of contested edges on new temp graph

Step 5.
Pick the solution that has the most valid shortest paths (ideally one for each source,sink pair). If there are multiple,
pick the one with the fewest contested edges. If there are multiple, pick the one with the shortest sum of all paths.

*/

function permutateEdgeDirections(graph, baseSolution, edgePermutation) {
	let minSolution = baseSolution;
	let minEdges = null;
		
	for (let edge of baseSolution.contestedEdges) {
		if (edgePermutation.has(edge)) continue; // don't try to permute the same edge again

		for (let dir of [FORWARD, REVERSE]) {	
			const modifiedEdgeDirections = new Map(edgePermutation).set(edge, dir);
			
			let subsolution = suboptimalDirections(graph, modifiedEdgeDirections);

			// if we end up with fewer possible paths, we're not on the right track
			if (subsolution.paths.length < baseSolution.paths.length) continue;

			// pick a solution if:
				// there are fewer contested edges
					// if equal, the sum of the shortest paths is lower 
			if (minEdges === null || 
				(subsolution.contestedEdges.length < minSolution.contestedEdges.length ||
				(subsolution.contestedEdges.length === minSolution.contestedEdges.length && 
					subsolution.sumShortestPaths < minSolution.sumShortedPaths)
			)) {
				minSolution = subsolution;
				minEdges = modifiedEdgeDirections;
			}
		}
	}

	// if there are still contested edges, optimize further
	if (minEdges && minSolution.contestedEdges.length > 0) {
		minSolution = permutateEdgeDirections(graph, minSolution, minEdges);
	}
	
	return minSolution;
}

export function optimalDirections(graphData) {

	const graph = indexGraph(graphData);
	let solution = suboptimalDirections(graph, new Map());
	
	if (solution.contestedEdges.length > 0) {
		solution = permutateEdgeDirections(graph, solution, new Map())
	}
	return solution;
}