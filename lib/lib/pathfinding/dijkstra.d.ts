import { AdjacencyFunc, Step, WeightFunc } from "../definitions.js";
/**
 * Given a weighted graph, find all paths from one source to one or more destinations
 * @param {*} source
 * @param {*} dest - the search destination node, or an array of destinations that must all be found
 * @param {*} getAdjacent
 * @param {*}
 *
 * @returns Map(to, { edge, from, to, cost })
 */
export declare function dijkstra<N, E>(source: N, dest: N | N[], getAdjacent: AdjacencyFunc<N, E>, { maxIterations, getWeight, }?: {
    maxIterations?: number;
    getWeight?: WeightFunc<N, E>;
}): Map<N, Step<N, E>>;
