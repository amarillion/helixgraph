import test from 'ava';
import { optimalDirections } from '../src/algorithm';
import { LINEAR, ALTERNATING } from './helper/graphData';

test('simple', t => {
	const solution = optimalDirections(LINEAR);
	t.is(solution.contestedEdges.length, 0);
});

test('impossible', t => {
	const solution = optimalDirections(ALTERNATING);
	t.is(solution.contestedEdges.length, 1);
	t.deepEqual(solution.contestedEdges, ['C-D'] );
});