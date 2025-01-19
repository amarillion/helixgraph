import { recursiveBackTracker } from "../../lib/maze/recursiveBacktracker.js";
import { pickOne } from "../../lib/random.js";
import { BaseGrid, NORTH, SOUTH, EAST, WEST } from "../../lib/BaseGrid.js";
import { prim, PRIM_LAST_ADDED_RANDOM_EDGES, PRIM_RANDOM } from "../../lib/maze/prim.js";
import { kruskal } from "../../lib/maze/kruskal.js";
import { aldousBroder } from "../../lib/maze/aldousBroder.js";
import { Collapsible, Select } from "../util/components.js";
import { assert } from "../../lib/assert.js";

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
	[NORTH]: POINTS.slice(0, 2),
	[EAST]: POINTS.slice(1, 3),
	[SOUTH]: POINTS.slice(2, 4),
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
		for (const dir of [ NORTH, EAST, SOUTH, WEST ]) {
			if (this.linked(dir)) continue;

			const segment = SEGMENTS[dir];
			ctx.beginPath();
			ctx.moveTo(margin + this.px + segment[0].x, margin + this.py + segment[0].y);
			ctx.lineTo(margin + this.px + segment[1].x, margin + this.py + segment[1].y);
			ctx.stroke();
		}
	}
}

// antoher alternative maze generation algorithm
// THIS works only with a rectangular grid...
// TODO: move to library
export function binaryTree(grid, linkCells, prng = Math.random) {
	for (const cell of grid.eachNode()) {
		const neighbors = [ ...grid.getAdjacent(cell) ]
			.filter(([ key ]) => key === NORTH || key === EAST);
		
		if (neighbors.length > 0) {
			const [ dir, to ] = pickOne(neighbors, prng);
			linkCells(cell, dir, to);
		}
	}
}

customElements.define("hxg-collapsible", Collapsible);
customElements.define("hxg-select", Select);

const linkCells = (src, dir, dest) => { src.link(dest, dir, reverse[dir]); };

class Main {
	refreshCanvas() {
		const canvasWidth = (document.body.clientWidth);
		const canvasHeight = (document.body.clientHeight);
	
		this.canvas.setAttribute("width", canvasWidth);
		this.canvas.setAttribute("height", canvasHeight);

		this.refreshMaze();
	}

	refreshMaze() {
		const canvasWidth = (document.body.clientWidth);
		const canvasHeight = (document.body.clientHeight);

		const cellFactory = (x, y) => new Cell(x, y);
		const grid = new BaseGrid(
			Math.floor((canvasWidth - margin * 2) / CELL_SIZE),
			Math.floor((canvasHeight - margin * 2) / CELL_SIZE),
			cellFactory
		);
		this.algorithm(grid);
		const ctx = this.canvas.getContext("2d");
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for (const node of grid.eachNode()) {
			node.render(ctx);
		}
	}

	refreshAlgorithm() {
		switch (this.algorithmSelect.value) {
			case "recursivebt":
				this.algorithm = (grid) => recursiveBackTracker(
					grid.randomCell(), // start cell
					n => grid.getAdjacent(n),
					linkCells);
				break;
			case "kruskal":
				this.algorithm = (grid) => kruskal(
					grid.eachNode(),
					n => grid.getAdjacent(n),
					linkCells);
				break;
			case "prim_last_node":
				this.algorithm = (grid) => prim(
					grid.randomCell(), // start cell
					n => grid.getAdjacent(n),
					linkCells, {
						tiebreaker: PRIM_LAST_ADDED_RANDOM_EDGES
					});
				break;
			case "prim_random":
				this.algorithm = (grid) => prim(
					grid.randomCell(), // start cell
					n => grid.getAdjacent(n),
					linkCells, {
						tiebreaker: PRIM_RANDOM
					});
				break;
			case "binary_tree":
				this.algorithm = (grid) => binaryTree(grid, linkCells);
				break;
			case "aldous_broder":
				this.algorithm = (grid) => aldousBroder(grid.eachNode(), n => grid.getAdjacent(n), linkCells);
				break;
			default:
				assert(`Coding error - algorithm ${this.algorithmSelect.value} is unknown`);
		}

		this.refreshMaze();
	}

	constructor() {
		this.canvas = document.getElementById("myCanvas");
	
		this.algorithmSelect = document.getElementById("algorithm-select");
		this.algorithmSelect.options = [
			{ id: "recursivebt", name: "Recursive Backtracker" },
			{ id: "kruskal", name: "Kruskal's algorithm" },
			{ id: "prim_last_node", name: "Prim's algorithm (last node)" },
			{ id: "prim_random", name: "Prim's algorithm (random)" },
			{ id: "binary_tree", name: "Binary tree" },
			{ id: "aldous_broder", name: "Aldous-Broder algorithm" },
		];
	
		this.algorithmSelect.callback = () => {
			this.refreshAlgorithm();
		};
	
		window.onresize = () => {
			this.refreshCanvas();
		};

		this.refreshCanvas();
	}
}

window.onload = () => {
	new Main();
};
