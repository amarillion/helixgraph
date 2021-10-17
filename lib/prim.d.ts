import { AdjacencyFunc, LinkFunc, WeightFunc } from "./definitions.js";
export interface PrimTieBreaker {
    start(): void;
    nextNode(): void;
    next(): number;
}
/**
 * Prioritize nodes that were opened last, but shuffle edges within that node.
 * Produces windy mazes with high river, like the recursive backtracker.
 */
export declare const PRIM_LAST_ADDED_RANDOM_EDGES: PrimTieBreaker;
/**
 * Prioritize edges that were opened last.
 * Produces a very regular effect. No randomness at all.
 * Relies more on the weight function to do something interesting.
 */
export declare const PRIM_LAST_ADDED: PrimTieBreaker;
/**
 * Prioritize edges completely randomly.
 * Produces low-river mazes with lots of branches and lots of short dead-ends.
 */
export declare const PRIM_RANDOM: PrimTieBreaker;
export declare function prim<N, E>(startNode: N, getAdjacent: AdjacencyFunc<N, E>, linkCells: LinkFunc<N, E>, { maxIterations, getWeight, tiebreaker }?: {
    maxIterations?: number;
    getWeight?: WeightFunc<N, E>;
    tiebreaker?: PrimTieBreaker;
}): void;