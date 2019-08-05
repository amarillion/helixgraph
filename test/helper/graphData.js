export const LINEAR = {
	nodes: [ 'A', 'B' ],
	edges: [ 'A-B' ],
	isSource: (n) => ['A'].indexOf(n) >= 0,
	isSink: (n) => ['B'].indexOf(n) >= 0,
	getWeight: (n) => 1,
	getLeft: (e) => e[0],
	getRight: (e) => e[2],
};

export const CYCLICAL = {
	nodes: [ 'A', 'B', 'C' ],
	edges: [ 'A-B', 'B-C', 'C-A' ],
	isSource: (n) => ['A'].indexOf(n) >= 0,
	isSink: (n) => ['C'].indexOf(n) >= 0,
	getWeight: (n) => 1,
	getLeft: (e) => e[0],
	getRight: (e) => e[2],
};

export const ALTERNATING = {
	nodes: [ 'A', 'B', 'C', 'D', 'E', 'F' ],
	edges: [ 'A-C', 'B-C', 'C-D', 'D-E', 'D-F' ],
	isSource: (n) => ['B', 'F'].indexOf(n) >= 0,
	isSink: (n) => ['A', 'E'].indexOf(n) >= 0,
	getWeight: (n) => 1,
	getLeft: (e) => e[0],
	getRight: (e) => e[2],
};