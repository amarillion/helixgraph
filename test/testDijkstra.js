import test from "ava";
import { dijkstra } from "../src/algorithm.js";
import { indexGraph, FORWARD, REVERSE, constrainedNeighborFunc } from "../src/assignDirections.js";
import { LINEAR, ALTERNATING_AXIS, TWO_ROUTES } from "./helper/graphData";

test("simple dijkstra", t => {
	const graph = indexGraph(LINEAR);
	const paths = dijkstra("A", graph.sinks, graph.getNeighbors, graph.getWeight);
	
	t.deepEqual (paths, [
		[ { edge: "A-B", dir: FORWARD } ]
	]);
});

test("no possible path dijkstra", t => {
	const graph = indexGraph(LINEAR);

	// mark A-B as a reverse directed edge, making it impossible to find a path
	const neighborFunc = constrainedNeighborFunc(graph.getNeighbors, new Map().set("A-B", REVERSE));
	const paths = dijkstra("A", graph.sinks, neighborFunc, graph.getWeight);
	t.deepEqual (paths, []);
});

test("alternating dijkstra", t => {
	const graph = indexGraph(ALTERNATING_AXIS);
	let paths = dijkstra("B", graph.sinks, graph.getNeighbors, graph.getWeight);
	t.deepEqual (paths, [
		[ { edge: "B-C", dir: FORWARD }, { edge: "A-C", dir: REVERSE } ],
		[ { edge: "B-C", dir: FORWARD }, { edge: "C-D", dir: FORWARD }, { edge: "D-E", dir: FORWARD } ],
	]);
	paths = dijkstra("F", graph.sinks, graph.getNeighbors, graph.getWeight);
	t.deepEqual (paths, [
		[ { edge: "D-F", dir: REVERSE }, { edge: "C-D", dir: REVERSE }, { edge: "A-C", dir: REVERSE } ],
		[ { edge: "D-F", dir: REVERSE }, { edge: "D-E", dir: FORWARD } ]
	]);
});

test("cyclical dijkstra with direction restrictions", t => {
	const graph = indexGraph(TWO_ROUTES);
	
	let neighborFunc = constrainedNeighborFunc(graph.getNeighbors, new Map().set("C-A", FORWARD));
	let paths = dijkstra("A", graph.sinks, neighborFunc, graph.getWeight);
	t.deepEqual (paths, [
		[ { edge: "A-B", dir: FORWARD }, { edge: "B-C", dir: FORWARD } ],
	]);
	
	neighborFunc = constrainedNeighborFunc(graph.getNeighbors, new Map().set("C-A", REVERSE));
	paths = dijkstra("A", graph.sinks, neighborFunc, graph.getWeight);
	t.deepEqual (paths, [
		[ { edge: "C-A", dir: REVERSE } ],
	]);

});