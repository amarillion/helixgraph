import { AdjacencyFunc, PredicateFunc } from "./definitions.js";
import { mmArrayPush } from "./multimap.js";

function followEdge(source, edge, next, isSource, isSink, getAdjacent, visited) {
	const forwardChain = {
		edgeChain: [edge],
		nodeChain: [source],
	};
	const reverseChain = {
		edgeChain: [],
		nodeChain: [],
	};

	let prev = source;
	let current =  next;

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
			
			return [{ nodeChain: forwardChain.nodeChain, 
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
			}];
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

/**
 * @param {*} source a starting node, typically one of the possible source nodes.
 * @param {*} isSource a function to determine if a given node is a source
 * @param {*} isSink a function to determine if a given node is a sink
 * @param {*} getAdjacent function that for given node, returns array [ edge, node ] pairs
 * 
 * @result a structure containing: 
 * 	getWeight, getLeft, getRight, isSoure, isSink and getAdjacent functions,
 *  as well as the data for those functions.
 */
export function simplify<N, E>(source: N, isSource: PredicateFunc<N>, isSink : PredicateFunc<N>, getAdjacent : AdjacencyFunc<N, E>) {
	
	const result = {
		getWeight: (e) => e.weight,
		getLeft: (e) => e.left,
		getRight: (e) => e.right,
		isSource: isSource,
		isSink: isSink,
		sources: [],
		sinks: [],
		nodes: [],
		edgesByNode: new Map(),
		getAdjacent: function(node) {
			return result.edgesByNode.get(node) || [];
		}
	}

	const visited = new Set();
	const keyNodes = new Set();
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
		for (const [edge, dest] of getAdjacent(current)) {
			// console.log ("  Checking adjacent node", { edge, dest });
			const chains = followEdge(current, edge, dest, isSource, isSink, getAdjacent, visited);
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
export function flattenPath(path) {
	return path.reduce(
		(acc, e) => acc.concat(e.edgeChain), 
		[] );
}