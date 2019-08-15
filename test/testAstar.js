import test from "ava";
import { GridGraph, MAP } from "./helper/gridGraph";
import { astar, breadthFirstSearch, trackback, trackbackEdges } from "../src/algorithm";

test("astar on a grid", t => {
	
	const graph = new GridGraph(MAP);

	const source = graph.getNodeAt(0, 0);
	const dest = graph.getNodeAt(19,6);

	const manhattan = (x1, y1, x2, y2) => Math.abs(x2 - x1) + Math.abs(y2 - y1);

	const { /* dist, */ prev } = astar(source, dest, 
		(node) => graph.getNeighbors(node), 
		(edge) => graph.getWeight(edge), 
		(node, goal) => 1.01 * manhattan(graph.getx(node), graph.gety(node), graph.getx(goal), graph.gety(goal))
	);
	// const { dist, prev } = breadthFirstSearch(source, [ dest ], (node) => graph.getNeighbors(node));

	for (const [k, v] of prev.entries()) {
		
		const chars = {
			0: "^",
			1: ">",
			2: "v",
			3: "<",
		};
		
		graph.setTile(graph.getx(k), graph.gety(k), chars[v.edge]);
	}

	console.log("\n\n" + graph.toString());

	const path = trackbackEdges(source, dest, prev);
	
	t.deepEqual(path, [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
		2, 2, 2, 2, 2, 2, 
		1, 1, 1, 1, 1, 1, 1, 1
	]);
});


test("use bfs distance map for astar heuristic", t => {
	
	const graph = new GridGraph(MAP);

	const source = graph.getNodeAt(0, 0);
	const dest = graph.getNodeAt(19,6);

	const { dist: bsdDist } = breadthFirstSearch(source, [ dest ], (node) => graph.getNeighbors(node));

	const { prev } = astar(dest, source, 
		(node) => graph.getNeighbors(node), 
		() => 1, 
		(node /*, goal */) => bsdDist.get(node)
	);

	console.log("\n\n" + graph.toString());

	for (const [k, v] of prev.entries()) {
		
		const chars = {
			0: "^",
			1: ">",
			2: "v",
			3: "<",
		};
		
		graph.setTile(graph.getx(k), graph.gety(k), chars[v.edge]);
	}

	console.log("\n\n" + graph.toString());

	const path = [];
	const isValid = trackback (dest, source, prev, (from, edge /* , to */ ) => {
		const INVERSE = {
			0: 2,
			1: 3,
			2: 0,
			3: 1
		};
		path.push( INVERSE[edge] );
	});
	
	t.deepEqual(path, [ 1, 1, 1, 1, 1, 1, 1, 
		2, 2, 2, 2, 
		1,
		2,
		1, 1, 1, 
		2, 
		1, 1, 1, 1, 1, 1, 1, 1
	]);
	t.true(isValid);

});