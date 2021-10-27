/**
 * Should return a positive number if a has higher priority, or 0 or negative otherwise
 * (This class does not actually care about the distinction between 0 and negative numbers)
 */
declare type ComparatorFunc<T> = (a: T, b: T) => number;
export declare class PriorityQueue<T> {
    #private;
    constructor(comparator?: ComparatorFunc<T>);
    size(): number;
    isEmpty(): boolean;
    peek(): T;
    push(...values: T[]): number;
    pop(): T;
    replace(value: T): T;
    private _greater;
    private _swap;
    private _siftUp;
    private _siftDown;
}
export {};
