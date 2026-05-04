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
import { createTriangularGrid } from "./triangular.js";
import { breadthFirstSearch } from "../../lib/pathfinding/bfs.js";

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

class Main {
	// let maxCost = 0;
	// let firstNode = null;

	linkCells = (src, dir, dest) => {
		src.link(dest, dir);

		// TODO: use set to not touch internal state of cells
		src.visited = true;
		dest.visited = true;

		if (!this.firstNode) {
			this.firstNode = src;
		}

		// on-the-fly calculation of distances for coloring, doesn't work with kruskal.
		if (this.algorithmSelect.value !== "kruskal") {
			// TOOD: use map to not touch internal state of cells
			if (src.cost) {
				dest.cost = src.cost + 1;
				this.maxCost = Math.max(this.maxCost, dest.cost);
			}
			else {
				if (dest.cost) {
					src.cost = dest.cost + 1;
					this.maxCost = Math.max(this.maxCost, src.cost);
				}
				else {
					src.cost = 1;
					this.maxCost = Math.max(this.maxCost, src.cost);
				}
			}
		}
	};

	refreshCanvas() {
		const canvasWidth = (document.body.clientWidth);
		const canvasHeight = (document.body.clientHeight);
	
		this.canvas.setAttribute("width", canvasWidth);
		this.canvas.setAttribute("height", canvasHeight);

		this.refreshMaze();
	}

	calculateDistances() {
		const map = breadthFirstSearch(
			this.firstNode,
			null,
			n => this.grid.getAdjacent(n).filter(([ dir, _neighbor ]) => n.linked(dir)),
		);
		this.maxCost = 0;
		for (const [ node, step ] of map.entries()) {
			node.cost = step.cost;
			this.maxCost = Math.max(this.maxCost, step.cost);
		}
	}

	render() {
		const ctx = this.canvas.getContext("2d");
		ctx.fillStyle = 'white';
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		if (this.colorReady) {
			for (const node of this.grid.eachNode()) {
				if (!node.visited) continue;
				node.fill(ctx, `rgb(${[
					(node.cost / this.maxCost) * 255, // red
					100, // green
					50, // blue
				].join(',')})`);
			}
		}

		for (const node of this.grid.eachNode()) {
			if (!node.visited) continue;
			node.render(ctx);
		}
	}

	refreshMaze() {
		this.refreshGrid();

		if (this.animated) {
			this.iter = this.animation();
		}
		else {
			// run the algorithm to completion immediately
			for (const _ of this.algorithm(this.grid)) { /* pass */}

			this.onMazeCompleted();
		}
	}

	refreshGrid() {
		const canvasWidth = (document.body.clientWidth);
		const canvasHeight = (document.body.clientHeight);

		this.maxCost = 0;

		switch(this.gridSelect.value) {
			case 'polar':
				this.grid = createPolarGrid(canvasWidth, canvasHeight);
				break;
			case 'triangular':
				this.grid = createTriangularGrid(canvasWidth, canvasHeight);
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
					this.linkCells);
				break;
			case "kruskal":
				this.algorithm = (grid) => new KruskalIter(
					grid.eachNode(),
					n => grid.getAdjacent(n),
					this.linkCells);
				break;
			case "prim_last_node":
				this.algorithm = (grid) => new PrimIter(
					grid.randomCell(), // start cell
					n => grid.getAdjacent(n),
					this.linkCells, {
						tiebreaker: PRIM_LAST_ADDED_RANDOM_EDGES
					});
				break;
			case "prim_random":
				this.algorithm = (grid) => new PrimIter(
					grid.randomCell(), // start cell
					n => grid.getAdjacent(n),
					this.linkCells, {
						tiebreaker: PRIM_RANDOM
					});
				break;
			// case "binary_tree":
			// 	this.algorithm = (grid) => binaryTree(grid, linkCells);
			// 	break;
			case "aldous_broder":
				this.algorithm = (grid) => new AldousBroderIter(
					grid.eachNode(),
					n => grid.getAdjacent(n),
					this.linkCells);
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
		this.colorCheckbox = document.getElementById("color-checkbox");

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
			{ id: "triangular", name: "Triangular" },
			/*
			{ id: "hexagonal", name: "Hexagonal" },
			{ id: "diamonds", name: "Diamonds" },
			{ id: "cairo", name: "Cairo" },
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
		
		this.colorCheckbox.callback = (newVal) => {
			this.wantsColoring = newVal;
			this.colorReady = this.wantsColoring && this.algorithmSelect.value !== "kruskal";
			this.render();
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
		this.onMazeCompleted();
	}

	onMazeCompleted() {
		this.iter = null;
		if (this.algorithmSelect.value === "kruskal") {
			// kruskal doesn't build a spanning tree in a way that grows outwards from the start node,
			// but rather adds random edges between random nodes in the maze, which results in a very patchy coloring.
			this.calculateDistances();
			this.colorReady = true;
			console.log("maze completed, distances calculated, ready to color");
		}
		this.render();
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
