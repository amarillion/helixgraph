import { assert } from "./assert.js";
import { randomNumber, pickOne } from "./util.js";

/*
Generate a maze
*/

export const NORTH = 0x01;
export const EAST = 0x02;
export const SOUTH = 0x04;
export const WEST = 0x08;

const reverse = {
	[NORTH]: SOUTH,
	[SOUTH]: NORTH,
	[EAST]: WEST,
	[WEST]: EAST
};

export class Cell {
	
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.links = {};
	}

	link(other, dir, bidi=true, linkType = 1) {
		if (dir in this.links) {
			console.log("WARNING: creating link that already exists");
		}
		this.links[dir] = other;
		if (bidi) { other.link(this, reverse[dir], false, linkType); }
	}

	linked(dir) {
		return dir in this.links;
	}

	unlink(other, bidi=true) {
		console.log({other, bidi});
		assert(false, "Unimplemented");
	}

	listNeighbors() {
		const result = [];
		for (const [k, v] of Object.entries(this.links)) {
			result.push({ dir: k, cell : v });
		}
		return result;
	}
}

export class Grid {

	constructor (w, h) {
		this.w = w;
		this.h = h;
		this.data = [];

		this.prepareGrid();
	}

	prepareGrid() {
		for(let x = 0; x < this.w; ++x) {
			for (let y = 0; y < this.h; ++y) {
				this.data[this._index(x, y)] = new Cell(x, y);
			}
		}
	}

	eachCell(f) {
		for (const cell of this.data) {
			f(cell);
		}
	}

	allNodes() {
		return this.data;
	}

	_index(x, y) {
		return x + y * this.w;
	}

	inRange(x, y) {
		return (x >= 0 && y >= 0 && x < this.w && y < this.h);
	}

	get(x, y) {
		assert (this.inRange(x, y), "Out of bounds");
		return this.data[this._index(x, y)];
	}

	// list neighbors, not necessarily linked
	// returns array of dir, cell pairs
	allNeighbors(cell) {
		const result = [];
		for (const dirKey of [NORTH, EAST, SOUTH, WEST]) {
			const n = this.findNeighbor(cell, dirKey);
			if (n) result.push( { dir: dirKey, cell : n });
		}
		return result;
	}

	// find neighboring cell in given dir, not necessarily linked
	// may return null, e.g. when at edge of map
	findNeighbor(cell, dir) {
		const x = cell.x;
		const y = cell.y;
		let nx = x;
		let ny = y;
		switch (dir) {
		case NORTH: ny -= 1; break;
		case EAST: nx += 1; break;
		case SOUTH: ny += 1; break;
		case WEST: nx -= 1; break;
		default: assert(false, "Impossible direction");
		}
		if (this.inRange(nx, ny)) return this.get(nx, ny); else return null;
	}

	renderToString() {
		
		const rep = (str, n) => {
			let result = "";
			for (let i = 0; i < n; ++i) {
				result += str;
			}
			return result;
		};

		// top-row
		let output = "+" + rep("---+", this.w) + "\n";

		for (let y = 0; y < this.h; ++y) {

			let top = "|";
			let bottom = "-";

			for (let x = 0; x < this.w; ++x) {
				const cell = this.get(x, y);
				top += "   " + (cell.linked(EAST) ? " " : "|");
				bottom += (cell.linked(SOUTH) ? "   " : "---") + "+";
			}

			output += top + "\n";
			output += bottom + "\n";
		}
		return output;
	}

}

export function binaryTree(grid) {

	grid.eachCell(cell => {
		
		const neighbors = [];
		
		const north = grid.findNeighbor(cell, NORTH);
		if (north) neighbors.push({ dir: NORTH, cell: north });
		
		const east = grid.findNeighbor(cell, EAST);
		if (east) neighbors.push({ dir: EAST, cell: east });
		
		const item = pickOne(neighbors);
		if (item) { 
			// add door sometimes...
			const linkType  = Math.random() > 0.95 ? 2 : 1;	
			cell.link(item.cell, item.dir, true, linkType); 
		}

		// add key sometimes
		if (Math.random() > 0.95) {
			cell.object = 2;
		}
	});
	
}

export function recursiveBackTracker(grid) {
	const stack = [];
	const start = grid.get(randomNumber(grid.w), randomNumber(grid.h));
	stack.push(start);

	while (stack.length > 0) {
		const current = stack[stack.length - 1];
		const unvisitedNeighbors = grid.allNeighbors(current).filter(item => {
			return (Object.entries(item.cell.links).length === 0);
		});

		if (unvisitedNeighbors.length === 0) {
			stack.pop();
		}
		else {
			const item = pickOne(unvisitedNeighbors);
			
			let linkType = 1; // base
			current.link(item.cell, item.dir, true, linkType);
			stack.push(item.cell); 
		}
	}
}

// use bfs to find all freely linked nodes
export function expandNodes(node) {
	const visited = new Set();
	const stack = [];
	stack.push(node);
	visited.add(node);

	while(stack.length > 0) {

		const current = stack.pop();
		
		// find unvisited neighbors
		const unvisited = current.
			listNeighbors().
			filter(item => !visited.has(item.cell));

		for (const item of unvisited) {
			visited.add(item.cell);
			stack.push(item.cell);
		}
	}

	return [ ...visited.values() ];
}

export function reachable(src, dest) {

	const visited = new Set();
	const stack = [];
	stack.push(src);
	visited.add(src);

	while(stack.length > 0) {

		const current = stack.pop();
		
		// find unvisited neighbors
		const unvisited = current.
			listNeighbors().
			filter(item => !visited.has(item.cell));

		for (const item of unvisited) {
			if (item.cell === dest) {
				return true; // found!
			}
			visited.add(item.cell);
			stack.push(item.cell);
		}
	}

	return false; // not found
}
