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

export const pointToHSL = (xyz: Vector3): Vector3 => {
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
  return [deg, s, l];
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
export const hslToPoint = (hsl: Vector3): Vector3 => {
  // Destructure the input array into separate hue, saturation, and lightness values
  const [h, s, l] = hsl;
  // cx and cy are the center (x and y) values
  const cx = 0.5;
  const cy = 0.5;
  // Calculate the angle in radians based on the hue value
  const radians = h / (180 / Math.PI);
  // Calculate the distance from the center based on the lightness value
  const dist = l * cx;
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

export const vectorsOnLine = (
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
    const t = i / (numPoints - 1);
    const tModifiedX = fx(t, invert);
    const tModifiedY = fy(t, invert);
    const tModifiedZ = fz(t, invert);
    const x = (1 - tModifiedX) * p1[0] + tModifiedX * p2[0];
    const y = (1 - tModifiedY) * p1[1] + tModifiedY * p2[1];
    const z = (1 - tModifiedZ) * p1[2] + tModifiedZ * p2[2];

    points.push([x, y, z]);
  }

  return points;
};

const linearPosition = (t: number) => {
  return t;
};

const exponentialPosition = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - (1 - t) ** 2;
  }
  return t ** 2;
};

const quadraticPosition = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - (1 - t) ** 3;
  }
  return t ** 3;
};

const cubicPosition = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - (1 - t) ** 4;
  }
  return t ** 4;
};

const quarticPosition = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - (1 - t) ** 5;
  }
  return t ** 5;
};

const sinusoidalPosition = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - Math.sin(((1 - t) * Math.PI) / 2);
  }
  return Math.sin((t * Math.PI) / 2);
};

const asinusoidalPosition = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - Math.asin(1 - t) / (Math.PI / 2);
  }
  return Math.asin(t) / (Math.PI / 2);
};

const buggyCosinePosition = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - Math.cos(((1 - t) * Math.PI) / 2);
  }
  return Math.cos((t * Math.PI) / 2);
};

// Math.sqrt(1 - (1 - t) ** 2)
// Math,atan2(Math.sqrt(1 - t ** 2), t)

const circularPosition = (t: number, reverse = false) => {
  if (reverse) {
    return 1 - Math.sqrt(1 - (1 - t) ** 2);
  }
  return 1 - Math.sqrt(1 - t ** 2);
};

const arcPosition = (t: number, reverse = false) => {
  if (reverse) {
    return Math.sqrt(1 - (1 - t) ** 2);
  }
  return 1 - Math.sqrt(1 - t);
};

export const positionFunctions = {
  linearPosition,
  exponentialPosition,
  quadraticPosition,
  cubicPosition,
  quarticPosition,
  sinusoidalPosition,
  asinusoidalPosition,
  buggyCosinePosition,
  circularPosition,
  arcPosition,
};

/**
 * Calculates the distance between two points
 * @param p1 The first point
 * @param p2 The second point
 * @returns The distance between the two points
 * @example
 * const p1 = [0, 0, 0];
 * const p2 = [1, 1, 1];
 * const dist = distance(p1, p2);
 * console.log(dist); // 1.7320508075688772
 **/
const distance = (p1, p2) => {
  const a = p1[0] === null || p2[0] === null ? 0 : p2[0] - p1[0];
  const b = p1[1] === null || p2[1] === null ? 0 : p2[1] - p1[1];
  const c = p1[1] === null || p2[1] === null ? 0 : p2[2] - p1[2];

  return Math.sqrt(a * a + b * b + c * c);
};

type ColorPointCollection = {
  x?: number;
  y?: number;
  z?: number;
  color?: Vector3;
  insertAtIndex?: number;
};

class ColorPoint {
  public x = 0;
  public y = 0;
  public z = 0;
  public color: Vector3 = [0, 0, 0];

  constructor({ x, y, z, color }: ColorPointCollection = {}) {
    this.positionOrColor({ x, y, z, color });
  }

  positionOrColor({ x, y, z, color }: ColorPointCollection) {
    if (x && y && y && color) {
      throw new Error("Point must be initialized with either x,y,z or hsl");
    } else if (x && y && z) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.color = pointToHSL([this.x, this.y, this.z]);
    } else if (color) {
      this.color = color;
      [this.x, this.y, this.z] = hslToPoint(color);
    }
  }

  set position([x, y, z]: Vector3) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.color = pointToHSL([this.x, this.y, this.z]);
  }

  get position(): Vector3 {
    return [this.x, this.y, this.z];
  }

  set hsl([h, s, l]: Vector3) {
    this.color = [h, s, l];
    [this.x, this.y, this.z] = hslToPoint(this.color);
  }

  get hsl(): Vector3 {
    return this.color;
  }

  shiftHue(angle: number): void {
    this.color[0] = (360 + (this.color[0] + angle)) % 360;

    [this.x, this.y, this.z] = hslToPoint(this.color);
  }

  get hslCSS(): string {
    return `hsl(${this.color[0]}, ${this.color[1] * 100}%, ${
      this.color[2] * 100
    }%)`;
  }
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

export class Poline {
  public anchorPoints: ColorPoint[];

  private numPoints: number;
  private points: ColorPoint[][];

  private positionFunctionX = sinusoidalPosition;
  private positionFunctionY = sinusoidalPosition;
  private positionFunctionZ = sinusoidalPosition;

  private connectLastAndFirstAnchor = false;

  constructor(
    {
      anchorColors = randomHSLPair(),
      numPoints = 4,
      positionFunction = sinusoidalPosition,
      positionFunctionX,
      positionFunctionY,
      positionFunctionZ,
      closedLoop,
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

    if (numPoints < 1) {
      throw new Error("Must have at least one point");
    }

    this.anchorPoints = anchorColors.map(
      (point) => new ColorPoint({ color: point })
    );

    this.numPoints = numPoints + 2; // add two for the anchor points
    this.positionFunctionX =
      positionFunctionX || positionFunction || sinusoidalPosition;
    this.positionFunctionY =
      positionFunctionY || positionFunction || sinusoidalPosition;
    this.positionFunctionZ =
      positionFunctionZ || positionFunction || sinusoidalPosition;

    this.connectLastAndFirstAnchor = closedLoop;

    this.updatePointPairs();
  }

  updatePointPairs(): void {
    const pairs = [] as ColorPoint[][];

    const anchorPointsLength = this.connectLastAndFirstAnchor
      ? this.anchorPoints.length
      : this.anchorPoints.length - 1;

    for (let i = 0; i < anchorPointsLength; i++) {
      const pair = [
        this.anchorPoints[i],
        this.anchorPoints[(i + 1) % this.anchorPoints.length],
      ] as ColorPoint[];

      pairs.push(pair);
    }

    this.points = pairs.map((pair, i) => {
      const p1position = pair[0] ? pair[0].position : ([0, 0, 0] as Vector3);
      const p2position = pair[1] ? pair[1].position : ([0, 0, 0] as Vector3);

      return vectorsOnLine(
        p1position,
        p2position,
        this.numPoints,
        i % 2 ? true : false,
        this.positionFunctionX,
        this.positionFunctionY,
        this.positionFunctionZ
      ).map((p) => new ColorPoint({ x: p[0], y: p[1], z: p[2] }));
    });
  }

  addAnchorPoint({
    x,
    y,
    z,
    color,
    insertAtIndex,
  }: ColorPointCollection): ColorPoint {
    const newAnchor = new ColorPoint({ x, y, z, color });
    if (insertAtIndex) {
      this.anchorPoints.splice(insertAtIndex, 0, newAnchor);
    } else {
      this.anchorPoints.push(newAnchor);
    }
    this.updatePointPairs();
    return newAnchor;
  }

  removeAnchorPoint(point: ColorPoint): void {
    const index = this.anchorPoints.indexOf(point);
    if (index > -1) {
      this.anchorPoints.splice(index, 1);
    }
    this.updatePointPairs();
  }

  getClosestAnchorPoint(point: Vector3, maxDistance: 1) {
    const distances = this.anchorPoints.map((anchor) => {
      return distance(anchor.position, point);
    });

    const minDistance = Math.min(...distances);

    if (minDistance > maxDistance) {
      return null;
    }

    const closestAnchorIndex = distances.indexOf(minDistance);

    return this.anchorPoints[closestAnchorIndex];
  }

  public set closedLoop(newStatus: boolean) {
    this.connectLastAndFirstAnchor = newStatus;
    this.updatePointPairs();
  }

  public set anchorPoint({
    pointReference,
    pointIndex,
    x,
    y,
    z,
    color,
  }: AnchorPointReference) {
    let index = pointIndex;

    if (pointReference) {
      index = this.anchorPoints.indexOf(pointReference);
    }

    if (index == -1) {
      throw new Error("Anchor point not found");
    } else if (index == 0 || index == this.anchorPoints.length - 1) {
      this.anchorPoints[index] = new ColorPoint({ x, y, z, color });
      this.updatePointPairs();
    }
  }

  get flattenedPoints() {
    return this.points
      .flat()
      .filter((p, i) => (i != 0 ? i % this.numPoints : true));
  }

  get colors() {
    const colors = this.flattenedPoints.map((p) => p.color);
    if (this.connectLastAndFirstAnchor) {
      colors.pop();
    }
    return colors;
  }

  get colorsCSS() {
    const cssColors = this.flattenedPoints.map((p) => p.hslCSS);
    if (this.connectLastAndFirstAnchor) {
      cssColors.pop();
    }
    return cssColors;
  }

  shiftHue(hShift: number): void {
    this.anchorPoints.forEach((p) => p.shiftHue(hShift));
    this.updatePointPairs();
  }
}
