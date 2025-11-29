/* eslint-disable @typescript-eslint/ban-ts-comment */
export type FuncNumberReturn = (arg0: number) => Vector2;
export type Vector2 = [number, number];
export type Vector3 = [number, ...Vector2];
export type PartialVector3 = [number | null, number | null, number | null];

type CSSColorMethods = {
  hsl: (p: ColorPoint) => string;
  oklch: (p: ColorPoint) => string;
  lch: (p: ColorPoint) => string;
};

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

export const pointToHSL = (
  xyz: Vector3,
  invertedLightness: boolean
): Vector3 => {
  const [x, y, z] = xyz;

  // cy and cx are the center (y and x) values
  const cx = 0.5;
  const cy = 0.5;

  // Calculate the angle between the point (x, y) and the center (cx, cy)
  const radians = Math.atan2(y - cy, x - cx);

  // Convert the angle to degrees and shift it so that it goes from 0 to 360
  let deg = radians * (180 / Math.PI);
  deg = (360 + deg) % 360;

  // The saturation value is taken from the z coordinate
  const s = z;

  // Calculate the lightness value based on the distance from the center
  const dist = Math.sqrt(Math.pow(y - cy, 2) + Math.pow(x - cx, 2));
  const l = dist / cx;

  // Return the HSL color as an array [hue, saturation, lightness]
  return [deg, s, invertedLightness ? 1 - l : l];
};

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
export const hslToPoint = (
  hsl: Vector3,
  invertedLightness: boolean
): Vector3 => {
  // Destructure the input array into separate hue, saturation, and lightness values
  const [h, s, l] = hsl;
  // cx and cy are the center (x and y) values
  const cx = 0.5;
  const cy = 0.5;
  // Calculate the angle in radians based on the hue value
  const radians = h / (180 / Math.PI);

  // Calculate the distance from the center based on the lightness value
  const dist = (invertedLightness ? 1 - l : l) * cx;

  // Calculate the x and y coordinates based on the distance and angle
  const x = cx + dist * Math.cos(radians);
  const y = cy + dist * Math.sin(radians);
  // The z coordinate is equal to the saturation value
  const z = s;
  // Return the (x, y, z) coordinate as an array [x, y, z]
  return [x, y, z];
};

export const randomHSLPair = (
  startHue: number = Math.random() * 360,
  saturations: Vector2 = [Math.random(), Math.random()],
  lightnesses: Vector2 = [0.75 + Math.random() * 0.2, 0.3 + Math.random() * 0.2]
): [Vector3, Vector3] => [
  [startHue, saturations[0], lightnesses[0]],
  [(startHue + 60 + Math.random() * 180) % 360, saturations[1], lightnesses[1]],
];

export const randomHSLTriple = (
  startHue: number = Math.random() * 360,
  saturations: Vector3 = [Math.random(), Math.random(), Math.random()],
  lightnesses: Vector3 = [
    0.75 + Math.random() * 0.2,
    Math.random() * 0.2,
    0.75 + Math.random() * 0.2,
  ]
): [Vector3, Vector3, Vector3] => [
  [startHue, saturations[0], lightnesses[0]],
  [(startHue + 60 + Math.random() * 180) % 360, saturations[1], lightnesses[1]],
  [(startHue + 60 + Math.random() * 180) % 360, saturations[2], lightnesses[2]],
];

const vectorOnLine = (
  t: number,
  p1: Vector3,
  p2: Vector3,
  invert = false,
  fx = (t: number, invert: boolean): number => (invert ? 1 - t : t),
  fy = (t: number, invert: boolean): number => (invert ? 1 - t : t),
  fz = (t: number, invert: boolean): number => (invert ? 1 - t : t)
): Vector3 => {
  const tModifiedX = fx(t, invert);
  const tModifiedY = fy(t, invert);
  const tModifiedZ = fz(t, invert);
  const x = (1 - tModifiedX) * p1[0] + tModifiedX * p2[0];
  const y = (1 - tModifiedY) * p1[1] + tModifiedY * p2[1];
  const z = (1 - tModifiedZ) * p1[2] + tModifiedZ * p2[2];

  return [x, y, z];
};

const vectorsOnLine = (
  p1: Vector3,
  p2: Vector3,
  numPoints = 4,
  invert = false,
  fx = (t: number, invert: boolean): number => (invert ? 1 - t : t),
  fy = (t: number, invert: boolean): number => (invert ? 1 - t : t),
  fz = (t: number, invert: boolean): number => (invert ? 1 - t : t)
): Vector3[] => {
  const points: Vector3[] = [];

  for (let i = 0; i < numPoints; i++) {
    const [x, y, z] = vectorOnLine(
      i / (numPoints - 1),
      p1,
      p2,
      invert,
      fx,
      fy,
      fz
    );
    points.push([x, y, z]);
  }

  return points;
};

export type PositionFunction = (t: number, reverse?: boolean) => number;

const linearPosition: PositionFunction = (t: number) => {
  return t;
};

const exponentialPosition: PositionFunction = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - (1 - t) ** 2;
  }
  return t ** 2;
};

const quadraticPosition: PositionFunction = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - (1 - t) ** 3;
  }
  return t ** 3;
};

const cubicPosition: PositionFunction = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - (1 - t) ** 4;
  }
  return t ** 4;
};

const quarticPosition: PositionFunction = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - (1 - t) ** 5;
  }
  return t ** 5;
};

const sinusoidalPosition: PositionFunction = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - Math.sin(((1 - t) * Math.PI) / 2);
  }
  return Math.sin((t * Math.PI) / 2);
};

const asinusoidalPosition: PositionFunction = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - Math.asin(1 - t) / (Math.PI / 2);
  }
  return Math.asin(t) / (Math.PI / 2);
};

const arcPosition: PositionFunction = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - Math.sqrt(1 - t ** 2);
  }
  return 1 - Math.sqrt(1 - t);
};

const smoothStepPosition: PositionFunction = (t: number) => {
  return t ** 2 * (3 - 2 * t);
};

export const positionFunctions = {
  linearPosition,
  exponentialPosition,
  quadraticPosition,
  cubicPosition,
  quarticPosition,
  sinusoidalPosition,
  asinusoidalPosition,
  arcPosition,
  smoothStepPosition,
};

/**
 * Calculates the distance between two points
 * @param p1 The first point
 * @param p2 The second point
 * @param hueMode Whether to use the hue distance function
 * @returns The distance between the two points
 * @example
 * const p1 = [0, 0, 0];
 * const p2 = [1, 1, 1];
 * const dist = distance(p1, p2);
 * console.log(dist); // 1.7320508075688772
 **/
const distance = (
  p1: PartialVector3,
  p2: PartialVector3,
  hueMode = false
): number => {
  const a1 = p1[0];
  const a2 = p2[0];
  let diffA = 0;

  if (hueMode && a1 !== null && a2 !== null) {
    diffA = Math.min(Math.abs(a1 - a2), 360 - Math.abs(a1 - a2));
    diffA = diffA / 360;
  } else {
    diffA = a1 === null || a2 === null ? 0 : a1 - a2;
  }

  const a = diffA;
  const b = p1[1] === null || p2[1] === null ? 0 : p2[1] - p1[1];
  const c = p1[2] === null || p2[2] === null ? 0 : p2[2] - p1[2];

  return Math.sqrt(a * a + b * b + c * c);
};

export type ColorPointCollection = {
  xyz?: Vector3;
  color?: Vector3;
  invertedLightness?: boolean;
};

export class ColorPoint {
  public x = 0;
  public y = 0;
  public z = 0;
  public color: Vector3 = [0, 0, 0];
  private _invertedLightness = false;

  constructor({
    xyz,
    color,
    invertedLightness = false,
  }: ColorPointCollection = {}) {
    this._invertedLightness = invertedLightness;
    this.positionOrColor({ xyz, color, invertedLightness });
  }

  positionOrColor({
    xyz,
    color,
    invertedLightness = false,
  }: ColorPointCollection) {
    this._invertedLightness = invertedLightness;
    if ((xyz && color) || (!xyz && !color)) {
      throw new Error("Point must be initialized with either x,y,z or hsl");
    } else if (xyz) {
      this.x = xyz[0];
      this.y = xyz[1];
      this.z = xyz[2];
      this.color = pointToHSL([this.x, this.y, this.z], invertedLightness);
    } else if (color) {
      this.color = color;
      [this.x, this.y, this.z] = hslToPoint(color, invertedLightness);
    }
  }

  set position([x, y, z]: Vector3) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.color = pointToHSL(
      [this.x, this.y, this.z] as Vector3,
      this._invertedLightness
    );
  }

  get position(): Vector3 {
    return [this.x, this.y, this.z];
  }

  set hsl([h, s, l]: Vector3) {
    this.color = [h, s, l];
    [this.x, this.y, this.z] = hslToPoint(
      this.color as Vector3,
      this._invertedLightness
    );
  }

  get hsl(): Vector3 {
    return this.color;
  }

  get hslCSS(): string {
    const [h, s, l] = this.color;
    return `hsl(${h.toFixed(2)}, ${(s * 100).toFixed(2)}%, ${(l * 100).toFixed(
      2
    )}%)`;
  }

  get oklchCSS(): string {
    const [h, s, l] = this.color;
    return `oklch(${(l * 100).toFixed(2)}% ${(s * 0.4).toFixed(3)} ${h.toFixed(
      2
    )})`;
  }

  get lchCSS(): string {
    const [h, s, l] = this.color;
    return `lch(${(l * 100).toFixed(2)}% ${(s * 150).toFixed(2)} ${h.toFixed(
      2
    )})`;
  }

  set invertedLightness(val: boolean) {
    this._invertedLightness = val;
    this.color = pointToHSL(
      [this.x, this.y, this.z] as Vector3,
      this._invertedLightness
    );
  }

  get invertedLightness(): boolean {
    return this._invertedLightness;
  }

  shiftHue(angle: number): void {
    this.color[0] = (360 + (this.color[0] + angle)) % 360;
    [this.x, this.y, this.z] = hslToPoint(
      this.color as Vector3,
      this._invertedLightness
    );
  }
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
export class Poline {
  private _anchorPoints: ColorPoint[];

  private _numPoints: number;
  private points: ColorPoint[][];

  private _positionFunctionX = sinusoidalPosition;
  private _positionFunctionY = sinusoidalPosition;
  private _positionFunctionZ = sinusoidalPosition;

  private _anchorPairs: ColorPoint[][];

  private connectLastAndFirstAnchor = false;

  private _animationFrame: null | number = null;

  private _invertedLightness = false;

  constructor(
    {
      anchorColors = randomHSLPair(),
      numPoints = 4,
      positionFunction = sinusoidalPosition,
      positionFunctionX,
      positionFunctionY,
      positionFunctionZ,
      closedLoop,
      invertedLightness,
    }: PolineOptions = {
      anchorColors: randomHSLPair(),
      numPoints: 4,
      positionFunction: sinusoidalPosition,
      closedLoop: false,
    }
  ) {
    if (!anchorColors || anchorColors.length < 2) {
      throw new Error("Must have at least two anchor colors");
    }

    this._anchorPoints = anchorColors.map(
      (point) => new ColorPoint({ color: point, invertedLightness })
    );

    this._numPoints = numPoints + 2; // add two for the anchor points

    this._positionFunctionX =
      positionFunctionX || positionFunction || sinusoidalPosition;
    this._positionFunctionY =
      positionFunctionY || positionFunction || sinusoidalPosition;
    this._positionFunctionZ =
      positionFunctionZ || positionFunction || sinusoidalPosition;

    this.connectLastAndFirstAnchor = closedLoop || false;

    this._invertedLightness = invertedLightness || false;

    this.updateAnchorPairs();
  }

  public get numPoints(): number {
    return this._numPoints - 2;
  }

  public set numPoints(numPoints: number) {
    if (numPoints < 1) {
      throw new Error("Must have at least one point");
    }
    this._numPoints = numPoints + 2; // add two for the anchor points
    this.updateAnchorPairs();
  }

  public set positionFunction(
    positionFunction: PositionFunction | PositionFunction[]
  ) {
    if (Array.isArray(positionFunction)) {
      if (positionFunction.length !== 3) {
        throw new Error("Position function array must have 3 elements");
      }
      if (
        typeof positionFunction[0] !== "function" ||
        typeof positionFunction[1] !== "function" ||
        typeof positionFunction[2] !== "function"
      ) {
        throw new Error("Position function array must have 3 functions");
      }
      this._positionFunctionX = positionFunction[0];
      this._positionFunctionY = positionFunction[1];
      this._positionFunctionZ = positionFunction[2];
    } else {
      this._positionFunctionX = positionFunction;
      this._positionFunctionY = positionFunction;
      this._positionFunctionZ = positionFunction;
    }

    this.updateAnchorPairs();
  }

  public get positionFunction(): PositionFunction | PositionFunction[] {
    // not to sure what to do here, because the position function is a combination of the three
    if (
      this._positionFunctionX === this._positionFunctionY &&
      this._positionFunctionX === this._positionFunctionZ
    ) {
      return this._positionFunctionX;
    }

    return [
      this._positionFunctionX,
      this._positionFunctionY,
      this._positionFunctionZ,
    ];
  }

  public set positionFunctionX(positionFunctionX: PositionFunction) {
    this._positionFunctionX = positionFunctionX;
    this.updateAnchorPairs();
  }

  public get positionFunctionX(): PositionFunction {
    return this._positionFunctionX;
  }

  public set positionFunctionY(positionFunctionY: PositionFunction) {
    this._positionFunctionY = positionFunctionY;
    this.updateAnchorPairs();
  }

  public get positionFunctionY(): PositionFunction {
    return this._positionFunctionY;
  }

  public set positionFunctionZ(positionFunctionZ: PositionFunction) {
    this._positionFunctionZ = positionFunctionZ;
    this.updateAnchorPairs();
  }

  public get positionFunctionZ(): PositionFunction {
    return this._positionFunctionZ;
  }

  public get anchorPoints(): ColorPoint[] {
    return this._anchorPoints;
  }

  public set anchorPoints(anchorPoints: ColorPoint[]) {
    this._anchorPoints = anchorPoints;
    this.updateAnchorPairs();
  }

  public updateAnchorPairs(): void {
    this._anchorPairs = [] as ColorPoint[][];

    const anchorPointsLength = this.connectLastAndFirstAnchor
      ? this.anchorPoints.length
      : this.anchorPoints.length - 1;

    for (let i = 0; i < anchorPointsLength; i++) {
      const pair = [
        this.anchorPoints[i],
        this.anchorPoints[(i + 1) % this.anchorPoints.length],
      ] as ColorPoint[];

      this._anchorPairs.push(pair);
    }

    this.points = this._anchorPairs.map((pair, i) => {
      const p1position = pair[0] ? pair[0].position : ([0, 0, 0] as Vector3);
      const p2position = pair[1] ? pair[1].position : ([0, 0, 0] as Vector3);

      // Special handling for closed loop with exactly 2 anchors
      // we want to invert the ease for the first segment
      const shouldInvertEase = this.shouldInvertEaseForSegment(i);

      return vectorsOnLine(
        p1position,
        p2position,
        this._numPoints,
        shouldInvertEase ? true : false,
        this.positionFunctionX,
        this.positionFunctionY,
        this.positionFunctionZ
      ).map(
        (p) =>
          new ColorPoint({ xyz: p, invertedLightness: this._invertedLightness })
      );
    });
  }

  public addAnchorPoint({
    xyz,
    color,
    insertAtIndex,
  }: ColorPointCollection & { insertAtIndex?: number }): ColorPoint {
    const newAnchor = new ColorPoint({
      xyz,
      color,
      invertedLightness: this._invertedLightness,
    });
    if (insertAtIndex !== undefined) {
      this.anchorPoints.splice(insertAtIndex, 0, newAnchor);
    } else {
      this.anchorPoints.push(newAnchor);
    }
    this.updateAnchorPairs();
    return newAnchor;
  }

  public removeAnchorPoint({
    point,
    index,
  }: {
    point?: ColorPoint;
    index?: number;
  }): void {
    if (!point && index === undefined) {
      throw new Error("Must provide a point or index");
    }

    if (this.anchorPoints.length < 3) {
      throw new Error("Must have at least two anchor points");
    }

    let apid;

    if (index !== undefined) {
      apid = index;
    } else if (point) {
      apid = this.anchorPoints.indexOf(point);
    }

    if (apid > -1 && apid < this.anchorPoints.length) {
      this.anchorPoints.splice(apid, 1);
      this.updateAnchorPairs();
    } else {
      throw new Error("Point not found");
    }
  }

  public updateAnchorPoint({
    point,
    pointIndex,
    xyz,
    color,
  }: {
    point?: ColorPoint;
    pointIndex?: number;
  } & ColorPointCollection): ColorPoint {
    if (pointIndex !== undefined) {
      point = this.anchorPoints[pointIndex];
    }

    if (!point) {
      throw new Error("Must provide a point or pointIndex");
    }

    if (!xyz && !color) {
      throw new Error("Must provide a new xyz position or color");
    }

    if (xyz) point.position = xyz;
    if (color) point.hsl = color;

    this.updateAnchorPairs();

    return point;
  }

  public getClosestAnchorPoint({
    xyz,
    hsl,
    maxDistance = 1,
  }: {
    xyz?: PartialVector3;
    hsl?: PartialVector3;
    maxDistance?: number;
  }): ColorPoint | null {
    if (!xyz && !hsl) {
      throw new Error("Must provide a xyz or hsl");
    }

    let distances;

    if (xyz) {
      distances = this.anchorPoints.map((anchor) =>
        distance(anchor.position, xyz)
      );
    } else if (hsl) {
      distances = this.anchorPoints.map((anchor) =>
        distance(anchor.hsl, hsl, true)
      );
    }

    const minDistance = Math.min(...distances);

    if (minDistance > maxDistance) {
      return null;
    }

    const closestAnchorIndex = distances.indexOf(minDistance);

    return this.anchorPoints[closestAnchorIndex] || null;
  }

  public set closedLoop(newStatus: boolean) {
    this.connectLastAndFirstAnchor = newStatus;
    this.updateAnchorPairs();
  }

  public get closedLoop(): boolean {
    return this.connectLastAndFirstAnchor;
  }

  public set invertedLightness(newStatus: boolean) {
    this._invertedLightness = newStatus;
    this.anchorPoints.forEach((p) => (p.invertedLightness = newStatus));
    this.updateAnchorPairs();
  }

  public get invertedLightness(): boolean {
    return this._invertedLightness;
  }

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
  public get flattenedPoints() {
    return this.points
      .flat()
      .filter((p, i) => (i != 0 ? i % this._numPoints : true));
  }

  public get colors() {
    const colors = this.flattenedPoints.map((p) => p.color);
    if (this.connectLastAndFirstAnchor && this._anchorPoints.length !== 2) {
      colors.pop();
    }
    return colors;
  }

  public cssColors(mode: "hsl" | "oklch" | "lch" = "hsl"): string[] {
    const methods: CSSColorMethods = {
      hsl: (p: ColorPoint): string => p.hslCSS,
      oklch: (p: ColorPoint): string => p.oklchCSS,
      lch: (p: ColorPoint): string => p.lchCSS,
    };
    const cssColors = this.flattenedPoints.map(methods[mode]);
    if (this.connectLastAndFirstAnchor) {
      cssColors.pop();
    }
    return cssColors;
  }

  public get colorsCSS() {
    return this.cssColors("hsl");
  }

  public get colorsCSSlch() {
    return this.cssColors("lch");
  }

  public get colorsCSSoklch() {
    return this.cssColors("oklch");
  }

  public shiftHue(hShift = 20): void {
    this.anchorPoints.forEach((p) => p.shiftHue(hShift));
    this.updateAnchorPairs();
  }

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
  public getColorAt(t: number): ColorPoint {
    if (t < 0 || t > 1) {
      throw new Error("Position must be between 0 and 1");
    }

    if (this.anchorPoints.length === 0) {
      throw new Error("No anchor points available");
    }

    // For closed loops, we need to handle the full circle
    const totalSegments = this.connectLastAndFirstAnchor
      ? this.anchorPoints.length
      : this.anchorPoints.length - 1;

    // Special case: if we only have 2 anchors in a closed loop,
    // we actually have 2 segments going different ways
    const effectiveSegments =
      this.connectLastAndFirstAnchor && this.anchorPoints.length === 2
        ? 2
        : totalSegments;

    // Calculate which segment we're in and the position within that segment
    const segmentPosition = t * effectiveSegments;
    const segmentIndex = Math.floor(segmentPosition);
    const localT = segmentPosition - segmentIndex;

    // Handle edge case where t = 1 (end of line)
    const actualSegmentIndex =
      segmentIndex >= effectiveSegments ? effectiveSegments - 1 : segmentIndex;
    const actualLocalT = segmentIndex >= effectiveSegments ? 1 : localT;

    // Get the anchor pair for this segment
    const pair = this._anchorPairs[actualSegmentIndex];
    if (!pair || pair.length < 2 || !pair[0] || !pair[1]) {
      // Fallback to first anchor if something goes wrong
      return new ColorPoint({
        color: this.anchorPoints[0]?.color || [0, 0, 0],
        invertedLightness: this._invertedLightness,
      });
    }

    const p1position = pair[0].position;
    const p2position = pair[1].position;

    // Apply the same easing logic as in updateAnchorPairs
    const shouldInvertEase =
      this.shouldInvertEaseForSegment(actualSegmentIndex);

    // Use the existing vectorOnLine function for consistent interpolation
    const xyz = vectorOnLine(
      actualLocalT,
      p1position,
      p2position,
      shouldInvertEase,
      this._positionFunctionX,
      this._positionFunctionY,
      this._positionFunctionZ
    );

    return new ColorPoint({
      xyz,
      invertedLightness: this._invertedLightness,
    });
  }

  /**
   * Determines whether easing should be inverted for a given segment
   * @param segmentIndex The index of the segment
   * @returns Whether easing should be inverted
   */
  private shouldInvertEaseForSegment(segmentIndex: number): boolean {
    return !!(
      segmentIndex % 2 ||
      (this.connectLastAndFirstAnchor &&
        this.anchorPoints.length === 2 &&
        segmentIndex === 0)
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { p5 } = globalThis as any;

if (p5 && p5.VERSION && p5.VERSION.startsWith("1.")) {
  console.info("p5 < 1.x detected, adding poline to p5 prototype");

  const poline = new Poline();
  p5.prototype.poline = poline;

  const polineColors = () =>
    poline.colors.map(
      (c) => `hsl(${Math.round(c[0])},${c[1] * 100}%,${c[2] * 100}%)`
    );

  p5.prototype.registerMethod("polineColors", polineColors);

  globalThis.poline = poline;
  globalThis.polineColors = polineColors;
}
