import { randomInt } from "../../lib/random.js";
import { prim, PRIM_LAST_ADDED } from "../../lib/maze/prim.js";
import { BaseGrid } from "../../lib/BaseGrid.js";

const NE = "NE", N = "N", NW = "NW", SE = "SE", S = "S", SW = "SW"; 

// for being able to find the opposite direction
const reverse = {
	NE: SW,
	N: S,
	NW: SE,
	SE: NW,
	S: N,
	SW: NE,
};

const TRIANGLE_UP_DIRS = {
	NW: { w: 1, dx: -1, dy: 0 },
	NE: { w: 1, dx: 1, dy: 0 },
	S: { w: 1, dx: 0, dy: 1 }
};
const TRIANGLE_DOWN_DIRS = {
	N: { w: 1, dx: 0, dy: -1 },
	SE: { w: 1, dx: 1, dy: 0 },
	SW: { w: 1, dx: -1, dy: 0 },
};

class TriangularLattice {

	constructor(size, xofst, yofst) {
		this.xofst = xofst;
		this.yofst = yofst;

		// TRIANGLE properties
		const C = size; // side
		const A = C / 2; // half of a side
		const B = Math.sqrt(C * C - A * A); // perpendicular line

		this.C = C;
		this.A = A;
		this.B = B;

		const POINTS = [
			// up
			{ x: -A, y: B },
			{ x: 0, y: 0 },
			{ x: A, y: B },
			// down
			{ x: -A, y: 0 },
			{ x: A, y: 0 },
			{ x: 0, y: B },
		];

		this.POINTS = POINTS;
		this.SEGMENTS = {
			NW: [ POINTS[0], POINTS[1] ],
			N:  [ POINTS[3], POINTS[4] ],
			NE: [ POINTS[1], POINTS[2] ],
			SE: [ POINTS[4], POINTS[5] ],
			S:  [ POINTS[2], POINTS[0] ],
			SW: [ POINTS[5], POINTS[3] ]
		};

	}
}

// cell implementation that keeps track of links to neighboring cells
class TriangularCell {

	constructor(x, y, grid, layout) {
		this.x = x;
		this.y = y;
		this.grid = grid;
		this.pointingDown = (x % 2) !== (y % 2);
		
		this.links = {};
		this.points = this.pointingDown ? layout.POINTS.slice(3,6) : layout.POINTS.slice(0,3);
		this.dirs = this.pointingDown ? TRIANGLE_DOWN_DIRS : TRIANGLE_UP_DIRS;
		this.layout = layout;
	}

	/**
	 * @param {*} other cell to link to
	 * @param {*} dir one of NE, NW, E, SE, SW, W
	 * @param {*} reverse optional - supply a reverse direction if you want to make
	 *   the link bidirectional
	 */
	linkHelper(other, dir, reverse) {
		if (dir in this.links) {
			console.log("WARNING: creating link that already exists: ", { dir, reverse });
		}
		if (!(dir in this.dirs)) {
			throw new Error(`Creating link that mismatches triangle orientation: ${JSON.stringify({ x: this.x, y: this.y, dir, reverse })}`);
		}
		this.links[dir] = other;
		if (reverse) {
			// call recursively, but without reversing again
			other.linkHelper(this, reverse);
		}
	}

	link(other, dir) {
		this.linkHelper(other, dir, reverse[dir]);
	}

	linked(dir) {
		return dir in this.links;
	}

	//TODO: generator?
	*neighborFunc() {
		for (const [ key, { dx, dy } ] of Object.entries(this.dirs)) {
			const nx = this.x + dx;
			const ny = this.y + dy;
			if (!this.grid.inRange(nx, ny)) continue;
			const cell = this.grid.get(nx, ny);
			if (!cell) continue;
			yield [ key, cell ];
		}
	}

	// TODO: rewrite as filter of neighborFunc
	undirectedNeighborFunc() {
		const result = [];
		for (const [ key, { dx, dy } ] of Object.entries(this.dirs)) {
			
			// key difference: filter
			if (key === S || key === SE || key === SW) continue;

			const nx = this.x + dx;
			const ny = this.y + dy;
			if (!this.grid.inRange(nx, ny)) continue;
			const cell = this.grid.get(nx, ny);
			result.push([ key, cell ]);
		}
		return result;
	}

	fill(ctx, color) {
		ctx.fillStyle = color || "white";
		ctx.lineWidth = 1.0;
		ctx.strokeStyle = ctx.fillStyle;
		ctx.beginPath();
		ctx.moveTo(this.px + this.points[0].x, this.py + this.points[0].y);
		for (const p of this.points.slice(1)) {
			ctx.lineTo(this.px + p.x, this.py + p.y);
		}
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}

	render(ctx, strokeStyle = "black") {
		ctx.lineWidth = 1.0;
		ctx.strokeStyle = strokeStyle;
		// ctx.lineCap = "round";
		for (const dir in this.dirs) {
			if (this.linked(dir)) continue;

			const segment = this.layout.SEGMENTS[dir];
			ctx.beginPath();
			ctx.moveTo(this.px + segment[0].x, this.py + segment[0].y);
			ctx.lineTo(this.px + segment[1].x, this.py + segment[1].y);
			ctx.stroke();
		}
	}

	get px() { return this.layout.xofst + this.layout.A * (this.x + 1); }
	get py() { return this.layout.yofst + this.y * this.layout.B; }
	
}

export function createTriangularGrid(canvasWidth, canvasHeight) {

	const lattice = new TriangularLattice(30, 10, 10);
	const width = Math.floor((canvasWidth - lattice.xofst * 2) / lattice.A) - 1;
	const height = Math.floor((canvasHeight - lattice.yofst * 2) / lattice.B);

	const cellFactory = (x, y, grid) => new TriangularCell(x, y, grid, lattice);
	const grid = new BaseGrid(
		width, height,
		cellFactory
	);
	// override adjacency function.
	// TODO: make this more elegant instead of monkey patching.
	grid.getAdjacent = cell => [ ...cell.neighborFunc() ];
	return grid;
}