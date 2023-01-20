import { LinkFunc, AdjacencyFunc } from "./definitions.js";
export declare class RecursiveBackTrackerIter<N, E> implements IterableIterator<void> {
    linkNodes: LinkFunc<N, E>;
    listAdjacent: AdjacencyFunc<N, E>;
    stack: N[];
    visited: Set<N>;
    constructor(start: N, listAdjacent: AdjacencyFunc<N, E>, linkNodes: LinkFunc<N, E>);
    next(): IteratorResult<void>;
    [Symbol.iterator](): this;
}
export declare function recursiveBackTracker<N, E>(start: N, listAdjacent: AdjacencyFunc<N, E>, linkNodes: LinkFunc<N, E>): void;
