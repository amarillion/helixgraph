import { AdjacencyFunc, LinkFunc } from "../definitions.js";
import { pickOne } from "../random.js";

export function aldousBroder<N, E>(nodeIterator: Iterable<N>, getUndirectedEdges: AdjacencyFunc<N, E>, linkNodes: LinkFunc<N, E>,
	{ prng = Math.random }: { maxIterations?: number, prng?: () => number } = {}
) {
	const nodes = Array.isArray(nodeIterator) ? nodeIterator : [ ...nodeIterator ];
	let unvisited = nodes.length - 1;
	let current = pickOne(nodes, prng);
	const linked = new Set<N>([ current ]);

	while (unvisited > 0) {
		const [ edge, neighbor ] = pickOne([ ...getUndirectedEdges(current) ], prng);

		if (!linked.has(neighbor)) {
			linkNodes(current, edge, neighbor);
			linked.add(neighbor);
			unvisited -= 1;
		}

		current = neighbor;
	}
}
