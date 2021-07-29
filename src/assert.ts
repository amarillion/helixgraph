class AssertionError extends Error {
	constructor(msg: string) {
		super(msg);
	}
}

export function assert(test : boolean, msg?: string) {
	if (!test) {
		console.error(msg);
		throw new AssertionError(msg);
	}
}
