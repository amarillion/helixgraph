class AssertionError extends Error {
    constructor(msg) {
        super(msg);
    }
}
export function assert(test, msg = "") {
    if (!test) {
        throw new AssertionError(msg);
    }
}
export function notNull(value) {
    assert(value !== null && value !== undefined, `Expected value to be non-null and defined, but was ${value}`);
    return value;
}
