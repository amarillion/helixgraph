import { AdjacencyFunc, LinkFunc } from "./definitions.js";
import { shuffle } from "./random.js";

// for internal use
type EdgeType<N, E> = {
	src: N,
	dir: E,
	dest: N,
};

export class KruskalIter<N, E> implements IterableIterator<void> {
	edges: EdgeType<N, E>[];
	setByNode: Map<N, number>;
	nodesBySet: Map<number, N[]>;
	linkNodes: LinkFunc<N, E>;

	constructor(nodeIterator: Iterable<N>, getUndirectedEdges: AdjacencyFunc<N, E>, linkNodes: LinkFunc<N, E>) {
		this.edges = [];
		this.setByNode = new Map();
		this.nodesBySet = new Map();
		this.linkNodes = linkNodes;

		for (const node of nodeIterator) {
			const setIdx = this.setByNode.size;
			this.setByNode.set(node, setIdx);
			this.nodesBySet.set(setIdx, [ node ]);

			for (const [ dir, dest ] of getUndirectedEdges(node)) {
				this.edges.push({ src: node, dir, dest });
			}
		}

		shuffle(this.edges);
	}

	merge(leftNode: N, dir: E, rightNode: N) {
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

	canMerge(leftNode: N, rightNode: N) {
		return this.setByNode.get(leftNode) !== this.setByNode.get(rightNode);
	}

	next(): IteratorResult<void> {
		while (true) {
			if (this.edges.length === 0) return { value: undefined, done: true };
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

export function kruskal<N, E>(nodeIterator: Iterable<N>, getUndirectedEdges: AdjacencyFunc<N, E>, linkNodes: LinkFunc<N, E>,
	{ maxIterations = 0 }: { maxIterations?: number } = {}
) {
	const iter = new KruskalIter(nodeIterator, getUndirectedEdges, linkNodes);
	let maxIt = maxIterations;
	
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for (const _ of iter) {
		if (maxIt > 0) {
			if (--maxIt === 0) { throw new Error("Infinite loop detected"); }
		}
	}
}
