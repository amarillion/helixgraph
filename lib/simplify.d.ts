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
    getWeight: (e: any) => any;
    getLeft: (e: any) => any;
    getRight: (e: any) => any;
    isSource: PredicateFunc<N>;
    isSink: PredicateFunc<N>;
    sources: any[];
    sinks: any[];
    nodes: any[];
    edgesByNode: Map<any, any>;
    getAdjacent: (node: any) => any;
};
/**
 *
 * Given a path of edges as returned by trackbackEdges from a simplified graph
 * Concatenate the edgeChains of each simplified edge
 * Reverse the edgeChains when necessary.
 */
export declare function flattenPath(path: any): any;
