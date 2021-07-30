import { breadthFirstSearch, shortestPathsFromSource, edgeBetween } from "../src/pathFinding.js";
import { indexGraph, FORWARD, REVERSE, filteredAdjacencyFunc } from "./helper/indexGraph.js";
import { LINEAR, ALTERNATING_AXIS, TWO_ROUTES } from "./helper/graphData.js";

test("simple dijkstra", () => {
	const graph = indexGraph(LINEAR);
	const prev = breadthFirstSearch("A", graph.sinks, graph.getAdjacent);
	const paths = shortestPathsFromSource("A", graph.sinks, prev);
	expect(paths).toEqual([
		[ { parent: "A-B", dir: FORWARD } ]
	]);
});

test("no possible path dijkstra", () => {
	const graph = indexGraph(LINEAR);
	// mark A-B as a reverse directed edge, making it impossible to find a path
	const edgeAB = edgeBetween(graph.getAdjacent, "A", "B");
	const adjacencyFunc = filteredAdjacencyFunc(graph.getAdjacent, e => e === edgeAB);
	const prev = breadthFirstSearch("A", graph.sinks, adjacencyFunc);
	const paths = shortestPathsFromSource("A", graph.sinks, prev);
	expect(paths).toEqual([]);
});

test("alternating dijkstra", () => {
	const graph = indexGraph(ALTERNATING_AXIS);
	let prev = breadthFirstSearch("B", graph.sinks, graph.getAdjacent);
	let paths = shortestPathsFromSource("B", graph.sinks, prev);
	expect(paths).toEqual([
		[ { parent: "B-C", dir: FORWARD }, { parent: "A-C", dir: REVERSE } ],
		[ { parent: "B-C", dir: FORWARD }, { parent: "C-D", dir: FORWARD }, { parent: "D-E", dir: FORWARD } ],
	]);
	prev = breadthFirstSearch("F", graph.sinks, graph.getAdjacent);
	paths = shortestPathsFromSource("F", graph.sinks, prev);
	expect(paths).toEqual([
		[ { parent: "D-F", dir: REVERSE }, { parent: "C-D", dir: REVERSE }, { parent: "A-C", dir: REVERSE } ],
		[ { parent: "D-F", dir: REVERSE }, { parent: "D-E", dir: FORWARD } ]
	]);
});

test("cyclical dijkstra with direction restrictions", () => {
	const graph = indexGraph(TWO_ROUTES);
	
	const edgeAC = edgeBetween(graph.getAdjacent, "A", "C");
	let adjacencyFunc = filteredAdjacencyFunc(graph.getAdjacent, e => e === edgeAC);
	let prev = breadthFirstSearch("A", graph.sinks, adjacencyFunc)
	let paths = shortestPathsFromSource("A", graph.sinks, prev);
	expect(paths).toEqual([
		[ { parent: "A-B", dir: FORWARD }, { parent: "B-C", dir: FORWARD } ],
	]);
	
	const edgeCA = edgeBetween(graph.getAdjacent, "C", "A");
	adjacencyFunc = filteredAdjacencyFunc(graph.getAdjacent, e => e === edgeCA);
	prev = breadthFirstSearch("A", graph.sinks, adjacencyFunc)
	paths = shortestPathsFromSource("A", graph.sinks, prev);
	expect(paths).toEqual([
		[ { parent: "C-A", dir: REVERSE } ],
	]);

});