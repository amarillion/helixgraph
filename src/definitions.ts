/** 
 * An adjacency function takes a node as input, and returns an iterable of Edge, Node tuples. 
 * 
 * The return tuple's order Edge, Node is chosen so that they map simply 
 * to an internal representation as a Key, Value pairs of a Map or js object.
*/
export type AdjacencyFunc<N, E> = (from: N) => Iterable<[E, N]>;

/** create a link between two nodes */
export type LinkFunc<N, E> = (from: N, edge: E, to: N) => boolean

export type PathFindFunc<N, E> = 
	(src: N, dest: N | N[], getAdjacent: AdjacencyFunc<N, E>, options: { [key: string] : unknown }) => Map<N, Step<N, E>>;

/** 
 * Weight for a given edge.
 * For graph representations where E is a unique object, you can return a weight based on E only.
 * For graph representations where E is not unique, you can use the combination of E+N to return a weight.
*/
export type WeightFunc<N, E> = (edge: E, from: N) => number;

/** boolean predicate for filtering, finding etc. */
export type PredicateFunc<T> = (t:  T) => boolean;

export type Step<N, E> = {
	to: N,
	from: N,
	edge: E,
	cost: number
}

/** simple way to define a graph  */
export interface SimpleGraph<N, E> {
	nodes: Iterable<N>, 
	edges: Iterable<E>, 
	getLeft: (e: E) => N, 
	getRight: (e: E) => N, 
	sources : N[],
	sinks : N[],
	getWeight? : WeightFunc<N, E>
}

/** another way to define a graph */
export interface GraphType<N, E> extends SimpleGraph<N, E> { 
	getAdjacent : AdjacencyFunc<N, E>,
	isSource?: PredicateFunc<N>,
	isSink?: PredicateFunc<N>,
	getWeight? : WeightFunc<N, E>,
	reverseEdge? : (e: E) => E,
}
