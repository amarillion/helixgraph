import { recursiveBackTracker } from "../../src/maze.js";
import { pickOne } from "../../src/random.js";
import BaseGrid, { NORTH, SOUTH, EAST, WEST } from "../../src/BaseGrid.js";
import { renderToString } from "./renderToString.js";

// for being able to find the opposite direction
const reverse = {
	[NORTH]: SOUTH,
	[SOUTH]: NORTH,
	[EAST]: WEST,
	[WEST]: EAST
};

// cell implementation that keeps track of links to neighboring cells
class Cell {

	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.links = {};
	}

	/**
	 * @param {*} other cell to link to
	 * @param {*} dir one of NORTH, EAST, SOUTH, WEST
	 * @param {*} reverse optional - supply a reverse direction if you want to make
	 *   the link bidirectional
	 */
	link(other, dir, reverse) {
		if (dir in this.links) {
			console.log("WARNING: creating link that already exists: ", { dir, reverse });
		}
		this.links[dir] = other;
		if (reverse) { 
			// call recursively, but without reversing again
			other.link(this, reverse); 
		}
	}

	linked(dir) {
		return dir in this.links;
	}
}

// alternative maze generation algorithm
// TODO: currently unusued
export function binaryTree(grid) {

	for (const cell of grid.eachCell()) {
		
		const neighbors = [];
		
		const north = grid.findNeighbor(cell, NORTH);
		if (north) neighbors.push({ dir: NORTH, cell: north });
		
		const east = grid.findNeighbor(cell, EAST);
		if (east) neighbors.push({ dir: EAST, cell: east });
		
		const item = pickOne(neighbors);
		if (item) { 
			cell.link(item.cell, item.dir, reverse[item.dir]); 
		}
	}
}

window.onload = () => {
	
	const linkCells = (src, dir, dest) => { src.link(dest, dir, reverse[dir]); };
	const cellFactory = (x, y) => new Cell(x, y);

	const grid = new BaseGrid(10, 10, cellFactory);
	
	// generate maze
	recursiveBackTracker(
		grid.randomCell(), // start cell
		n => grid.getAdjacent(n), 
		linkCells );
	
	const elt = document.getElementById("mainDiv");
	elt.innerHTML = `<pre>${renderToString(grid)}</pre>`;
};
