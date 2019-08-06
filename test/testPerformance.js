import test from 'ava';
import { randomNetwork } from './helper/randomNetwork';
import { optimalDirections } from '../src/algorithm';

// test('test random network', t => {
	
// 	const graphData = randomNetwork(10, 2.5, 3, 3);
// 	console.log({graphData});

// 	for (const edge of graphData.edges) {
// 		console.log ({ edge, left: graphData.getLeft(edge), right: graphData.getRight(edge), weight: graphData.getWeight(edge)});
// 	}
// 	for (const node of graphData.nodes) {
// 		console.log ({ node, isSource: graphData.isSource(node), isSink: graphData.isSink(node)});
// 	}

// });

test('performance', t => {

	for (let numNodes of [10, 20, 40, 80, 160, 320]) {

		// generate network
		const graphData = randomNetwork(numNodes, 2.5, numNodes / 10, numNodes / 10);

		// time solution
		const start = new Date().getTime();
		const solution = optimalDirections(graphData);	
		const end = new Date().getTime();

		console.log(numNodes, end - start, solution.contestedEdges.length);

		t.pass();
	};

	
});