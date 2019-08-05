export const FORWARD = 'F';
export const REVERSE = 'R';

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

export function shortedPathsFromSource(source, indexedUndirectedGraph, partialSolutionEdgeDirections) {

	// Mark all nodes unvisited. Create a set of all the unvisited nodes called the unvisited set.
	// Assign to every node a tentative distance value: set it to zero for our initial node and to infinity for all other nodes. Set the initial node as current.[13]

	const dist = new Map();
	const visited = new Set();
	const prev = new Map();
	const destinations = indexedUndirectedGraph.sinks;
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

		for (const [edge, dir, sibling] of indexedUndirectedGraph.edgesByNode[current]) {			
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
			path.unshift({ edge: step.edge, dir: step.dir });
			current = step.from;
			if (current === source) {
				break;
			}
		}

		result.push(path);
	}

	return result;
}

/** 

all shortest paths from sources to sinks .
Returns an array of arrays of steps.

*/
function allShortestPaths(indexedUndirectedGraph, partialSolutionEdgeDirections) {
	let allPaths = [];
	for (let source of indexedUndirectedGraph.sources) {
		const morePaths = shortedPathsFromSource(source, indexedUndirectedGraph, partialSolutionEdgeDirections)
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

function suboptimalDirections(indexedUndirectedGraph, partialSolutionEdgeDirections) {

	const newSolution = {
		contestedEdges: [],
		sumShortestPaths: 0,
		paths: null, // filled in at end
		edgeDirections: new Map()
	};

	// calculate the pairs of shortest paths from source to sink, taking into account the 
	// directions provided in the partial solution
	const allPaths = allShortestPaths(indexedUndirectedGraph, partialSolutionEdgeDirections);

	for (let path of allPaths) {
		newSolution.sumShortestPaths += path.length;
	}

	// build an index of which edges are used by shortest path steps.
	const edgeUsage = calcEdgeUsage(allPaths);

	// assign directions in a new partial solution given uncontested edges in the paths.
	for (let edge of indexedUndirectedGraph.edges) {
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
export function indexGraph(undirectedGraph) {
	
	// add getAdjacent function

	undirectedGraph.edgesByNode = {};
	for (const edge of undirectedGraph.edges) {

		const nodeLeft = edge[0];
		const nodeRight = edge[1];
		const edgeLeft = [ edge, FORWARD, nodeRight ];
		const edgeRight = [ edge, REVERSE, nodeLeft ];
		
		if (nodeLeft in undirectedGraph.edgesByNode) {
			undirectedGraph.edgesByNode[nodeLeft].push(edgeLeft);
		}
		else {
			undirectedGraph.edgesByNode[nodeLeft] = [ edgeLeft ];
		}

		if (nodeRight in undirectedGraph.edgesByNode) {
			undirectedGraph.edgesByNode[nodeRight].push(edgeRight);
		}
		else {
			undirectedGraph.edgesByNode[nodeRight] = [ edgeRight ];
		}
	}

	return undirectedGraph;
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

export function optimalDirections(undirectedGraph) {

	const indexedUndirectedGraph = indexGraph(undirectedGraph);
	const baseSolution = suboptimalDirections(indexedUndirectedGraph, new Map());
	
	let minSolution = baseSolution;
	
	for (let edge of baseSolution.contestedEdges) {
		for (let dir of [FORWARD, REVERSE]) {
			const modifiedEdgeDirections = new Map(baseSolution.edgeDirections).set(edge, dir);
			const subsolution = suboptimalDirections(indexedUndirectedGraph, modifiedEdgeDirections);
			if (!subsolution) continue; // there are no possible paths with the given constraints, skip
			if (minSolution === null) {
				minSolution = subsolution;
			}
			else {
				// pick a solution if:
					// there are the same number of possible paths. If one path becomes impossible, this is no longer a good solution
						// if equal, there are fewer contested edges
							// if equal, the sum of the shortest paths is lower 
				if (subsolution.paths.length >= minSolution.paths.length &&
					(subsolution.contestedEdges.length < minSolution.contestedEdges.length ||
					(subsolution.contestedEdges.length === minSolution.contestedEdges.length && 
						subsolution.sumShortestPaths < minSolution.subShortedPaths))
				) {
					minSolution = subsolution;
				}
			}
		}
	}
	return minSolution;
}