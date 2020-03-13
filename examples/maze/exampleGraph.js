import BaseGrid from "../../src/BaseGrid.js";

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

}

export class ExampleGraph extends BaseGrid {

	constructor(width, height, cellFactory = (x, y) => new Cell(x, y)) {
		super(width, height, cellFactory);
	}

}
