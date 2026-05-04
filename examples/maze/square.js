import { BaseGrid, NORTH, SOUTH, EAST, WEST } from "../../lib/BaseGrid.js";

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
	 * @param {*} inv optional - supply a reverse direction if you want to make
	 *   the link bidirectional
	 */
	linkHelper(other, dir, inv) {
		if (dir in this.links) {
			console.log("WARNING: creating link that already exists: ", { dir, reverse: inv });
		}
		this.links[dir] = other;
		if (inv) {
			// call recursively, but without reversing again
			other.linkHelper(this, inv);
		}
	}

	link(other, dir) {
		this.linkHelper(other, dir, reverse[dir]);
	}

	linked(dir) {
		return dir in this.links;
	}

	get px() { return this.x * CELL_SIZE; }
	get py() { return this.y * CELL_SIZE; }
	
	// TODO: extract rendering code to separate class.
	render(ctx) {
		this.renderBorders(ctx);
	}

	fill(ctx, color) {
		ctx.fillStyle = color;
		ctx.fillRect(margin + this.px, margin + this.py, CELL_SIZE, CELL_SIZE);
	}

	renderBorders(ctx) {
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


export function createSquareGrid(canvasWidth, canvasHeight) {
	
	const width = Math.floor((canvasWidth - margin * 2) / CELL_SIZE);
	const height = Math.floor((canvasHeight - margin * 2) / CELL_SIZE);

	const cellFactory = (x, y) => new Cell(x, y);
	const grid = new BaseGrid(
		width, height,
		cellFactory
	);
	
	return grid;
}