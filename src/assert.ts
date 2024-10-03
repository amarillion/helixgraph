class AssertionError extends Error {
	constructor(msg: string) {
		super(msg);
	}
}

export function assert(test: unknown, msg?: string): asserts test {
	if (!test) {
		console.error(msg);
		throw new AssertionError(msg);
	}
}
