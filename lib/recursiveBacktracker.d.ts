import { LinkFunc, AdjacencyFunc } from "./definitions.js";
export declare function recursiveBackTracker<N, E>(start: N, listAdjacent: AdjacencyFunc<N, E>, linkNodes: LinkFunc<N, E>): void;
