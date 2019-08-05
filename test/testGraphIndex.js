import test from 'ava';
import { LINEAR, CYCLICAL } from './helper/graphData.js';
import { indexGraph, FORWARD, REVERSE } from '../src/algorithm.js';

test('simple graph index', t => {
	const graph = LINEAR;
	const indexedGraph = indexGraph(graph);
	
	const edges = indexedGraph.edges;
	t.deepEqual (indexedGraph.edgesByNode, {
		'A': [ [ edges[0], FORWARD, 'B'] ],
		'B': [ [ edges[0], REVERSE, 'A'] ]
	});
});

test('cyclical graph index', t => {
	const graph = CYCLICAL;
	const indexedGraph = indexGraph(graph);
	
	const edges = indexedGraph.edges;
	t.deepEqual (indexedGraph.edgesByNode, {
		'A': [ [ edges[0], FORWARD, 'B'], [ edges[2], REVERSE, 'C'] ],
		'B': [ [ edges[0], REVERSE, 'A'], [ edges[1], FORWARD, 'C'] ],
		'C': [ [ edges[1], REVERSE, 'B'], [ edges[2], FORWARD, 'A'] ]
	});
});
