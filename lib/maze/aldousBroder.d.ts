import { AdjacencyFunc, LinkFunc } from "../definitions.js";
export declare function aldousBroder<N, E>(nodeIterator: Iterable<N>, getUndirectedEdges: AdjacencyFunc<N, E>, linkNodes: LinkFunc<N, E>, { prng }?: {
    maxIterations?: number;
    prng?: () => number;
}): void;
