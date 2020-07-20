import test from "ava";
import { T_JUNCTION, LINEAR_THREE, DEAD_END, CYCLICAL } from "./helper/graphData";
import { indexGraph, FORWARD, REVERSE } from "./helper/indexGraph.js";
import { simplify } from "../src/simplify";
import { edgeBetween, edgesBetween } from "../src/pathFinding.js";

test("Simplify network: linear", t => {
	const graph = indexGraph(LINEAR_THREE);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getNeighbors);
	t.deepEqual(graph2.nodes, ["A", "C"]);
	t.deepEqual(graph2.getNeighbors("A")[0][0], {
		weight: 2,
		edgeChain: [{ parent: "A-B", dir: FORWARD }, { parent: "B-C", dir: FORWARD } ],
		nodeChain: ["A", "B"],
		left: "A",
		right: "C"
	} );
});

test("Simplify network: t-junction", t => {
	const graph = indexGraph(T_JUNCTION);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getNeighbors);
	t.deepEqual(graph2.nodes, ["A", "C", "E", "G"]);

	t.deepEqual(edgeBetween(graph2.getNeighbors, "A", "C"), { 
		weight: 2, left: "A", right: "C",
		edgeChain: [{ parent: "A-B", dir: FORWARD }, { parent: "B-C", dir: FORWARD }],
		nodeChain: ["A", "B"]
	});

	t.deepEqual(edgeBetween(graph2.getNeighbors, "C", "A"), { 
		weight: 2, left: "C", right: "A",
		edgeChain: [{ parent: "B-C", dir: REVERSE }, { parent: "A-B", dir: REVERSE }],
		nodeChain: ["C", "B"]
	});
	
	t.deepEqual(edgeBetween(graph2.getNeighbors, "C", "E"), { 
		weight: 2, left: "C", right: "E",
		edgeChain: [{ parent: "C-D", dir: FORWARD }, { parent: "D-E", dir: FORWARD } ],
		nodeChain: [ "C", "D" ]
	});
	
	t.deepEqual(edgeBetween(graph2.getNeighbors, "C", "G"), { 	
		weight: 2, left: "C", right: "G",
		edgeChain: [{ parent: "C-F", dir: FORWARD }, { parent: "F-G", dir: FORWARD } ],
		nodeChain: ["C", "F"]
	});
});

test("Simplify network: dead-end", t => {
	const graph = indexGraph(DEAD_END);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getNeighbors);
	t.deepEqual(graph2.nodes, ["A", "C", "E"]);

	t.deepEqual(edgeBetween(graph2.getNeighbors, "A", "C"), { 
		weight: 2, left: "A", right: "C",
		edgeChain: [{ parent: "A-B", dir: FORWARD }, { parent: "B-C", dir: FORWARD } ],
		nodeChain: ["A", "B"],
	});

	t.deepEqual(edgeBetween(graph2.getNeighbors, "C", "E"), { 
		weight: 2, left: "C", right: "E",
		edgeChain: [{ parent: "C-D", dir: FORWARD }, { parent: "D-E", dir: FORWARD } ],
		nodeChain: ["C", "D"]
	});
});

test("Simplify network: cycle", t => {
	const graph = indexGraph(CYCLICAL);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getNeighbors);
	t.deepEqual(graph2.nodes, ["A", "B", "D", "F"]);

	//TODO: list is susceptible to re-ordering.
	t.deepEqual(edgesBetween(graph2.getNeighbors, "B", "D"), [{ 
		weight: 2, left: "B", right: "D",
		edgeChain: [{ parent: "B-C", dir: FORWARD }, { parent: "C-D", dir: FORWARD } ],
		nodeChain: ["B", "C"]
	}, { 
		weight: 2, left: "B", right: "D",
		edgeChain: [{ parent: "E-B", dir: REVERSE }, { parent: "D-E", dir: REVERSE } ],
		nodeChain: ["B", "E"]
	}]);

	//TODO: list is susceptible to re-ordering.
	t.deepEqual(edgesBetween(graph2.getNeighbors, "D", "B"), [{ 
		weight: 2, left: "D", right: "B",
		edgeChain: [{ parent: "C-D", dir: REVERSE }, { parent: "B-C", dir: REVERSE } ],
		nodeChain: ["D", "C"]
	}, {
		weight: 2, left: "D", right: "B",
		edgeChain: [{ parent: "D-E", dir: FORWARD }, { parent: "E-B", dir: FORWARD } ],
		nodeChain: ["D", "E"]
	}]);
});