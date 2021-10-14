import { AdjacencyFunc, LinkFunc, WeightFunc } from "./definitions.js";
import { PriorityQueue } from "./PriorityQueue.js";

export function prim<N, E>(
	startNode : N, 
	getAdjacent : AdjacencyFunc<N, E>, 
	linkCells : LinkFunc<N, E>, 
	{
		maxIterations = 0,
		getWeight = () => 1,
	} : {
		maxIterations?: number,
		getWeight?: WeightFunc<N, E>
	} = {}
) {
	const collectedNodes = new Set<N>();

	// only used internally
	type EdgeType = {
		src: N;
		dir: E;
		dest: N;
		weight: number;
		tiebreaker: number;
	};

	const edgeQueue = new PriorityQueue<EdgeType>((a, b) => b.weight - a.weight || b.tiebreaker - a.tiebreaker);
	
	let tiebreakerCounter = 0;
	const collectNode = (node : N) => {
		for (const [ edge, dest ] of getAdjacent(node)) {
			
			// choice of tiebreaker determines the texture of the maze. 
			// a random tiebreaker creates a texture more like kruskal or random prim
			// a decreasing tiebreaker creates a texture more like the recursive backtracker
			edgeQueue.push({ src: node, dir: edge, dest, weight: getWeight(edge, node), tiebreaker: tiebreakerCounter-- });
		}
		collectedNodes.add(node);
	};

	collectNode(startNode);

	const canLinkTo = (destNode : N) => !collectedNodes.has(destNode); 

	let i = maxIterations;
	while(!edgeQueue.isEmpty()) {
		
		// then continue
		const { src, dir, dest } = edgeQueue.pop();

		if (canLinkTo(dest)) {
			linkCells(src, dir, dest);
			collectNode(dest);
		}

		i--; // i 0 -> -1 means infinite
		if (i === 0) break;
	}
}
