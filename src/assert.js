class AssertionError extends Error {

	constructor(msg) {
		super(msg);
	}

}

export function assert(test, msg)
{
	if (!test) {
		console.error(msg);
		throw new AssertionError(msg);
	}
}
