import { assert } from "../src/assert.js";

test("assert throws an exception when false", () => {
	const t = () => assert(false, "my message");
	expect(t).toThrow("my message");
});

test("assert passes when true", () => {
	const t = () => assert(true, "my message");
	expect(t).not.toThrow();
});
