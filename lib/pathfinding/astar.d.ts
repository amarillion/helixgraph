import { AdjacencyFunc, Step, WeightFunc } from "../definitions.js";
/**
 * Given a weighted graph, find all paths from one source to one or more destinations
 * @param {*} source
 * @param {*} destinations
 * @param {*} getAdjacent
 * @param {Object} options containing getHeuristic(node), maxIterations, getWeight(edge)
 *
 * @returns Map(to, { edge, from, to, cost })
 */
export declare function astar<N, E>(source: N, dest: N, getAdjacent: AdjacencyFunc<N, E>, { maxIterations, getWeight, getHeuristic }?: {
    maxIterations?: number;
    getWeight?: WeightFunc<N, E>;
    getHeuristic?: (node: N) => number;
}): Map<N, Step<N, E>>;
