import test from 'ava';
import { optimalDirections } from '../src/algorithm';

test('simple', t => {
	const graph = {
		nodes: [ 'A', 'B' ],
		edges: [ ['A', 'B'] ],
		sources: [ 'A' ],
		sinks: [ 'B' ]
	}
	const solution = optimalDirections(graph);
	t.is(solution.contestedEdges.length, 0);
});

test('impossible', t => {

	const graph = {
		nodes: [ 'A', 'B', 'C', 'D', 'E', 'F' ],
		edges: [ ['A', 'C'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['D', 'F'] ],
		sources: [ 'B', 'F' ],
		sinks: [ 'A', 'E' ]
	}
	const solution = optimalDirections(graph);
	t.is(solution.contestedEdges.length, 1);
	t.deepEqual(solution.contestedEdges[0], ['C', 'D'] );
});