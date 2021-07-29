import { LINEAR, TWO_ROUTES } from "./helper/graphData.js";
import { indexGraph, FORWARD, REVERSE } from "./helper/indexGraph.js";
import { edgeBetween } from "../src/pathFinding.js";

test("linear graph index", () => {
	const graph = indexGraph(LINEAR);
	
	expect(graph.edgesByNode.get("A")).toEqual(
		[ [ { parent: "A-B", dir: FORWARD }, "B"] ]
	);
	expect(graph.edgesByNode.get("B")).toEqual(
		[ [ { parent: "A-B", dir: REVERSE }, "A"] ]
	);
});

test("linear graph reverse edges", () => {
	const graph = indexGraph(LINEAR);
	const edgeAB = edgeBetween(graph.getNeighbors, "A", "B");
	const edgeBA = edgeBetween(graph.getNeighbors, "B", "A");
	expect(graph.reverseEdge(edgeAB)).toBe(edgeBA);
	expect(graph.reverseEdge(edgeBA)).toBe(edgeAB);
});

test("two-route graph index", () => {
	const graph = indexGraph(TWO_ROUTES);

	expect(graph.edgesByNode.get("A")).toEqual(
		[ [ { parent: "A-B", dir: FORWARD }, "B"], [ { parent: "C-A", dir: REVERSE }, "C"] ]
	);
	expect(graph.edgesByNode.get("B")).toEqual(
		[ [ { parent: "A-B", dir: REVERSE }, "A"], [ { parent: "B-C", dir: FORWARD }, "C"] ]
	);
	expect(graph.edgesByNode.get("C")).toEqual(
		[ [ { parent: "B-C", dir: REVERSE }, "B"], [ { parent: "C-A", dir: FORWARD }, "A"] ]
	);

});
