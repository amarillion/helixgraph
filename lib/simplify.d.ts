import { AdjacencyFunc, PredicateFunc } from "./definitions.js";
/**
 * @param {*} source a starting node, typically one of the possible source nodes.
 * @param {*} isSource a function to determine if a given node is a source
 * @param {*} isSink a function to determine if a given node is a sink
 * @param {*} getAdjacent function that for given node, returns array [ edge, node ] pairs
 *
 * @result a structure containing:
 * 	getWeight, getLeft, getRight, isSoure, isSink and getAdjacent functions,
 *  as well as the data for those functions.
 */
export declare function simplify<N, E>(source: N, isSource: PredicateFunc<N>, isSink: PredicateFunc<N>, getAdjacent: AdjacencyFunc<N, E>): {
    getWeight: (e: {
        edgeChain: E[];
        nodeChain: N[];
    } & {
        right: N;
        left: N;
        weight: number;
    }) => number;
    getLeft: (e: {
        edgeChain: E[];
        nodeChain: N[];
    } & {
        right: N;
        left: N;
        weight: number;
    }) => N;
    getRight: (e: {
        edgeChain: E[];
        nodeChain: N[];
    } & {
        right: N;
        left: N;
        weight: number;
    }) => N;
    isSource: PredicateFunc<N>;
    isSink: PredicateFunc<N>;
    edgesByNode: Map<N, [[{
        edgeChain: E[];
        nodeChain: N[];
    } & {
        right: N;
        left: N;
        weight: number;
    }, N]]>;
    getAdjacent: AdjacencyFunc<N, {
        edgeChain: E[];
        nodeChain: N[];
    } & {
        right: N;
        left: N;
        weight: number;
    }>;
    sources: N[];
    sinks: N[];
    nodes: N[];
};
/**
 *
 * Given a path of edges as returned by trackbackEdges from a simplified graph
 * Concatenate the edgeChains of each simplified edge
 * Reverse the edgeChains when necessary.
 */
export declare function flattenPath<E>(path: {
    edgeChain: E;
}[]): any[];
