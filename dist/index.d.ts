export type FuncNumberReturn = (arg0: number) => Vector2;
export type Vector2 = [number, number];
export type Vector3 = [number, ...Vector2];
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
export declare const pointToHSL: (xyz: [number, number, number]) => [number, number, number];
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
export declare const hslToPoint: (hsl: [number, number, number]) => [number, number, number];
export declare const randomHSLPair: (startHue?: number, saturations?: Vector2, lightnesses?: Vector2) => [Vector3, Vector3];
export declare const randomHSLTriple: (startHue?: number, saturations?: [number, number, number], lightnesses?: [number, number, number]) => [Vector3, Vector3, Vector3];
export declare const vectorsOnLine: (p1: [number, number, number], p2: [number, number, number], numPoints?: number, invert?: boolean, fx?: (t: number, invert: boolean) => number, fy?: (t: number, invert: boolean) => number, fz?: (t: number, invert: boolean) => number) => Vector3[];
export type PositionFunction = (t: number, reverse?: boolean) => number;
export declare const positionFunctions: {
    linearPosition: PositionFunction;
    exponentialPosition: PositionFunction;
    quadraticPosition: PositionFunction;
    cubicPosition: PositionFunction;
    quarticPosition: PositionFunction;
    sinusoidalPosition: PositionFunction;
    asinusoidalPosition: PositionFunction;
    buggyCosinePosition: PositionFunction;
    circularPosition: PositionFunction;
    arcPosition: PositionFunction;
};
type ColorPointCollection = {
    x?: number;
    y?: number;
    z?: number;
    color?: Vector3;
    insertAtIndex?: number;
};
declare class ColorPoint {
    x: number;
    y: number;
    z: number;
    color: Vector3;
    constructor({ x, y, z, color }?: ColorPointCollection);
    positionOrColor({ x, y, z, color }: ColorPointCollection): void;
    set position([x, y, z]: Vector3);
    get position(): Vector3;
    set hsl([h, s, l]: Vector3);
    get hsl(): Vector3;
    shiftHue(angle: number): void;
    get hslCSS(): string;
}
export type AnchorPointReference = {
    pointReference?: ColorPoint;
    pointIndex?: number;
} & ColorPointCollection;
export type PolineOptions = {
    anchorColors: Vector3[];
    numPoints: number;
    positionFunction?: (t: number, invert?: boolean) => number;
    positionFunctionX?: (t: number, invert?: boolean) => number;
    positionFunctionY?: (t: number, invert?: boolean) => number;
    positionFunctionZ?: (t: number, invert?: boolean) => number;
    closedLoop: boolean;
};
export declare class Poline {
    private _needsUpdate;
    anchorPoints: ColorPoint[];
    private _numPoints;
    private points;
    private _positionFunctionX;
    private _positionFunctionY;
    private _positionFunctionZ;
    private connectLastAndFirstAnchor;
    private _animationFrame;
    constructor({ anchorColors, numPoints, positionFunction, positionFunctionX, positionFunctionY, positionFunctionZ, closedLoop, }?: PolineOptions);
    get numPoints(): number;
    set numPoints(numPoints: number);
    set positionFunctionX(positionFunctionX: PositionFunction);
    get positionFunctionX(): PositionFunction;
    set positionFunctionY(positionFunctionY: PositionFunction);
    get positionFunctionY(): PositionFunction;
    set positionFunctionZ(positionFunctionZ: PositionFunction);
    get positionFunctionZ(): PositionFunction;
    updatePointPairs(): void;
    addAnchorPoint({ x, y, z, color, insertAtIndex, }: ColorPointCollection): ColorPoint;
    removeAnchorPoint(point: ColorPoint): void;
    getClosestAnchorPoint(point: Vector3, maxDistance: 1): ColorPoint | null | undefined;
    set closedLoop(newStatus: boolean);
    set anchorPoint({ pointReference, pointIndex, x, y, z, color, }: AnchorPointReference);
    get flattenedPoints(): ColorPoint[];
    get colors(): [number, number, number][];
    get colorsCSS(): string[];
    shiftHue(hShift: number): void;
}
export {};
