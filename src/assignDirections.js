import { allShortestPaths } from "./algorithm";

export const FORWARD = "F";
export const REVERSE = "R";

/**
 * Turn the getNeighbors function of an undirected network into the getNeighbors function of a directed network,
 * given the constraints on the directions of certain edges.
 * Edges that have no constraint will be returned for both nodes of the edge.
 * Edges that have a constraint will be returned for only one node
 * 
 * @param {*} originalGetNeighbors function(node) that returns an array of [edge, sibling] arrays.
 * @param {*} edgeConstraints Map<edge, FORWARD|REVERSE> constraint that the given undirected edge is only used in the given direction, 
 *            i.e. the undirected edge becomes an directed edge.
 */
export function constrainedNeighborFunc(originalNeighborFunc, edgeConstraints) {
	return (node) => {
		const result = [];
		const neighbors = originalNeighborFunc(node);
		for (const [edge, sibling] of neighbors) {
			
			const undirectedParent = edge.parent;
			if (edgeConstraints.has(undirectedParent) &&
				edge.dir !== edgeConstraints.get(undirectedParent)
			) {
				continue;
			}

			result.push([edge, sibling]);
		}
		return result;
	};
}

function getOrDefault(map, key, defaultFactory) {
	if (map.has(key)) {
		return map.get(key);
	}
	else {
		const result = defaultFactory();
		map.set(key, result);
		return result;
	}
}

/* build an index of which edges are used by shortest path steps. */
function calcEdgeUsage(allPaths) {
	const edgeUsage = new Map();
	for (const [ source, pathList ] of allPaths.entries()) {
		for (const path of pathList) {
			for (let edge of path) {
				const edgeUsageEntry = getOrDefault(edgeUsage, edge.parent, () => new Map())
				const edgeUsageValue = getOrDefault(edgeUsageEntry, edge.dir, () => new Set())
				edgeUsageValue.add(source);
			}
		}
	}
	return edgeUsage;
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
		const edgeLeft = [ { parent: edge, dir: FORWARD }, nodeRight ];
		const edgeRight = [ { parent: edge, dir: REVERSE }, nodeLeft ];
		
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

	result.getNeighbors = function(node) {
		return result.edgesByNode[node];
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
function permutateEdgeDirections(graph, baseSolution) {
	let minSolution = baseSolution;
	let first = true;

	for (let edge of baseSolution.contestedEdges) {

		if (baseSolution.edgeConstraints.has(edge)) continue; // don't try to permute the same edge again

		for (let dir of [FORWARD, REVERSE]) {

			let subsolution = improveSolution(graph, baseSolution, edge, dir);

			// if we end up with fewer possible paths, we're not on the right track
			if (subsolution.numPaths < baseSolution.numPaths) continue;

			// pick a solution if:
				// there are fewer contested edges
					// if equal, the sum of the shortest paths is lower 
			if (first || 
				(subsolution.contestedEdges.length < minSolution.contestedEdges.length ||
				(subsolution.contestedEdges.length === minSolution.contestedEdges.length && 
					subsolution.sumShortestPaths < minSolution.sumShortestPaths)
			)) {
				first = false;
				minSolution = subsolution;
			}
		}
	}

	// if there are still contested edges, optimize further
	if (!first && minSolution.contestedEdges.length > 0) {
		minSolution = permutateEdgeDirections(graph, minSolution);
	}
	
	return minSolution;
}

export function optimalDirections(graphData) {

	const graph = indexGraph(graphData);
	let solution = firstSolution(graph);
	
	if (solution.contestedEdges.length > 0) {
		solution = permutateEdgeDirections(graph, solution, new Map())
	}
	return solution;
}

function scoreSolution(allPaths, edges) {

	let sumShortestPaths = 0;
	let numPaths = 0;
	const edgeDirections = new Map();
	const contestedEdges = [];

	for (const pathList of allPaths.values()) {
		for (const path of pathList)
		{
			sumShortestPaths += path.length;
			numPaths ++;
		}
	}

	// build an index of which edges are used by shortest path steps.
	const edgeUsage = calcEdgeUsage(allPaths);

	// assign directions in a new partial solution given uncontested edges in the paths.
	for (let edge of edges) {			
		if (edgeUsage.has(edge)) {
			const sourcesByDir = edgeUsage.get(edge);
			if (sourcesByDir.size > 1) {
				contestedEdges.push(edge)
			}
			else {
				edgeDirections.set(edge, sourcesByDir.keys().next().value);
			}
		}
	}

	return {
		contestedEdges, 
		edgeDirections,
		sumShortestPaths,
		numPaths
	}
}

function firstSolution(graph) {
	// calculate the pairs of shortest paths from source to sink, taking into account the 
	// directions provided in the partial solution
	const allPaths = allShortestPaths(graph.sources, graph.sinks, graph.getNeighbors, graph.getWeight);

	const { contestedEdges, sumShortestPaths, edgeDirections, numPaths } = scoreSolution(allPaths, graph.edges);
	
	const newSolution = {
		contestedEdges,
		sumShortestPaths,
		edgeDirections,
		numPaths,
		paths: allPaths,
		edgeConstraints: new Map()
	};

	return newSolution;
}

function improveSolution(graph, baseSolution, edge, dir) {

	const newEdgeConstraints = new Map(baseSolution.edgeConstraints).set(edge, dir);
	const neighborFunc = constrainedNeighborFunc(graph.getNeighbors, newEdgeConstraints);

	//TODO: only recalculate the paths that we need here...
	const allPaths = allShortestPaths(graph.sources, graph.sinks, neighborFunc, graph.getWeight);

	const { contestedEdges, sumShortestPaths, numPaths, edgeDirections } = scoreSolution(allPaths, graph.edges);
	const newSolution = {
		contestedEdges,
		sumShortestPaths,
		edgeDirections,
		numPaths,
		paths: allPaths,
		edgeConstraints: newEdgeConstraints
	};
	return newSolution;
}
