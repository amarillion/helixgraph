import { AdjacencyFunc, LinkFunc, WeightFunc } from "./definitions.js";
import { PriorityQueue } from "./PriorityQueue.js";

export interface PrimTieBreaker {
	start(): void,
	nextNode(): void,
	next(): number,
}

/**
 * Prioritize nodes that were opened last, but shuffle edges within that node.
 * Produces windy mazes with high river, like the recursive backtracker.
 */
export const PRIM_LAST_ADDED_RANDOM_EDGES: PrimTieBreaker = ((prng = Math.random) => {
	let counter: number;
	return {
		start: () => counter = 0,
		nextNode: () => --counter,
		next: () => counter + prng()
	};
})();

/**
 * Prioritize edges that were opened last.
 * Produces a very regular effect. No randomness at all.
 * Relies more on the weight function to do something interesting.
 */
export const PRIM_LAST_ADDED: PrimTieBreaker = (() => {
	let counter: number;
	return {
		start: () => counter = 0,
		nextNode: () => {},
		next: () => --counter
	};
})();

/**
 * Prioritize edges completely randomly.
 * Produces low-river mazes with lots of branches and lots of short dead-ends.
 */
export const PRIM_RANDOM: PrimTieBreaker = ((prng = Math.random) => {
	return {
		start: () => {},
		nextNode: () => {},
		next: () => prng()
	};
})();

// only used internally
type EdgeType<N, E> = {
	src: N,
	dir: E,
	dest: N,
	weight: number,
	tiebreaker: number,
};

export class PrimIter<N, E> implements IterableIterator<void> {
	collectedNodes: Set<N>;
	edgeQueue: PriorityQueue<EdgeType<N, E>>;
	tiebreaker: PrimTieBreaker;
	getWeight: WeightFunc<N, E>;
	getAdjacent: AdjacencyFunc<N, E>;
	linkNodes: LinkFunc<N, E>;

	constructor(startNode: N,
		getAdjacent: AdjacencyFunc<N, E>,
		linkNodes: LinkFunc<N, E>,
		{
			getWeight = () => 1,
			tiebreaker = PRIM_LAST_ADDED_RANDOM_EDGES
		}: {
			getWeight?: WeightFunc<N, E>,
			tiebreaker?: PrimTieBreaker,
		} = {}
	) {
		this.getAdjacent = getAdjacent;
		this.getWeight = getWeight;
		this.tiebreaker = tiebreaker;

		this.collectedNodes = new Set<N>();
		this.edgeQueue = new PriorityQueue<EdgeType<N, E>>((a, b) => b.weight - a.weight || b.tiebreaker - a.tiebreaker);
		
		tiebreaker.start();
	
		this.collectNode(startNode);
		this.linkNodes = linkNodes;
	}

	collectNode(node: N) {
		for (const [ edge, dest ] of this.getAdjacent(node)) {
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

	canLinkTo(destNode: N) {
		return !this.collectedNodes.has(destNode);
	}

	next(): IteratorResult<void> {
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

export function prim<N, E>(
	startNode: N,
	getAdjacent: AdjacencyFunc<N, E>,
	linkNodes: LinkFunc<N, E>,
	{
		maxIterations = 0,
		getWeight = () => 1,
		tiebreaker = PRIM_LAST_ADDED_RANDOM_EDGES
	}: {
		maxIterations?: number,
		getWeight?: WeightFunc<N, E>,
		tiebreaker?: PrimTieBreaker,
	} = {}
) {
	const iter = new PrimIter(startNode, getAdjacent, linkNodes, { getWeight, tiebreaker });
	let maxIt = maxIterations;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for (const _ of iter) {
		if (--maxIt === 0) { throw new Error("Infinite loop detected"); }
	}
}
