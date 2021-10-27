export declare const NORTH = 1;
export declare const EAST = 2;
export declare const SOUTH = 4;
export declare const WEST = 8;
export declare class TemplateGrid<T> {
    cellFactory: (x: number, y: number, parent: unknown) => T;
    width: number;
    height: number;
    _data: T[];
    constructor(width: number, height: number, cellFactory: (x: number, y: number, parent: unknown) => T);
    applyMask(mask: string[]): this;
    _prepareGrid(): void;
    randomCell(): T;
    _index(x: number, y: number): number;
    remove(x: number, y: number): void;
    get(x: number, y: number): T;
    inRange(x: number, y: number): boolean;
    eachNode(): Generator<T, void, unknown>;
    getAdjacent(n: {
        x: number;
        y: number;
    }): Generator<[number, T]>;
}
export default class BaseGrid extends TemplateGrid<unknown> {
    constructor(width: number, height: number, cellFactory?: (x: number, y: number) => {
        x: number;
        y: number;
    });
}
