/** 
 * Map<key, []>
 * 
 * if key doesn't exist, create a single-element array with value
 * if key exists, push to the end of the array
 */
export function mmArrayPush<K, V>(map : Map<K, V[]>, key : K, value : V) {
	const keyExists = map.has(key);
	if (keyExists) {	
		map.get(key).push(value);
	}
	else {
		map.set(key, [value]);
	}
	return !keyExists;
}

/** 
 * Map<key, Set()>
 * 
 * if key doesn't exist, create a single-element Set with value
 * if key exists, add to the Set
 */
export function mmSetAdd<K, V>(map : Map<K, Set<V>>, key : K, value : V) {
	const keyExists = map.has(key);
	if (keyExists) {	
		map.get(key).add(value);
	}
	else {
		map.set(key, new Set([value]));
	}
	return !keyExists;
}
