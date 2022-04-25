import { shuffle } from "./random.js";
export class KruskalIter {
    constructor(nodeIterator, getUndirectedEdges, linkNodes) {
        this.edges = [];
        this.setByNode = new Map();
        this.nodesBySet = new Map();
        this.linkNodes = linkNodes;
        for (const node of nodeIterator) {
            const setIdx = this.setByNode.size;
            this.setByNode.set(node, setIdx);
            this.nodesBySet.set(setIdx, [node]);
            for (const [dir, dest] of getUndirectedEdges(node)) {
                this.edges.push({ src: node, dir, dest });
            }
        }
        shuffle(this.edges);
    }
    merge(leftNode, dir, rightNode) {
        this.linkNodes(leftNode, dir, rightNode);
        const leftIdx = this.setByNode.get(leftNode);
        const rightIdx = this.setByNode.get(rightNode);
        const leftCount = this.nodesBySet.get(leftIdx).length;
        const rightCount = this.nodesBySet.get(rightIdx).length;
        // when merging two sets of nodes, keep the largest one unchanged
        const winnerIdx = leftCount > rightCount ? leftIdx : rightIdx;
        const loserIdx = leftCount > rightCount ? rightIdx : leftIdx;
        const winners = this.nodesBySet.get(winnerIdx);
        for (const loser of this.nodesBySet.get(loserIdx)) {
            winners.push(loser);
            this.setByNode.set(loser, winnerIdx);
        }
        this.nodesBySet.delete(loserIdx);
    }
    canMerge(leftNode, rightNode) {
        return this.setByNode.get(leftNode) !== this.setByNode.get(rightNode);
    }
    next() {
        while (true) {
            if (this.edges.length === 0)
                return { value: undefined, done: true };
            const { src, dir, dest } = this.edges.pop();
            if (this.canMerge(src, dest)) {
                this.merge(src, dir, dest);
                return { value: undefined, done: this.edges.length === 0 };
            }
        }
    }
    [Symbol.iterator]() {
        // assumes you iterate only once, unlike iterables for data collections
        // this is valid, although not common practice
        return this;
    }
}
export function kruskal(nodeIterator, getUndirectedEdges, linkNodes, { maxIterations = 0 } = {}) {
    const iter = new KruskalIter(nodeIterator, getUndirectedEdges, linkNodes);
    let maxIt = maxIterations;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _ of iter) {
        if (maxIt > 0) {
            if (--maxIt === 0) {
                throw new Error("Infinite loop detected");
            }
        }
    }
}
