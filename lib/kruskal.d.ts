import { AdjacencyFunc, LinkFunc } from "./definitions.js";
declare type EdgeType<N, E> = {
    src: N;
    dir: E;
    dest: N;
};
export declare class KruskalIter<N, E> implements IterableIterator<void> {
    edges: EdgeType<N, E>[];
    setByNode: Map<N, number>;
    nodesBySet: Map<number, N[]>;
    linkNodes: LinkFunc<N, E>;
    constructor(nodeIterator: Iterable<N>, getUndirectedEdges: AdjacencyFunc<N, E>, linkNodes: LinkFunc<N, E>);
    merge(leftNode: N, dir: E, rightNode: N): void;
    canMerge(leftNode: N, rightNode: N): boolean;
    next(): IteratorResult<void>;
    [Symbol.iterator](): this;
}
export declare function kruskal<N, E>(nodeIterator: Iterable<N>, getUndirectedEdges: AdjacencyFunc<N, E>, linkNodes: LinkFunc<N, E>, { maxIterations }?: {
    maxIterations?: number;
}): void;
export {};
