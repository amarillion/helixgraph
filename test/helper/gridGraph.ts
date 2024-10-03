import { DirectionType, EAST, NORTH, SOUTH, TemplateGrid, WEST } from "../../src/BaseGrid.js";

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

export const reverse: { [dir: number]: DirectionType } = {
	[NORTH]: SOUTH,
	[SOUTH]: NORTH,
	[EAST]: WEST,
	[WEST]: EAST
};

export class Cell {
	x: number;
	y: number;
	tile: unknown;
	links: { [key: number]: Cell };

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.links = {};
	}

	link(other: Cell, dir: DirectionType, reverse?: DirectionType) {
		let result = true;
		if (dir in this.links) {
			console.log("WARNING: creating link that already exists: ", { dir, reverse });
			result = false;
		}
		this.links[dir] = other;
		if (reverse) { other.link(this, reverse); }
		return result;
	}

	linked(dir: DirectionType) {
		return dir in this.links;
	}

	getLinks() {
		return Object.entries(this.links);
	}
}

export class GridGraph extends TemplateGrid<Cell> {
	static fromMask(mask: string[]) {
		const width = mask[0].length;
		const height = mask.length;
		const result = new GridGraph(width, height);
		result.applyMask(mask);
		return result;
	}

	constructor(width: number, height: number, cellFactory = (x: number, y: number) => new Cell(x, y)) {
		super(width, height, cellFactory);
	}

	getWeight() {
		return 1;
	}
	
	getLinks(n: Cell) {
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
