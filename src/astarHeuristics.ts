/**
 * Astar Heuristic with tie-breaker that prefers paths that follow the direct line
 * between start and goal, alternating horizontal/vertical for short steps, as much as needed
 * to approximate the direct line.
 * See: https://stackoverflow.com/questions/845626/how-do-i-find-the-most-naturally-direct-route-using-a-star-a/845630#845630
 * @param {*} sx start x
 * @param {*} sy start y
 * @param {*} cx current x
 * @param {*} cy current y
 * @param {*} gx goal x
 * @param {*} gy goal y
 */
export function manhattanCrossProductHeuristic(sx: number, sy: number, cx: number, cy: number, gx: number, gy: number) {
	const dx1 = cx - gx;
	const dy1 = cy - gy;
	const dx2 = sx - gx;
	const dy2 = sy - gy;
	const heuristic = Math.abs(dx1) + Math.abs(dy1);
	const cross = Math.abs(dx1 * dy2 - dx2 * dy1);
	return heuristic + cross * 0.001;
}

// heuristic for eight-way movement on a rectangular grid.
export function octagonalHeuristic(sx: number, sy: number, cx: number, cy: number, gx: number, gy: number) {
	const dx1 = cx - gx;
	const dy1 = cy - gy;
	const dx2 = sx - gx;
	const dy2 = sy - gy;
	const adx1 = Math.abs(dx1);
	const ady1 = Math.abs(dy1);
	const min = Math.min(adx1, ady1);
	const max = Math.max(adx1, ady1);
	const heuristic = (min * 0.414) + max; // sqrt(2) - 1
	const cross = Math.abs(dx1 * dy2 - dx2 * dy1);
	return heuristic + cross * 0.001;
}

/**
 * Astar Heuristic with opposite behaviour of the manhattanCrossProductHeuristic:
 * the tie breaker prefers paths with long stretches of horizontal/vertical, with the fewest turns possible.
 */
export function manhattanStraightHeuristic(sx: number, sy: number, cx: number, cy: number, gx: number, gy: number) {
	const dx1 = cx - gx;
	const dy1 = cy - gy;
	const dx2 = sx - gx;
	const dy2 = sy - gy;

	// fx is fraction of the way between sx and gx
	const fx = dx2 === 0 ? 0.5 : dx1 / dx2 + 0.01; // 0.01 is to break tie between horizontal / vertical
	const fy = dy2 === 0 ? 0.5 : dy1 / dy2;
	const heuristic = Math.abs(dx1) + Math.abs(dy1);
	// Map x 0..1 into curve -(x(x-1))
	const tie = Math.abs ((fx * (fx - 1)) * (fy * (fy - 1)));
	return heuristic + tie;
}
