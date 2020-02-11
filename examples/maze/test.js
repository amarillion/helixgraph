import test from "ava";
import { Grid, binaryTree, recursiveBackTracker, addDoors, expandNodes, reachable, addDoors1 } from "./maze.js";

// test("binary tree maze", t => {
// 	const grid = new Grid(10, 10);
// 	binaryTree(grid);
// 	console.log("\n\n", grid.renderToString(), "\n\n");
// 	t.assert(true);
// });

test("recursive backtracker maze", t => {
	const grid = new Grid(10, 10);
	recursiveBackTracker(grid);
	console.log("\n\n", grid.renderToString(), "\n\n");
	t.assert(true);
});

test("expand nodes", t => {
	
	const grid = new Grid(10, 10);
	recursiveBackTracker(grid);
	
	const start = grid.get(0, 0);
	const expanse = expandNodes(start);

	t.is(expanse.length, 100);
	t.is(grid.allNodes().length, 100);
});

test("reachable", t => {

	const grid = new Grid(10, 10);
	recursiveBackTracker(grid);
	
	const start = grid.get(0, 0);
	const end = grid.get(9, 9);

	t.true(reachable(start, end));
	t.true(reachable(end, start));
});