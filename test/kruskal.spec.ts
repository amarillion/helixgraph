import { GridGraph, reverse } from "./helper/gridGraph.js";
import { Stream } from "../src/iterableUtils.js";
import { kruskal } from "../src/kruskal.js";

test("Kruskal's algorithm", () => {

	const w = 2;
	const h = 2;
	const graph = new GridGraph(w, h);
	
	// given a grid of 2x2
	const linkNodes = (src, dir, dest) => src.link(dest, dir, reverse[dir]);
	
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