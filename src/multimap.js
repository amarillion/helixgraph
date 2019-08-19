/** 
 * Map<key, []>
 * 
 * if key doesn't exist, create a single-element array with value
 * if key exists, push to the end of the array
 */
export function mmArrayPush(map, key, value) {
	if (map.has(key)) {
		map.get(key).push(value);
	}
	else {
		map.set(key, [value]);
	}
}

/** 
 * Map<key, Set()>
 * 
 * if key doesn't exist, create a single-element Set with value
 * if key exists, add to the Set
 */
export function mmSetAdd(map, key, value) {
	if (map.has(key)) {
		map.get(key).add(value);
	}
	else {
		map.set(key, new Set([value]));
	}
}

/** 
 * Map<key, ???>
 * 
 * if key doesn't exist, call val = createFunc(), addFunc(val), and put in the map.
 * if key exists, skip createFunc, call addFunc(val)
 */
export function mmCreateAdd(map, key, createFunc, addFunc) {
	let val;
	if (map.has(key)) {
		val = map.get(key);
	}
	else {
		val = createFunc();
		map.set(key, val);
	}
	addFunc(val);
}