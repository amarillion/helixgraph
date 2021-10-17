import { shuffle } from "./random.js";
class KruskalState {
    constructor(nodeIterator, getUndirectedEdges, linkCells) {
        this.edges = [];
        this.linkCells = linkCells;
        this.setByNode = new Map();
        this.nodesBySet = new Map();
        for (const node of nodeIterator) {
            const setIdx = this.setByNode.size;
            this.setByNode.set(node, setIdx);
            this.nodesBySet.set(setIdx, [node]);
            for (const [dir, dest] of getUndirectedEdges(node)) {
                this.edges.push({ src: node, dir, dest });
            }
        }
    }
    merge(leftNode, dir, rightNode) {
        this.linkCells(leftNode, dir, rightNode);
        const winnerIdx = this.setByNode.get(leftNode);
        const loserIdx = this.setByNode.get(rightNode);
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
    run() {
        const edges = this.edges;
        shuffle(edges);
        let maxIt = 10000000;
        while (edges.length > 0) {
            const { src, dir, dest } = edges.pop();
            if (this.canMerge(src, dest)) {
                this.merge(src, dir, dest);
            }
            if (--maxIt < 0) {
                throw new Error("Infinite loop detected");
            }
        }
    }
}
export function kruskal(nodeIterator, getUndirectedEdges, linkCells) {
    const state = new KruskalState(nodeIterator, getUndirectedEdges, linkCells);
    state.run();
}
