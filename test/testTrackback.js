import test from "ava";
import { breadthFirstSearch, trackbackEdges, trackback } from "../src/algorithm.js";
import { indexGraph, FORWARD } from "./helper/indexGraph.js";
import { LINEAR, CYCLICAL_4SS } from "./helper/graphData.js";

test("trackback edges simple", t => {
	const graph = indexGraph(LINEAR);
	const { prev } = breadthFirstSearch("A", graph.sinks, graph.getNeighbors);
	
	const path = trackbackEdges("A", "B", prev);

	t.deepEqual (path, [
		{ parent: "A-B", dir: FORWARD }
	]);	
});


test("trackback nodes complex", t => {
	const graph = indexGraph(CYCLICAL_4SS);
	const source = "J";
	const { prev } = breadthFirstSearch(source, graph.sinks, graph.getNeighbors);
	
	const path = [];
	const isValid = trackback(source, "I", prev, (fromNode, edge, toNode) => {
		path.unshift(toNode);
	});
	path.unshift(source);

	t.true(isValid);
	t.deepEqual (path, [ "J", "D", "C", "B", "I" ]);
	
});
