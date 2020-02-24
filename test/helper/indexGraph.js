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
	* listNeighbors(node) function that returns directed edges.
 */
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
