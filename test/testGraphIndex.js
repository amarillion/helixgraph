import test from "ava";
import { LINEAR, TWO_ROUTES } from "./helper/graphData.js";
import { indexGraph, FORWARD, REVERSE } from "./helper/indexGraph.js";
import { edgeBetween } from "../src/algorithm.js";

test("linear graph index", t => {
	const graph = indexGraph(LINEAR);
	
	t.deepEqual (graph.edgesByNode.get("A"), 
		[ [ { parent: "A-B", dir: FORWARD }, "B"] ]
	);
	t.deepEqual (graph.edgesByNode.get("B"), 
		[ [ { parent: "A-B", dir: REVERSE }, "A"] ]
	);
});

test("linear graph reverse edges", t => {
	const graph = indexGraph(LINEAR);
	const edgeAB = edgeBetween(graph.getNeighbors, "A", "B");
	const edgeBA = edgeBetween(graph.getNeighbors, "B", "A");
	t.is(graph.reverseEdge(edgeAB), edgeBA);
	t.is(graph.reverseEdge(edgeBA), edgeAB);
});

test("two-route graph index", t => {
	const graph = indexGraph(TWO_ROUTES);

	t.deepEqual (graph.edgesByNode.get("A"), 
		[ [ { parent: "A-B", dir: FORWARD }, "B"], [ { parent: "C-A", dir: REVERSE }, "C"] ]
	);
	t.deepEqual (graph.edgesByNode.get("B"), 
		[ [ { parent: "A-B", dir: REVERSE }, "A"], [ { parent: "B-C", dir: FORWARD }, "C"] ]
	);
	t.deepEqual (graph.edgesByNode.get("C"),
		[ [ { parent: "B-C", dir: REVERSE }, "B"], [ { parent: "C-A", dir: FORWARD }, "A"] ]
	);

});
