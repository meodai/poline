var __pow = Math.pow;

// src/index.ts
var pointToHSL = (xyz) => {
  const [x, y, z] = xyz;
  const cx = 0.5;
  const cy = 0.5;
  const radians = Math.atan2(y - cy, x - cx);
  let deg = radians * (180 / Math.PI);
  deg = (360 + deg) % 360;
  const s = z;
  const dist = Math.sqrt(Math.pow(y - cy, 2) + Math.pow(x - cx, 2));
  const l = dist / cx;
  return [deg, s, l];
};
var hslToPoint = (hsl) => {
  const [h, s, l] = hsl;
  const cx = 0.5;
  const cy = 0.5;
  const radians = h / (180 / Math.PI);
  const dist = l * cx;
  const x = cx + dist * Math.cos(radians);
  const y = cy + dist * Math.sin(radians);
  const z = s;
  return [x, y, z];
};
var randomHSLPair = (minHDiff = 90, minSDiff = 0, minLDiff = 0.25, previousColor = null) => {
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
var randomHSLTriple = (startHue = Math.random() * 360, saturations = [
  Math.random(),
  Math.random(),
  Math.random()
], lightnesses = [
  0.75 + Math.random() * 2,
  Math.random() * 0.2,
  0.75 + Math.random() * 2
]) => [
  [startHue, saturations[0], lightnesses[0]],
  [(startHue + 60 + Math.random() * 180) % 360, saturations[1], lightnesses[1]],
  [(startHue + 60 + Math.random() * 180) % 360, saturations[2], lightnesses[2]]
];
var vectorsOnLine = (p1, p2, numPoints = 4, invert = false, fx = (t, invert2) => invert2 ? 1 - t : t, fy = (t, invert2) => invert2 ? 1 - t : t, fz = (t, invert2) => invert2 ? 1 - t : t) => {
  const points = [];
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
var linearPosition = (t) => {
  return t;
};
var exponentialPosition = (t, reverse = false) => {
  if (reverse) {
    return 1 - __pow(1 - t, 2);
  }
  return __pow(t, 2);
};
var quadraticPosition = (t, reverse = false) => {
  if (reverse) {
    return 1 - __pow(1 - t, 3);
  }
  return __pow(t, 3);
};
var cubicPosition = (t, reverse = false) => {
  if (reverse) {
    return 1 - __pow(1 - t, 4);
  }
  return __pow(t, 4);
};
var quarticPosition = (t, reverse = false) => {
  if (reverse) {
    return 1 - __pow(1 - t, 5);
  }
  return __pow(t, 5);
};
var sinusoidalPosition = (t, reverse = false) => {
  if (reverse) {
    return 1 - Math.sin((1 - t) * Math.PI / 2);
  }
  return Math.sin(t * Math.PI / 2);
};
var asinusoidalPosition = (t, reverse = false) => {
  if (reverse) {
    return 1 - Math.asin(1 - t) / (Math.PI / 2);
  }
  return Math.asin(t) / (Math.PI / 2);
};
var buggyCosinePosition = (t, reverse = false) => {
  if (reverse) {
    return 1 - Math.cos((1 - t) * Math.PI / 2);
  }
  return Math.cos(t * Math.PI / 2);
};
var circularPosition = (t, reverse = false) => {
  if (reverse) {
    return 1 - Math.sqrt(1 - __pow(1 - t, 2));
  }
  return 1 - Math.sqrt(1 - __pow(t, 2));
};
var arcPosition = (t, reverse = false) => {
  if (reverse) {
    return Math.sqrt(1 - __pow(1 - t, 2));
  }
  return 1 - Math.sqrt(1 - t);
};
var positionFunctions = {
  linearPosition,
  exponentialPosition,
  quadraticPosition,
  cubicPosition,
  quarticPosition,
  sinusoidalPosition,
  asinusoidalPosition,
  buggyCosinePosition,
  circularPosition,
  arcPosition
};
var distance = (p1, p2) => {
  const a = p1[0] === null || p2[0] === null ? 0 : p2[0] - p1[0];
  const b = p1[1] === null || p2[1] === null ? 0 : p2[1] - p1[1];
  const c = p1[1] === null || p2[1] === null ? 0 : p2[2] - p1[2];
  return Math.sqrt(a * a + b * b + c * c);
};
var ColorPoint = class {
  constructor({ x, y, z, color } = {}) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.color = [0, 0, 0];
    this.positionOrColor = { x, y, z, color };
  }
  set positionOrColor({ x, y, z, color }) {
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
  shiftHue(angle) {
    this.color[0] = (360 + (this.color[0] + angle)) % 360;
    [this.x, this.y, this.z] = hslToPoint(this.color);
  }
  get position() {
    return [this.x, this.y, this.z];
  }
  get hslCSS() {
    return `hsl(${this.color[0]}, ${this.color[1] * 100}%, ${this.color[2] * 100}%)`;
  }
};
var Poline = class {
  constructor({
    anchorColors,
    numPoints,
    positionFunction,
    positionFunctionY,
    positionFunctionZ,
    closedLoop
  } = {
    anchorColors: randomHSLPair(),
    numPoints: 4,
    positionFunction: sinusoidalPosition,
    closedLoop: false
  }) {
    this.positionFunction = sinusoidalPosition;
    this.positionFunctionY = sinusoidalPosition;
    this.positionFunctionZ = sinusoidalPosition;
    this.connectLastAndFirstAnchor = false;
    if (!anchorColors || anchorColors.length < 2) {
      throw new Error("Must have at least two anchor colors");
    }
    if (numPoints < 1) {
      throw new Error("Must have at least one point");
    }
    this.anchorPoints = anchorColors.map(
      (point) => new ColorPoint({ color: point })
    );
    this.numPoints = numPoints + 2;
    this.positionFunction = positionFunction;
    this.positionFunctionY = positionFunctionY || positionFunction;
    this.positionFunctionZ = positionFunctionZ || positionFunction;
    this.connectLastAndFirstAnchor = closedLoop;
    this.updatePointPairs();
  }
  updatePointPairs() {
    const pairs = [];
    const anchorPointsLength = this.connectLastAndFirstAnchor ? this.anchorPoints.length : this.anchorPoints.length - 1;
    for (let i = 0; i < anchorPointsLength; i++) {
      const pair = [
        this.anchorPoints[i],
        this.anchorPoints[(i + 1) % this.anchorPoints.length]
      ];
      pairs.push(pair);
    }
    this.points = pairs.map((pair, i) => {
      const p1position = pair[0] ? pair[0].position : [0, 0, 0];
      const p2position = pair[1] ? pair[1].position : [0, 0, 0];
      return vectorsOnLine(
        p1position,
        p2position,
        this.numPoints,
        i % 2 ? true : false,
        this.positionFunction,
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
    insertAtIndex
  }) {
    const newAnchor = new ColorPoint({ x, y, z, color });
    if (insertAtIndex) {
      this.anchorPoints.splice(insertAtIndex, 0, newAnchor);
    } else {
      this.anchorPoints.push(newAnchor);
    }
    this.updatePointPairs();
    return newAnchor;
  }
  removeAnchorPoint(point) {
    const index = this.anchorPoints.indexOf(point);
    if (index > -1) {
      this.anchorPoints.splice(index, 1);
    }
    this.updatePointPairs();
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
  set closedLoop(newStatus) {
    this.connectLastAndFirstAnchor = newStatus;
    this.updatePointPairs();
  }
  set anchorPoint({
    pointReference,
    pointIndex,
    x,
    y,
    z,
    color
  }) {
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
    return this.points.flat().filter((p, i) => i != 0 ? i % this.numPoints : true);
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
  shiftHue(hShift) {
    this.anchorPoints.forEach((p) => p.shiftHue(hShift));
    this.updatePointPairs();
  }
};
export {
  Poline,
  hslToPoint,
  pointToHSL,
  positionFunctions,
  randomHSLPair,
  randomHSLTriple,
  vectorsOnLine
};
//# sourceMappingURL=index.mjs.map
