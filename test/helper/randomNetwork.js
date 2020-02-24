import { randomInt } from "../../src/random.js";

// size is number of nodes
// edgeRedundancy is a factor, larger than 1, that determines the number of edges
// relative to size.

export function randomNetwork(size, edgeRedundancy, numSources, numSinks) {
	
	const nodes = [];
	const edges = new Set();
	const sources = new Set();
	const sinks = new Set();

	let startNodeId = 1000;
	
	const newNode = () => {
		const result = startNodeId;
		// generate root node;
		nodes.push(startNodeId++);
		return result;
	};

	const newEdge = (left, right) => {
		const result = `${left}-${right}`;
		edges.add(result);
		return result;
	};

	const pickRandomNode = () => {
		const r = randomInt(nodes.length);
		return nodes[r];
	};

	// start with generating root
	newNode();

	for (let i = 0; i < size; ++i) {
		// grab random existing node and form edge
		const y = pickRandomNode();
		// generate a node
		const x = newNode();
		newEdge(x, y);
	}

	for (let i = 0; i < (size * (edgeRedundancy - 1.0)); ++i) {
		const x = pickRandomNode();
		let y;
		do {
			y = pickRandomNode();
		} while (x === y);

		newEdge(x, y);
	}

	// add sources & sinks
	// make sure they are both on nodes with degree=1
	for (let i = 0; i < numSources; ++i) {
		const y = pickRandomNode();
		const x = newNode();
		newEdge(x, y);
		sources.add(x);
	}

	// idem for sinks
	for (let i = 0; i < numSinks; ++i) {
		const y = pickRandomNode();
		const x = newNode();
		newEdge(x, y);
		sinks.add(x);
	}

	return {
		nodes,
		edges,
		getWeight: () => 1,
		getLeft: (e) => +(e.split("-")[0]),
		getRight: (e) => +(e.split("-")[1]),
		isSource: (n) => sources.has(n),
		isSink: (n) => sinks.has(n),
	};
}