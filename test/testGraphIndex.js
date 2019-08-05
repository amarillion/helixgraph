import test from 'ava';
import { LINEAR, CYCLICAL } from './helper/graphData.js';
import { indexGraph, FORWARD, REVERSE } from '../src/algorithm.js';

test('simple graph index', t => {
	const graph = indexGraph(LINEAR);	
	t.deepEqual (graph.edgesByNode, {
		'A': [ [ 'A-B', FORWARD, 'B'] ],
		'B': [ [ 'A-B', REVERSE, 'A'] ]
	});
});

test('cyclical graph index', t => {
	const graph = indexGraph(CYCLICAL);	
	t.deepEqual (graph.edgesByNode, {
		'A': [ [ 'A-B', FORWARD, 'B'], [ 'C-A', REVERSE, 'C'] ],
		'B': [ [ 'A-B', REVERSE, 'A'], [ 'B-C', FORWARD, 'C'] ],
		'C': [ [ 'B-C', REVERSE, 'B'], [ 'C-A', FORWARD, 'A'] ]
	});
});
