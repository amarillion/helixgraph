import { AdjacencyFunc, GraphType, PredicateFunc, SimpleGraph } from "../../src/definitions.js";
import { mmArrayPush } from "../../src/multimap.js";

export const FORWARD = "F";
export const REVERSE = "R";

/* 
	Create a directed graph from simple undirected graph data.
	Given a data structure that defines at least the following:
	* array of undirected edges
	* array of nodes
	* function getLeft(edge) -> return left node of undirected edge
	* function getRight(edge) -> return right node of undirected edge
	* function isSource(node)
	* function isSink(node)

	Return the same data structure with the following added:
	* Map edgesByNode: with directed edges
	* Map reverse: for each edge, the edge going the other way.
	* list of sources,
	* list of sinks
	* reverseEdge(edge) function
	* getAdjacent(node) function that returns directed edges.
 */
export function indexGraph<N, E>(graphData : SimpleGraph<N, E>) : GraphType<N, E> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const edgesByNode = new Map<N, any>();
	const reverse = new Map();
	for (const edge of graphData.edges) {
		const nodeLeft = graphData.getLeft(edge);
		const nodeRight = graphData.getRight(edge);
		const edgeLeft = { parent: edge, dir: FORWARD };
		const edgeRight = { parent: edge, dir: REVERSE };
		reverse.set(edgeLeft, edgeRight);
		reverse.set(edgeRight, edgeLeft);

		mmArrayPush(edgesByNode, nodeLeft, [ edgeLeft, nodeRight ]);
		mmArrayPush(edgesByNode, nodeRight, [ edgeRight, nodeLeft ]);
	}

	return {
		...graphData,
		getAdjacent: (node) => edgesByNode.get(node),
		isSource: (node) => graphData.sources.indexOf(node) >= 0, 
		isSink: (node) => graphData.sinks.indexOf(node) >= 0, 
		reverseEdge: (edge) => reverse.get(edge)
	};
}

/**
 * Filter an adjacencyFunc using a predicate
 * 
 * @param {*} originalGetAdjacent function(node) that returns an array of [edge, sibling] arrays.
 * @param {*} predicate function(edge), returns true if edge is discarded
 */
export function filteredAdjacencyFunc<N, E>(originalGetAdjacent : AdjacencyFunc<N, E>, predicate : PredicateFunc<E>) {
	return (node : N) => {
		const result : Array<[E, N]> = [];
		const adjacents = originalGetAdjacent(node);
		for (const [edge, sibling] of adjacents) {
			if (predicate(edge)) {
				continue;
			}
			result.push([edge, sibling]);
		}
		return result;
	};
}
