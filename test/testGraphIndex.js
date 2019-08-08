import test from "ava";
import { LINEAR, TWO_ROUTES } from "./helper/graphData.js";
import { indexGraph, FORWARD, REVERSE } from "../src/assignDirections.js";

test("linear graph index", t => {
	const graph = indexGraph(LINEAR);	
	t.deepEqual (graph.edgesByNode, {
		"A": [ [ { parent: "A-B", dir: FORWARD }, "B"] ],
		"B": [ [ { parent: "A-B", dir: REVERSE }, "A"] ]
	});
});

test("two-route graph index", t => {
	const graph = indexGraph(TWO_ROUTES);
	t.deepEqual (graph.edgesByNode, {
		"A": [ [ { parent: "A-B", dir: FORWARD }, "B"], [ { parent: "C-A", dir: REVERSE }, "C"] ],
		"B": [ [ { parent: "A-B", dir: REVERSE }, "A"], [ { parent: "B-C", dir: FORWARD }, "C"] ],
		"C": [ [ { parent: "B-C", dir: REVERSE }, "B"], [ { parent: "C-A", dir: FORWARD }, "A"] ]
	});
});
