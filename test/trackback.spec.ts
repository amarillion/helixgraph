import { breadthFirstSearch, trackbackEdges, trackback } from "../src/pathFinding.js";
import { indexGraph, FORWARD } from "./helper/indexGraph.js";
import { LINEAR, CYCLICAL_4SS } from "./helper/graphData.js";

test("trackback edges simple", () => {
	const graph = indexGraph(LINEAR);
	const prev = breadthFirstSearch("A", graph.sinks, graph.getAdjacent);
	
	const path = trackbackEdges("A", "B", prev);

	expect(path).toEqual([
		{ parent: "A-B", dir: FORWARD }
	]);	
});


test("trackback nodes complex", () => {
	const graph = indexGraph(CYCLICAL_4SS);
	const source = "J";
	const prev = breadthFirstSearch(source, graph.sinks, graph.getAdjacent);
	
	const path = [];
	const isValid = trackback(source, "I", prev, (fromNode, edge, toNode) => {
		path.unshift(toNode);
	});
	path.unshift(source);

	expect(isValid).toBe(true);
	expect(path).toEqual([ "J", "D", "C", "B", "I" ]);
	
});
