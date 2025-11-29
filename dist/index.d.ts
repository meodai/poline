export type FuncNumberReturn = (arg0: number) => Vector2;
export type Vector2 = [number, number];
export type Vector3 = [number, ...Vector2];
export type PartialVector3 = [number | null, number | null, number | null];
/**
 * Converts the given (x, y, z) coordinate to an HSL color
 * The (x, y) values are used to calculate the hue, while the z value is used as the saturation
 * The lightness value is calculated based on the distance of (x, y) from the center (0.5, 0.5)
 * Returns an array [hue, saturation, lightness]
 * @param xyz:Vector3 [x, y, z] coordinate array in (x, y, z) format (0-1, 0-1, 0-1)
 * @returns [hue, saturation, lightness]: Vector3 color array in HSL format (0-360, 0-1, 0-1)
 * @example
 * pointToHSL([0.5, 0.5, 1]) // [0, 1, 0.5]
 * pointToHSL([0.5, 0.5, 0]) // [0, 1, 0]
 **/
export declare const pointToHSL: (xyz: [number, number, number], invertedLightness: boolean) => [number, number, number];
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
export declare const hslToPoint: (hsl: [number, number, number], invertedLightness: boolean) => [number, number, number];
export declare const randomHSLPair: (startHue?: number, saturations?: Vector2, lightnesses?: Vector2) => [Vector3, Vector3];
export declare const randomHSLTriple: (startHue?: number, saturations?: [number, number, number], lightnesses?: [number, number, number]) => [Vector3, Vector3, Vector3];
export type PositionFunction = (t: number, reverse?: boolean) => number;
export declare const positionFunctions: {
    linearPosition: PositionFunction;
    exponentialPosition: PositionFunction;
    quadraticPosition: PositionFunction;
    cubicPosition: PositionFunction;
    quarticPosition: PositionFunction;
    sinusoidalPosition: PositionFunction;
    asinusoidalPosition: PositionFunction;
    arcPosition: PositionFunction;
    smoothStepPosition: PositionFunction;
};
export type ColorPointCollection = {
    xyz?: Vector3;
    color?: Vector3;
    invertedLightness?: boolean;
};
export declare class ColorPoint {
    x: number;
    y: number;
    z: number;
    color: Vector3;
    private _invertedLightness;
    constructor({ xyz, color, invertedLightness, }?: ColorPointCollection);
    positionOrColor({ xyz, color, invertedLightness, }: ColorPointCollection): void;
    set position([x, y, z]: Vector3);
    get position(): Vector3;
    set hsl([h, s, l]: Vector3);
    get hsl(): Vector3;
    get hslCSS(): string;
    get oklchCSS(): string;
    get lchCSS(): string;
    set invertedLightness(val: boolean);
    get invertedLightness(): boolean;
    shiftHue(angle: number): void;
}
export type PolineOptions = {
    anchorColors?: Vector3[];
    numPoints?: number;
    positionFunction?: (t: number, invert?: boolean) => number;
    positionFunctionX?: (t: number, invert?: boolean) => number;
    positionFunctionY?: (t: number, invert?: boolean) => number;
    positionFunctionZ?: (t: number, invert?: boolean) => number;
    invertedLightness?: boolean;
    closedLoop?: boolean;
};
export declare class Poline {
    private _anchorPoints;
    private _numPoints;
    private points;
    private _positionFunctionX;
    private _positionFunctionY;
    private _positionFunctionZ;
    private _anchorPairs;
    private connectLastAndFirstAnchor;
    private _animationFrame;
    private _invertedLightness;
    constructor({ anchorColors, numPoints, positionFunction, positionFunctionX, positionFunctionY, positionFunctionZ, closedLoop, invertedLightness, }?: PolineOptions);
    get numPoints(): number;
    set numPoints(numPoints: number);
    set positionFunction(positionFunction: PositionFunction | PositionFunction[]);
    get positionFunction(): PositionFunction | PositionFunction[];
    set positionFunctionX(positionFunctionX: PositionFunction);
    get positionFunctionX(): PositionFunction;
    set positionFunctionY(positionFunctionY: PositionFunction);
    get positionFunctionY(): PositionFunction;
    set positionFunctionZ(positionFunctionZ: PositionFunction);
    get positionFunctionZ(): PositionFunction;
    get anchorPoints(): ColorPoint[];
    set anchorPoints(anchorPoints: ColorPoint[]);
    updateAnchorPairs(): void;
    addAnchorPoint({ xyz, color, insertAtIndex, }: ColorPointCollection & {
        insertAtIndex?: number;
    }): ColorPoint;
    removeAnchorPoint({ point, index, }: {
        point?: ColorPoint;
        index?: number;
    }): void;
    updateAnchorPoint({ point, pointIndex, xyz, color, }: {
        point?: ColorPoint;
        pointIndex?: number;
    } & ColorPointCollection): ColorPoint;
    getClosestAnchorPoint({ xyz, hsl, maxDistance, }: {
        xyz?: PartialVector3;
        hsl?: PartialVector3;
        maxDistance?: number;
    }): ColorPoint | null;
    set closedLoop(newStatus: boolean);
    get closedLoop(): boolean;
    set invertedLightness(newStatus: boolean);
    get invertedLightness(): boolean;
    /**
     * Returns a flattened array of all points across all segments,
     * removing duplicated anchor points at segment boundaries.
     *
     * Since anchor points exist at both the end of one segment and
     * the beginning of the next, this method keeps only one instance of each.
     * The filter logic keeps the first point (index 0) and then filters out
     * points whose indices are multiples of the segment size (_numPoints),
     * which are the anchor points at the start of each segment (except the first).
     *
     * This approach ensures we get all unique points in the correct order
     * while avoiding duplicated anchor points.
     *
     * @returns {ColorPoint[]} A flat array of unique ColorPoint instances
     */
    get flattenedPoints(): ColorPoint[];
    get colors(): [number, number, number][];
    cssColors(mode?: "hsl" | "oklch" | "lch"): string[];
    get colorsCSS(): string[];
    get colorsCSSlch(): string[];
    get colorsCSSoklch(): string[];
    shiftHue(hShift?: number): void;
    /**
     * Returns a color at a specific position along the entire color line (0-1)
     * Treats all segments as one continuous path, respecting easing functions
     * @param t Position along the line (0-1), where 0 is start and 1 is end
     * @returns ColorPoint at the specified position
     * @example
     * getColorAt(0) // Returns color at the very beginning
     * getColorAt(0.5) // Returns color at the middle of the entire journey
     * getColorAt(1) // Returns color at the very end
     */
    getColorAt(t: number): ColorPoint;
    /**
     * Determines whether easing should be inverted for a given segment
     * @param segmentIndex The index of the segment
     * @returns Whether easing should be inverted
     */
    private shouldInvertEaseForSegment;
}
