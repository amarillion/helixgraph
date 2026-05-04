import { AdjacencyFunc, LinkFunc } from "../definitions.js";
export declare class AldousBroderIter<N, E> implements IterableIterator<void> {
    private nodes;
    private unvisited;
    private current;
    private linked;
    private linkNodes;
    private getUndirectedEdges;
    private prng;
    constructor(nodeIterator: Iterable<N>, getUndirectedEdges: AdjacencyFunc<N, E>, linkNodes: LinkFunc<N, E>, { prng }?: {
        prng?: () => number;
    });
    next(): IteratorResult<void>;
    [Symbol.iterator](): this;
}
export declare function aldousBroder<N, E>(nodeIterator: Iterable<N>, getUndirectedEdges: AdjacencyFunc<N, E>, linkNodes: LinkFunc<N, E>, { prng }?: {
    prng?: () => number;
}): void;
