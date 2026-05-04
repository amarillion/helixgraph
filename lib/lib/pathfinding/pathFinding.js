import { assert } from "../assert.js";
import { Stream } from "../iterableUtils.js";
/** helper function to allow eigher single or multiple destination nodes in path finding functions */
export function toSet(value) {
    if (Array.isArray(value)) {
        return new Set(value);
    }
    else {
        return new Set([value]);
    }
}
/**
 * Utility that takes the 'prev' data from any of astar, dijkstra, or breadthFirstSearch, and turns it in a sequence of edges forming a path.
 *
 * @param {*} source start node
 * @param {*} dest destination node
 * @param {*} prev Map (node, [dir, srcNode]) - result from astar, dijkstra, or breadthFirstSearch
 */
export function trackbackEdges(source, dest, prev, maxIterations = 1e6) {
    const path = [];
    const isValid = trackback(source, dest, prev, (from, edge /* , to */) => {
        path.unshift(edge);
    }, maxIterations);
    return isValid ? path : null;
}
export function trackbackNodes(source, dest, prev, maxIterations = 1e6) {
    const path = [];
    const isValid = trackback(source, dest, prev, (from, edge, to) => {
        path.unshift(to);
    }, maxIterations);
    path.unshift(source);
    return isValid ? path : null;
}
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
export function trackback(source, dest, prev, callback, maxIterations = 1e6) {
    let current = dest;
    // set a maximum no of iterations to prevent infinite loop
    for (let i = 0; i < maxIterations; ++i) {
        const step = prev.get(current);
        if (!step) {
            return false; // no valid path
        }
        callback(step.from, step.edge, current);
        current = step.from;
        if (current === source) {
            // path finished!
            return true; // valid path
        }
    }
    assert(false, "Reached iteration limit when constructing path");
}
export function shortestPathsFromSource(source, destinations, prev) {
    // Now backtrack from each destination to the source
    const result = [];
    for (const dest of destinations) {
        const path = trackbackEdges(source, dest, prev);
        if (path !== null) {
            result.push(path);
        }
    }
    return result;
}
/**
all shortest paths from sources to sinks .
Returns an array of arrays of steps.
*/
export function allShortestPaths(sources, sinks, algorithm) {
    const allPaths = new Map();
    for (const source of sources) {
        const prev = algorithm(source, sinks);
        const paths = shortestPathsFromSource(source, sinks, prev);
        // note that it's possible that some source->sink paths are NOT possible.
        // they will be omitted from the result
        allPaths.set(source, paths);
    }
    return allPaths;
}
/**
 * Utility function.
 * given an adjacency func, find the first edge that goes from one node to another.
 */
export function edgeBetween(getAdjacent, from, to) {
    var _a;
    return (_a = Stream.of(getAdjacent(from))
        .find(step => step[1] === to)) === null || _a === void 0 ? void 0 : _a[0];
}
/**
 * Utility function.
 * given an adjacency func, find all edges that go from one node to another.
 */
export function edgesBetween(getAdjacent, from, to) {
    return Stream.of(getAdjacent(from))
        .filter(step => step[1] === to)
        .map(step => step[0])
        .collect();
}
