import { AdjacencyFunc, LinkFunc } from "../definitions.js";
import { pickOne } from "../random.js";

export class AldousBroderIter<N, E> implements IterableIterator<void> {

	private nodes: N[];
	private unvisited: number;
	private current: N;
	private linked : Set<N>;
	private linkNodes: LinkFunc<N, E>;
	private getUndirectedEdges: AdjacencyFunc<N, E>;
	private prng: () => number;

	constructor(
		nodeIterator: Iterable<N>,
		getUndirectedEdges: AdjacencyFunc<N, E>,
		linkNodes: LinkFunc<N, E>,
		{ prng = Math.random }: { /* maxIterations?: number, */ prng?: () => number } = {}
	) {
		this.nodes = Array.isArray(nodeIterator) ? nodeIterator : [ ...nodeIterator ];
		this.unvisited = this.nodes.length - 1;
		this.current = pickOne(this.nodes, prng);
		this.linked = new Set<N>([ this.current ]);

		this.linkNodes = linkNodes;
		this.getUndirectedEdges = getUndirectedEdges;
		this.prng = prng;
	}

	next(): IteratorResult<void> {
		if (this.unvisited <= 0) { return { done: true, value: undefined }; }

		const [ edge, neighbor ] = pickOne([ ...this.getUndirectedEdges(this.current) ], this.prng);

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

export function aldousBroder<N, E>(
	nodeIterator: Iterable<N>,
	getUndirectedEdges: AdjacencyFunc<N, E>,
	linkNodes: LinkFunc<N, E>,
	{ prng = Math.random }: { /* maxIterations?: number, */ prng?: () => number } = {}
) {
	const iter = new AldousBroderIter(nodeIterator, getUndirectedEdges, linkNodes, { prng });
	
	for (const _ of iter) {
		/* pass */
	}
}
