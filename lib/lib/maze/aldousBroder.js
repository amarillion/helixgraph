import { pickOne } from "../random.js";
export class AldousBroderIter {
    constructor(nodeIterator, getUndirectedEdges, linkNodes, { prng = Math.random } = {}) {
        this.nodes = Array.isArray(nodeIterator) ? nodeIterator : [...nodeIterator];
        this.unvisited = this.nodes.length - 1;
        this.current = pickOne(this.nodes, prng);
        this.linked = new Set([this.current]);
        this.linkNodes = linkNodes;
        this.getUndirectedEdges = getUndirectedEdges;
        this.prng = prng;
    }
    next() {
        if (this.unvisited <= 0) {
            return { done: true, value: undefined };
        }
        const [edge, neighbor] = pickOne([...this.getUndirectedEdges(this.current)], this.prng);
        if (!this.linked.has(neighbor)) {
            this.linkNodes(this.current, edge, neighbor);
            this.linked.add(neighbor);
            this.unvisited -= 1;
        }
        this.current = neighbor;
        return { done: false, value: undefined };
    }
    [Symbol.iterator]() {
        // assumes you iterate only once, unlike iterables for data collections
        // this is valid, although not common practice
        return this;
    }
}
export function aldousBroder(nodeIterator, getUndirectedEdges, linkNodes, { prng = Math.random } = {}) {
    const iter = new AldousBroderIter(nodeIterator, getUndirectedEdges, linkNodes, { prng });
    for (const _ of iter) {
        /* pass */
    }
}
