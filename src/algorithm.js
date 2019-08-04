import { symlinkSync } from "fs";

/*

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
Pick a solution that has the fewest contested edges. If there are multiple, pick the one with the shortest sum of all paths.


In pseudo-code

-> {
	nodes: [ ... ]
	edges: [{ n1: node, n2: node, dir: undirected }, ...]    
}

findSourcesAndSinks(graph, isSource, isSink)

-> {
	sources: []
	sinks: []
	nodes: [ ... ]
	edges: [{ n1: node, n2: node, dir: undirected }, ...]    
}

findShortestPathsAndContestedEdges(graphWithSinksAndSources) 

-> {
	newGraph
	sumPathLength: 7
	paths: { source: { path: [] }, ... }
	numUndirectedEdges: 3
}

*/

export const FORWARD = 'F';
export const REVERSE = 'R';

export function dijkstra(source, indexedUndirectedGraph, partialSolutionEdgeDirections) {

	const edges = indexedUndirectedGraph.edges;
	// hardcoded for now...
	switch (source) {
		case 'A':
			return [
				[ { edge: edges[0], dir: FORWARD } ]
			];
		case 'B': 
			return [
				[ { edge: edges[1], dir: FORWARD }, { edge: edges[2], dir: FORWARD }, { edge: edges[3], dir: FORWARD } ],
				[ { edge: edges[1], dir: FORWARD }, { edge: edges[0], dir: REVERSE } ]
			];
		case 'F':
			return [
				[ { edge: edges[4], dir: REVERSE }, { edge: edges[2], dir: REVERSE }, { edge: edges[0], dir: REVERSE } ],
				[ { edge: edges[4], dir: REVERSE }, { edge: edges[3], dir: FORWARD } ]
			];			
	}

}

function suboptimalDirections(indexedUndirectedGraph, partialSolutionEdgeDirections) {

	// calculate the pairs of shortest paths from source to sink, taking into account the 
	// directions provided in the partial solution

	let allPaths = [];
	const newSolution = {
		contestedEdges: [],
		sumShortestPaths: 0,
		paths: null, // filled in at end
		edgeDirections: new Map()
	};

	for (let source of indexedUndirectedGraph.sources) {
		const morePaths = dijkstra(source, indexedUndirectedGraph, partialSolutionEdgeDirections)
		// note that it's possible that some source->sink paths are NOT possible.
		// they will be omitted from the result
		allPaths = allPaths.concat(morePaths);
	}

	for (let path of allPaths) {
		newSolution.sumShortestPaths += path.length;
	}

	// build an index of which edges are used by shortest path steps.
	const edgeUsage = new Map();
	for (let path of allPaths) {
		for (let step of path) {
			if (!edgeUsage.has(step.edge)) {
				edgeUsage.set(step.edge, new Set());
			}
			edgeUsage.get(step.edge).add(step.dir);
		}
	}

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
	return undirectedGraph;
}

/**  

assign optimal directions to an undirected graph
Expected input:

{
	nodes: [],
	edges: [ {} ]
}

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