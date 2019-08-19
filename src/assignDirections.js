import { allShortestPaths, shortestPathsFromSource } from "./algorithm";
import { mmArrayPush } from "./multimap.js";

export const FORWARD = "F";
export const REVERSE = "R";

/**
 * Turn the getNeighbors function of an undirected network into the getNeighbors function of a directed network,
 * given the constraints on the directions of certain edges.
 * Edges that have no constraint will be returned for both nodes of the edge.
 * Edges that have a constraint will be returned for only one node
 * 
 * @param {*} originalGetNeighbors function(node) that returns an array of [edge, sibling] arrays.
 * @param {*} edgeConstraints Set<edge> constraint that the given directed edge is NOT used, 
 *            i.e. only it's reverse edge is used
 */
export function constrainedNeighborFunc(originalNeighborFunc, edgeConstraints) {
	return (node) => {
		const result = [];
		const neighbors = originalNeighborFunc(node);
		for (const [edge, sibling] of neighbors) {
			if (edgeConstraints.has(edge)) {
				continue;
			}
			result.push([edge, sibling]);
		}
		return result;
	};
}

/* build an index of which edges are used by shortest path steps. */
function calcEdgeUsage(allPaths, reverseEdgeFunc) {
	const edgeUsage = new Map();
	const contestedEdges = [];
	for (const [ source, pathList ] of allPaths.entries()) {
		for (const path of pathList) {
			for (let edge of path) {
				let edgeUsageEntry;
				if (edgeUsage.has(edge)) {
					edgeUsageEntry = edgeUsage.get(edge);
				}
				else {
					edgeUsageEntry = new Set();
					edgeUsage.set(edge, edgeUsageEntry);
					const reverse = reverseEdgeFunc(edge);
					if (edgeUsage.has(reverse)) {
						contestedEdges.push([edge, reverse]);
					}
				}
				edgeUsageEntry.add(source);
			}
		}
	}
	return { edgeUsage, contestedEdges };
}

/* add indices to the graph to make further processing more efficient */
export function indexGraph(graphData) {

	const result = {
		...graphData,
		edgesByNode: new Map(),
		reverse: new Map(),
		sources: [],
		sinks: []
	};

	// add getAdjacent function

	for (const edge of graphData.edges) {

		const nodeLeft = graphData.getLeft(edge);
		const nodeRight = graphData.getRight(edge);
		const edgeLeft = { parent: edge, dir: FORWARD };
		const edgeRight = { parent: edge, dir: REVERSE };
		result.reverse.set(edgeLeft, edgeRight);
		result.reverse.set(edgeRight, edgeLeft);

		mmArrayPush(result.edgesByNode, nodeLeft, [ edgeLeft, nodeRight ]);
		mmArrayPush(result.edgesByNode, nodeRight, [ edgeRight, nodeLeft ]);
	}

	result.getNeighbors = function(node) {
		return result.edgesByNode.get(node);
	};

	result.getWeight = function(edge) {
		return graphData.getWeight(edge.parent);
	};

	result.reverseEdge = function(edge) {
		return result.reverse.get(edge);
	};

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

	for (let edgePair of baseSolution.contestedEdges) {

		if (baseSolution.edgeConstraints.has(edgePair[0]) ||
			baseSolution.edgeConstraints.has(edgePair[1])) continue; // don't try to permute the same edge again

		for (let edge of edgePair) {

			let subsolution = improveSolution(graph, baseSolution, edge, graph.reverseEdge);

			// if we end up with fewer possible paths, we're not on the right track
			if (subsolution.numPaths < baseSolution.numPaths) continue;

			// pick a solution if:
			// there are fewer contested edges
			// if equal, the sum of the shortest paths is lower 
			if (first || 
				(subsolution.contestedEdges.length < minSolution.contestedEdges.length ||
					(subsolution.contestedEdges.length === minSolution.contestedEdges.length && 
					subsolution.sumShortestPaths < minSolution.sumShortestPaths)
				)
			) {
				first = false;
				minSolution = subsolution;
			}
		}
	}

	// if there are still contested edges, optimize further
	if (!first && minSolution.contestedEdges.length > 0) {
		minSolution = permutateEdgeDirections(graph, minSolution, graph.reverseEdge);
	}
	
	return minSolution;
}

export function optimalDirections(graphData) {

	const graph = indexGraph(graphData);
	let solution = firstSolution(graph);
	if (solution.contestedEdges.length > 0) {
		solution = permutateEdgeDirections(graph, solution);
	}
	return solution;
}

function scoreSolution(allPaths, reverseEdgeFunc) {

	let sumShortestPaths = 0;
	let numPaths = 0;

	for (const pathList of allPaths.values()) {
		for (const path of pathList)
		{
			sumShortestPaths += path.length;
			numPaths ++;
		}
	}

	// build an index of which edges are used by shortest path steps.
	const { edgeUsage, contestedEdges } = calcEdgeUsage(allPaths, reverseEdgeFunc);

	return {
		contestedEdges, 
		edgeUsage,
		sumShortestPaths,
		numPaths
	};
}

function firstSolution(graph) {
	// calculate the pairs of shortest paths from source to sink, taking into account the 
	// directions provided in the partial solution
	const allPaths = allShortestPaths(graph.sources, graph.sinks, graph.getNeighbors, graph.getWeight);

	const { contestedEdges, sumShortestPaths, edgeUsage, numPaths } = scoreSolution(allPaths, graph.reverseEdge);
	
	const newSolution = {
		contestedEdges,
		sumShortestPaths,
		edgeUsage,
		numPaths,
		paths: allPaths,
		edgeConstraints: new Set()
	};

	return newSolution;
}

function improveSolution(graph, baseSolution, edge) {

	const newEdgeConstraints = new Set(baseSolution.edgeConstraints).add(edge);
	const neighborFunc = constrainedNeighborFunc(graph.getNeighbors, newEdgeConstraints);

	const newPaths = new Map(baseSolution.paths);
	const affectedSources = baseSolution.edgeUsage.get(edge);

	for (const source of affectedSources) {
		const paths = shortestPathsFromSource(source, graph.sinks, neighborFunc, graph.getWeight);
		// note that it's possible that some source->sink paths are NOT possible.
		// they will be omitted from the result
		newPaths.set(source, paths);
	}

	const { contestedEdges, sumShortestPaths, numPaths, edgeUsage } = scoreSolution(newPaths, graph.reverseEdge);
	const newSolution = {
		contestedEdges,
		sumShortestPaths,
		edgeUsage,
		numPaths,
		paths: newPaths,
		edgeConstraints: newEdgeConstraints
	};
	return newSolution;
}
