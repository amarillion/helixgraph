export const LINEAR = {
	nodes: [ 'A', 'B' ],
	edges: [ ['A', 'B'] ],
	sources: [ 'A' ],
	sinks: [ 'B' ],
	getWeight: (n) => 1
};

export const CYCLICAL = {
	nodes: [ 'A', 'B', 'C' ],
	edges: [ ['A', 'B'], ['B', 'C'], ['C', 'A'] ],
	sources: [ 'A' ],
	sinks: [ 'C' ],
	getWeight: (n) => 1
};

export const ALTERNATING = {
	nodes: [ 'A', 'B', 'C', 'D', 'E', 'F' ],
	edges: [ ['A', 'C'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['D', 'F'] ],
	sources: [ 'B', 'F' ],
	sinks: [ 'A', 'E' ],
	getWeight: (n) => 1
};