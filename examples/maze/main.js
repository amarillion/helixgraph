import { recursiveBackTracker } from "../../src/maze.js";
import { GridGraph, reverse } from "../../test/helper/gridGraph.js";
import { renderToString } from "./maze.js";

window.onload = () => {
	
	const linkCells = (src, dir, dest) => { src.link(dest, dir, reverse[dir]); };

	const grid = new GridGraph(10, 10);
	recursiveBackTracker(
		grid.randomCell(), 
		n => grid.getAdjacent(n), 
		linkCells );
	
	console.log("\n\n", renderToString(grid), "\n\n");
	
	const elt = document.getElementById("mainDiv");
	console.log(elt);
	elt.innerHTML = `<pre>${renderToString(grid)}</pre>`;
};
