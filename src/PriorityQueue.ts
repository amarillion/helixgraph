// based on https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
const TOP = 0;
const parent = (i: number) => ((i + 1) >>> 1) - 1;
const left = (i: number) => (i << 1) + 1;
const right = (i: number) => (i + 1) << 1;

/**
 * Should return a positive number if a has higher priority, or 0 or negative otherwise
 * (This class does not actually care about the distinction between 0 and negative numbers)
 */
type ComparatorFunc<T> = (a: T, b: T) => number;

export class PriorityQueue<T> {
	#heap: T[];
	#comparator: ComparatorFunc<T>;

	constructor(comparator: ComparatorFunc<T> = (a, b) => b > a ? 1 : -1) {
		this.#heap = [];
		this.#comparator = comparator;
	}

	size() {
		return this.#heap.length;
	}

	isEmpty() {
		return this.size() === 0;
	}

	peek() {
		return this.#heap[TOP];
	}

	push(...values: T[]) {
		values.forEach(value => {
			this.#heap.push(value);
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
		this.#heap.pop();
		this._siftDown();
		return poppedValue;
	}

	replace(value: T) {
		const replacedValue = this.peek();
		this.#heap[TOP] = value;
		this._siftDown();
		return replacedValue;
	}

	private _greater(i: number, j: number) {
		return this.#comparator(this.#heap[i], this.#heap[j]) > 0;
	}

	private _swap(i: number, j: number) {
		[ this.#heap[i], this.#heap[j] ] = [ this.#heap[j], this.#heap[i] ];
	}

	private _siftUp() {
		let node = this.size() - 1;
		while (node > TOP && this._greater(node, parent(node))) {
			this._swap(node, parent(node));
			node = parent(node);
		}
	}

	private _siftDown() {
		let node = TOP;
		while (
			(left(node) < this.size() && this._greater(left(node), node)) ||
			(right(node) < this.size() && this._greater(right(node), node))
		) {
			const maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
			this._swap(node, maxChild);
			node = maxChild;
		}
	}
}
