var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Stream_wrapped;
export class Stream {
    constructor(wrapped) {
        _Stream_wrapped.set(this, void 0);
        __classPrivateFieldSet(this, _Stream_wrapped, wrapped, "f");
    }
    static of(iter) {
        return new Stream(iter);
    }
    filter(predicate) {
        return new Stream(filter(__classPrivateFieldGet(this, _Stream_wrapped, "f"), predicate));
    }
    find(predicate) {
        return find(__classPrivateFieldGet(this, _Stream_wrapped, "f"), predicate);
    }
    first() {
        const iterator = __classPrivateFieldGet(this, _Stream_wrapped, "f")[Symbol.iterator]();
        return iterator.next().value;
    }
    map(func) {
        return new Stream(map(__classPrivateFieldGet(this, _Stream_wrapped, "f"), func));
    }
    size() {
        if (Array.isArray(__classPrivateFieldGet(this, _Stream_wrapped, "f"))) {
            // more efficient O(1) length calculation
            return __classPrivateFieldGet(this, _Stream_wrapped, "f").length;
        }
        else {
            let count = 0;
            for (const i of __classPrivateFieldGet(this, _Stream_wrapped, "f")) {
                count++;
            }
            return count;
        }
    }
    collect() {
        return [...__classPrivateFieldGet(this, _Stream_wrapped, "f")];
    }
}
_Stream_wrapped = new WeakMap();
function* filter(iter, predictate) {
    for (const i of iter) {
        if (predictate(i)) {
            yield i;
        }
    }
}
function find(iter, predictate) {
    for (const i of iter) {
        if (predictate(i)) {
            return i;
        }
    }
    return null;
}
function* map(iter, mapFunc) {
    for (const i of iter) {
        yield mapFunc(i);
    }
}
