// rule for eslint:
/* global d3 */

import { astar, breadthFirstSearch, dijkstra, trackbackNodes } from "../../lib/pathFinding.js";
import { assert } from "../../lib/assert.js";
import { BaseGrid } from "../../lib/BaseGrid.js";
import { Collapsible, Select, Tooltip, Checkbox } from "../util/components.js";

const BLOCKED_COLOR = "grey";
const BASE_COLOR = "white";

// inspired by http://qiao.github.io/PathFinding.js/visual/

const RECTANGULAR_4WAY = {
	N: { key : "N", dx:  0, dy:  1, w: 1 },
	E: { key : "E", dx:  1, dy:  0, w: 1 },
	S: { key : "S", dx:  0, dy: -1, w: 1 },
	W: { key : "W", dx: -1, dy:  0, w: 1 },
};
const RECTANGULAR_8WAY = {
	...RECTANGULAR_4WAY,
	NE: { key : "NE", dx:  1, dy:  1, w: 1.414 },
	NW: { key : "NW", dx: -1, dy:  1, w: 1.414 },
	SE: { key : "SE", dx:  1, dy: -1, w: 1.414 },
	SW: { key : "SW", dx: -1, dy: -1, w: 1.414 },
};
const HEX_DIRS = {
	0: { w: 1, dx: -1, dy: 0 },
	1: { w: 1, dx: -1, dy: -1 },
	2: { w: 1, dx: 0, dy: -1 },
	3: { w: 1, dx: 1, dy: 0 },
	4: { w: 1, dx: 1, dy: 1 },
	5: { w: 1, dx: 0, dy: 1 },
};

let octagonalToggle = false;

class RectangularCell {
	constructor(x, y, grid) {
		this.grid = grid;
		this.x = x;
		this.y = y;
		this.blocked = false;
		this.points = "0,0 0,30 30,30, 30,0";
	}

	neighborFunc() {
		const DIRS_AVAILABLE = octagonalToggle ? RECTANGULAR_8WAY : RECTANGULAR_4WAY;
		const result = [];
		for (const key in DIRS_AVAILABLE) {
			const { dx, dy } = DIRS_AVAILABLE[key];
			const nx = this.x + dx;
			const ny = this.y + dy;
			if (!this.grid.inRange(nx, ny)) continue;
			const cell = this.grid.get(nx, ny);
			if (!cell.blocked)
				result.push ([ key, cell ]);
		}
		return result;
	}

	get px() { return this.x * 30; }
	get py() { return this.y * 30; }
	get cx() { return this.px + 15; }
	get cy() { return this.py + 15; }
}

class HexagonalCell {
	constructor(x, y, grid) {
		this.grid = grid;
		this.x = x;
		this.y = y;
		this.blocked = false;
		this.points = "0,10, 0,30 15,40, 30,30, 30,10, 15,0";
	}

	neighborFunc() {
		const result = [];
		for (const key in HEX_DIRS) {
			let { dx, dy } = HEX_DIRS[key];
			if (this.y % 2 === 0) {
				if (dy === 1) dx--;
			}
			else {
				if (dy === -1) dx++;
			}
			const nx = this.x + dx;
			const ny = this.y + dy;
			
			if (!this.grid.inRange(nx, ny)) continue;
			const cell = this.grid.get(nx, ny);
			if (!cell.blocked)
				result.push ([ key, cell ]);
		}
		return result;
	}

	get px() { return this.x * 30 + ((this.y % 2) * 15); }
	get py() { return this.y * 30; }
	get cx() { return this.px + 15; }
	get cy() { return this.py + 20; }
}

class Main {
	constructor() {
		this.maxIterations = 1;
		this.start = null;
		this.goal = null;
		this.validPath = false;
		this.mouseMode = null;
		
		this.distanceSelect = document.getElementById("distance-select");
		this.distanceSelect.options = [
			{id: "manhattan", name:"Manhattan"},
			{id: "euclidian", name:"Euclidian"},
			{id: "octagonal", name:"8-Way"},
			{id: "hexagonal", name:"Catan"},
		];

		this.tiebreakerSelect = document.getElementById("tiebreaker-select");
		this.tiebreakerSelect.options = [
			{id:"crossprod", name:"Cross Product"},
			{id:"straight", name:"Near bounding box"},
			{id:"none", name:"None"},
		];

		this.gridSelect = document.getElementById("grid-select");
		this.gridSelect.options = [
			{ id:"rectangular", name:"Rectangular 4-way"},
			{ id:"octagonal", name: "Rectangular 8-way"},
			{ id:"hexagonal", name: "Hexagonal"}
		];

		this.colorSelect = document.getElementById("color-select");
		this.colorSelect.options = [
			{ id:"cost", name:"Animate path" },
			{ id:"heuristic", name: "Heuristic" },
			{ id:"distance", name: "Distance" },
			{ id:"tiebreaker", name: "Tie-breaker" }
		];

		this.algorithmSelect = document.getElementById("algorithm-select");
		this.algorithmSelect.options = [
			{id:"astar", name: "A*"}, {id:"bfs", name: "Breadth First Search"}, {id:"dijkstra", name: "Dijkstra"}
		];

		this.greedyCheck = document.getElementById("greedy-checkbox");
		
		this.distanceSelect.callback = () => {
			this.heuristic = this.heuristicFactory();
		};
		
		this.tiebreakerSelect.callback = () => {
			this.heuristic = this.heuristicFactory();
		};

		this.gridSelect.callback = (newVal, oldVal) => {
			octagonalToggle = newVal === "octagonal";
			if (newVal === "hexagonal" || oldVal === "hexagonal") {
				this.initGrid();
			}
			this.heuristic = this.heuristicFactory();
		};
		
		this.greedyCheck.callback = (newVal) => {
			this.greedy = newVal;
			this.heuristic = this.heuristicFactory();
		};

		this.algorithmSelect.callback = (newVal) => {
			const valueToFunc = {
				"astar": astar,
				"bfs": breadthFirstSearch,
				"dijkstra": dijkstra
			};
			this.algorithm = valueToFunc[newVal];
			assert(this.algorithm);
			this.heuristic = this.heuristicFactory();
			this.resetPath();
		};

		this.colorSelect.callback = () => {
			this.resetPath();
		};

		this.algorithm = astar;
		this.heuristic = () => 0;
	}

	distanceFunc() {
		const distanceFunctions = {
			manhattan: (x1, y1, x2, y2) => Math.abs(x2-x1) + Math.abs(y2-y1),
			euclidian: (x1, y1, x2, y2) => Math.sqrt((x2-x1) * (x2-x1) + (y2-y1) * (y2-y1)),
			octagonal: (x1, y1, x2, y2) => {
				const adx1 = Math.abs(x2 - x1);
				const ady1 = Math.abs(y2 - y1);
				const min = Math.min(adx1, ady1);
				const max = Math.max(adx1, ady1);
				return (min * (Math.sqrt(2) - 1)) + max;
			},
			hexagonal: (x1, y1, x2, y2) => {
				/*
				 * Transfrom x to rx, so that
				 *   x-axis forms a diagonal line, instead of a zig-zag.
				 *
				 *         x        ->        rx
				 *
				 *     0 1 2 3 4          0 1 2 3 4
				 *      0 1 2 3 4          1 2 3 4 5
				 *     0 1 2 3 4    ->    1 2 3 4 5
				 *      0 1 2 3 4          2 3 4 5 6
				 *     0 1 2 3 4          2 3 4 5 6
				 */
				const rx1 = x1 + Math.ceil(y1 / 2);
				const rx2 = x2 + Math.ceil(y2 / 2);
				const rdx = rx2 - rx1;
				const abs_rdx = Math.abs(rdx);
				const dy = y2 - y1;
				const abs_dy = Math.abs(dy);
				/**
				 * dx < -dy \       /   dx < 0
				 *           \     /
				 *      F     \ E /   D        dy > 0
				 *             \ /
				 * -------------X-----------------
				 *             / \
				 *       C    / B \   A        dy < 0
				 *           /     \
				 *  dx > 0  /       \  dx > -dy
				 */
				
				if (rdx * dy < 0) { // one positive, other negative
					// areas C + D
					return abs_rdx + abs_dy;
				}
				else if (abs_rdx > abs_dy) { // areas F + A
					return abs_rdx;
				}
				else { // areas E + B
					return abs_dy;
				}
			}
		};
		const dest = this.goal;
		const func = distanceFunctions[this.distanceSelect.value];
		return current => {
			return func(current.x, current.y, dest.x, dest.y);
		};
	}

	tiebreakerFunc() {
		const tiebreakerFunctions = {
			none: () => 0,
			crossprod: (dx1, dy1, dx2, dy2) => Math.abs(dx1*dy2 - dx2*dy1),
			straight: (dx1, dy1, dx2, dy2) => {
				const fx = dx2 === 0 ? 0.5 : dx1 / dx2 + 0.01; // 0.01 is to break tie between horizontal / vertical
				const fy = dy2 === 0 ? 0.5 : dy1 / dy2;
				// Map x 0..1 into curve -(x(x-1))
				return Math.abs ((fx * (fx - 1)) * (fy * (fy - 1)));
			}
		};
		const source = this.start;
		const dest = this.goal;
		const func = tiebreakerFunctions[this.tiebreakerSelect.value];
		return current => {
			const dx1 = current.x - dest.x;
			const dy1 = current.y - dest.y;
			const dx2 = source.x - dest.x;
			const dy2 = source.y - dest.y;
			return func(dx1, dy1, dx2, dy2);
		};
	}

	heuristicFactory() {
		const distance = this.distanceFunc();
		const tiebreaker = this.tiebreakerFunc();

		if (!(tiebreaker && distance)) return () => 0;

		const greedyFactor = (this.greedy === true ? 1.5 : 1);
		return current => {
			return greedyFactor * (
				distance(current) +
				0.001 * tiebreaker(current)
			);
		};
	}

	set heuristic(value) {
		this._heuristic = value;
		this.resetPath();
	}

	get heuristic() {
		return this._heuristic;
	}

	selectedMeasure() {
		const MEASURES = {
			"heuristic":  d => this.heuristic(d),
			"distance":   this.distanceFunc(),
			"tiebreaker": this.tiebreakerFunc(),
		};
		return MEASURES[this.colorSelect.value];
	}

	visualizeMeasure() {
		const COLOR_SCALES = {
			"heuristic":  [ "#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3" ] /* set-3 */,
			"distance":   [ "#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99" ] /* paired */,
			"tiebreaker": [ "#d01c8b","#f1b6da","#f7f7f7","#b8e186","#4dac26" ] /* pink-green */,
		};

		const measure = this.selectedMeasure();
		if (!measure) return; // 'cost', or an invalid colorOption

		const [ w, h ] = [ this.grid.width, this.grid.height ];
		const range = [
			measure(this.grid.get(0,0)),
			measure(this.grid.get(w-1,0)),
			measure(this.grid.get(0,h-1)),
			measure(this.grid.get(w-1,h-1)),
			measure(this.grid.get(Math.floor(w/2),Math.floor(h/2)))
		];
		const min = Math.min(...range);
		const max = Math.max(...range);
		const delta = max - min;

		const colorScale = d3.scaleLinear()
			.domain([ min, min + delta * 0.25, min + delta * 0.5, min + delta * 0.75, max ])
			.range(COLOR_SCALES[this.colorSelect.value]);

		this.cellSelection.join(
			() => {},
			update => update
				.attr("fill", d => d.blocked ? BLOCKED_COLOR : colorScale(measure(d)))
		);
	}

	findPath(source, dest, maxIterations) {
		const weightFunc = octagonalToggle
			? (edge) => RECTANGULAR_8WAY[edge].w
			: () => 1;
		const opts = {
			maxIterations,
			getWeight: weightFunc,
			getHeuristic: this.heuristic
		};
		return this.algorithm(source, dest, node => node.neighborFunc(), opts);
	}

	drawPath(data, source, dest) {
		const maxDist = this.heuristic(this.start);
		const colorScale = d3.scaleLinear()
			.domain([ 0, maxDist * 0.6, maxDist * 1.2 ])
			.range([ "blue", "beige", "red" ]);

		for (const { to, cost } of data.values()) {
			const rect = d3.select(to.elt);
			rect.attr("fill", colorScale(cost));
		}
		
		const pathData = trackbackNodes(source, dest, data);
		this.validPath = pathData !== null;

		if (this.validPath) {
			//This is the accessor function we talked about above
			var lineFunction = d3.line()
				.x(d => d.cx)
				.y(d => d.cy);

			// clear old path
			d3.selectAll("#route").remove();

			// draw new path
			d3.select("svg").append("path")
				.attr("id", "route")
				.attr("d", lineFunction(pathData))
				.attr("stroke", "blue")
				.attr("stroke-width", 2)
				.attr("fill", "none");
		}
	}

	initViz() {
		this.tooltip = document.querySelector("hxg-tooltip");
		const svg = d3.create("svg")
			.attr("width", "100%")
			.attr("height", "100%")
			// events tutorial:
			// https://www.stator-afm.com/tutorial/d3-js-mouse-events/
			.on("mouseup", () => {
				this.onEnd();
			})
			.on("mousedown", (event) => {
				this.onStart(event);
			})
			.on("mousemove", (event) => {
				if (event.buttons === 1) {
					this.onDrag(event);
				}
				this.onMove(event);
			})
			.on("mouseleave", () => {
				this.tooltip.style = "display: none;";
			})
			// important differences between touch and mouse:
			// 1. touch event targets always equals the place where the touch _started_
			//    that's why we need to recalculate the current target from the position
			// 2. there can be multiple touches / targets per event
			// 3. there is no 'buttons' property on the event
			.on("touchmove", (event) => {
				this.onDrag(event.touches[0]);
			})
			.on("touchstart", (event) => {
				const p = event.touches[0];
				this.onStart(p);
			})
			.on("touchend", () => {
				this.onEnd();
			});

		document.body.appendChild(svg.node());
	}

	mapFillColor(d) {
		if (d.blocked) return BLOCKED_COLOR;
		return BASE_COLOR;
	}
	
	onStart(p) {
		const currentTarget = document.elementFromPoint(p.clientX, p.clientY);
		const d = currentTarget.data;
		this.mouseMode = !d.blocked;
		d.blocked = !d.blocked;
	}
	onDrag(p) {
		const target = document.elementFromPoint(p.clientX, p.clientY);
		const d = target.data;
		d.blocked = !!this.mouseMode;
		d3.select(target)
			.transition().duration(200)
			.attr("fill", this.mapFillColor(d));
	}
	onMove(event) {
		const target = document.elementFromPoint(event.clientX, event.clientY);
		if (target) {
			const d = target.data;
			if (d) {
				const h = this.heuristic(d);
				const distance = this.distanceFunc()(d);
				const tiebreaker = this.tiebreakerFunc()(d) * 0.001;
				let text = `x = ${d.x}, y = ${d.y}<br>
					${distance.toFixed(2)} (distance)<br>
					${tiebreaker.toPrecision(2)} (tie-breaker)<br>
					h = ${h.toFixed(2)} (heuristic)`;
				if (this.data.has(d)) {
					const cost = this.data.get(d).cost;
					text += `<br>g = ${cost.toFixed(2)} (cost)<br>f = ${(h + cost).toFixed(2)} (total)`;
				}
				this.tooltip.innerHTML = text;
				this.tooltip.style =
					`--xco: ${event.clientX + 16}px;
					--yco: ${event.clientY + 16}px`;
			}
		}
	}
	onEnd() {
		this.mouseMode = null;
		this.resetPath();
	}

	updateViz() {
		if (!this.grid) return;

		this.cellSelection = d3.select("svg")
			.selectAll("polygon")
			.data(this.grid.eachNode());

		this.cellSelection.join(
			enter => enter
				.append("polygon")
				// .append("rect")
				.each(
					// store reference to SVG element.
					// if we use old fashioned function notation, 'this' is bound to svg element.
					function(d) { d.elt = this; this.data = d; }
				)
				.attr("points", d => d.points)
				.attr("transform", d => {
					return `translate(${d.px}, ${d.py})`;
				})
				.attr("fill", this.mapFillColor),
			update => update
				.attr("fill", this.mapFillColor)
		);

		d3.select("svg")
			.selectAll("circle")
			.data([ this.start, this.goal ])
			.join("circle")
			.attr("r", 15)
			.attr("cx", d => d.cx)
			.attr("cy", d => d.cy)
			.attr("fill", (d, /* i */) => {
				if (d === this.start) return "lightgreen";
				else return "crimson";
			});

		this.visualizeMeasure();
	}

	initGrid() {
		const w = document.body.clientWidth;
		const h = document.body.clientHeight;

		const isHexagonal = this.gridSelect.value === "hexagonal";
		this.grid = new BaseGrid(
			Math.ceil(w / 30), Math.ceil(h / 30),
			(x, y, grid) =>
				isHexagonal
					? new HexagonalCell(x, y, grid)
					: new RectangularCell(x, y, grid)
		);

		this.start = this.grid.get(5, this.grid.height - 5);
		this.goal = this.grid.get(this.grid.width - 5, 5);

		d3.select("svg").selectAll("polygon").remove();
		d3.select("svg").selectAll("circle").remove();

		this.heuristic = this.heuristicFactory();
		this.resetPath();
	}

	init() {
		this.initViz();
		this.initGrid();

		setInterval(
			() => this.update(), 20);
		
		window.onresize = () => {
			this.initGrid();
		};
	}

	resetPath() {
		this.maxIterations = 0;
		this.validPath = false;
		
		// clear drawn cost function...
		this.updateViz();
		
		// remove any drawn path...
		d3.selectAll("#route").remove();
	}

	update() {
		if (this.colorSelect.value !== "cost") return;

		if (!this.validPath) {
			this.maxIterations++;
			this.data = this.findPath(this.start, this.goal, this.maxIterations);
			this.drawPath(this.data, this.start, this.goal);
		}
	}
}

customElements.define("hxg-collapsible", Collapsible);
customElements.define("hxg-select", Select);
customElements.define("hxg-checkbox", Checkbox);
customElements.define("hxg-tooltip", Tooltip);

window.onload = () => {
	/** disable RMB context menu globally */
	document.body.addEventListener("contextmenu", e => e.preventDefault());
	const main = new Main();
	main.init();
	window.main = main;
};
