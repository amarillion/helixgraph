# Maze generation

Think of this simple graph on a grid:

![A dense graph on a grid](./grid.png)

If we take away a few edges, it becomes more interesting, reminiscent of a maze:

![A graph that looks like a maze](./maze.png)

You could think of the process of making a maze as the transformation of one, densely connected graph into another, sparser graph. The input graph contains all *possible* paths you can take between cells. The output graph contains a random selection of edges, as few as possible, so that each node is *just* reachable. In the graph algorithm world, this is called a [minimum spanning tree](https://en.wikipedia.org/wiki/Minimum_spanning_tree).

If you want to know more, I highly recommend [Mazes for programmers](http://www.mazesforprogrammers.com/)

Helixgraph currently contains the following maze generation algorithms:

* **Recursive backtracker**: Starts from a random walk, and backtracks if it gets stuck, until the entire maze is filled. Produces mazes with nice windy paths with few long dead ends. 
* **(Random) Kruskal's algorithm**: Assigns each node to its own set, then merge sets randomly until we end up with a perfect maze. Currently only the *random* variant of Kruskal's algorithm is implemented. Produces mazes with lots of short dead ends.
* **Prim's algorithm**: From the starting point, picks the edge with the lowest weight and adds the next edge to the open set. Variants of prim are possible based on how the next edge is picked in case there are ties. The LAST_ADDED_* variants look more like recursive backtracker, the RANDOM_* variant looks more like Kruskal. The weighting function can be used to give the generated maze a certain bias.

## Code example: generate a random maze

Here is how you may use one of these algorithms to generate a maze:

Here are some key bits of code to generate a 10x10 maze. For full source code, see [maze.js](../examples/maze/main.js)

```js
const linkCells = (src, dir, dest) => { src.link(dest, dir, reverse[dir]); };
const cellFactory = (x, y) => new Cell(x, y);

const grid = new BaseGrid(10, 10, cellFactory);

// generate maze
recursiveBackTracker(
	
	grid.randomCell(), // start seed
	
	// getAdjacent defines the input graph
	n => grid.getAdjacent(n),  
	
	// linkCells is called for each edge that we choose to keep in the output graph
	// we can modify the existing grid structure, or copy to a new graph structure
	linkCells);
```