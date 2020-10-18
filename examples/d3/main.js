// rule for eslint:
/* global d3 */

import { astar, breadthFirstSearch, dijkstra, trackbackNodes } from "../../src/pathFinding.js";
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
		this.octagonalToggle = false;
		this.mouseMode = null;

		this.distanceSelect = document.getElementById("distance-select");
		this.distanceSelect.options = [
			{id: "manhattan", name:"Manhattan"},
			{id: "euclidian", name:"Euclidian"}, 
			{id: "octagonal", name:"Octagonal"}
		];

		this.tiebreakerSelect = document.getElementById("tiebreaker-select");
		this.tiebreakerSelect.options = [
			{id:"crossprod", name:"Cross Product"},
			{id:"straight", name:"Near bounding box"},
			{id:"none", name:"None"}, 
		];

		this.gridSelect = document.getElementById("grid-select");
		this.gridSelect.options = [
			{id:"rectangular", name:"Rectangular 4-way"}, { id:"octagonal", name: "Rectangular 8-way"}
		];

		this.algorithmSelect = document.getElementById("algorithm-select");
		this.algorithmSelect.options = [
			{id:"astar", name: "A*"}, {id:"bfs", name: "Breadth First Search"}, {id:"dijkstra", name: "Dijkstra"}
		];

		this.distanceSelect.callback = () => {
			this.heuristic = this.heuristicFactory(this.start, this.goal);
		};
		
		this.tiebreakerSelect.callback = () => {
			this.heuristic = this.heuristicFactory(this.start, this.goal);
		};

		this.gridSelect.callback = (newVal) => {
			this.octagonalToggle = newVal === "octagonal";
			this.heuristic = this.heuristicFactory(this.start, this.goal);
		};
		
		this.algorithmSelect.callback = (newVal) => {
			const valueToFunc = {
				"astar": astar,
				"bfs": breadthFirstSearch,
				"dijkstra": dijkstra
			};
			this.algorithm = valueToFunc[newVal];
			assert(this.algorithm);
			this.heuristic = this.heuristicFactory(this.start, this.goal);
			this.resetPath();
		};

		this.algorithm = astar;
		this.heuristic = () => 0;
	}

	heuristicFactory(source, dest) {
		
		const distanceFunctions = {
			manhattan: (dx1, dy1) => Math.abs(dx1) + Math.abs(dy1),
			euclidian: (dx1, dy1) => Math.sqrt(dx1 * dx1 + dy1 * dy1),
			octagonal: (dx1, dy1) => {
				const adx1 = Math.abs(dx1);
				const ady1 = Math.abs(dy1);
				const min = Math.min(adx1, ady1);
				const max = Math.max(adx1, ady1);
				return (min * 0.414) + max;
			}
		};
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

		const distance = distanceFunctions[this.distanceSelect.value];
		const tiebreaker = tiebreakerFunctions[this.tiebreakerSelect.value];

		if (!(tiebreaker && distance)) return () => 0;

		return current => {
			const dx1 = current.x - dest.x;
			const dy1 = current.y - dest.y;
			const dx2 = source.x - dest.x;
			const dy2 = source.y - dest.y;
			return distance(dx1, dy1, dx2, dy2) + 0.001 * tiebreaker(dx1, dy1, dx2, dy2);
		};
	}

	set heuristic(value) {
		this._heuristic = value;
		this.resetPath();
	}

	get heuristic() {
		return this._heuristic;
	}

	vizHeuristic() {
		const maxDist = this.heuristic(this.start);
		const colorScale = d3.scaleLinear()
			.domain([0, maxDist, maxDist * 2])
			.range(["orange", "white", "purple"]);

		const rects = d3.select("svg")
			.selectAll("rect")
			.data(this.grid.eachNode());

		rects.join(
			() => {},
			update => update 
				.attr("fill", d => d.blocked ? BLOCKED_COLOR : colorScale(this.heuristic(d)))
		);
	}

	findPath(source, dest, maxIterations) {
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
		if (!this.grid) return;

		const rects = d3.select("svg")
			.selectAll("rect")
			.data(this.grid.eachNode());

		const mapFillColor = (d) => {
			if (d.blocked) return BLOCKED_COLOR;
			return BASE_COLOR;
		};

		rects.join(
			enter => enter
				.append("rect")
				.each(
					// store reference to SVG element.
					// if we use old fashioned function notation, 'this' is bound to svg element.
					function(d) { d.elt = this; } 
				)
				.attr("x", d => d.px())
				.attr("y", d => d.py())
				.attr("fill", mapFillColor)
				.attr("width", 30)
				.attr("height", 30)
				// events tutorial:
				// https://www.stator-afm.com/tutorial/d3-js-mouse-events/
				.on("mousedown", (evt, d) => {
					this.mouseMode = !d.blocked;
					d.blocked = !d.blocked;
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

		// this.vizHeuristic();
	}

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

		// const mid = Math.floor(this.grid.height / 2);
		this.start = this.grid.get(5, this.grid.height - 5);
		this.goal = this.grid.get(this.grid.width - 5, 5);
		
		this.heuristic = this.heuristicFactory(this.start, this.goal);

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

class Select extends HTMLElement {
	
	constructor() {	
		super();
		this.attachShadow({ mode: "open" });
	
		this._options = [];
		this._label = this.getAttribute("label") || "";
		this.binding = null;
		this.render();
		this._callback = () => {};
	}

	set label(val) {
		this._label = val;
		this.render();
	}

	set options(idNamePairs) {
		this._options = idNamePairs;
		this.render();
	}

	set callback(val) {
		this._callback = val;
		// immediately trigger with current value
		this._callback(this.shadowRoot.querySelector("select").value);
	}

	get value() {
		return this.shadowRoot.querySelector("select").value;
	}

	onChange(event) {
		this._callback(event.target.value);
	}

	render() {
		this.shadowRoot.innerHTML = `
		<style>
		:host {
			width: 100%;
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: 0.5rem;
		}
		label {
			text-align: right;
		}
		</style>
		<label>${this._label}</label>
		<select>
			${this._options.map(opt => `<option value="${opt.id}">${opt.name}</option>`).join()}
		</select>`;
		this.shadowRoot.querySelector("select").addEventListener("change", (e) => this.onChange(e));
	}
}

customElements.define("hxg-select", Select);

window.onload = () => {
	/** disable RMB context menu globally */
	document.body.addEventListener("contextmenu", e => e.preventDefault());
	const main = new Main();
	main.init();
	window.main = main;
};
