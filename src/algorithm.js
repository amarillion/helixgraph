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

/**  

assign optimal directions to an undirected graph
Expected input:

{
	nodes: [],
	edges: [ {} ]
}

 */
export function optimalDirections(undirectedGraph) {

	indexedUndirectedGraph = indexGraph(undirectedGraph);
	baseSolution = suboptimalDirections(indexedUndirectedGraph, nullAssignment);
	
	let minSolution = baseSolution;
	
	for (edge of tempAssignment.contestedEdges) {
		for (dir of [FORWARD, REVERSE]) {
			currentAssignment = baseSolution.with(edge, dir);
			const subsolution = suboptimalDirections(indexedUndirectedGraph, currentAssignment);
			if (minSolution === null) {
				minSolution = subsolution;
			}
			else {
				if (subsolution.contestedEdges.length < minSolution.contestedEdges.length ||
					(subsolution.contestedEdges.length === minSolution.contestedEdges.length && 
						subsolution.sumShortestPaths < minSolution.subShortedPaths)
				) {
					minSolution = subsolution;
				}
			}
		}
	}
	return minSolution;
}