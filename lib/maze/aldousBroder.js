import { pickOne } from "../random.js";
export function aldousBroder(nodeIterator, getUndirectedEdges, linkNodes, { prng = Math.random } = {}) {
    const nodes = Array.isArray(nodeIterator) ? nodeIterator : [...nodeIterator];
    let unvisited = nodes.length - 1;
    let current = pickOne(nodes, prng);
    const linked = new Set([current]);
    while (unvisited > 0) {
        const [edge, neighbor] = pickOne([...getUndirectedEdges(current)], prng);
        if (!linked.has(neighbor)) {
            linkNodes(current, edge, neighbor);
            linked.add(neighbor);
            unvisited -= 1;
        }
        current = neighbor;
    }
}
