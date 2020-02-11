class AssertionError extends Error {

	constructor(msg) {
		super(msg);
	}

}

// TODO - not global?
export function assert(test, msg)
{
	if (!test) {
		console.error(msg);
		throw new AssertionError(msg);
	}
}
