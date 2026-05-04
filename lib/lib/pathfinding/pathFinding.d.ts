import { AdjacencyFunc, Step } from "../definitions.js";
/** helper function to allow eigher single or multiple destination nodes in path finding functions */
export declare function toSet<T>(value: T[] | T): Set<T>;
/**
 * Utility that takes the 'prev' data from any of astar, dijkstra, or breadthFirstSearch, and turns it in a sequence of edges forming a path.
 *
 * @param {*} source start node
 * @param {*} dest destination node
 * @param {*} prev Map (node, [dir, srcNode]) - result from astar, dijkstra, or breadthFirstSearch
 */
export declare function trackbackEdges<N, E>(source: N, dest: N, prev: Map<N, Step<N, E>>, maxIterations?: number): E[];
export declare function trackbackNodes<N>(source: N, dest: N, prev: Map<N, Step<N, unknown>>, maxIterations?: number): N[];
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
export declare function trackback<N, E>(source: N, dest: N, prev: Map<N, Step<N, E>>, callback: (from: N | undefined, edge: E | undefined, to: N) => void, maxIterations?: number): boolean;
export declare function shortestPathsFromSource<N, E>(source: N, destinations: N[], prev: Map<N, Step<N, E>>): E[][];
/**
all shortest paths from sources to sinks .
Returns an array of arrays of steps.
*/
export declare function allShortestPaths<N, E>(sources: N[], sinks: N[], algorithm: (source: N, sinks: N[]) => Map<N, Step<N, E>>): Map<N, E[][]>;
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
