import test from "ava";
import { shortestPathsFromSource, edgeBetween } from "../src/pathFinding.js";
import { indexGraph, FORWARD, REVERSE, filteredNeighborFunc } from "./helper/indexGraph.js";
import { LINEAR, ALTERNATING_AXIS, TWO_ROUTES } from "./helper/graphData";

test("simple dijkstra", t => {
	const graph = indexGraph(LINEAR);
	const paths = shortestPathsFromSource("A", graph.sinks, graph.getNeighbors, graph.getWeight);
	
	t.deepEqual (paths, [
		[ { parent: "A-B", dir: FORWARD } ]
	]);
});

test("no possible path dijkstra", t => {
	const graph = indexGraph(LINEAR);
	// mark A-B as a reverse directed edge, making it impossible to find a path
	const edgeAB = edgeBetween(graph.getNeighbors, "A", "B");
	const neighborFunc = filteredNeighborFunc(graph.getNeighbors, e => e === edgeAB);
	const paths = shortestPathsFromSource("A", graph.sinks, neighborFunc, graph.getWeight);
	t.deepEqual (paths, []);
});

test("alternating dijkstra", t => {
	const graph = indexGraph(ALTERNATING_AXIS);
	let paths = shortestPathsFromSource("B", graph.sinks, graph.getNeighbors, graph.getWeight);
	t.deepEqual (paths, [
		[ { parent: "B-C", dir: FORWARD }, { parent: "A-C", dir: REVERSE } ],
		[ { parent: "B-C", dir: FORWARD }, { parent: "C-D", dir: FORWARD }, { parent: "D-E", dir: FORWARD } ],
	]);
	paths = shortestPathsFromSource("F", graph.sinks, graph.getNeighbors, graph.getWeight);
	t.deepEqual (paths, [
		[ { parent: "D-F", dir: REVERSE }, { parent: "C-D", dir: REVERSE }, { parent: "A-C", dir: REVERSE } ],
		[ { parent: "D-F", dir: REVERSE }, { parent: "D-E", dir: FORWARD } ]
	]);
});

test("cyclical dijkstra with direction restrictions", t => {
	const graph = indexGraph(TWO_ROUTES);
	
	const edgeAC = edgeBetween(graph.getNeighbors, "A", "C");
	let neighborFunc = filteredNeighborFunc(graph.getNeighbors, e => e === edgeAC);
	let paths = shortestPathsFromSource("A", graph.sinks, neighborFunc, graph.getWeight);
	t.deepEqual (paths, [
		[ { parent: "A-B", dir: FORWARD }, { parent: "B-C", dir: FORWARD } ],
	]);
	
	const edgeCA = edgeBetween(graph.getNeighbors, "C", "A");
	neighborFunc = filteredNeighborFunc(graph.getNeighbors, e => e === edgeCA);
	paths = shortestPathsFromSource("A", graph.sinks, neighborFunc, graph.getWeight);
	t.deepEqual (paths, [
		[ { parent: "C-A", dir: REVERSE } ],
	]);

});