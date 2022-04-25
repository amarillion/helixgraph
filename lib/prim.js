import { PriorityQueue } from "./PriorityQueue.js";
/**
 * Prioritize nodes that were opened last, but shuffle edges within that node.
 * Produces windy mazes with high river, like the recursive backtracker.
 */
export const PRIM_LAST_ADDED_RANDOM_EDGES = (() => {
    let counter;
    return {
        start: () => counter = 0,
        nextNode: () => --counter,
        next: () => counter + Math.random()
    };
})();
/**
 * Prioritize edges that were opened last.
 * Produces a very regular effect. No randomness at all.
 * Relies more on the weight function to do something interesting.
 */
export const PRIM_LAST_ADDED = (() => {
    let counter;
    return {
        start: () => counter = 0,
        nextNode: () => { },
        next: () => --counter
    };
})();
/**
 * Prioritize edges completely randomly.
 * Produces low-river mazes with lots of branches and lots of short dead-ends.
 */
export const PRIM_RANDOM = (() => {
    return {
        start: () => { },
        nextNode: () => { },
        next: () => Math.random()
    };
})();
export class PrimIter {
    constructor(startNode, getAdjacent, linkNodes, { getWeight = () => 1, tiebreaker = PRIM_LAST_ADDED_RANDOM_EDGES } = {}) {
        this.getAdjacent = getAdjacent;
        this.getWeight = getWeight;
        this.tiebreaker = tiebreaker;
        this.collectedNodes = new Set();
        this.edgeQueue = new PriorityQueue((a, b) => b.weight - a.weight || b.tiebreaker - a.tiebreaker);
        tiebreaker.start();
        this.collectNode(startNode);
        this.linkNodes = linkNodes;
    }
    collectNode(node) {
        for (const [edge, dest] of this.getAdjacent(node)) {
            // choice of tiebreaker determines the texture of the maze. 
            // a random tiebreaker creates a texture more like kruskal or random prim
            // a decreasing tiebreaker creates a texture more like the recursive backtracker
            this.edgeQueue.push({
                src: node,
                dir: edge,
                dest,
                weight: this.getWeight(edge, node),
                tiebreaker: this.tiebreaker.next()
            });
        }
        this.tiebreaker.nextNode();
        this.collectedNodes.add(node);
    }
    canLinkTo(destNode) {
        return !this.collectedNodes.has(destNode);
    }
    next() {
        while (true) {
            if (this.edgeQueue.isEmpty()) {
                return { value: undefined, done: true };
            }
            const { src, dir, dest } = this.edgeQueue.pop();
            if (this.canLinkTo(dest)) {
                this.collectNode(dest);
                this.linkNodes(src, dir, dest);
                return { value: undefined, done: false };
            }
        }
    }
    [Symbol.iterator]() {
        return this;
    }
}
export function prim(startNode, getAdjacent, linkNodes, { maxIterations = 0, getWeight = () => 1, tiebreaker = PRIM_LAST_ADDED_RANDOM_EDGES } = {}) {
    const iter = new PrimIter(startNode, getAdjacent, linkNodes, { getWeight, tiebreaker });
    let maxIt = maxIterations;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _ of iter) {
        if (--maxIt === 0) {
            throw new Error("Infinite loop detected");
        }
    }
}
