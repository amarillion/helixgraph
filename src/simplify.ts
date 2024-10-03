import { AdjacencyFunc, PredicateFunc } from "./definitions.js";
import { mmArrayPush } from "./multimap.js";

/**
 * @param {*} source a starting node, typically one of the possible source nodes.
 * @param {*} isSource a function to determine if a given node is a source
 * @param {*} isSink a function to determine if a given node is a sink
 * @param {*} getAdjacent function that for given node, returns array [ edge, node ] pairs
 *
 * @result a structure containing:
 *  getWeight, getLeft, getRight, isSoure, isSink and getAdjacent functions,
 *  as well as the data for those functions.
 */
export function simplify<N, E>(source: N, isSource: PredicateFunc<N>, isSink: PredicateFunc<N>, getAdjacent: AdjacencyFunc<N, E>) {
	type ChainType = { edgeChain: E[], nodeChain: N[] };
		
	function followEdge(source: N, edge: E, next: N, visited: Set<N>) {
		const forwardChain: ChainType = {
			edgeChain: [ edge ],
			nodeChain: [ source ],
		};
		const reverseChain: ChainType = {
			edgeChain: [],
			nodeChain: [],
		};
	
		let prev = source;
		let current = next;
	
		while (true) {
			if (visited.has(current)) {
				// discarded because this path has already been visited
				return [ null, null ];
			}
	
			let reverseStep = null;
			const nonReverseSteps = [];
			for (const step of getAdjacent(current)) {
				if (step[1] === prev) {
					reverseStep = step;
					// NB we discard any double reverse Steps
				}
				else {
					nonReverseSteps.push(step);
				}
			}
	
			const degree = nonReverseSteps.length + 1;
			const isKeyNode = isSource(current) ||
				isSink(current) ||
				degree > 2;
	
			if (isKeyNode) {
				// chain ends
				// final reverse step
				reverseChain.edgeChain.unshift(reverseStep[0]);
				reverseChain.nodeChain.unshift(current);
				
				return [ { nodeChain: forwardChain.nodeChain,
					edgeChain: forwardChain.edgeChain,
					left: source,
					right: current,
					weight: forwardChain.edgeChain.length
				}, {
					nodeChain: reverseChain.nodeChain,
					edgeChain: reverseChain.edgeChain,
					left: current,
					right: source,
					weight: reverseChain.edgeChain.length
				} ];
			}
			else if (degree === 1) {
				// dead end
				return [ null, null ];
			}
			else {
				// degree must be 2. nonReverseStep length must be 1.
				visited.add(current);
				const forwardStep = nonReverseSteps[0];
				forwardChain.edgeChain.push(forwardStep[0]);
				forwardChain.nodeChain.push(current);
				reverseChain.edgeChain.unshift(reverseStep[0]);
				reverseChain.nodeChain.unshift(current);
				prev = current;
				current = forwardStep[1];
			}
		}
	}
	
	type NewEdgeType = ChainType & {
		right: N,
		left: N,
		weight: number,
	};

	const result: {
		getWeight: (e: NewEdgeType) => number,
		getLeft: (e: NewEdgeType) => N,
		getRight: (e: NewEdgeType) => N,
		isSource: PredicateFunc<N>,
		isSink: PredicateFunc<N>,
		edgesByNode: Map<N, [[ NewEdgeType, N ]]>,
		getAdjacent: AdjacencyFunc<N, NewEdgeType>,
		sources: N[],
		sinks: N[],
		nodes: N[],
		
	} = {
		getWeight: (e: NewEdgeType) => e.weight,
		getLeft: (e: NewEdgeType) => e.left,
		getRight: (e: NewEdgeType) => e.right,
		isSource: isSource,
		isSink: isSink,
		sources: [],
		sinks: [],
		nodes: [],
		edgesByNode: new Map<N, [[ NewEdgeType, N ]]>(),
		getAdjacent: function*(node: N) {
			const edges = result.edgesByNode.get(node) || [];
			for (const edge of edges) { yield edge; } // TODO: test
		}
	};

	const visited = new Set<N>();
	const keyNodes = new Set<N>();
	const open = [];
	open.push(source);
	keyNodes.add(source);
	while (open.length > 0) {
		const current = open.shift();
		if (visited.has(current)) continue;
		
		if (isSource(current)) {
			result.sources.push(current);
		}
		if (isSink(current)) {
			result.sinks.push(current);
		}
		
		visited.add(current);

		// console.log ("Opening node", { current });
		for (const [ edge, dest ] of getAdjacent(current)) {
			// console.log ("  Checking adjacent node", { edge, dest });
			const chains = followEdge(current, edge, dest, visited);
			const [ forwardEdge, reverseEdge ] = chains;

			if (forwardEdge && reverseEdge) {
				// console.log ("  Adding new edge and node", { node: newEdge.right, edge: newEdge });

				mmArrayPush (result.edgesByNode, forwardEdge.left, [ forwardEdge, forwardEdge.right ]);
				mmArrayPush (result.edgesByNode, reverseEdge.left, [ reverseEdge, reverseEdge.right ]);

				if (!visited.has(forwardEdge.right)) {
					keyNodes.add(forwardEdge.right);
					open.push(forwardEdge.right);
				}
			}
		}
	}
	result.nodes = [ ...keyNodes.keys() ];
	return result;
}

/**
 *
 * Given a path of edges as returned by trackbackEdges from a simplified graph
 * Concatenate the edgeChains of each simplified edge
 * Reverse the edgeChains when necessary.
 */
export function flattenPath<E>(path: { edgeChain: E }[]) {
	return path.reduce(
		(acc, e) => acc.concat(e.edgeChain),
		[]);
}
