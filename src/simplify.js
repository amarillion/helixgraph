import { indexGraph, FORWARD, REVERSE } from "./assignDirections";

function followEdge(source, edge, dest, graph, visited) {
	const edgeChain = [edge];
	const nodeChain = [source];
	let current =  dest;

	while (true) {
		if (visited.has(current)) {
			// console.log("  - discarded because current node is already visited");
			return null;
		}
		
		const degree = graph.getNeighbors(current).length; 
		const isKeyNode = graph.isSource(current) || 
				graph.isSink(current) || 
				degree > 2;

		if (isKeyNode) {
			// chain ends
			return { nodeChain, 
				edgeChain, 
				left: source,
				right: current,
				weight: edgeChain.length 
			};
		}
		else if (degree === 1) {
			// console.log("  - discarded because it is a dead end");
			// dead end
			return null;
		}
		else {
			visited.add(current);
			
			// continue chain
			const nextStep = graph.getNeighbors(current).find( 
				(step) => !visited.has(step[1])
			);
			const next = nextStep[1];
			edgeChain.push(nextStep[0]);
			nodeChain.push(current);
			current = next;
		}
	}
		
}

/**
 * 
 * @param {*} source a starting node, typically one of the possible source nodes.
 * @param {*} graph an indexed graph
 * 
 * @result a non-indexed graph
 */
export function simplify(source, graph) {
	
	const result = {
		getWeight: (e) => e.weight,
		getLeft: (e) => e.left,
		getRight: (e) => e.right,
		isSource: graph.isSource,
		isSink: graph.isSink,
		nodes: [],
		edges: [],
	};

	const visited = new Set();
	const keyNodes = new Set();
	const open = [];
	open.push(source);
	keyNodes.add(source);
	while (open.length > 0) {
		const current = open.shift();
		if (visited.has(current)) continue;
		visited.add(current);
		
		const neighbors = graph.getNeighbors(current);
		// console.log ("Opening node", { current });
		for (const [edge, dest] of neighbors) {
			// console.log ("  Checking neighbor", { edge, dest });
			const newEdge = followEdge(current, edge, dest, graph, visited);
			
			if (newEdge) {
				// console.log ("  Adding new edge and node", { node: newEdge.right, edge: newEdge });
				result.edges.push(newEdge);
				
				if (!visited.has(newEdge.right)) {
					keyNodes.add(newEdge.right);
					open.push(newEdge.right);
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
 * 
 */
export function flattenPath(path) {
	
	function reverseEdgeChain(edgeChain) {
		return edgeChain.map(e => ({ parent: e.parent, dir: e.dir === FORWARD ? REVERSE: FORWARD }) ).reverse();
	}

	return path.reduce(
		(acc, e) => e.dir === FORWARD ? acc.concat(e.parent.edgeChain) : acc.concat(reverseEdgeChain(e.parent.edgeChain)), 
		[] );
}