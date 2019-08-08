import test from "ava";
import { optimalDirections } from "../src/assignDirections.js";
import { LINEAR, ALTERNATING_AXIS, TWO_CYCLES, CYCLICAL, CYCLICAL_4SS, LINEAR_AXIS, LOCAL_MINIMUM } from "./helper/graphData";

test("solve simple source->sink", t => {
	const solution = optimalDirections(LINEAR);
	t.is(solution.contestedEdges.length, 0);
});

test("solve straightforward axis with source/sinks on opposite ends", t => {
	const solution = optimalDirections(LINEAR_AXIS);
	t.is(solution.contestedEdges.length, 0);
});

test("solve axis with alternating source/sink, with contested edge", t => {
	const solution = optimalDirections(ALTERNATING_AXIS);
	t.is(solution.contestedEdges.length, 1);
	t.deepEqual(solution.contestedEdges, ["C-D"] );
});

test("solve simple cyclical network with two possible solutions", t => {
	const solution = optimalDirections(CYCLICAL);
	t.is(solution.contestedEdges.length, 0);
});

test("solve larger cyclical network with one optimal solution", t => {
	const solution = optimalDirections(CYCLICAL_4SS);
	t.is(solution.contestedEdges.length, 0);
});

test("solve network with two cycles", t => {
	const solution = optimalDirections(TWO_CYCLES);
	t.is(solution.contestedEdges.length, 0);
});

test("solve network with number of contested edges going up", t => {
	const solution = optimalDirections(LOCAL_MINIMUM);
	t.is(solution.contestedEdges.length, 0);
});