import { Cell, GridGraph, reverse } from "./helper/gridGraph.js";
import { Stream } from "../src/iterableUtils.js";
import { kruskal } from "../src/kruskal.js";
import { DirectionType } from "../src/BaseGrid.js";

test("Kruskal's algorithm", () => {
	const w = 2;
	const h = 2;
	const graph = new GridGraph(w, h);
	
	// given a grid of 2x2
	const linkNodes = (src: Cell, dir: DirectionType, dest: Cell) => src.link(dest, dir, reverse[dir]);
	
	kruskal(graph.eachNode(), c => graph.getAdjacent(c), linkNodes);

	let linkCount = 0;
	let adjacentCount = 0;
	for (const node of graph.eachNode()) {
		linkCount += graph.getLinks(node).length;
		adjacentCount += Stream.of(graph.getAdjacent(node)).size();
	}

	// should contain exactly 3 edges.
	expect(linkCount).toBe(6);
	// but total potential edges is 4
	expect(adjacentCount).toBe(8);
});

test("Kruskal's algorithm max iterations", () => {
	const w = 2;
	const h = 2;
	const graph = new GridGraph(w, h);
	// given a grid of 2x2
	const linkNodes = (src: Cell, dir: DirectionType, dest: Cell) => src.link(dest, dir, reverse[dir]);
		
	expect(() =>
		kruskal(graph.eachNode(), c => graph.getAdjacent(c), linkNodes, { maxIterations: 1 })
	).toThrow();
});
