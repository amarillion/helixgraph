import test from "ava";
import { LINEAR, CYCLICAL } from "./helper/graphData";
import { indexGraph } from "../src/assignDirections.js";
import { bfsVisit } from "../src/algorithm.js";

test("bfs on simple graph", t => {
	const graph = indexGraph(LINEAR);
	const visited = [];
	bfsVisit("A", graph.getNeighbors, (node) => visited.push(node));
	t.deepEqual(visited, ["A", "B"]);
});

test("bfs on cycle", t => {
	const graph = indexGraph(CYCLICAL);
	const visited = [];
	bfsVisit("A", graph.getNeighbors, (node) => visited.push(node));
	t.deepEqual(visited, ["A", "B", "C", "E", "D", "F"]);
});