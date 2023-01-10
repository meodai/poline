export type FuncNumberReturn = (arg0: number) => Vector2;
export type Vector2 = [number, number];
export type Vector3 = [number, number, number];
export declare const pointToHSL: (x: number, y: number, z: number) => Vector3;
export declare const hslToPoint: (hsl: Vector3) => Vector3;
export declare const randomHSLPair: (minHDiff?: number, minSDiff?: number, minLDiff?: number, previousColor?: Vector3 | null) => [Vector3, Vector3];
export declare const vectorsOnLine: (p1: Vector3, p2: Vector3, numPoints?: number, f?: (t: any, invert: boolean) => any, invert?: boolean) => Vector3[];
export declare const positionFunctions: {
    linearPosition: (t: number) => number;
    exponentialPosition: (t: number, reverse?: boolean) => number;
    quadraticPosition: (t: number, reverse?: boolean) => number;
    sinusoidalPosition: (t: number, reverse?: boolean) => number;
    circularPosition: (t: number, reverse?: boolean) => number;
    arcPosition: (t: number, reverse?: boolean) => number;
};
type ColorPointCollection = {
    x?: number;
    y?: number;
    z?: number;
    color?: Vector3;
};
declare class ColorPoint {
    x: number;
    y: number;
    z: number;
    color: Vector3;
    constructor({ x, y, z, color }?: ColorPointCollection);
    set positionAndColor({ x, y, z, color }: ColorPointCollection);
    get position(): Vector3;
    get hslCSS(): string;
}
export declare class Poline {
    anchorPoints: ColorPoint[];
    private numPoints;
    private points;
    private positionFunction;
    constructor(anchorColors?: [Vector3, Vector3], numPoints?: number, positionFunction?: (t: number, reverse?: boolean) => number);
    updatePointPairs(): void;
    addAnchorPoint({ x, y, z, color }: {
        x: any;
        y: any;
        z: any;
        color: any;
    }): void;
    getClosestAnchorPoint(point: Vector3, maxDistance: 1): ColorPoint | null | undefined;
    set anchorPoint({ pointReference, pointIndex, x, y, z, color }: {
        pointReference: any;
        pointIndex: any;
        x: any;
        y: any;
        z: any;
        color: any;
    });
    get flattenedPoints(): ColorPoint[];
    get colors(): Vector3[];
    get colorsCSS(): string[];
}
export {};
