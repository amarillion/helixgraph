import { LINEAR, CYCLICAL } from "./helper/graphData.js";
import { GraphType, indexGraph } from "./helper/indexGraph.js";
import { bfsVisit, bfsGenerator } from "../src/pathFinding.js";

test("bfs on simple graph", () => {
	const graph = indexGraph(LINEAR as GraphType<string, string>);
	const visited = [];
	bfsVisit("A", graph.getNeighbors, (node) => visited.push(node));
	expect(visited).toEqual(["A", "B"]);
});

test("bfs generator on simple graph", () => {
	const graph = indexGraph(LINEAR as GraphType<string, string>);
	const visited = [ ...bfsGenerator("A", graph.getNeighbors) ];
	expect(visited).toEqual(["A", "B"]);
});

test("bfs on cycle", () => {
	const graph = indexGraph(CYCLICAL as GraphType<string, string>);
	const visited = [];
	bfsVisit("A", graph.getNeighbors, (node) => visited.push(node));
	expect(visited).toEqual(["A", "B", "C", "E", "D", "F"]);
});