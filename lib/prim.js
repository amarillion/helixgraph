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
export function prim(startNode, getAdjacent, linkCells, { maxIterations = 0, getWeight = () => 1, tiebreaker = PRIM_LAST_ADDED_RANDOM_EDGES } = {}) {
    const collectedNodes = new Set();
    const edgeQueue = new PriorityQueue((a, b) => b.weight - a.weight || b.tiebreaker - a.tiebreaker);
    tiebreaker.start();
    const collectNode = (node) => {
        for (const [edge, dest] of getAdjacent(node)) {
            // choice of tiebreaker determines the texture of the maze. 
            // a random tiebreaker creates a texture more like kruskal or random prim
            // a decreasing tiebreaker creates a texture more like the recursive backtracker
            edgeQueue.push({ src: node, dir: edge, dest, weight: getWeight(edge, node), tiebreaker: tiebreaker.next() });
        }
        tiebreaker.nextNode();
        collectedNodes.add(node);
    };
    collectNode(startNode);
    const canLinkTo = (destNode) => !collectedNodes.has(destNode);
    let i = maxIterations;
    while (!edgeQueue.isEmpty()) {
        // then continue
        const { src, dir, dest } = edgeQueue.pop();
        if (canLinkTo(dest)) {
            linkCells(src, dir, dest);
            collectNode(dest);
        }
        i--; // i 0 -> -1 means infinite
        if (i === 0)
            break;
    }
}
