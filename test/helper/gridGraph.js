import { pickOne } from "../../src/util.js";
import { assert } from "../../src/assert.js";

export const MAP = [
//   01234567890123456789
	"............##......",
	"............##......",
	".....##.....##......",
	".....##.....##......",
	".....##.....##......",
	".....##.....##......",
	".....##............."
];

export const NORTH = 0x01;
export const EAST = 0x02;
export const SOUTH = 0x04;
export const WEST = 0x08;

export const reverse = {
	[NORTH]: SOUTH,
	[SOUTH]: NORTH,
	[EAST]: WEST,
	[WEST]: EAST
};

class Cell {

	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.links = {};
	}

	link(other, dir, reverse) {
		if (dir in this.links) {
			console.log("WARNING: creating link that already exists: ", { dir, reverse });
		}
		this.links[dir] = other;
		if (reverse) { other.link(this, reverse); }
	}

	linked(dir) {
		return dir in this.links;
	}

	getLinks() {
		return Object.entries(this.links);
	}
}

export class GridGraph {

	static fromMask(mask) {
		const width = mask[0].length;
		const height = mask.length;
		const result = new GridGraph(width, height);

		let pos = 0;
		for (const row of mask) {
			for (let x = 0; x < width; ++x) {
				const c = row.substring(x, x + 1);
				if (c !== ".") {
					result.data[pos] = null;
				}
				pos++;
			}
		}
		return result;
	}

	constructor(width, height, cellFactory = (x, y) => new Cell(x, y)) {
		this.width = width;
		this.height = height;
		this.cellFactory = cellFactory;
		this.prepareGrid();
	}

	prepareGrid() {
		this.data = new Array(this.width * this.height);
		for(let x = 0; x < this.width; ++x) {
			for (let y = 0; y < this.height; ++y) {
				this.data[this._index(x, y)] = this.cellFactory(x, y);
			}
		}
	}

	randomCell() {
		for (let it = 0; it < 20; ++it) {
			const result = pickOne(this.data);
			if (result) return result;
		}
		assert(false, "Reached maximum number of iterations");
	}

	getWeight () {
		return 1;
	}
	
	_index(x, y) {
		return x + y * this.width;
	}
	
	get(x, y) {
		if (this.inRange(x, y)) {
			return this.data[this._index(x, y)];
		}
		else {
			return null;
		}
	}

	inRange(x, y) {
		return x >= 0 && y >= 0 && x < this.width && y < this.height;
	}

	getLinks(n) {
		return Object.entries(n.links);
	}

	*eachNode() {
		for (const node of this.data) {
			if (node) yield node;
		}
	}

	getAdjacent(n) {
		const result = [];
		let dx = 0;
		let dy = -1;
		const x = n.x;
		const y = n.y;
		
		for (const dir of [NORTH, EAST, SOUTH, WEST]) {
			const nx = x + dx;
			const ny = y + dy;
			const neighbor = this.get(nx, ny);
			if (neighbor) {
				result.push([dir, neighbor]);
			}
			[dx, dy] = [-dy, dx];
		}
		return result;
	}

	toString() {
		let result = "";
		
		for (let i = 0; i < this.data.length; ++i) {
			result += this.data[i] ? (this.data[i].tile || ".") : "#";
			if (((i + 1) % this.width) === 0) result += "\n";
		}
		return result;
	}

}
