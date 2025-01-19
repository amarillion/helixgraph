import { T_JUNCTION, LINEAR_THREE, DEAD_END, CYCLICAL } from "./helper/graphData.js";
import { indexGraph, FORWARD, REVERSE } from "./helper/indexGraph.js";
import { simplify } from "../src/simplify.js";
import { edgeBetween, edgesBetween } from "../src/pathfinding/pathFinding.js";
import { assert } from "../src/assert.js";

test("Simplify network: linear", () => {
	const graph = indexGraph(LINEAR_THREE);
	assert(graph.isSource && graph.isSink);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getAdjacent);
	expect(graph2.nodes).toEqual([ "A", "C" ]);
	expect([ ...graph2.getAdjacent("A") ][0][0]).toEqual({
		weight: 2,
		edgeChain: [ { parent: "A-B", dir: FORWARD }, { parent: "B-C", dir: FORWARD } ],
		nodeChain: [ "A", "B" ],
		left: "A",
		right: "C"
	});
});

test("Simplify network: t-junction", () => {
	const graph = indexGraph(T_JUNCTION);
	assert(graph.isSource && graph.isSink);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getAdjacent);
	expect(graph2.nodes).toEqual([ "A", "C", "E", "G" ]);

	expect(edgeBetween(graph2.getAdjacent, "A", "C")).toEqual({
		weight: 2, left: "A", right: "C",
		edgeChain: [ { parent: "A-B", dir: FORWARD }, { parent: "B-C", dir: FORWARD } ],
		nodeChain: [ "A", "B" ]
	});

	expect(edgeBetween(graph2.getAdjacent, "C", "A")).toEqual({
		weight: 2, left: "C", right: "A",
		edgeChain: [ { parent: "B-C", dir: REVERSE }, { parent: "A-B", dir: REVERSE } ],
		nodeChain: [ "C", "B" ]
	});
	
	expect(edgeBetween(graph2.getAdjacent, "C", "E")).toEqual({
		weight: 2, left: "C", right: "E",
		edgeChain: [ { parent: "C-D", dir: FORWARD }, { parent: "D-E", dir: FORWARD } ],
		nodeChain: [ "C", "D" ]
	});
	
	expect(edgeBetween(graph2.getAdjacent, "C", "G")).toEqual({
		weight: 2, left: "C", right: "G",
		edgeChain: [ { parent: "C-F", dir: FORWARD }, { parent: "F-G", dir: FORWARD } ],
		nodeChain: [ "C", "F" ]
	});
});

test("Simplify network: dead-end", () => {
	const graph = indexGraph(DEAD_END);
	assert(graph.isSource && graph.isSink);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getAdjacent);
	expect(graph2.nodes).toEqual([ "A", "C", "E" ]);

	expect(edgeBetween(graph2.getAdjacent, "A", "C")).toEqual({
		weight: 2, left: "A", right: "C",
		edgeChain: [ { parent: "A-B", dir: FORWARD }, { parent: "B-C", dir: FORWARD } ],
		nodeChain: [ "A", "B" ],
	});

	expect(edgeBetween(graph2.getAdjacent, "C", "E")).toEqual({
		weight: 2, left: "C", right: "E",
		edgeChain: [ { parent: "C-D", dir: FORWARD }, { parent: "D-E", dir: FORWARD } ],
		nodeChain: [ "C", "D" ]
	});
});

test("Simplify network: cycle", () => {
	const graph = indexGraph(CYCLICAL);
	assert(graph.isSource && graph.isSink);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getAdjacent);
	expect(graph2.nodes).toEqual([ "A", "B", "D", "F" ]);

	// TODO: list is susceptible to re-ordering.
	expect(edgesBetween(graph2.getAdjacent, "B", "D")).toEqual([ {
		weight: 2, left: "B", right: "D",
		edgeChain: [ { parent: "B-C", dir: FORWARD }, { parent: "C-D", dir: FORWARD } ],
		nodeChain: [ "B", "C" ]
	}, {
		weight: 2, left: "B", right: "D",
		edgeChain: [ { parent: "E-B", dir: REVERSE }, { parent: "D-E", dir: REVERSE } ],
		nodeChain: [ "B", "E" ]
	} ]);

	// TODO: list is susceptible to re-ordering.
	expect(edgesBetween(graph2.getAdjacent, "D", "B")).toEqual([ {
		weight: 2, left: "D", right: "B",
		edgeChain: [ { parent: "C-D", dir: REVERSE }, { parent: "B-C", dir: REVERSE } ],
		nodeChain: [ "D", "C" ]
	}, {
		weight: 2, left: "D", right: "B",
		edgeChain: [ { parent: "D-E", dir: FORWARD }, { parent: "E-B", dir: FORWARD } ],
		nodeChain: [ "D", "E" ]
	} ]);
});
