import test from 'ava';
import { indexGraph, shortestPathsFromSource, FORWARD, REVERSE } from "../src/algorithm";
import { LINEAR, ALTERNATING } from './helper/graphData';

test('simple dijkstra', t => {
	const graph = indexGraph(LINEAR);
	const paths = shortestPathsFromSource('A', graph.sinks, graph, new Map());
	
	t.deepEqual (paths, [
				[ { edge: 'A-B', dir: FORWARD } ]
			]);
});

test('impossible dijkstra', t => {
	const graph = indexGraph(ALTERNATING);
	let paths = shortestPathsFromSource('B', graph.sinks, graph, new Map());
	t.deepEqual (paths, [
		[ { edge: 'B-C', dir: FORWARD }, { edge: 'A-C', dir: REVERSE } ],
		[ { edge: 'B-C', dir: FORWARD }, { edge: 'C-D', dir: FORWARD }, { edge: 'D-E', dir: FORWARD } ],
	]);
	paths = shortestPathsFromSource('F', graph.sinks, graph, new Map());
	t.deepEqual (paths, [
		[ { edge: 'D-F', dir: REVERSE }, { edge: 'C-D', dir: REVERSE }, { edge: 'A-C', dir: REVERSE } ],
		[ { edge: 'D-F', dir: REVERSE }, { edge: 'D-E', dir: FORWARD } ]
	]);
});