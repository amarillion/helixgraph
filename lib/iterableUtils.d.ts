import { PredicateFunc } from "./definitions.js";
export declare class Stream<T> {
    #private;
    constructor(wrapped: Iterable<T>);
    static of<T>(iter: Iterable<T>): Stream<T>;
    filter(predicate: PredicateFunc<T>): Stream<T>;
    find(predicate: PredicateFunc<T>): T;
    first(): T;
    map<U>(func: (t: T) => U): Stream<U>;
    size(): number;
    collect(): T[];
    reduce<U>(fn: (cur: T, acc: U) => U, init: U): U;
    max(): T;
}
