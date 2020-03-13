import { recursiveBackTracker } from "../../src/maze.js";
import { ExampleGraph, reverse } from "./exampleGraph.js";
import { renderToString } from "./maze.js";

window.onload = () => {
	
	const linkCells = (src, dir, dest) => { src.link(dest, dir, reverse[dir]); };

	const grid = new ExampleGraph(10, 10);
	recursiveBackTracker(
		grid.randomCell(), 
		n => grid.getAdjacent(n), 
		linkCells );
	
	const elt = document.getElementById("mainDiv");
	elt.innerHTML = `<pre>${renderToString(grid)}</pre>`;
};
