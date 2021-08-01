import { PredicateFunc } from "./definitions.js";

export class Stream<T> {
	#wrapped : Iterable<T>;

	constructor(wrapped : Iterable<T>) {
		this.#wrapped = wrapped;
	}

	static of<T>(iter : Iterable<T>) : Stream<T> {
		return new Stream<T>(iter);
	}

	filter(predicate : PredicateFunc<T>) : Stream<T> {
		return new Stream<T>(filter(this.#wrapped, predicate));
	}

	find(predicate : PredicateFunc<T>) : T {
		return find(this.#wrapped, predicate);
	}

	first() : T {
		const iterator = this.#wrapped[Symbol.iterator]();
		return iterator.next().value;
	}

	map<U>(func: (t: T) => U) : Stream<U> {
		return new Stream<U>(map(this.#wrapped, func));
	}

	size() : number {
		if (Array.isArray(this.#wrapped)) {
			// more efficient O(1) length calculation
			return this.#wrapped.length;
		}
		else {
			let count = 0;
			for (const i of this.#wrapped) { count++; }
			return count;
		}
	}

	collect() : T[] {
		return [...this.#wrapped];
	}
}

function *filter<T>(iter : Iterable<T>, predictate : PredicateFunc<T>) {
	for(const i of iter) {
		if (predictate(i)) {
			yield i;
		}
	}
}

function find<T>(iter : Iterable<T>, predictate : PredicateFunc<T>) {
	for(const i of iter) {
		if (predictate(i)) {
			return i;
		}
	}
	return null;
}

function *map<A, B>(iter: Iterable<A>, mapFunc : (a: A) => B) {
	for (const i of iter) {
		yield mapFunc(i);
	}
}