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
	makeAdjacent(border, dest, reverseBorder) {
		if (dest) {
			this.links[border] = dest;
			dest.links[reverseBorder] = this;
		}
	}

	/** During maze generation, erase borders for adjacent pairs of cells */
	link(dest, dir) {
		this.visited = dest.visited = true;
		delete this.borders[dir];
		const reverseDir = Object.keys(dest.links).find(b => dest.links[b] === this);
		delete dest.borders[reverseDir];
	}

	// TODO: extract rendering code to separate class.
	render(ctx) {
		ctx.lineWidth = 1.0;
		ctx.strokeStyle = "black";

		// TODO: fill current hue.

		// ctx.lineCap = "round";
		for (const drawBorder of Object.values(this.borders)) {
			ctx.beginPath();
			drawBorder(ctx);
			ctx.stroke();
		}
	}
	
}

class Grid {
	constructor() {
		this.rows = [];
	}

	//TODO: extract rendering code to separate class.
	render(p, state) {
		for (const cell of this.eachNode()) {
			if (cell.visited) {
				const hue = (state.setByNode.get(cell) * 23) % 360;
				cell.render(p, hue);
			}
		}
	}

	*eachNode() {
		for (const row of this.rows) {
			for (const cell of row) {
				yield cell;
			}
		}
	}

	randomCell() {
		const nodes = [ ...this.eachNode() ];
		return nodes[Math.floor(Math.random() * nodes.length)];
	}

	getAdjacent(cell) {
		return Object.entries(cell.links);
	}
}

export function createPolarGrid(canvasWidth, canvasHeight) {

	const cx = canvasWidth / 2;
	const cy = canvasHeight / 2;
	const margin = 10;

	const GRID_SIZE = 22;
	const ROWLEN_FOR_RADIUS = initRowLenForRadius(); // number of cells in row of a quadrant
	let CELL_SIZE = Math.floor((Math.min(canvasWidth, canvasHeight) - margin) / 2 / GRID_SIZE);
	
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
		const r1 = (v) => v * y * CELL_SIZE;
		const r15 = (v) => v * (y + 0.5) * CELL_SIZE;
		const r2 = (v) => v * (y + 1) * CELL_SIZE;
		const quartRowLen = ROWLEN_FOR_RADIUS[y];
		const angularWidth = (0.5 * PI / quartRowLen);
		const theta1 = (x * angularWidth);
		const theta15 = ((x + 0.5) * angularWidth);
		const theta2 = ((x + 1) * angularWidth);

		cell.borders = {
			IN: (p) => p.arc(cx, cy, r1(2) / 2, theta1, theta2),
			CW: (p) => { p.moveTo(cx + r1(cos(theta2)), cy + r1(sin(theta2))); p.lineTo(cx + r2(cos(theta2)), cy + r2(sin(theta2))); },
			CCW: (p) => { p.moveTo(cx + r1(cos(theta1)), cy + r1(sin(theta1))); p.lineTo(cx + r2(cos(theta1)), cy + r2(sin(theta1))); },
		};
		// some radial cells have two neighbors on the outside, and their outer border is split in two.
		if (isSplit) {
			cell.borders.OUT1 = (p) => p.arc(cx, cy, r2(2) / 2, theta1, theta15);
			cell.borders.OUT2 = (p) => p.arc(cx, cy, r2(2) / 2, theta15, theta2);
		}
		else {
			cell.borders.OUT = (p) => p.arc(cx, cy, r2(2) / 2, theta1, theta2);
		}
		cell.fill = (p, hue) => {
			p.noFill();
			p.colorMode(p.HSL, 360);
			p.stroke(hue, 200, 200);
			p.strokeWeight(CELL_SIZE);
			p.strokeCap(p.SQUARE);
			p.arc(cx, cy, r15(2), theta1, theta2);
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
				if (xx > 0) { cell.makeAdjacent("CCW", row[xx - 1], "CW"); }
				if (yy > 0) {
					// does the inner neighbor have two outer neighbors?
					const { parentIndex, border } = innerRowIsShorter ?
						// if so, check which one we are.
						{ border: (xx % 2 === 0) ? "OUT1" : "OUT2", parentIndex: Math.floor(xx / 2) } :
						{ border: "OUT", parentIndex: xx };
					// link inner neighbor
					cell.makeAdjacent("IN", grid.rows[yy - 1][parentIndex], border);
				}
			}
			grid.rows.push(row);
		}

		// join up where circle meets itself
		for (let n = 0; n < GRID_SIZE; ++n) {
			const polarRow = grid.rows[n];
			const cell = polarRow[0];
			const otherCell = polarRow[polarRow.length - 1];
			cell.makeAdjacent("CCW", otherCell, "CW");
		}
	
		return grid;
	}

	return polarGrid(GRID_SIZE);
}
