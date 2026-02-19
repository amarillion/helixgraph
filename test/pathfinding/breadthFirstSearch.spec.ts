import { LINEAR, CYCLICAL, LINEAR_THREE } from "../helper/graphData.js";
import { indexGraph } from "../helper/indexGraph.js";
import { bfsVisit, bfsGenerator, breadthFirstSearch } from "../../src/pathfinding/bfs.js";
import { test, expect } from 'vitest';

test("bfs distance calculations", () => {
	const graph = indexGraph(LINEAR_THREE);
	const prevMap = breadthFirstSearch("A", [], graph.getAdjacent);
	expect(prevMap.get("C")?.cost).toBe(2);
	expect(prevMap.get("B")?.cost).toBe(1);
	expect(prevMap.get("A")?.cost).toBe(0);
});

test("bfs visit on simple graph", () => {
	const graph = indexGraph(LINEAR);
	const visited: string[] = [];
	bfsVisit("A", graph.getAdjacent, (node) => visited.push(node));
	expect(visited).toEqual([ "A", "B" ]);
});

test("bfs generator on simple graph", () => {
	const graph = indexGraph(LINEAR);
	const visited = [ ...bfsGenerator("A", graph.getAdjacent) ];
	expect(visited).toEqual([ "A", "B" ]);
});

test("bfs visit on cycle", () => {
	const graph = indexGraph(CYCLICAL);
	const visited: string[] = [];
	bfsVisit("A", graph.getAdjacent, (node) => visited.push(node));
	expect(visited).toEqual([ "A", "B", "C", "E", "D", "F" ]);
});
