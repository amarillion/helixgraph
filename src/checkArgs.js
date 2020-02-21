import { assert } from "./assert.js";

export function assertFunctionType(arg) {
	assert(typeof(arg) === "function", 
		`Parameter must be a function but is ${typeof(arg)}`);
}