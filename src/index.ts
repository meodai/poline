export type FuncNumberReturn = (arg0: number) => Vector2;
export type Vector2 = [number, number];
export type Vector3 = [number, number, number];

export const pointToHSL = (
  x: number,
  y: number,
  saturation: number
): Vector3 => {
  const cy = 0.5;
  const cx = 0.5;
  const radians = Math.atan2(y - cy, x - cx);
  let deg = radians * (180 / Math.PI);
  deg = (deg + 90) % 360;

  const dist = Math.sqrt(Math.pow(y - cy, 2) + Math.pow(x - cx, 2));

  const l = dist / cx;

  return [deg, s, l];
};

export const hslToPoint = (hsl: Vector3): Vector2 => {
  const [h, s, l] = hsl;
  const cx = 0.5;
  const cy = 0.5;

  const radians = h / (180 / Math.PI) - 90;
  const dist = l * cx;
  const x = cx + dist * Math.cos(radians);
  const y = cy + dist * Math.sin(radians);

  return [x, y];
};

export const randomHSLPair = (
  minHDiff = 90,
  minSDiff = 0,
  minLDiff = 0.2,
  previousColor: Vector3
): [Vector3, Vector3] => {
  let h1, s1, l1;

  if (previousColor) {
    [h1, s1, l1] = previousColor;
  } else {
    h1 = Math.random() * 360;
    s1 = Math.random();
    l1 = Math.random();
  }

  const h2 =
    (360 + (h1 + minHDiff + Math.random() * (360 - minHDiff * 2))) % 360;
  const s2 = minSDiff + Math.random() * (1 - minSDiff);
  const l2 = minSDiff + Math.random() * (1 - minLDiff);

  return [
    [h1, s1, l1],
    [h2, s2, l2],
  ];
};

export const vectorsOnLine = (
  p1: Vector2,
  p2: Vector2,
  numPoints = 4,
  f = (t, p) => t
):Vector2[] => {
  const points:Vector2[] = [];

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const tModified = f(t, numPoints);
    const x = (1 - tModified) * p1.x + tModified * p2.x;
    const y = (1 - tModified) * p1.y + tModified * p2.y;
    points.push([x, y]);
  }

  return points;
};

export const exponentialDistance = (t: number, n: number) => {
  return t ** 2;
};

class ColorPoint {
  constructor(options: { x: number; y: number; color: Vector3 }) {
    if (options.x && options.y && options.color) {
      throw new Error("Point must be initialized with either x,y or hsl");
    } else if (options.x && options.y) {
      this.x = options.x;
      this.y = options.y;
      this.color = pointToHSL(this.x, this.y, 1);
    } else if (options.color) {
      this.color = options.color;
      [this.x, this.y] = hslToPoint(this.color);
    }
  }

  x:number;
  y:number;
  color: Vector3;
}

export class Poline {
  constructor(controlPoints: [Vector3], numPoints: number) {
    this.pointsAsColor = controlPoints;
    this.numPoints = numPoints;
    this.points = vectorsOnLine(
      hslToPoint(hsl1),
      hslToPoint(hsl2),
      numPoints,
      exponentialDistance
    );
  }

  pointsAsColor: Vector3[];
  numPoints: number;
  points: Vector2[];

  createPointPairs() {
    const pairs = [];
    for (let i = 0; i < this.points.length - 1; i++) {
      pairs.push([this.points[i], this.points[i + 1]]);
    }
    return pairs;
  }
}
