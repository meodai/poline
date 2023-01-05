var __pow = Math.pow;

// src/index.ts
var pointToHSL = (x, y, saturation) => {
  const cy = 0.5;
  const cx = 0.5;
  const radians = Math.atan2(y - cy, x - cx);
  let deg = radians * (180 / Math.PI);
  deg = (deg + 90) % 360;
  const dist = Math.sqrt(Math.pow(y - cy, 2) + Math.pow(x - cx, 2));
  const l = dist / cx;
  return [deg, s, l];
};
var hslToPoint = (hsl) => {
  const [h, s2, l] = hsl;
  const cx = 0.5;
  const cy = 0.5;
  const radians = h / (180 / Math.PI) - 90;
  const dist = l * cx;
  const x = cx + dist * Math.cos(radians);
  const y = cy + dist * Math.sin(radians);
  return [x, y];
};
var randomHSLPair = (minHDiff = 90, minSDiff = 0, minLDiff = 0.2, previousColor) => {
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
  return [[h1, s1, l1], [h2, s2, l2]];
};
var pointsOnLine = (p1, p2, numPoints = 4, f = (t, p) => t) => {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    let t = i / (numPoints - 1);
    let tModified = f(t, numPoints);
    let x = (1 - tModified) * p1.x + tModified * p2.x;
    let y = (1 - tModified) * p1.y + tModified * p2.y;
    points.push([x, y]);
  }
  return points;
};
var exponentialDistance = (t, n) => {
  return __pow(t, 2);
};
var Poline = class {
  constructor(controlPoints, numPoints) {
    this.pointsAsColor = controlPoints;
    this.numPoints = numPoints;
    this.points = pointsOnLine(hslToPoint(hsl1), hslToPoint(hsl2), numPoints, exponentialDistance);
  }
  createPointPairs() {
    const pairs = [];
    for (let i = 0; i < this.points.length - 1; i++) {
      pairs.push([this.points[i], this.points[i + 1]]);
    }
    return pairs;
  }
};
export {
  Poline,
  exponentialDistance,
  hslToPoint,
  pointToHSL,
  pointsOnLine,
  randomHSLPair
};
//# sourceMappingURL=index.mjs.map
