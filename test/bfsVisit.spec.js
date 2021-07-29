import { LINEAR, CYCLICAL } from "./helper/graphData";
import { indexGraph } from "./helper/indexGraph.js";
import { bfsVisit, bfsGenerator } from "../src/pathFinding.js";

test("bfs on simple graph", () => {
	const graph = indexGraph(LINEAR);
	const visited = [];
	bfsVisit("A", graph.getNeighbors, (node) => visited.push(node));
	expect(visited).toEqual(["A", "B"]);
});

test("bfs generator on simple graph", () => {
	const graph = indexGraph(LINEAR);
	const visited = [ ...bfsGenerator("A", graph.getNeighbors) ];
	expect(visited).toEqual(["A", "B"]);
});

test("bfs on cycle", () => {
	const graph = indexGraph(CYCLICAL);
	const visited = [];
	bfsVisit("A", graph.getNeighbors, (node) => visited.push(node));
	expect(visited).toEqual(["A", "B", "C", "E", "D", "F"]);
});