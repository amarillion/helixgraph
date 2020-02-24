import { pickOne } from "../../src/random.js";
import { assert } from "../../src/assert.js";
import { bfsGenerator } from "../../src/algorithm.js";
import { EAST, SOUTH, NORTH } from "../../src/BaseGrid.js";

export function renderToString(grid) {

	const rep = (str, n) => {
		let result = "";
		for (let i = 0; i < n; ++i) {
			result += str;
		}
		return result;
	};

	// top-row
	let output = "+" + rep("---+", grid.width) + "\n";

	for (let y = 0; y < grid.height; ++y) {

		let top = "|";
		let bottom = "-";

		for (let x = 0; x < grid.width; ++x) {
			const cell = grid.get(x, y);
			top += "   " + (cell.linked(EAST) ? " " : "|");
			bottom += (cell.linked(SOUTH) ? "   " : "---") + "+";
		}

		output += top + "\n";
		output += bottom + "\n";
	}
	return output;
}

export function binaryTree(grid) {

	for (const cell of grid.eachCell()) {
		
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
	}
	
}

// use bfs to find all freely linked nodes
export function expandNodes(node, listNeighbors) {
	assert(typeof(listNeighbors) === "function", `Parameter listNeighbors must be a function but is ${typeof(listNeighbors)}`);
	return [ ...bfsGenerator(node, listNeighbors) ];
}

export function reachable(src, dest, listNeighbors) {
	assert(typeof(listNeighbors) === "function", `Parameter listNeighbors must be a function but is ${typeof(listNeighbors)}`);
	for (const node of bfsGenerator(src, listNeighbors)) {
		if (node === dest) {
			return true; // found!
		}
	}
	return false; // not found
}
