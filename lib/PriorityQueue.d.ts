export declare class PriorityQueue<T> {
    #private;
    constructor(comparator?: (a: T, b: T) => boolean);
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
