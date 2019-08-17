const BASE = {
	getWeight: (n) => 1,
	getLeft: (e) => e[0],
	getRight: (e) => e[2],
}

export const LINEAR = {
	...BASE,
	nodes: [ 'A', 'B' ],
	edges: [ 'A-B' ],
	isSource: (n) => ['A'].indexOf(n) >= 0,
	isSink: (n) => ['B'].indexOf(n) >= 0,
};

export const LINEAR_THREE = {
	...BASE,
	nodes: [ 'A', 'B', 'C' ],
	edges: [ 'A-B', 'B-C' ],
	isSource: (n) => ['A'].indexOf(n) >= 0,
	isSink: (n) => ['C'].indexOf(n) >= 0,
};

export const T_JUNCTION = {
	...BASE,
	nodes: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G' ],
	edges: [ 'A-B', 'B-C', 'C-D', 'D-E', 'C-F', 'F-G' ],
	isSource: (n) => ['A', 'G'].indexOf(n) >= 0,
	isSink: (n) => ['E'].indexOf(n) >= 0,
};

export const DEAD_END = {
	...BASE,
	nodes: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G' ],
	edges: [ 'A-B', 'B-C', 'C-D', 'D-E', 'C-F', 'F-G' ],
	isSource: (n) => ['A'].indexOf(n) >= 0,
	isSink: (n) => ['E'].indexOf(n) >= 0,
};

export const TWO_ROUTES = {
	...BASE,
	nodes: [ 'A', 'B', 'C' ],
	edges: [ 'A-B', 'B-C', 'C-A' ],
	isSource: (n) => ['A'].indexOf(n) >= 0,
	isSink: (n) => ['C'].indexOf(n) >= 0,
};

/**

   A---B---C
       |   |
       E---D---F

 */
export const CYCLICAL = {
	...BASE,
	nodes: [ 'A', 'B', 'C', 'D', 'E', 'F' ],
	edges: [ 'A-B', 'B-C', 'C-D', 'D-E', 'D-F', 'E-B' ],
	isSource: (n) => ['A'].indexOf(n) >= 0,
	isSink: (n) => ['F'].indexOf(n) >= 0,
};

/**

        A
        |
    B---C---D---E
            |
            F

*/
export const LINEAR_AXIS = {
	...BASE,
	nodes: [ 'A', 'B', 'C', 'D', 'E', 'F' ],
	edges: [ 'A-C', 'B-C', 'C-D', 'D-E', 'D-F' ],
	isSource: (n) => ['A', 'B'].indexOf(n) >= 0,
	isSink: (n) => ['E', 'F'].indexOf(n) >= 0,
};

/**

        A
        |
    B---C---D---E
            |
            F

*/
export const ALTERNATING_AXIS = {
	...BASE,
	nodes: [ 'A', 'B', 'C', 'D', 'E', 'F' ],
	edges: [ 'A-C', 'B-C', 'C-D', 'D-E', 'D-F' ],
	isSource: (n) => ['B', 'F'].indexOf(n) >= 0,
	isSink: (n) => ['A', 'E'].indexOf(n) >= 0,
};


/**

      I
      |
  A---B---C
  |       |
  H       D---J
  |       |
  G---F---E---K
      |
      L
*/

export const CYCLICAL_4SS = {
	...BASE,
	nodes: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L' ],
	edges: [ 'A-B', 'B-C', 'C-D', 'D-E', 'E-F', 'F-G', 'G-H', 'H-A', 'B-I', 'D-J', 'E-K', 'F-L' ],
	isSource: (n) => ['J', 'L'].indexOf(n) >= 0,
	isSink: (n) => ['I', 'K'].indexOf(n) >= 0,
};

/**

 *A  +B  *C
  |   |   |
  D---E---F
  |   |   |
  G---H---I
  |   |   |
 +J  *K  +L

*/
export const TWO_CYCLES = {
	...BASE,
	nodes: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L' ],
	edges: [ 'A-D', 'B-E', 'C-F', 'D-E', 'E-F', 'D-G', 'E-H', 'F-I', 'G-H', 'H-I', 'G-J', 'H-K', 'I-L' ],
	isSource: (n) => ['A', 'K', 'C'].indexOf(n) >= 0,
	isSink: (n) => ['J', 'B', 'L'].indexOf(n) >= 0,
};

/*

This network forms a 'local minimum' for the solving algorithm
In the first round, the contested edge will be D-E.
Restricting this edge to F, will lead to H-I and I-J becoming contested.
Restricting this edge to R, will lead to D-H and E-J becoming contested.

However, the network is solvable.

      *A      *B
       |       |
  +C---D-------E----F+
       |       |
  *G---H---I---J----K+

*/
export const LOCAL_MINIMUM = {
	...BASE,
	nodes: [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K' ],
	edges: [ 'A-D', 'B-E', 'C-D', 'D-E', 'E-F', 'D-H', 'E-J', 'G-H', 'H-I', 'I-J', 'J-K' ],
	isSource: (n) => ['A', 'B', 'G'].indexOf(n) >= 0,
	isSink: (n) => ['C', 'F', 'K'].indexOf(n) >= 0,
}