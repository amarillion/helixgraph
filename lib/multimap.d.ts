/**
 * Map<key, []>
 *
 * if key doesn't exist, create a single-element array with value
 * if key exists, push to the end of the array
 */
export declare function mmArrayPush<K, V>(map: Map<K, V[]>, key: K, value: V): boolean;
/**
 * Map<key, Set()>
 *
 * if key doesn't exist, create a single-element Set with value
 * if key exists, add to the Set
 */
export declare function mmSetAdd<K, V>(map: Map<K, Set<V>>, key: K, value: V): boolean;
