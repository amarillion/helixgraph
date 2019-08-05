import test from 'ava';
import { indexGraph, shortedPathsFromSource, FORWARD, REVERSE } from "../src/algorithm";
import { LINEAR, ALTERNATING } from './helper/graphData';

test('simple dijkstra', t => {
	const graph = LINEAR;
	const indexedGraph = indexGraph(graph);
	const paths = shortedPathsFromSource('A', indexedGraph, new Map());
	
	const edges = graph.edges;
	t.deepEqual (paths, [
				[ { edge: edges[0], dir: FORWARD } ]
			]);
});

test('impossible dijkstra', t => {

	const graph = ALTERNATING;	
	const indexedGraph = indexGraph(graph);
	let paths = shortedPathsFromSource('B', indexedGraph, new Map());
	const edges = graph.edges;
	t.deepEqual (paths, [
		[ { edge: edges[1], dir: FORWARD }, { edge: edges[0], dir: REVERSE } ],
		[ { edge: edges[1], dir: FORWARD }, { edge: edges[2], dir: FORWARD }, { edge: edges[3], dir: FORWARD } ],
	]);
	paths = shortedPathsFromSource('F', indexedGraph, new Map());
	t.deepEqual (paths, [
		[ { edge: edges[4], dir: REVERSE }, { edge: edges[2], dir: REVERSE }, { edge: edges[0], dir: REVERSE } ],
		[ { edge: edges[4], dir: REVERSE }, { edge: edges[3], dir: FORWARD } ]
	]);
});