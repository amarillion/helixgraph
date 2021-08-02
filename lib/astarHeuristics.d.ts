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
export declare function manhattanCrossProductHeuristic(sx: number, sy: number, cx: number, cy: number, gx: number, gy: number): number;
export declare function octagonalHeuristic(sx: number, sy: number, cx: number, cy: number, gx: number, gy: number): number;
/**
 * Astar Heuristic with opposite behaviour of the manhattanCrossProductHeuristic:
 * the tie breaker prefers paths with long stretches of horizontal/vertical, with the fewest turns possible.
 */
export declare function manhattanStraightHeuristic(sx: number, sy: number, cx: number, cy: number, gx: number, gy: number): number;
