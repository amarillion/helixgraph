import test from 'ava';
import { indexGraph, dijkstra, FORWARD, REVERSE } from "../src/algorithm";

test('simple dijkstra', t => {
	const graph = {
		nodes: [ 'A', 'B' ],
		edges: [ ['A', 'B'] ],
		sources: [ 'A' ],
		sinks: [ 'B' ]
	}
	const indexedGraph = indexGraph(graph);
	const paths = dijkstra('A', indexedGraph, new Map());
	
	const edges = graph.edges;
	t.deepEqual (paths, [
				[ { edge: edges[0], dir: FORWARD } ]
			]);
});

test('impossible dijkstra', t => {

	const graph = {
		nodes: [ 'A', 'B', 'C', 'D', 'E', 'F' ],
		edges: [ ['A', 'C'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['D', 'F'] ],
		sources: [ 'B', 'F' ],
		sinks: [ 'A', 'E' ]
	}
	const indexedGraph = indexGraph(graph);
	let paths = dijkstra('B', indexedGraph, new Map());
	const edges = graph.edges;
	t.deepEqual (paths, [
		[ { edge: edges[1], dir: FORWARD }, { edge: edges[2], dir: FORWARD }, { edge: edges[3], dir: FORWARD } ],
		[ { edge: edges[1], dir: FORWARD }, { edge: edges[0], dir: REVERSE } ]
	]);
	paths = dijkstra('F', indexedGraph, new Map());
	t.deepEqual (paths, [
		[ { edge: edges[4], dir: REVERSE }, { edge: edges[2], dir: REVERSE }, { edge: edges[0], dir: REVERSE } ],
		[ { edge: edges[4], dir: REVERSE }, { edge: edges[3], dir: FORWARD } ]
	]);
});