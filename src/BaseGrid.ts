import { assert } from "./assert.js";
import { randomInt } from "./random.js";

export type DirectionType = 1 | 2 | 4 | 8;

export const NORTH: DirectionType = 0x01;
export const EAST: DirectionType = 0x02;
export const SOUTH: DirectionType = 0x04;
export const WEST: DirectionType = 0x08;

const DEFAULT_CELL_FACTORY = (x: number, y: number) => ({ x, y });

/*
A rectangular grid of width x height cells.
The actual cell T is determined by the cellFactory constructor argument.
It's possible to mask / clear cells, in which case those cells are null.

Using the getAdjacent method, it's possible to treat the grid as a
graph where adjacent cells are connected. This makes it possible to run
e.g. astar or dijkstra on this grid directly.

This class is designed to be extended to allow different topographies,
such as e.g. hexagonal grids.
*/
export class TemplateGrid<T> {
	cellFactory: (x: number, y: number, parent: unknown) => T;
	width: number;
	height: number;
	_data: T[];

	constructor(
		width: number,
		height: number,
		cellFactory: (x: number, y: number, parent: unknown) => T
	) {
		this.cellFactory = cellFactory;
		this.width = width;
		this.height = height;
		this._prepareGrid();
	}

	/*
	Removes some cells based on a mask.

	The mask is an array of strings. Width & height are derived from this array.
	Each cell that is either '.' or ' ' is kept, the rest is removed.
	*/
	applyMask(mask: string[]) {
		const width = mask[0].length;
		const height = mask.length;

		for (let y = 0; y < height; ++y) {
			const row = mask[y];
			for (let x = 0; x < width; ++x) {
				const c = row.substring(x, x + 1);
				if (!(c === "." || c === " ")) {
					this.remove(x, y);
				}
			}
		}
		return this;
	}

	/*
	Protected.
	Should be called by the constructor only, to initialize each cell in the grid.
	Override this method if you want to change the topography of the grid
	*/
	_prepareGrid() {
		this._data = new Array(this.width * this.height);
		for (let x = 0; x < this.width; ++x) {
			for (let y = 0; y < this.height; ++y) {
				this._data[this._index(x, y)] = this.cellFactory(x, y, this);
			}
		}
	}

	/*
	Pick a random cell that is not null. Useful to pick a starting point for
	some algorithms.

	May fail with an assertion error if there are no cells in the maze.
	*/
	randomCell(prng = Math.random) {
		const len = this._data.length;
		let pos = randomInt(len, prng);
		for (let i = 0; i < len; ++i) {
			const result = this._data[pos];
			if (result) return result;
			// step through using large prime number as stride
			// ensuring that we cover the whole map (unless width or
			// height are a multiple of 523)
			else pos = (pos + 523) % len;
		}
		assert(false, "No available cell found in map, reached max iterations");
	}
	
	// internal mapping from coordinate to index.
	_index(x: number, y: number) {
		return x + y * this.width;
	}

	remove(x: number, y: number) {
		if (this.inRange(x, y)) { this._data[this._index(x, y)] = null; }
	}

	get(x: number, y: number) {
		if (this.inRange(x, y)) {
			return this._data[this._index(x, y)];
		}
		else {
			return null;
		}
	}

	inRange(x: number, y: number) {
		return x >= 0 && y >= 0 && x < this.width && y < this.height;
	}

	// generator going through all valid cells in order
	*eachNode() {
		for (const node of this._data) {
			if (node) yield node;
		}
	}

	/*
	list adjacent, valid cells. Cells removed or outside the map are excluded.
	returns an array of [ dir, cell ] tuples, where
	dir is one of [ NORTH, EAST, SOUTH, WEST ] and cell is the adjacent cell.
	
	Should be overridden to implement different grid topologies.
	*/
	*getAdjacent(n: { x: number, y: number }): Generator<[DirectionType, T]> {
		let dx = 0;
		let dy = -1;
		const x = n.x;
		const y = n.y;
		
		for (const dir of [ NORTH, EAST, SOUTH, WEST ]) {
			const nx = x + dx;
			const ny = y + dy;
			const adjacent = this.get(nx, ny);
			if (adjacent) {
				yield [ dir, adjacent ];
			}
			// rotate 90 degrees
			[ dx, dy ] = [ -dy, dx ];
		}
	}
}

export class BaseGrid extends TemplateGrid<unknown> {
	constructor(width: number, height: number, cellFactory = DEFAULT_CELL_FACTORY) {
		super(width, height, cellFactory);
	}
}
