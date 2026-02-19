import { LinkFunc, AdjacencyFunc } from "../definitions.js";
import { Stream } from "../iterableUtils.js";
import { pickOne } from "../random.js";

export class RecursiveBackTrackerIter<N, E> implements IterableIterator<void> {
	linkNodes: LinkFunc<N, E>;
	listAdjacent: AdjacencyFunc<N, E>;
	stack: N[] = [];
	visited: Set<N> = new Set();
	prng: () => number;

	constructor(start: N, listAdjacent: AdjacencyFunc<N, E>, linkNodes: LinkFunc<N, E>, prng = Math.random) {
		this.listAdjacent = listAdjacent;
		this.linkNodes = linkNodes;
		this.stack.push(start);
		this.visited.add(start);
		this.prng = prng;
	}

	next(): IteratorResult<void> {
		while (true) {
			if (this.stack.length === 0) return { value: undefined, done: true };

			const current = this.stack[this.stack.length - 1];
			const unvisitedAdjacents = Stream
				.of(this.listAdjacent(current))
				.filter(([ , node ]) => !this.visited.has(node))
				.collect();

			if (unvisitedAdjacents.length === 0) {
				this.stack.pop();
			}
			else {
				const [ dir, node ] = pickOne(unvisitedAdjacents, this.prng);
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

export function recursiveBackTracker<N, E>(start: N, listAdjacent: AdjacencyFunc<N, E>, linkNodes: LinkFunc<N, E>) {
	const iter = new RecursiveBackTrackerIter(start, listAdjacent, linkNodes);
	for (const _ of iter) {
		/* pass */
	}
}
