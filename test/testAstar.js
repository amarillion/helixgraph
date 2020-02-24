import test from "ava";
import { GridGraph, MAP, reverse, NORTH, EAST, SOUTH, WEST } from "./helper/gridGraph";
import { astar, breadthFirstSearch, trackback, trackbackEdges } from "../src/algorithm";

const chars = {
	[NORTH]: "^",
	[EAST] : ">",
	[SOUTH]: "v",
	[WEST] : "<",
};

test("astar on a grid", t => {
	
	const graph = GridGraph.fromMask(MAP);

	const source = graph.get(0, 0);
	const dest = graph.get(19,6);

	const manhattan = (x1, y1, x2, y2) => Math.abs(x2 - x1) + Math.abs(y2 - y1);

	const { /* dist, */ prev } = astar(source, dest, 
		(node) => graph.getAdjacent(node), 
		() => graph.getWeight(), 
		(node, goal) => 1.01 * manhattan(node.x, node.y, goal.x, goal.y)
	);
	// const { dist, prev } = breadthFirstSearch(source, [ dest ], (node) => graph.getAdjacent(node));

	for (const [k, v] of prev.entries()) {		
		k.tile = chars[v.edge];
	}

	console.log("\n\n" + graph.toString());

	const path = trackbackEdges(source, dest, prev);
	
	const E = EAST;
	const S = SOUTH;
	t.deepEqual(path, [ E, E, E, E, E, E, E, E, E, E, E, 
		S, S, S, S, S, S, 
		E, E, E, E, E, E, E, E
	]);
});


test("use bfs distance map for astar heuristic", t => {
	
	const graph = GridGraph.fromMask(MAP);

	const source = graph.get(0, 0);
	const dest = graph.get(19,6);

	const { dist: bsdDist } = breadthFirstSearch(source, [ dest ], (node) => graph.getAdjacent(node));

	const { prev } = astar(dest, source, 
		(node) => graph.getAdjacent(node), 
		() => 1, 
		(node /*, goal */) => bsdDist.get(node)
	);

	console.log("\n\n" + graph.toString());

	for (const [k, v] of prev.entries()) {	
		k.tile = chars[v.edge];
	}

	console.log("\n\n" + graph.toString());

	const path = [];
	const isValid = trackback (dest, source, prev, (from, edge /* , to */ ) => {
		path.push( reverse[edge] );
	});
	
	const E = EAST;
	const S = SOUTH;
	t.deepEqual(path, [ E, E, E, E, E, E, E,
		S, S, S, S,
		E,
		S,
		E, E, E, 
		S, 
		E, E, E, E, E, E, E, E
	]);
	t.true(isValid);

});