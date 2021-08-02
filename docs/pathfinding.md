# Path finding

Path finding is the most basic form of game AI. Nothing breaks the illusion of intelligence as an NPC getting stuck behind a simple obstruction.

Helixgraph currently provides three algorithms for path finding:
1. Breadth first search
1. Dijkstra
1. A* / A-star

Each algorithm has the exact same function signature and return data structure, so you can quickly switch from one algorithm to the other.

### BFS: Visiting all nodes in a maze or graph

''Breadth first search'' is a simple but effective algorithm. Use it if all nodes are equal (i.e. your graph is unweighted) and it's not possible to come up with a decent heuristic (see below for explanation). For example, BFS applies for arbitrary graphs that are not based on a regular grid, or for mazes (where most A* heuristics are practically useless)

Assuming you start from node `src`, want to find a path to node `dest`, and you have a suitable `getAdjacent` function as explained in the chapter on [representing graphs](./graphs.md), then you can do:

```js
import { 
	breadthFirstSearch, trackbackNodes, trackbackEdges 
} from '@amarillion/helixgraph';

let src; // source node;
let dest; // destination node;
let getAdjacent; // function defining the graph

const pathData = breadthFirstSearch(src, dest, getAdjacent);

// sequence of nodes you go through, from src to dest
const nodes = trackbackNodes(src, dest, pathData);

// sequence of edges or directions to follow, from src to dest
const edges = trackbackEdges(src, dest, pathData);
```

`pathData` is an intermediate data structure, a Map containing data for each examined node.
You can call `trackbackNodes()` or `trackBackEdges()` to turn pathData into a sequence of steps.Which of the two you use totally dependends on what is most convenient for your situation.

### Dijkstra: Finding shortest path in a weighted graph

''Dijkstra'' is like BFS, but can take into account edge weights, i.e. the cost of navigation between nodes (for example, when some parts of the terrain are hilly, or should be avoided because they are dangerous)

The only difference when it comes to invoking dijkstra, is that you have to supply a getWeight() function. If you omit this, then each edge will get the default weight of 1, making the result indistinguishable from breadthFirstSearch.

```js
import { 
	dijkstra, trackbackNodes, trackbackEdges 
} from '@amarillion/helixgraph';

let src; // source node;
let dest; // destination node;
let getAdjacent; // function defining the graph

const pathData = dijkstra(src, dest, getAdjacent, {
	getWeight: (edge, node) => { /* calculate or obtain weight here */ }
});

// sequence of nodes you go through, from src to dest
const nodes = trackbackNodes(src, dest, pathData);

// sequence of edges or directions to follow, from src to dest
const edges = trackbackEdges(src, dest, pathData);
```

### Astar: Finding shortest path in a grid or tilemap

* ''A*'' is like Dijkstra, but uses a 'heuristic' to optimize searching. The heuristic encodes a 'gut feeling' for which direction the path most likely will go. This makes A* much more efficient for open spaces in regular grids. Think, for example, of the terrain of a real-time strategy game. The shortest path could wind around, visiting all the corners of the map. But more likely than not, the route to the enemy base is in a relatively straight line, perhaps circumnavigating a few trees or rocks. In that situation, it would be a waste of computing time to do an exhaustive search of all corners of the map.

You have to supply A* with a heuristic: a function that does a best-case-scenario estimation of the cost of moving from a given node to the destination. The algorithm will prefer to investigate nodes with a low cost, i.e. ones that are close to the destination already.

For more extensive explanation of A*, and all the possible heuristics, have a look at [Amit's A* pages](http://theory.stanford.edu/~amitp/GameProgramming/)

A simple solution is to use the pythagoras formula. In these examples, each node are an object with an x, y propery. You can use a different method to represent the position of each node, you'll have to adapt the examples to your situation.

```js
// in this example, we encode the position of a node using x, y properties
const dest = { x: ..., y: ... }
function pythagoras(node) {
	delta = { x: node.x - dest.x, y: node.y - dest.y };
	return Math.sqrt(delta.x * delta.x + delta.y * delta.y);
}
```

The full example is thus:

```js

	let src; // source node;
	let dest; // destination node;
	let getAdjacent; // function defining the graph

	const pathData = dijkstra(src, dest, getAdjacent, {
		 // For simple flat maps, it's ok to use unit weights. This is actually the default.
		getWeight: () => 1,
		getHeuristic: pythagoras
	});

	// sequence of nodes you go through, from src to dest
	const nodes = trackbackNodes(src, dest, pathData);

	// sequence of edges or directions to follow, from src to dest
	const edges = trackbackEdges(src, dest, pathData);
```
