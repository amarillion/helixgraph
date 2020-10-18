// rule for eslint:
/* global d3 */

import { astar, breadthFirstSearch, dijkstra, trackbackNodes } from "../../src/pathFinding.js";
import { manhattanCrossProductHeuristic, manhattanStraightHeuristic, octagonalHeuristic } from "../../src/astarHeuristics.js";
import { assert } from "../../src/assert.js";
import BaseGrid from "../../src/BaseGrid.js";

const BLOCKED_COLOR = "grey";
const BASE_COLOR = "white";

// inspired by http://qiao.github.io/PathFinding.js/visual/

class Main {
	
	constructor() {
		this.counter = 0;
		this.maxIterations = 1;
		this.start = null;
		this.goal = null;
		this.validPath = false;
		this.octagonalToggle = true;
		this.mouseMode = null;

		const heuristicSelect = document.getElementById("heuristic-select");
		const gridSelect = document.getElementById("grid-select");
		const algorithmSelect = document.getElementById("algorithm-select");

		heuristicSelect.addEventListener("change", () => {
			this.crossProdToggle = heuristicSelect.value === "crossprod";
			console.log(heuristicSelect.value);
			this.resetPath();
		});
		this.crossProdToggle = heuristicSelect.value === "crossprod";

		gridSelect.addEventListener("change", () => {
			this.octagonalToggle = gridSelect.value === "octagonal";
			this.resetPath();
		});
		this.octogonalToggle = gridSelect.value === "octagonal";

		algorithmSelect.addEventListener("change", () => {
			const valueToFunc = {
				"astar": astar,
				"bfs": breadthFirstSearch,
				"dijkstra": dijkstra
			};
			this.algorithm = valueToFunc[algorithmSelect.value];
			assert(this.algorithm);
			this.resetPath();
		});
		this.algorithm = astar;
	}

	heuristicFactory(source, dest) {
		return (current) => {
			if (this.octagonalToggle) {
				return octagonalHeuristic(source.x, source.y, current.x, current.y, dest.x, dest.y);
			}
			else {
				if (this.crossProdToggle) {
					return manhattanCrossProductHeuristic(source.x, source.y, current.x, current.y, dest.x, dest.y);
				}
				else {
					return manhattanStraightHeuristic(source.x, source.y, current.x, current.y, dest.x, dest.y);
				}
			}
		};
	}

	findPath(source, dest, maxIterations) {
		this.heuristic = this.heuristicFactory(source, dest);
		const dirs = {
			N: { key : "N", dx:  0, dy:  1, w: 1 },
			E: { key : "E", dx:  1, dy:  0, w: 1 },
			S: { key : "S", dx:  0, dy: -1, w: 1 },
			W: { key : "W", dx: -1, dy:  0, w: 1 },
		};
		const dirs2 = {
			...dirs,
			NE: { key : "NE", dx:  1, dy:  1, w: 1.414 },
			NW: { key : "NW", dx: -1, dy:  1, w: 1.414 },
			SE: { key : "SE", dx:  1, dy: -1, w: 1.414 },
			SW: { key : "SW", dx: -1, dy: -1, w: 1.414 },
		};
		const dirsUsed = this.octagonalToggle ? dirs2 : dirs;

		const grid = this.grid;
		function *neighborFunc(tile) {
			const { x, y } = tile;
			for (const key in dirsUsed) {
				const { dx, dy } = dirsUsed[key];
				const nx = x + dx;
				const ny = y + dy;
				if (!grid.inRange(nx, ny)) continue;
				const cell = grid.get(nx, ny);
				if (!cell.blocked)
					yield ([key, cell]);
			}
		}
		const weightFunc = (edge) => dirsUsed[edge].w;
		const opts = { 
			maxIterations,
			getWeight: weightFunc,
			getHeuristic: this.heuristic 
		};
		return this.algorithm(source, dest, neighborFunc, opts);
	}

	drawPath(data, source, dest) {
		
		const maxDist = this.heuristic(this.start);
		const colorScale = d3.scaleLinear()
			.domain([0, maxDist * 0.6, maxDist * 1.2])
			.range(["blue", "beige", "red"]);

		for (const { to, cost } of data.values()) {
			const rect = d3.select(to.elt);	
			rect.attr("fill", colorScale(cost));
		}
		
		const pathData = trackbackNodes(source, dest, data);
		this.validPath = pathData !== null;

		if (this.validPath) {
			//This is the accessor function we talked about above
			var lineFunction = d3.line()
				.x(d => d.cx())
				.y(d => d.cy());

			//The SVG Container
			console.log(d3.selectAll("#route"));
			d3.selectAll("#route").remove();

			// clear old path
			// svgPath.remove();

			//The line SVG Path we draw
			d3.select("svg").append("path")
				.attr("id", "route")
				.attr("d", lineFunction(pathData))
				.attr("stroke", "blue")
				.attr("stroke-width", 2)
				.attr("fill", "none");
		}
	}

	initViz() {
		const svg = d3.create("svg")
			.attr("width", "100%")
			.attr("height", "100%")

			.on("mouseup", () => {
				this.mouseMode = null;
				this.resetPath();
			})
			.on("mousedown", () => {
				// console.log("mousedown", evt.target, evt.buttons);
			})
			.on("mousemove", () => {
				// console.log("mousemove", evt.target, evt.buttons);
			});

		document.body.appendChild(svg.node());
	}

	updateViz() {
		const rects = d3.select("svg")
			.selectAll("rect")
			.data(this.grid.eachNode());

		const mapFillColor = (d) => {
			if (d.blocked) return BLOCKED_COLOR;
			else return BASE_COLOR;
		};

		rects.join(
			enter => enter
				.append("rect")
				.each(
					// store reference to SVG element.
					// if we use old fashioned function notation, this is bound to svg element.
					function(d) { d.elt = this; } 
				)
				.attr("x", d => d.px())
				.attr("y", d => d.py())
				.attr("fill", mapFillColor)
				.attr("width", 30)
				.attr("height", 30)
				// TODO: can use click, mouseDown, mouseEnter, mouseLeave...
				// https://www.stator-afm.com/tutorial/d3-js-mouse-events/
				.on("mousedown", (evt, d) => {
					this.mouseMode = !d.blocked;
				})
				.on("mousemove", (evt, d) => { 
					if (evt.buttons === 1) {
						d.blocked = !!this.mouseMode;
						d3.select(d.elt)
							.transition().duration(200)
							//TODO: try scale?
							.attr("fill", mapFillColor(d));
					}
				}),
				
			update => update 
				.attr("fill", mapFillColor)
		);

		d3.select("svg")
			.selectAll("circle")
			.data([this.start, this.goal])
			.join("circle")
			.attr("r", 15)
			.attr("cx", d => d.cx())
			.attr("cy", d => d.cy())
			.attr("fill", (d, /* i */) => {
				if (d === this.start) return "lightgreen";
				else return "crimson";
			});

	}

	// called everytime state is entered
	init () {
		const w = document.body.clientWidth;
		const h = document.body.clientHeight;

		this.grid = new BaseGrid(
			Math.ceil(w / 30), Math.ceil(h / 30), 
			(x, y) => ({ 
				x, y, blocked: false,
				px: () => x * 30,
				py: () => y * 30,
				cx: () => x * 30 + 15,
				cy: () => y * 30 + 15
			}) 
		);

		const mid = Math.floor(this.grid.height / 2);
		this.start = this.grid.get(5, mid);
		this.goal = this.grid.get(this.grid.width - 5, mid);

		this.initViz();

		this.resetPath();
		
		setInterval(
			() => this.update(), 20);
	}

	resetPath() {
		this.maxIterations = 0;
		this.counter = 0;
		this.validPath = false;
		
		// clear drawn cost function...
		this.updateViz();
		
		// remove any drawn path...
		d3.selectAll("#route").remove();
	}

	update() {
		if (!this.validPath) {
			this.maxIterations++;
			this.data = this.findPath(this.start, this.goal, this.maxIterations);
			this.drawPath(this.data, this.start, this.goal);
		}
	}
}

window.onload = () => {
	/** disable RMB context menu globally */
	document.body.addEventListener("contextmenu", e => e.preventDefault());
	const main = new Main();
	main.init();
	window.main = main;
};
