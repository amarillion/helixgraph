import { AdjacencyFunc, LinkFunc } from "./definitions.js";
export declare function kruskal<N, E>(nodeIterator: Iterable<N>, getUndirectedEdges: AdjacencyFunc<N, E>, linkCells: LinkFunc<N, E>): void;
