import test from "ava";
import { T_JUNCTION, LINEAR_THREE, CYCLICAL } from "./helper/graphData.js";
import { indexGraph, FORWARD, REVERSE } from "./helper/indexGraph.js";
import { simplify, flattenPath } from "../src/simplify";
import { dijkstra, trackbackNodes, trackbackEdges } from "../src/algorithm";

test("Simplified dijkstra: linear", t => {
	const graph = indexGraph(LINEAR_THREE);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getNeighbors);
	
	const { prev } = dijkstra("A", ["C"], graph2.getNeighbors, graph2.getWeight);
	const path1 = trackbackNodes("A", "C", prev);

	t.deepEqual(path1, ["A", "C"] );
});

test("Simplified dijkstra: t-junction", t => {
	const graph = indexGraph(T_JUNCTION);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getNeighbors);
	
	const { prev } = dijkstra("G", "E", graph2.getNeighbors, graph2.getWeight);

	const nodePath = trackbackNodes("G", "E", prev);
	t.deepEqual(nodePath, ["G", "C", "E"] );

	const edgePath = trackbackEdges("G", "E", prev);
	const flatEdgePath = flattenPath(edgePath);
	
	t.deepEqual(flatEdgePath, [
		{ parent: "F-G", dir: REVERSE },
		{ parent: "C-F", dir: REVERSE },
		{ parent: "C-D", dir: FORWARD },
		{ parent: "D-E", dir: FORWARD }
	]);
	
});

test("Simplified dijkstra: cycle", t => {
	const graph = indexGraph(CYCLICAL);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getNeighbors);
	
	const { prev } = dijkstra("A", "F", graph2.getNeighbors, graph2.getWeight);

	const nodePath = trackbackNodes("A", "F", prev);
	t.deepEqual(nodePath, ["A", "B", "D", "F"] );

	const edgePath = trackbackEdges("A", "F", prev);
	const flatEdgePath = flattenPath(edgePath);
	
	t.deepEqual(flatEdgePath, [
		{ parent: "A-B", dir: FORWARD },
		{ parent: "B-C", dir: FORWARD },
		{ parent: "C-D", dir: FORWARD },
		{ parent: "D-F", dir: FORWARD }
	]);

});