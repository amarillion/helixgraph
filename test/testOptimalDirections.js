import test from 'ava';
import { optimalDirections } from '../src/algorithm';
import { LINEAR, ALTERNATING } from './helper/graphData';

test('simple', t => {
	const graph = LINEAR;
	const solution = optimalDirections(graph);
	t.is(solution.contestedEdges.length, 0);
});

test('impossible', t => {

	const graph = ALTERNATING;
	const solution = optimalDirections(graph);
	t.is(solution.contestedEdges.length, 1);
	t.deepEqual(solution.contestedEdges[0], ['C', 'D'] );
});