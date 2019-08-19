import test from "ava";
import { LINEAR_AXIS } from "./helper/graphData";
import { indexGraph, REVERSE, FORWARD, constrainedNeighborFunc } from "../src/assignDirections";
import { edgeBetween } from "../src/algorithm";


test ("constrained neighbor func", t => {

	const graph = indexGraph(LINEAR_AXIS);

	t.deepEqual (graph.getNeighbors("C"), [ 
		[ { parent: "A-C", dir: REVERSE }, "A" ], 
		[ { parent: "B-C", dir: REVERSE }, "B" ], 
		[ { parent: "C-D", dir: FORWARD }, "D" ] 
	]);

	t.deepEqual (graph.getNeighbors("D"), [ 
		[ { parent: "C-D", dir: REVERSE }, "C" ], 
		[ { parent: "D-E", dir: FORWARD }, "E" ], 
		[ { parent: "D-F", dir: FORWARD }, "F" ], 
	]);

	const edgeConstraints = new Set().add(edgeBetween(graph.getNeighbors, "C", "D"));
	const neighborFunc = constrainedNeighborFunc(graph.getNeighbors, edgeConstraints);

	// C now has one less neighbor edge
	t.deepEqual (neighborFunc("C"), [ 
		[ { parent: "A-C", dir: REVERSE }, "A" ], 
		[ { parent: "B-C", dir: REVERSE }, "B" ], 
	]);

	// D remains the same
	t.deepEqual (neighborFunc("D"), [ 
		[ { parent: "C-D", dir: REVERSE }, "C" ], 
		[ { parent: "D-E", dir: FORWARD }, "E" ], 
		[ { parent: "D-F", dir: FORWARD }, "F" ], 
	]);

});