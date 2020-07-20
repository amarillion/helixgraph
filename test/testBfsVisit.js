import test from "ava";
import { LINEAR, CYCLICAL } from "./helper/graphData";
import { indexGraph } from "./helper/indexGraph.js";
import { bfsVisit, bfsGenerator } from "../src/pathFinding.js";

test("bfs on simple graph", t => {
	const graph = indexGraph(LINEAR);
	const visited = [];
	bfsVisit("A", graph.getNeighbors, (node) => visited.push(node));
	t.deepEqual(visited, ["A", "B"]);
});

test("bfs generator on simple graph", t => {
	const graph = indexGraph(LINEAR);
	const visited = [ ...bfsGenerator("A", graph.getNeighbors) ];
	t.deepEqual(visited, ["A", "B"]);
});

test("bfs on cycle", t => {
	const graph = indexGraph(CYCLICAL);
	const visited = [];
	bfsVisit("A", graph.getNeighbors, (node) => visited.push(node));
	t.deepEqual(visited, ["A", "B", "C", "E", "D", "F"]);
});