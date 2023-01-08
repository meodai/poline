var __pow = Math.pow;

// src/index.ts
var pointToHSL = (x, y, z) => {
  const cy = 0.5;
  const cx = 0.5;
  const radians = Math.atan2(y - cy, x - cx);
  let deg = radians * (180 / Math.PI);
  deg = (deg + 90) % 360;
  const s = z;
  const dist = Math.sqrt(Math.pow(y - cy, 2) + Math.pow(x - cx, 2));
  const l = dist / cx;
  return [deg, s, l];
};
var hslToPoint = (hsl) => {
  const [h, s, l] = hsl;
  const cx = 0.5;
  const cy = 0.5;
  const radians = h / (180 / Math.PI) - 90;
  const dist = l * cx;
  const x = cx + dist * Math.cos(radians);
  const y = cy + dist * Math.sin(radians);
  const z = s;
  return [x, y, z];
};
var randomHSLPair = (minHDiff = 90, minSDiff = 0, minLDiff = 0.2, previousColor = null) => {
  let h1, s1, l1;
  if (previousColor) {
    [h1, s1, l1] = previousColor;
  } else {
    h1 = Math.random() * 360;
    s1 = Math.random();
    l1 = Math.random();
  }
  const h2 = (360 + (h1 + minHDiff + Math.random() * (360 - minHDiff * 2))) % 360;
  const s2 = minSDiff + Math.random() * (1 - minSDiff);
  const l2 = minSDiff + Math.random() * (1 - minLDiff);
  return [
    [h1, s1, l1],
    [h2, s2, l2]
  ];
};
var vectorsOnLine = (p1, p2, numPoints = 4, f = (t, p) => t) => {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const tModified = f(t, numPoints);
    const x = (1 - tModified) * p1[0] + tModified * p2[0];
    const y = (1 - tModified) * p1[1] + tModified * p2[1];
    const z = (1 - tModified) * p1[2] + tModified * p2[2];
    points.push([x, y, z]);
  }
  return points;
};
var linearPosition = (t) => {
  return t;
};
var exponentialPosition = (t) => {
  return __pow(t, 2);
};
var quadraticPosition = (t) => {
  return __pow(t, 3);
};
var cubicPosition = (t) => {
  return __pow(t, 4);
};
var quarticPosition = (t) => {
  return __pow(t, 5);
};
var quinticPosition = (t) => {
  return __pow(t, 6);
};
var sinusoidalPosition = (t) => {
  return Math.sin(t * Math.PI / 2);
};
var reverseSinusoidalPosition = (t) => {
  return 1 - Math.sin((1 - t) * Math.PI / 2);
};
var circularPosition = (t) => {
  return 1 - Math.sqrt(1 - __pow(t, 2));
};
var reverseCircularPosition = (t) => {
  return Math.sqrt(1 - __pow(1 - t, 2));
};
var arcPosition = (t) => {
  return 1 - Math.sqrt(1 - t);
};
var reverseArcPosition = (t) => {
  return Math.sqrt(1 - __pow(1 - t, 2));
};
var positionFunctions = {
  linearPosition,
  exponentialPosition,
  quadraticPosition,
  cubicPosition,
  quarticPosition,
  quinticPosition,
  sinusoidalPosition,
  reverseSinusoidalPosition,
  circularPosition,
  reverseCircularPosition,
  arcPosition,
  reverseArcPosition
};
var distance = (p1, p2) => {
  const a = p2[0] - p1[0];
  const b = p2[1] - p1[1];
  const c = p2[2] - p1[2];
  return Math.sqrt(a * a + b * b + c * c);
};
var ColorPoint = class {
  constructor({
    x = null,
    y = null,
    z = null,
    color = null
  } = {}) {
    this.position = { x, y, z, color };
  }
  set position({
    x = null,
    y = null,
    z = null,
    color = null
  }) {
    if (x && y && y && color) {
      throw new Error("Point must be initialized with either x,y,z or hsl");
    } else if (x && y && z) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.color = pointToHSL(this.x, this.y, this.z);
    } else if (color) {
      this.color = color;
      [this.x, this.y, this.z] = hslToPoint(this.color);
    }
  }
  get position() {
    return [this.x, this.y, this.z];
  }
  get hslCSS() {
    return `hsl(${this.color[0]}, ${this.color[1] * 100}%, ${this.color[2] * 100}%)`;
  }
};
var Poline = class {
  constructor(anchorColors = randomHSLPair(), numPoints = 6) {
    this.anchorPoints = anchorColors.map(
      (point) => new ColorPoint({ x: null, y: null, z: null, color: point })
    );
    this.numPoints = numPoints;
    this.points = vectorsOnLine(
      this.anchorPoints[0].position,
      this.anchorPoints[1].position,
      numPoints,
      exponentialPosition
    ).map((p) => new ColorPoint(
      { x: p[0], y: p[1], z: p[2], color: null }
    ));
  }
  createPointPairs() {
    const pairs = [];
    for (let i = 0; i < this.points.length - 1; i++) {
      pairs.push(
        [this.points[i], this.points[i + 1]]
      );
    }
    return pairs;
  }
  getClosestAnchorPoint(point, maxDistance) {
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
  set anchorPoint({ pointReference, pointIndex, x, y, z, color }) {
    let index = pointIndex;
    if (pointReference) {
      index = this.anchorPoints.indexOf(pointReference);
    }
    this.anchorPoints[index] = new ColorPoint({ x, y, z, color });
  }
  get colors() {
    return this.points.map((p) => p.color);
  }
  get colorsCSS() {
    return this.points.map((c) => c.hslCSS);
  }
};
export {
  Poline,
  hslToPoint,
  pointToHSL,
  positionFunctions,
  randomHSLPair,
  vectorsOnLine
};
//# sourceMappingURL=index.mjs.map
