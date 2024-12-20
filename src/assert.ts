class AssertionError extends Error {
	constructor(msg: string) {
		super(msg);
	}
}

export function assert(test: unknown, msg = ""): asserts test {
	if (!test) {
		throw new AssertionError(msg);
	}
}

export function notNull<T>(value?: T): NonNullable<T> {
	assert(value !== null && value !== undefined, `Expected value to be non-null and defined, but was ${value}`);
	return value;
}
