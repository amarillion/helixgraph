import test from "ava";
import { GridGraph, reverse } from "./helper/gridGraph.js";
import { recursiveBackTracker } from "../src/maze.js";
import { renderToString } from "../examples/maze/renderToString.js";

test("Recursive backtracker with rendering", t => {

	const w = 8;
	const h = 8;
	const graph = new GridGraph(w, h);

	const start = graph.get(0, 0);
	const linkNodes = (src, dir, dest) => src.link(dest, dir, reverse[dir]);
	recursiveBackTracker(start, c => graph.getAdjacent(c), linkNodes);

	console.log("\n\n", renderToString(graph), "\n\n");
	t.pass();
});

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

	// should contain exactly 3 edges.
	t.is(linkCount, 6);
	// but total potential edges is 4
	t.is(adjacentCount, 8);
});