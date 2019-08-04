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
	console.log(solution);
	t.is(solution.contestedEdges.length, 0);
});

test('impossible', t => {

	const graph = {
		nodes: [ 'A', 'B', 'C', 'D', 'E', 'F' ],
		edges: [ ['A', 'C'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['D', 'F'] ],
		sources: [ 'A', 'E' ],
		sinks: [ 'B', 'F' ]
	}
	const solution = optimalDirections(graph);
	console.log(solution);
	t.is(solution.contestedEdges.length, 1);
	t.is(solution.contestedEdges[0], ['C', 'D'] );
});