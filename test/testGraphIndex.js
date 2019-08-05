import test from 'ava';
import { LINEAR, TWO_ROUTES } from './helper/graphData.js';
import { indexGraph, FORWARD, REVERSE } from '../src/algorithm.js';

test('linear graph index', t => {
	const graph = indexGraph(LINEAR);	
	t.deepEqual (graph.edgesByNode, {
		'A': [ [ 'A-B', FORWARD, 'B'] ],
		'B': [ [ 'A-B', REVERSE, 'A'] ]
	});
});

test('two-route graph index', t => {
	const graph = indexGraph(TWO_ROUTES);
	t.deepEqual (graph.edgesByNode, {
		'A': [ [ 'A-B', FORWARD, 'B'], [ 'C-A', REVERSE, 'C'] ],
		'B': [ [ 'A-B', REVERSE, 'A'], [ 'B-C', FORWARD, 'C'] ],
		'C': [ [ 'B-C', REVERSE, 'B'], [ 'C-A', FORWARD, 'A'] ]
	});
});
