import { RecursiveBackTrackerIter } from "../../lib/maze/recursiveBacktracker.js";
import { pickOne } from "../../lib/random.js";
import { PrimIter, PRIM_LAST_ADDED_RANDOM_EDGES, PRIM_RANDOM } from "../../lib/maze/prim.js";
import { KruskalIter } from "../../lib/maze/kruskal.js";
import { AldousBroderIter } from "../../lib/maze/aldousBroder.js";
import { Checkbox, Collapsible, Select } from "../util/components.js";
import { assert } from "../../lib/assert.js";
import { EAST, NORTH } from "../../lib/BaseGrid.js";
import { createSquareGrid } from "./square.js";
import { createPolarGrid } from "./polar.js";

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
customElements.define("hxg-checkbox", Checkbox);
customElements.define("hxg-select", Select);

const linkCells = (src, dir, dest) => { src.link(dest, dir); };

class Main {
	refreshCanvas() {
		const canvasWidth = (document.body.clientWidth);
		const canvasHeight = (document.body.clientHeight);
	
		this.canvas.setAttribute("width", canvasWidth);
		this.canvas.setAttribute("height", canvasHeight);

		this.refreshMaze();
	}

	render() {
		const ctx = this.canvas.getContext("2d");
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for (const node of this.grid.eachNode()) {
			node.render(ctx);
		}
	}

	refreshMaze() {
		this.refreshGrid();

		if (this.animated) {
			this.iter = this.animation();
		}
		else {
			this.iter = null;

			// run the algorithm to completion immediately
			for (const _ of this.algorithm(this.grid)) { /* pass */}
			this.render();
		}
	}

	refreshGrid() {
		const canvasWidth = (document.body.clientWidth);
		const canvasHeight = (document.body.clientHeight);

		switch(this.gridSelect.value) {
			case 'polar':
				this.grid = createPolarGrid(canvasWidth, canvasHeight);
				break;
			default:
				this.grid = createSquareGrid(canvasWidth, canvasHeight);
				break;
		}
	}

	refreshAlgorithm() {
		switch (this.algorithmSelect.value) {
			case "recursivebt":
				this.algorithm = (grid) => new RecursiveBackTrackerIter(
					grid.randomCell(), // start cell
					n => grid.getAdjacent(n),
					linkCells);
				break;
			case "kruskal":
				this.algorithm = (grid) => new KruskalIter(
					grid.eachNode(),
					n => grid.getAdjacent(n),
					linkCells);
				break;
			case "prim_last_node":
				this.algorithm = (grid) => new PrimIter(
					grid.randomCell(), // start cell
					n => grid.getAdjacent(n),
					linkCells, {
						tiebreaker: PRIM_LAST_ADDED_RANDOM_EDGES
					});
				break;
			case "prim_random":
				this.algorithm = (grid) => new PrimIter(
					grid.randomCell(), // start cell
					n => grid.getAdjacent(n),
					linkCells, {
						tiebreaker: PRIM_RANDOM
					});
				break;
			// case "binary_tree":
			// 	this.algorithm = (grid) => binaryTree(grid, linkCells);
			// 	break;
			case "aldous_broder":
				this.algorithm = (grid) => new AldousBroderIter(grid.eachNode(), n => grid.getAdjacent(n), linkCells);
				break;
			default:
				assert(`Coding error - algorithm ${this.algorithmSelect.value} is unknown`);
		}

		this.refreshMaze();
	}

	constructor() {
		this.canvas = document.getElementById("myCanvas");
	
		this.algorithmSelect = document.getElementById("algorithm-select");
		this.gridSelect = document.getElementById("grid-select");
		this.animationCheckbox = document.getElementById("animation-checkbox");

		this.algorithmSelect.options = [
			{ id: "recursivebt", name: "Recursive Backtracker" },
			{ id: "kruskal", name: "Kruskal's algorithm" },
			{ id: "prim_last_node", name: "Prim's algorithm (last node)" },
			{ id: "prim_random", name: "Prim's algorithm (random)" },
			// { id: "binary_tree", name: "Binary tree" },
			{ id: "aldous_broder", name: "Aldous-Broder algorithm" },
		];
	
		this.algorithmSelect.callback = () => {
			this.refreshAlgorithm();
		};
	
		this.gridSelect.options = [
			{ id: "square", name: "Square" },
			{ id: "polar", name: "Polar" },
			/*
			{ id: "hexagonal", name: "Hexagonal" },
			{ id: "diamonds", name: "Diamonds" },
			{ id: "cairo", name: "Cairo" },
			{ id: "triangular", name: "Triangular" },
			{ id: "voronoi", name: "Voronoi" },
			 */
		];
		
		this.gridSelect.callback = () => {
			this.refreshMaze();
		};

		this.animationCheckbox.callback = (newVal) => {
			this.animated = newVal;
			this.refreshMaze();
		};
		
		window.onresize = () => {
			this.refreshCanvas();
		};

		this.refreshCanvas();

		setInterval(() => {
			this.update();
		}, 17);

	}

	*animation() {
		const iter = this.algorithm(this.grid);
		while (true) {
			const { done } = iter.next();
			if (done) break;
			yield;
		}
	}

	update() {
		if (this.iter) {
			this.iter.next();
			this.render();
		}
	}
}

window.onload = () => {
	new Main();
};
