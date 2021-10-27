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
var _PriorityQueue_heap, _PriorityQueue_comparator;
// based on https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
const TOP = 0;
const parent = (i) => ((i + 1) >>> 1) - 1;
const left = (i) => (i << 1) + 1;
const right = (i) => (i + 1) << 1;
export class PriorityQueue {
    constructor(comparator = (a, b) => b > a ? 1 : -1) {
        _PriorityQueue_heap.set(this, void 0);
        _PriorityQueue_comparator.set(this, void 0);
        __classPrivateFieldSet(this, _PriorityQueue_heap, [], "f");
        __classPrivateFieldSet(this, _PriorityQueue_comparator, comparator, "f");
    }
    size() {
        return __classPrivateFieldGet(this, _PriorityQueue_heap, "f").length;
    }
    isEmpty() {
        return this.size() === 0;
    }
    peek() {
        return __classPrivateFieldGet(this, _PriorityQueue_heap, "f")[TOP];
    }
    push(...values) {
        values.forEach(value => {
            __classPrivateFieldGet(this, _PriorityQueue_heap, "f").push(value);
            this._siftUp();
        });
        return this.size();
    }
    pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > TOP) {
            this._swap(TOP, bottom);
        }
        __classPrivateFieldGet(this, _PriorityQueue_heap, "f").pop();
        this._siftDown();
        return poppedValue;
    }
    replace(value) {
        const replacedValue = this.peek();
        __classPrivateFieldGet(this, _PriorityQueue_heap, "f")[TOP] = value;
        this._siftDown();
        return replacedValue;
    }
    _greater(i, j) {
        return __classPrivateFieldGet(this, _PriorityQueue_comparator, "f").call(this, __classPrivateFieldGet(this, _PriorityQueue_heap, "f")[i], __classPrivateFieldGet(this, _PriorityQueue_heap, "f")[j]) > 0;
    }
    _swap(i, j) {
        [__classPrivateFieldGet(this, _PriorityQueue_heap, "f")[i], __classPrivateFieldGet(this, _PriorityQueue_heap, "f")[j]] = [__classPrivateFieldGet(this, _PriorityQueue_heap, "f")[j], __classPrivateFieldGet(this, _PriorityQueue_heap, "f")[i]];
    }
    _siftUp() {
        let node = this.size() - 1;
        while (node > TOP && this._greater(node, parent(node))) {
            this._swap(node, parent(node));
            node = parent(node);
        }
    }
    _siftDown() {
        let node = TOP;
        while ((left(node) < this.size() && this._greater(left(node), node)) ||
            (right(node) < this.size() && this._greater(right(node), node))) {
            const maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}
_PriorityQueue_heap = new WeakMap(), _PriorityQueue_comparator = new WeakMap();
