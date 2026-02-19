import { manhattanStraightHeuristic } from "../../src/index.js";
import { test } from 'vitest';

test("Cross product heuristic", () => {
	for (let y = 0; y < 30; ++y) {
		let row = "";
		for (let x = 0; x < 15; ++x) {
			const data = manhattanStraightHeuristic(2, 4, x, y, 8, 4);
			row += data.toFixed(3) + " ";
		}
		console.log(row);
	}
	// t.pass();
});
