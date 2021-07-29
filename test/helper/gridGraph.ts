import { TemplateGrid } from "../../src/BaseGrid.js";

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

	x: number;
	y: number;
	tile: any;
	links: object;

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

export class GridGraph extends TemplateGrid<Cell> {

	static fromMask(mask) {
		const width = mask[0].length;
		const height = mask.length;
		const result = new GridGraph(width, height);
		result.applyMask(mask);
		return result;
	}

	constructor(width, height, cellFactory = (x, y) => new Cell(x, y)) {
		super(width, height, cellFactory);
	}

	getWeight () {
		return 1;
	}
	
	getLinks(n) {
		return Object.entries(n.links);
	}

	toString() {
		let result = "";
		
		for (let i = 0; i < this._data.length; ++i) {
			result += this._data[i] ? (this._data[i].tile || ".") : "#";
			if (((i + 1) % this.width) === 0) result += "\n";
		}
		return result;
	}

}
