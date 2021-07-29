import { T_JUNCTION, LINEAR_THREE, DEAD_END, CYCLICAL } from "./helper/graphData";
import { indexGraph, FORWARD, REVERSE } from "./helper/indexGraph.js";
import { simplify } from "../src/simplify";
import { edgeBetween, edgesBetween } from "../src/pathFinding.js";

test("Simplify network: linear", () => {
	const graph = indexGraph(LINEAR_THREE);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getNeighbors);
	expect(graph2.nodes).toEqual(["A", "C"]);
	expect(graph2.getNeighbors("A")[0][0]).toEqual({
		weight: 2,
		edgeChain: [{ parent: "A-B", dir: FORWARD }, { parent: "B-C", dir: FORWARD } ],
		nodeChain: ["A", "B"],
		left: "A",
		right: "C"
	} );
});

test("Simplify network: t-junction", () => {
	const graph = indexGraph(T_JUNCTION);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getNeighbors);
	expect(graph2.nodes).toEqual(["A", "C", "E", "G"]);

	expect(edgeBetween(graph2.getNeighbors, "A", "C")).toEqual({ 
		weight: 2, left: "A", right: "C",
		edgeChain: [{ parent: "A-B", dir: FORWARD }, { parent: "B-C", dir: FORWARD }],
		nodeChain: ["A", "B"]
	});

	expect(edgeBetween(graph2.getNeighbors, "C", "A")).toEqual({ 
		weight: 2, left: "C", right: "A",
		edgeChain: [{ parent: "B-C", dir: REVERSE }, { parent: "A-B", dir: REVERSE }],
		nodeChain: ["C", "B"]
	});
	
	expect(edgeBetween(graph2.getNeighbors, "C", "E")).toEqual({ 
		weight: 2, left: "C", right: "E",
		edgeChain: [{ parent: "C-D", dir: FORWARD }, { parent: "D-E", dir: FORWARD } ],
		nodeChain: [ "C", "D" ]
	});
	
	expect(edgeBetween(graph2.getNeighbors, "C", "G")).toEqual({ 	
		weight: 2, left: "C", right: "G",
		edgeChain: [{ parent: "C-F", dir: FORWARD }, { parent: "F-G", dir: FORWARD } ],
		nodeChain: ["C", "F"]
	});
});

test("Simplify network: dead-end", () => {
	const graph = indexGraph(DEAD_END);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getNeighbors);
	expect(graph2.nodes).toEqual(["A", "C", "E"]);

	expect(edgeBetween(graph2.getNeighbors, "A", "C")).toEqual({ 
		weight: 2, left: "A", right: "C",
		edgeChain: [{ parent: "A-B", dir: FORWARD }, { parent: "B-C", dir: FORWARD } ],
		nodeChain: ["A", "B"],
	});

	expect(edgeBetween(graph2.getNeighbors, "C", "E")).toEqual({ 
		weight: 2, left: "C", right: "E",
		edgeChain: [{ parent: "C-D", dir: FORWARD }, { parent: "D-E", dir: FORWARD } ],
		nodeChain: ["C", "D"]
	});
});

test("Simplify network: cycle", () => {
	const graph = indexGraph(CYCLICAL);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getNeighbors);
	expect(graph2.nodes).toEqual(["A", "B", "D", "F"]);

	//TODO: list is susceptible to re-ordering.
	expect(edgesBetween(graph2.getNeighbors, "B", "D")).toEqual([{ 
		weight: 2, left: "B", right: "D",
		edgeChain: [{ parent: "B-C", dir: FORWARD }, { parent: "C-D", dir: FORWARD } ],
		nodeChain: ["B", "C"]
	}, { 
		weight: 2, left: "B", right: "D",
		edgeChain: [{ parent: "E-B", dir: REVERSE }, { parent: "D-E", dir: REVERSE } ],
		nodeChain: ["B", "E"]
	}]);

	//TODO: list is susceptible to re-ordering.
	expect(edgesBetween(graph2.getNeighbors, "D", "B")).toEqual([{ 
		weight: 2, left: "D", right: "B",
		edgeChain: [{ parent: "C-D", dir: REVERSE }, { parent: "B-C", dir: REVERSE } ],
		nodeChain: ["D", "C"]
	}, {
		weight: 2, left: "D", right: "B",
		edgeChain: [{ parent: "D-E", dir: FORWARD }, { parent: "E-B", dir: FORWARD } ],
		nodeChain: ["D", "E"]
	}]);
});