# helixgraph

An library of path finding & graph algorithms for game development, for JavaScript ES6

This library includes

* path finding algorithms such as A*, dijkstra, and breadth-first-search
* a random maze generation algorithm

The algorithms are suitable for tilemaps, regular grids, as well as (non-regular) graphs.

## Installation

  `npm install @amarillion/helixgraph`

## Live demo

Play with the [live examples](https://amarillion.github.io/helixgraph/)  
Source code for all examples is [on github](https://github.com/amarillion/helixgraph/tree/master/examples).

## Documentation

* [Chapter 1: How to represent graphs in JavaScript](./docs/graphs.md)
  
  Helixgraph's way of representing graphs is flexible, can be easily mixed with existing code, and can be used to represent all kinds of graphs: directed, undirected, sparse, dense, etc.

* [Chapter 2: Path finding algorithms](./docs/pathfinding.md)
  
  This section explains the use of three path finding algorithms: breadth first search, dijkstra, and A*

* [Chapter 3: Maze generation algorithms](./docs/mazes.md)
  
  Mazes are a type of graph, helixgraph includes a set of algorithms for procedural generation of mazes (which can then be solved again them using the algorithm of chapter 2).

## Source

Source code: https://github.com/amarillion/helixgraph/  
License: [MIT](./LICENSE)