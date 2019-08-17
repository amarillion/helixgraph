import test from "ava";
import { T_JUNCTION, LINEAR_THREE, DEAD_END, CYCLICAL } from "./helper/graphData";
import { indexGraph, FORWARD, REVERSE } from "../src/assignDirections";
import { simplify } from "../src/simplify";

test("Simplify network: linear", t => {
	const graph = indexGraph(LINEAR_THREE);
	const graph2 = simplify("A", graph);
	t.deepEqual(graph2.nodes, ["A", "C"]);
	t.deepEqual(graph2.edges, [ {
		weight: 2,
		edgeChain: [{ parent: "A-B", dir: FORWARD }, { parent: "B-C", dir: FORWARD } ],
		nodeChain: ["A", "B"],
		left: "A",
		right: "C"
	}] );
});

test("Simplify network: t-junction", t => {
	const graph = indexGraph(T_JUNCTION);
	const graph2 = simplify("A", graph);
	t.deepEqual(graph2.nodes, ["A", "C", "E", "G"]);
	t.deepEqual(graph2.edges, [{ 
		weight: 2, left: "A", right: "C",
		edgeChain: [{ parent: "A-B", dir: FORWARD }, { parent: "B-C", dir: FORWARD } ],
		nodeChain: ["A", "B"]
	}, {
		weight: 2, left: "C", right: "E",
		edgeChain: [{ parent: "C-D", dir: FORWARD }, { parent: "D-E", dir: FORWARD } ],
		nodeChain: [ "C", "D" ]
	}, {
		weight: 2, left: "C", right: "G",
		edgeChain: [{ parent: "C-F", dir: FORWARD }, { parent: "F-G", dir: FORWARD } ],
		nodeChain: ["C", "F"]
	}]);
});

test("Simplify network: dead-end", t => {
	const graph = indexGraph(DEAD_END);
	const graph2 = simplify("A", graph);
	t.deepEqual(graph2.nodes, ["A", "C", "E"]);
	t.deepEqual(graph2.edges, [{ 
		weight: 2, left: "A", right: "C",
		edgeChain: [{ parent: "A-B", dir: FORWARD }, { parent: "B-C", dir: FORWARD } ],
		nodeChain: ["A", "B"],
	}, {
		weight: 2, left: "C", right: "E",
		edgeChain: [{ parent: "C-D", dir: FORWARD }, { parent: "D-E", dir: FORWARD } ],
		nodeChain: ["C", "D"]
	}]);
});

test("Simplify network: cycle", t => {
	const graph = indexGraph(CYCLICAL);
	const graph2 = simplify("A", graph);
	t.deepEqual(graph2.nodes, ["A", "B", "D", "F"]);
	t.deepEqual(graph2.edges, [{ 
		weight: 1, left: "A", right: "B",
		edgeChain: [{ parent: "A-B", dir: FORWARD } ],
		nodeChain: ["A"],
	}, {
		weight: 2, left: "B", right: "D",
		edgeChain: [{ parent: "B-C", dir: FORWARD }, { parent: "C-D", dir: FORWARD } ],
		nodeChain: ["B", "C"],
	}, {
		weight: 2, left: "B", right: "D",
		edgeChain: [{ parent: "E-B", dir: REVERSE }, { parent: "D-E", dir: REVERSE } ],
		nodeChain: ["B", "E"],
	}, {
		weight: 1, left: "D", right: "F",
		edgeChain: [{ parent: "D-F", dir: FORWARD } ],
		nodeChain: ["D"]
	}]);
});