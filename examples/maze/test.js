import test from "ava";
import { binaryTree, expandNodes, reachable, renderToString } from "./maze.js";
import { GridGraph, reverse } from "../../test/helper/gridGraph.js";
import { recursiveBackTracker } from "../../src/maze.js";

const linkCells = (src, dir, dest) => { src.link(dest, dir, reverse[dir]); };

// test("binary tree maze", t => {
// 	const grid = new Grid(10, 10);
// 	binaryTree(grid);
// 	console.log("\n\n", grid.renderToString(), "\n\n");
// 	t.assert(true);
// });

test("recursive backtracker maze", t => {
	const grid = new GridGraph(10, 10);
	recursiveBackTracker(
		grid.randomCell(), 
		n => grid.getAdjacent(n), 
		linkCells );
	console.log("\n\n", renderToString(grid), "\n\n");
	t.assert(true);
});

test("expand nodes", t => {
	
	const grid = new GridGraph(10, 10);
	recursiveBackTracker(
		grid.randomCell(), 
		n => grid.getAdjacent(n), 
		linkCells );
	
	const start = grid.get(0, 0);
	const expanse = expandNodes(start, n => n.getLinks() );

	console.log("\n\n", renderToString(grid), "\n\n");
	t.is(expanse.length, 100);
	t.is([ ...grid.eachNode() ].length, 100);
});

test("reachable", t => {

	const grid = new GridGraph(10, 10);
	recursiveBackTracker(
		grid.randomCell(), 
		n => grid.getAdjacent(n), 
		linkCells );
	
	const start = grid.get(0, 0);
	const end = grid.get(9, 9);

	console.log("\n\n", renderToString(grid), "\n\n");
	t.true(reachable(start, end, n => n.getLinks() ));
	t.true(reachable(end, start, n => n.getLinks() ));
});