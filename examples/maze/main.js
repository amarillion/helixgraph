import { recursiveBackTracker } from "../../lib/recursiveBacktracker.js";
import { pickOne } from "../../lib/random.js";
import BaseGrid, { NORTH, SOUTH, EAST, WEST } from "../../lib/BaseGrid.js";
import { prim, PRIM_LAST_ADDED_RANDOM_EDGES, PRIM_RANDOM } from "../../lib/prim.js";
import { kruskal } from "../../lib/kruskal.js";
import { Collapsible, Select } from "../util/components.js";

// for being able to find the opposite direction
const reverse = {
	[NORTH]: SOUTH,
	[SOUTH]: NORTH,
	[EAST]: WEST,
	[WEST]: EAST
};

const CELL_SIZE = 20;

const POINTS = [
	{ x: 0, y: 0 },
	{ x: CELL_SIZE, y: 0 },
	{ x: CELL_SIZE, y: CELL_SIZE },
	{ x: 0, y: CELL_SIZE }
];

const SEGMENTS = {
	[NORTH]: POINTS.slice(0,2),
	[EAST]: POINTS.slice(1,3),
	[SOUTH]: POINTS.slice(2,4),
	[WEST]: [ POINTS[3], POINTS[0] ]
};

const margin = 10;

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

	get px() { return this.x * CELL_SIZE; }
	get py() { return this.y * CELL_SIZE; }
	
	render(ctx) {
		ctx.lineWidth = 1.0;
		ctx.strokeStyle = "black";

		// ctx.lineCap = "round";
		for (const dir of [NORTH, EAST, SOUTH, WEST]) {
			if (this.linked(dir)) continue;

			const segment = SEGMENTS[dir];
			ctx.beginPath();
			ctx.moveTo(margin + this.px + segment[0].x, margin + this.py + segment[0].y);
			ctx.lineTo(margin + this.px + segment[1].x, margin + this.py + segment[1].y);
			ctx.stroke();
		}
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

customElements.define("hxg-collapsible", Collapsible);
customElements.define("hxg-select", Select);

window.onload = () => {
	
	const linkCells = (src, dir, dest) => { src.link(dest, dir, reverse[dir]); };
	
	const canvasWidth = (document.body.clientWidth);
	const canvasHeight = (document.body.clientHeight);
	const canvas = document.getElementById("myCanvas");

	canvas.setAttribute("width", canvasWidth);
	canvas.setAttribute("height", canvasHeight);

	let algorithm = null;
	
	const algorithmSelect = document.getElementById("algorithm-select");
	algorithmSelect.options = [
		{ id: "recursivebt", name: "Recursive Backtracker" },
		{ id: "kruskal", name: "Kruskal's algorithm" },
		{ id: "prim_last_node", name: "Prim's algorithm (last node)" },
		{ id: "prim_random", name: "Prim's algorithm (random)" },
	];

	const algorithmFactory = () => {
		switch (algorithmSelect.value) {
		case "recursivebt": 
			algorithm = (grid) => recursiveBackTracker(
				grid.randomCell(), // start cell
				n => grid.getAdjacent(n), 
				linkCells );
			break;
		case "kruskal":
			algorithm = (grid) => kruskal(
				grid.eachNode(),
				n => grid.getAdjacent(n), 
				linkCells);
			break;
		case "prim_last_node": 
			algorithm = (grid) => prim(
				grid.randomCell(), // start cell
				n => grid.getAdjacent(n), 
				linkCells, {
					tiebreaker: PRIM_LAST_ADDED_RANDOM_EDGES
				});
			break;
		case "prim_random": 
			algorithm = (grid) => prim(
				grid.randomCell(), // start cell
				n => grid.getAdjacent(n), 
				linkCells, {
					tiebreaker: PRIM_RANDOM
				});
			break;
		}

		return algorithm;
	};

	const refresh = (algorithm) => {
		const cellFactory = (x, y) => new Cell(x, y);
		const grid = new BaseGrid(
			Math.floor((canvasWidth - margin * 2) / CELL_SIZE), 
			Math.floor((canvasHeight - margin * 2) / CELL_SIZE),
			cellFactory
		);
		algorithm(grid);
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (const node of grid.eachNode()) {
			node.render(ctx);
		}
	};

	algorithmSelect.callback = () => {
		algorithm = algorithmFactory();
		refresh(algorithm);
	};

	algorithm = algorithmFactory();
	refresh(algorithm);
};
