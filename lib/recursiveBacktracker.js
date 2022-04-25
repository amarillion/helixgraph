import { Stream } from "./iterableUtils.js";
import { pickOne } from "./random.js";
export class RecursiveBackTrackerIter {
    constructor(start, listAdjacent, linkNodes) {
        this.stack = [];
        this.visited = new Set();
        this.listAdjacent = listAdjacent;
        this.linkNodes = linkNodes;
        this.stack.push(start);
        this.visited.add(start);
    }
    next() {
        while (true) {
            if (this.stack.length === 0)
                return { value: undefined, done: true };
            const current = this.stack[this.stack.length - 1];
            const unvisitedAdjacents = Stream
                .of(this.listAdjacent(current))
                .filter(([, node]) => !this.visited.has(node))
                .collect();
            if (unvisitedAdjacents.length === 0) {
                this.stack.pop();
            }
            else {
                const [dir, node] = pickOne(unvisitedAdjacents);
                this.stack.push(node);
                this.visited.add(node);
                this.linkNodes(current, dir, node);
                return { value: undefined, done: this.stack.length === 0 };
            }
        }
    }
    [Symbol.iterator]() {
        // assumes you iterate only once, unlike iterables for data collections
        // this is valid, although not common practice
        return this;
    }
}
export function recursiveBackTracker(start, listAdjacent, linkNodes) {
    const iter = new RecursiveBackTrackerIter(start, listAdjacent, linkNodes);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _ of iter) {
        /* pass */
    }
}
