# helixgraph

A collection of path finding & graph algorithms for game development

This library includes

* path finding algorithms such as A*, dijkstra, and breadth-first-search
* a random maze generation algorithm

The algorithms are suitable for tilemaps, regular grids, as well as (non-regular) graphs.

# Core principles

* Graphs are defined by a loose combination of functions
* Nodes are identified by object identity
  * You can use objects, strings or numbers to identify nodes
  * This means you can easily adapt any existing graph data structure to helixgraph
  * You can base graphs on grids: rectangular, 3d, hexagonal, polar, ...
  * You can also use sparse graphs
* You can use generators to generate infinite graphs
* The pathfinding algorithms: astar, bfs and dijkstra all have the same function signature & return type
* The maze algorithms (aka minimum spanning tree) all have the same function signature & return type
* Some algorithms rely on edge identifiers, for some, a direction is sufficient
* list... functions can be both generators or functions returning lists



## Searching game states

## Implementing AI

# Building

# Contributing





### Representing a dense graph using a matrix

### Infinite graphs