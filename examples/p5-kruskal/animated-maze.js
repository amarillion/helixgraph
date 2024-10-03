import { KruskalIter } from "../../lib/kruskal.js";

const cos = Math.cos;
const sin = Math.sin;
const PI = Math.PI;

class Cell {
	constructor() {
		this.links = {}; // key: border name, value: adjacent cell.
		this.visited = false; // hide cells that have not been visited by the maze generator
		this.borders = {}; // key: border name, value: function to draw border
		this.fill = (/* p, color */) => { }; // function to fill area of cell.
	}

	/** Set two cells as being adjacent, and set border they share */
	link(border, dest, reverseBorder) {
		if (dest) {
			this.links[border] = dest;
			dest.links[reverseBorder] = this;
		}
	}

	/** During maze generation, erase borders for adjacent pairs of cells */
	removeBorder(border, dest) {
		this.visited = dest.visited = true;
		delete this.borders[border];
		const reverseBorder = Object.keys(dest.links).find(b => dest.links[b] === this);
		delete dest.borders[reverseBorder];
	}

	render(p, hue) {
		this.fill(p, hue);

		p.strokeWeight(1);
		p.stroke(0);
		p.noFill();
		for (const drawBorder of Object.values(this.borders)) {
			drawBorder(p);
		}
	}
}

class Grid {
	constructor() {
		this.rows = [];
	}

	render(p, state) {
		for (const cell of this.nodes()) {
			if (cell.visited) {
				const hue = (state.setByNode.get(cell) * 23) % 360;
				cell.render(p, hue);
			}
		}
	}

	*nodes() {
		for (const row of this.rows) {
			for (const cell of row) {
				yield cell;
			}
		}
	}
}

export function createRobinMaze() {
	const GRID_SIZE = 22;
	const ROWLEN_FOR_RADIUS = initRowLenForRadius(); // number of cells in row of a quadrant
	const script = scriptGenerator();
	let CELL_SIZE = 1;
	
	function initRowLenForRadius() {
		let result = [];
		let quartRowLen = 1;
		for (let y = 0; y < GRID_SIZE + 1; ++y) {
			// double the number of cells in a row whenever the arc length hits some treshold
			if ((0.5 * PI * (y + 1) / quartRowLen) > 1.7) { quartRowLen *= 2; }
			result.push(quartRowLen);
		}
		return result;
	}
	
	function createRadialCell(x, y, isSplit) {
		const cell = new Cell();
		const r1  = (v) => v * y * CELL_SIZE;
		const r15 = (v) => v* (y + 0.5) * CELL_SIZE;
		const r2  = (v) => v * (y + 1) * CELL_SIZE;
		const quartRowLen = ROWLEN_FOR_RADIUS[y];
		const angularWidth = (0.5 * PI / quartRowLen);
		const theta1 = (x * angularWidth);
		const theta15 = ((x + 0.5) * angularWidth);
		const theta2 = ((x + 1) * angularWidth);
		cell.borders = {
			"IN": (p) => p.arc(0, 0, r1(2), r1(2), theta1, theta2),
			"CW": (p) => p.line(r1(cos(theta2)), r1(sin(theta2)), r2(cos(theta2)), r2(sin(theta2))),
			"CCW": (p) => p.line(r1(cos(theta1)), r1(sin(theta1)), r2(cos(theta1)), r2(sin(theta1))),
		};
		// some radial cells have two neighbors on the outside, and their outer border is split in two.
		if (isSplit) {
			cell.borders.OUT1 = (p) => p.arc(0, 0, r2(2), r2(2), theta1, theta15);
			cell.borders.OUT2 = (p) => p.arc(0, 0, r2(2), r2(2), theta15, theta2);
		}
		else {
			cell.borders.OUT = (p) => p.arc(0, 0, r2(2), r2(2), theta1, theta2);
		}
		cell.fill = (p, hue) => {
			p.noFill();
			p.colorMode(p.HSL, 360);
			p.stroke(hue, 200, 200);
			p.strokeWeight(CELL_SIZE);
			p.strokeCap(p.SQUARE);
			p.arc(0, 0, r15(2), r15(2), theta1, theta2);
		};
		return cell;
	}

	function polarGrid(size) {
		const grid = new Grid();
		for (let yy = 0; yy < size; ++yy) {
			let row = [];
			let quartRowLen = ROWLEN_FOR_RADIUS[yy];
			const outerRowIsLonger = ROWLEN_FOR_RADIUS[yy + 1] > quartRowLen;
			const innerRowIsShorter = yy > 0 && ROWLEN_FOR_RADIUS[yy - 1] < quartRowLen;
			for (let xx = 0; xx < quartRowLen * 4; ++xx) {
				const cell = createRadialCell(xx, yy, outerRowIsLonger);
				row.push(cell);
				// link counter-clock-wise neighbor
				if (xx > 0) { cell.link("CCW", row[xx - 1], "CW"); }
				if (yy > 0) {
					// does the inner neighbor have two outer neighbors?
					const { parentIndex, border } = innerRowIsShorter ?
						// if so, check which one we are.
						{ border: (xx % 2 === 0) ? "OUT1" : "OUT2", parentIndex: Math.floor(xx / 2) } :
						{ border: "OUT", parentIndex: xx };
					// link inner neighbor
					cell.link("IN", grid.rows[yy - 1][parentIndex], border);
				}
			}
			grid.rows.push(row);
		}

		// join up where circle meets itself
		for (let n = 0; n < GRID_SIZE; ++n) {
			const polarRow = grid.rows[n];
			const cell = polarRow[0];
			const otherCell = polarRow[polarRow.length - 1];
			cell.link("CCW", otherCell, "CW");
		}
	
		return grid;
	}

	function setup(p) {
		p.stroke(0);
		// p.frameRate(10);
		updateCellSize(p.width, p.height);
	}

	function updateCellSize(width, height) {
		const minSize = Math.min(width, height) * 0.9; // minus 10% margin
		CELL_SIZE = Math.max(3, Math.floor(minSize / 50)); // size of a single square
	}

	function onResize(width, height) {
		updateCellSize(width, height);
	}

	let polar;
	let kruskal;
	
	function draw(p) {
		script.next();
		p.background(192);
		p.translate(p.width * 0.5, p.height * 0.5);

		polar.render(p, kruskal);
	}

	function *scriptGenerator() {
		while (true) {
			clearGrid();
			yield *kruskal;

			// do nothing for 100 frames before starting over
			for (let i = 0; i < 100; ++i) { yield; }
			clearGrid();
		}
	}

	function clearGrid() {
		polar = polarGrid(GRID_SIZE);

		const allNodes = [ ...polar.nodes() ];
		kruskal = new KruskalIter(
			allNodes,
			cell => Object.entries(cell.links),
			(src, border, dest) => src.removeBorder(border, dest),
		);
	}

	return { setup, onResize, draw };
}
