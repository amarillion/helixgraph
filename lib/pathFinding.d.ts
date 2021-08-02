import { AdjacencyFunc, Step, WeightFunc } from "./definitions.js";
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
/**
 * Given a weighted graph, find all paths from one source to one or more destinations
 * @param {*} source
 * @param {*} dest - the search destination node, or an array of destinations that must all be found
 * @param {*} getAdjacent
 * @param {*}
 *
 * @returns Map(to, { edge, from, to, cost })
 */
export declare function dijkstra<N, E>(source: N, dest: N | N[], getAdjacent: AdjacencyFunc<N, E>, { maxIterations, getWeight, }?: {
    maxIterations?: number;
    getWeight?: WeightFunc<N, E>;
}): Map<N, Step<N, E>>;
/**
 * Given a weighted graph, find all paths from one source to one or more destinations
 * @param {*} source
 * @param {*} destinations
 * @param {*} getAdjacent
 * @param {Object} options containing getHeuristic(node), maxIterations, getWeight(edge)
 *
 * @returns Map(to, { edge, from, to, cost })
 */
export declare function astar<N, E>(source: N, dest: N, getAdjacent: AdjacencyFunc<N, E>, { maxIterations, getWeight, getHeuristic }?: {
    maxIterations?: number;
    getWeight?: WeightFunc<N, E>;
    getHeuristic?: (node: N) => number;
}): Map<N, Step<N, E>>;
/**
 * Utility that takes the 'prev' data from any of astar, dijkstra, or breadthFirstSearch, and turns it in a sequence of edges forming a path.
 *
 * @param {*} source start node
 * @param {*} dest destination node
 * @param {*} prev Map (node, [dir, srcNode]) - result from astar, dijkstra, or breadthFirstSearch
 */
export declare function trackbackEdges<N, E>(source: N, dest: N, prev: Map<N, Step<N, E>>): E[];
export declare function trackbackNodes<N>(source: N, dest: N, prev: Map<N, Step<N, unknown>>): any[];
/**
 *
 * @callback trackbackFun
 * @param {*} fromNode
 * @param {*} edge
 * @param {*} toNode
 *
 * Creates a path from the results of dijsktra, bfs or astar, by tracking back using a prev map.
 * @param {*} source starting node
 * @param {*} dest target node
 * @param {Map} prev is a Map(destNode, { edge, from }) as returned bij `dijkstra`, `astar` or `breadthFirstSearch`)
 * @param {trackbackFun} callback called for each step of the path from source to dest, but in reverse order
 *
 * @returns: an array of [ edge ], or `null` if there is no path possible, i.e. dest is unreachable from source.
 *
 * TODO: for some applications, better to return an array of [ 'node' ] or an array of both?
 */
export declare function trackback<N, E>(source: N, dest: N, prev: Map<N, Step<N, E>>, callback: (from: N, edge: E, to: N) => void): boolean;
export declare function shortestPathsFromSource<N, E>(source: N, destinations: N[], prev: Map<N, Step<N, E>>): any[];
/**
all shortest paths from sources to sinks .
Returns an array of arrays of steps.
*/
export declare function allShortestPaths<N, E>(sources: N[], sinks: N[], algorithm: (source: N, sinks: N[]) => Map<N, Step<N, E>>): Map<any, any>;
/**
 * Utility function.
 * given an adjacency func, find the first edge that goes from one node to another.
 */
export declare function edgeBetween<N, E>(getAdjacent: AdjacencyFunc<N, E>, from: N, to: N): E;
/**
 * Utility function.
 * given an adjacency func, find all edges that go from one node to another.
 */
export declare function edgesBetween<N, E>(getAdjacent: AdjacencyFunc<N, E>, from: N, to: N): E[];
