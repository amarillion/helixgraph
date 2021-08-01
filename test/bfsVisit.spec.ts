import { LINEAR, CYCLICAL } from "./helper/graphData.js";
import { indexGraph } from "./helper/indexGraph.js";
import { bfsVisit, bfsGenerator } from "../src/pathFinding.js";

test("bfs on simple graph", () => {
	const graph = indexGraph(LINEAR);
	const visited : string[] = [];
	bfsVisit("A", graph.getAdjacent, (node) => visited.push(node));
	expect(visited).toEqual(["A", "B"]);
});

test("bfs generator on simple graph", () => {
	const graph = indexGraph(LINEAR);
	const visited = [ ...bfsGenerator("A", graph.getAdjacent) ];
	expect(visited).toEqual(["A", "B"]);
});

test("bfs on cycle", () => {
	const graph = indexGraph(CYCLICAL);
	const visited : string[] = [];
	bfsVisit("A", graph.getAdjacent, (node) => visited.push(node));
	expect(visited).toEqual(["A", "B", "C", "E", "D", "F"]);
});