import { AdjacencyFunc, Step } from "../definitions.js";
export declare function bfsVisit<N, E>(source: N, getAdjacent: AdjacencyFunc<N, E>, callback: (node: N) => void): void;
export declare function bfsGenerator<N, E>(source: N, getAdjacent: AdjacencyFunc<N, E>): Generator<N, void, unknown>;
/**
 * Performs a breadth-first search on a graph.
 * Starting form the source node, expanding until all connected nodes are visited.
 * Nodes are treated as opaque data objects and are not modified. You can use any kind of
 * variable type to represent nodes: ints, strings, objects, ...
 *
 * @param source starting node
 * @param distinations Single node or Array of nodes. Search will continue until all destinations are reached.
 * @param getAdjacent adjacency function representing the graph. For this algorithm, edges do not need to be unique.
 *
 * @returns a map of examined nodes. Pass this to a backtracking function to extract a simple path.
 *
 * Input graph may be undirected or directed (getAdjacent should act correspondingly)
 *
 * Guaranteed to return shortest paths for unweighted networks.
 * Complexity: O(V + E)
 * Faster than dijkstra, because it accesses the open list with O(1) instead of O(N) (or dijkstra with priorityQ: O(log N))
 * But unlike dijkstra, this can't handle weighted edges.
 *
 * For more discussion, see: https://stackoverflow.com/questions/25449781/what-is-difference-between-bfs-and-dijkstras-algorithms-when-looking-for-shorte
 */
export declare function breadthFirstSearch<N, E>(source: N, dest: N | N[], getAdjacent: AdjacencyFunc<N, E>, { maxIterations }?: {
    maxIterations?: number;
}): Map<N, Step<N, E>>;
