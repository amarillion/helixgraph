import { T_JUNCTION, LINEAR_THREE, CYCLICAL } from "./helper/graphData.js";
import { indexGraph, FORWARD, REVERSE, GraphType } from "./helper/indexGraph.js";
import { simplify, flattenPath } from "../src/simplify.js";
import { dijkstra, trackbackNodes, trackbackEdges } from "../src/pathFinding.js";

test("Simplified dijkstra: linear", () => {
	const graph = indexGraph(LINEAR_THREE as GraphType<string, string>);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getNeighbors);
	
	const prev = dijkstra("A", ["C"], graph2.getNeighbors, { getWeight: graph2.getWeight });
	const path1 = trackbackNodes("A", "C", prev);

	expect(path1).toEqual(["A", "C"] );
});

test("Simplified dijkstra: t-junction", () => {
	const graph = indexGraph(T_JUNCTION as GraphType<string, string>);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getNeighbors);
	
	const prev = dijkstra("G", "E", graph2.getNeighbors, { getWeight: graph2.getWeight });

	const nodePath = trackbackNodes("G", "E", prev);
	expect(nodePath).toEqual(["G", "C", "E"] );

	const edgePath = trackbackEdges("G", "E", prev);
	const flatEdgePath = flattenPath(edgePath);
	
	expect(flatEdgePath).toEqual([
		{ parent: "F-G", dir: REVERSE },
		{ parent: "C-F", dir: REVERSE },
		{ parent: "C-D", dir: FORWARD },
		{ parent: "D-E", dir: FORWARD }
	]);
	
});

test("Simplified dijkstra: cycle", () => {
	const graph = indexGraph(CYCLICAL as GraphType<string, string>);
	const graph2 = simplify("A", graph.isSource, graph.isSink, graph.getNeighbors);
	
	const prev = dijkstra("A", "F", graph2.getNeighbors, { getWeight: graph2.getWeight });

	const nodePath = trackbackNodes("A", "F", prev);
	expect(nodePath).toEqual(["A", "B", "D", "F"] );

	const edgePath = trackbackEdges("A", "F", prev);
	const flatEdgePath = flattenPath(edgePath);
	
	expect(flatEdgePath).toEqual([
		{ parent: "A-B", dir: FORWARD },
		{ parent: "B-C", dir: FORWARD },
		{ parent: "C-D", dir: FORWARD },
		{ parent: "D-F", dir: FORWARD }
	]);

});