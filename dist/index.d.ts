export type FuncNumberReturn = (arg0: number) => Vector2;
export type Vector2 = [number, number];
export type Vector3 = [number, number, number];
/**
 * Converts the given (x, y, z) coordinate to an HSL color
 * The (x, y) values are used to calculate the hue, while the z value is used as the saturation
 * The lightness value is calculated based on the distance of (x, y) from the center (0.5, 0.5)
 * Returns an array [hue, saturation, lightness]
 * @param xyz:Vector3 [x, y, z] coordinate array in (x, y, z) format (0-1, 0-1, 0-1)
 * @returns [hue, saturation, lightness]: Vector3 color array in HSL format (0-360, 0-1, 0-1)
 * @example
 * pointToHSL(0.5, 0.5, 1) // [0, 1, 0.5]
 * pointToHSL(0.5, 0.5, 0) // [0, 1, 0]
 * pointToHSL(0.5, 0.5, 1) // [0, 1, 1]
 **/
export declare const pointToHSL: (xyz: Vector3) => Vector3;
/**
 * Converts the given HSL color to an (x, y, z) coordinate
 * The hue value is used to calculate the (x, y) position, while the saturation value is used as the z coordinate
 * The lightness value is used to calculate the distance from the center (0.5, 0.5)
 * Returns an array [x, y, z]
 * @param hsl:Vector3 [hue, saturation, lightness] color array in HSL format (0-360, 0-1, 0-1)
 * @returns [x, y, z]:Vector3 coordinate array in (x, y, z) format (0-1, 0-1, 0-1)
 * @example
 * hslToPoint([0, 1, 0.5]) // [0.5, 0.5, 1]
 * hslToPoint([0, 1, 0]) // [0.5, 0.5, 1]
 * hslToPoint([0, 1, 1]) // [0.5, 0.5, 1]
 * hslToPoint([0, 0, 0.5]) // [0.5, 0.5, 0]
 **/
export declare const hslToPoint: (hsl: Vector3) => Vector3;
export declare const randomHSLPair: (minHDiff?: number, minSDiff?: number, minLDiff?: number, previousColor?: Vector3 | null) => [Vector3, Vector3];
export declare const vectorsOnLine: (p1: Vector3, p2: Vector3, numPoints?: number, invert?: boolean, fx?: (t: number, invert: boolean) => number, fy?: (t: number, invert: boolean) => number, fz?: (t: number, invert: boolean) => number) => Vector3[];
export declare const positionFunctions: {
    linearPosition: (t: number) => number;
    exponentialPosition: (t: number, reverse?: boolean) => number;
    quadraticPosition: (t: number, reverse?: boolean) => number;
    cubicPosition: (t: number, reverse?: boolean) => number;
    quarticPosition: (t: number, reverse?: boolean) => number;
    sinusoidalPosition: (t: number, reverse?: boolean) => number;
    asinusoidalPosition: (t: number, reverse?: boolean) => number;
    buggyCosinePosition: (t: number, reverse?: boolean) => number;
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
    set positionOrColor({ x, y, z, color }: ColorPointCollection);
    get position(): Vector3;
    get hslCSS(): string;
}
export type AnchorPointReference = {
    pointReference?: ColorPoint;
    pointIndex?: number;
} & ColorPointCollection;
export declare class Poline {
    anchorPoints: ColorPoint[];
    private numPoints;
    private points;
    private positionFunction;
    private positionFunctionY;
    private positionFunctionZ;
    private connectLastAndFirstAnchor;
    constructor(anchorColors?: [Vector3, Vector3], numPoints?: number, positionFunction?: (t: number, reverse?: boolean) => number, positionFunctionY?: (t: number, invert?: boolean) => number, positionFunctionZ?: (t: number, invert?: boolean) => number, cycleColors?: boolean);
    updatePointPairs(): void;
    addAnchorPoint({ x, y, z, color }: ColorPointCollection): ColorPoint;
    removeAnchorPoint(point: ColorPoint): void;
    getClosestAnchorPoint(point: Vector3, maxDistance: 1): ColorPoint | null | undefined;
    set loop(newStatus: boolean);
    set anchorPoint({ pointReference, pointIndex, x, y, z, color, }: AnchorPointReference);
    get flattenedPoints(): ColorPoint[];
    get colors(): Vector3[];
    get colorsCSS(): string[];
}
export {};
