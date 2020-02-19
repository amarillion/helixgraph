import test from "ava";
import { GridGraph, reverse } from "./helper/gridGraph.js";
import { recursiveBackTracker } from "../src/maze.js";

test("Recursive backtracker", t => {

	const w = 2;
	const h = 2;
	const graph = new GridGraph(w, h);
	
	// given a grid of 2x2
	// apply recursive backtracker
	const start = graph.get(0, 0);
	const linkNodes = (src, dir, dest) => src.link(dest, dir, reverse[dir]);
	recursiveBackTracker(start, c => graph.getAdjacent(c), linkNodes);

	let linkCount = 0;
	let adjacentCount = 0;
	for (const node of graph.eachNode()) {
		linkCount += graph.getLinks(node).length;
		adjacentCount += graph.getAdjacent(node).length;
	}

	t.is(linkCount, 6);
	t.is(adjacentCount, 8);
	// ## TODO
	// should be able to reach all nodes from 1,1 corner
	// should contain exactly 3 edges.
});