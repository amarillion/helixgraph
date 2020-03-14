import { SOUTH, EAST } from "../../src/BaseGrid.js";

/** Create a string representation of the grid */
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
