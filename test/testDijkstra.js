import test from 'ava';
import { indexGraph, shortestPathsFromSource, FORWARD, REVERSE } from "../src/algorithm";
import { LINEAR, ALTERNATING_AXIS, TWO_ROUTES } from './helper/graphData';

test('simple dijkstra', t => {
	const graph = indexGraph(LINEAR);
	const paths = shortestPathsFromSource('A', graph.sinks, graph.getNeighbors, graph.getWeight, new Map());
	
	t.deepEqual (paths, [
				[ { edge: 'A-B', dir: FORWARD } ]
			]);
});

test('no possible path dijkstra', t => {
	const graph = indexGraph(LINEAR);

	// mark A-B as a reverse directed edge, making it impossible to find a path
	const paths = shortestPathsFromSource('A', graph.sinks, graph.getNeighbors, graph.getWeight, new Map().set('A-B', REVERSE));
	t.deepEqual (paths, []);
});

test('alternating dijkstra', t => {
	const graph = indexGraph(ALTERNATING_AXIS);
	let paths = shortestPathsFromSource('B', graph.sinks, graph.getNeighbors, graph.getWeight, new Map());
	t.deepEqual (paths, [
		[ { edge: 'B-C', dir: FORWARD }, { edge: 'A-C', dir: REVERSE } ],
		[ { edge: 'B-C', dir: FORWARD }, { edge: 'C-D', dir: FORWARD }, { edge: 'D-E', dir: FORWARD } ],
	]);
	paths = shortestPathsFromSource('F', graph.sinks, graph.getNeighbors, graph.getWeight, new Map());
	t.deepEqual (paths, [
		[ { edge: 'D-F', dir: REVERSE }, { edge: 'C-D', dir: REVERSE }, { edge: 'A-C', dir: REVERSE } ],
		[ { edge: 'D-F', dir: REVERSE }, { edge: 'D-E', dir: FORWARD } ]
	]);
});

test('cyclical dijkstra with direction restrictions', t => {
	const graph = indexGraph(TWO_ROUTES);
	
	let paths = shortestPathsFromSource('A', graph.sinks, graph.getNeighbors, graph.getWeight, new Map().set('C-A', FORWARD));
	t.deepEqual (paths, [
		[ { edge: 'A-B', dir: FORWARD }, { edge: 'B-C', dir: FORWARD } ],
	]);
	paths = shortestPathsFromSource('A', graph.sinks, graph.getNeighbors, graph.getWeight, new Map().set('C-A', REVERSE));
	t.deepEqual (paths, [
		[ { edge: 'C-A', dir: REVERSE } ],
	]);

});