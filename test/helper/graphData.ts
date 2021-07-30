const BASE = {
	getWeight: () => 1,
	getLeft: (e : string) => e[0],
	getRight: (e : string) => e[2],
};

export const LINEAR = {
	...BASE,
	nodes: [ "A", "B" ],
	edges: [ "A-B" ],
	sources: ["A"],
	sinks: ["B"],
};

export const LINEAR_THREE = {
	...BASE,
	nodes: [ "A", "B", "C" ],
	edges: [ "A-B", "B-C" ],
	sources: [ "A" ],
	sinks: [ "C" ]
};

export const T_JUNCTION = {
	...BASE,
	nodes: [ "A", "B", "C", "D", "E", "F", "G" ],
	edges: [ "A-B", "B-C", "C-D", "D-E", "C-F", "F-G" ],
	sources: ["A", "G"],
	sinks: ["E"]
};

export const DEAD_END = {
	...BASE,
	nodes: [ "A", "B", "C", "D", "E", "F", "G" ],
	edges: [ "A-B", "B-C", "C-D", "D-E", "C-F", "F-G" ],
	sources: [ "A"],
	sinks: ["E" ]
};

export const TWO_ROUTES = {
	...BASE,
	nodes: [ "A", "B", "C" ],
	edges: [ "A-B", "B-C", "C-A" ],
	sources: ["A"],
	sinks: ["C"]
};

/**

   A---B---C
       |   |
       E---D---F

 */
export const CYCLICAL = {
	...BASE,
	nodes: [ "A", "B", "C", "D", "E", "F" ],
	edges: [ "A-B", "B-C", "C-D", "D-E", "D-F", "E-B" ],
	sources: ["A"],
	sinks: ["F"],
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
	nodes: [ "A", "B", "C", "D", "E", "F" ],
	edges: [ "A-C", "B-C", "C-D", "D-E", "D-F" ],
	sources: ["A", "B"],
	sinks: ["E", "F"]
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
	nodes: [ "A", "B", "C", "D", "E", "F" ],
	edges: [ "A-C", "B-C", "C-D", "D-E", "D-F" ],
	sources: ["B", "F"],
	sinks: ["A", "E"]
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
	nodes: [ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L" ],
	edges: [ "A-B", "B-C", "C-D", "D-E", "E-F", "F-G", "G-H", "H-A", "B-I", "D-J", "E-K", "F-L" ],
	sources: ["J", "L"],
	sinks: ["I", "K"]
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
	nodes: [ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L" ],
	edges: [ "A-D", "B-E", "C-F", "D-E", "E-F", "D-G", "E-H", "F-I", "G-H", "H-I", "G-J", "H-K", "I-L" ],
	sources: ["A", "K", "C"],
	sinks: ["J", "B", "L"]
};

/*

This network forms a "local minimum" for the solving algorithm
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
	nodes: [ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K" ],
	edges: [ "A-D", "B-E", "C-D", "D-E", "E-F", "D-H", "E-J", "G-H", "H-I", "I-J", "J-K" ],
	sources: ["A", "B", "G"],
	sinks: ["C", "F", "K"]
};
