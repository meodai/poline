"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __pow = Math.pow;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Poline: () => Poline,
  hslToPoint: () => hslToPoint,
  pointToHSL: () => pointToHSL,
  positionFunctions: () => positionFunctions,
  randomHSLPair: () => randomHSLPair,
  randomHSLTriple: () => randomHSLTriple
});
module.exports = __toCommonJS(src_exports);
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
var randomHSLPair = (startHue = Math.random() * 360, saturations = [Math.random(), Math.random()], lightnesses = [0.75 + Math.random() * 0.2, 0.3 + Math.random() * 0.2]) => [
  [startHue, saturations[0], lightnesses[0]],
  [(startHue + 60 + Math.random() * 180) % 360, saturations[1], lightnesses[1]]
];
var randomHSLTriple = (startHue = Math.random() * 360, saturations = [Math.random(), Math.random(), Math.random()], lightnesses = [
  0.75 + Math.random() * 0.2,
  Math.random() * 0.2,
  0.75 + Math.random() * 0.2
]) => [
  [startHue, saturations[0], lightnesses[0]],
  [(startHue + 60 + Math.random() * 180) % 360, saturations[1], lightnesses[1]],
  [(startHue + 60 + Math.random() * 180) % 360, saturations[2], lightnesses[2]]
];
var vectorOnLine = (t, p1, p2, invert = false, fx = (t2, invert2) => invert2 ? 1 - t2 : t2, fy = (t2, invert2) => invert2 ? 1 - t2 : t2, fz = (t2, invert2) => invert2 ? 1 - t2 : t2) => {
  const tModifiedX = fx(t, invert);
  const tModifiedY = fy(t, invert);
  const tModifiedZ = fz(t, invert);
  const x = (1 - tModifiedX) * p1[0] + tModifiedX * p2[0];
  const y = (1 - tModifiedY) * p1[1] + tModifiedY * p2[1];
  const z = (1 - tModifiedZ) * p1[2] + tModifiedZ * p2[2];
  return [x, y, z];
};
var vectorsOnLine = (p1, p2, numPoints = 4, invert = false, fx = (t, invert2) => invert2 ? 1 - t : t, fy = (t, invert2) => invert2 ? 1 - t : t, fz = (t, invert2) => invert2 ? 1 - t : t) => {
  const points = [];
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
var arcPosition = (t, reverse = false) => {
  if (reverse) {
    return Math.sqrt(1 - __pow(1 - t, 2));
  }
  return 1 - Math.sqrt(1 - t);
};
var smoothStepPosition = (t) => {
  return __pow(t, 2) * (3 - 2 * t);
};
var positionFunctions = {
  linearPosition,
  exponentialPosition,
  quadraticPosition,
  cubicPosition,
  quarticPosition,
  sinusoidalPosition,
  asinusoidalPosition,
  arcPosition,
  smoothStepPosition
};
var distance = (p1, p2, hueMode = false) => {
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
var ColorPoint = class {
  constructor({ xyz, color } = {}) {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.color = [0, 0, 0];
    this.positionOrColor({ xyz, color });
  }
  positionOrColor({ xyz, color }) {
    if (xyz && color) {
      throw new Error("Point must be initialized with either x,y,z or hsl");
    } else if (xyz) {
      this.x = xyz[0];
      this.y = xyz[1];
      this.z = xyz[2];
      this.color = pointToHSL([this.x, this.y, this.z]);
    } else if (color) {
      this.color = color;
      [this.x, this.y, this.z] = hslToPoint(color);
    }
  }
  set position([x, y, z]) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.color = pointToHSL([this.x, this.y, this.z]);
  }
  get position() {
    return [this.x, this.y, this.z];
  }
  set hsl([h, s, l]) {
    this.color = [h, s, l];
    [this.x, this.y, this.z] = hslToPoint(this.color);
  }
  get hsl() {
    return this.color;
  }
  get hslCSS() {
    return `hsl(${this.color[0].toFixed(2)}, ${(this.color[1] * 100).toFixed(
      2
    )}%, ${(this.color[2] * 100).toFixed(2)}%)`;
  }
  shiftHue(angle) {
    this.color[0] = (360 + (this.color[0] + angle)) % 360;
    [this.x, this.y, this.z] = hslToPoint(this.color);
  }
};
var Poline = class {
  constructor({
    anchorColors = randomHSLPair(),
    numPoints = 4,
    positionFunction = sinusoidalPosition,
    positionFunctionX,
    positionFunctionY,
    positionFunctionZ,
    closedLoop
  } = {
    anchorColors: randomHSLPair(),
    numPoints: 4,
    positionFunction: sinusoidalPosition,
    closedLoop: false
  }) {
    this._needsUpdate = true;
    this._positionFunctionX = sinusoidalPosition;
    this._positionFunctionY = sinusoidalPosition;
    this._positionFunctionZ = sinusoidalPosition;
    this.connectLastAndFirstAnchor = false;
    this._animationFrame = null;
    if (!anchorColors || anchorColors.length < 2) {
      throw new Error("Must have at least two anchor colors");
    }
    this._anchorPoints = anchorColors.map(
      (point) => new ColorPoint({ color: point })
    );
    this._numPoints = numPoints + 2;
    this._positionFunctionX = positionFunctionX || positionFunction || sinusoidalPosition;
    this._positionFunctionY = positionFunctionY || positionFunction || sinusoidalPosition;
    this._positionFunctionZ = positionFunctionZ || positionFunction || sinusoidalPosition;
    this.connectLastAndFirstAnchor = closedLoop;
    this.updateAnchorPairs();
  }
  get numPoints() {
    return this._numPoints - 2;
  }
  set numPoints(numPoints) {
    if (numPoints < 1) {
      throw new Error("Must have at least one point");
    }
    this._numPoints = numPoints + 2;
    this.updateAnchorPairs();
  }
  set positionFunction(positionFunction) {
    if (Array.isArray(positionFunction)) {
      if (positionFunction.length !== 3) {
        throw new Error("Position function array must have 3 elements");
      }
      if (typeof positionFunction[0] !== "function" || typeof positionFunction[1] !== "function" || typeof positionFunction[2] !== "function") {
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
  get positionFunction() {
    if (this._positionFunctionX === this._positionFunctionY && this._positionFunctionX === this._positionFunctionZ) {
      return this._positionFunctionX;
    }
    return [
      this._positionFunctionX,
      this._positionFunctionY,
      this._positionFunctionZ
    ];
  }
  set positionFunctionX(positionFunctionX) {
    this._positionFunctionX = positionFunctionX;
    this.updateAnchorPairs();
  }
  get positionFunctionX() {
    return this._positionFunctionX;
  }
  set positionFunctionY(positionFunctionY) {
    this._positionFunctionY = positionFunctionY;
    this.updateAnchorPairs();
  }
  get positionFunctionY() {
    return this._positionFunctionY;
  }
  set positionFunctionZ(positionFunctionZ) {
    this._positionFunctionZ = positionFunctionZ;
    this.updateAnchorPairs();
  }
  get positionFunctionZ() {
    return this._positionFunctionZ;
  }
  get anchorPoints() {
    return this._anchorPoints;
  }
  set anchorPoints(anchorPoints) {
    this._anchorPoints = anchorPoints;
    this.updateAnchorPairs();
  }
  updateAnchorPairs() {
    this._anchorPairs = [];
    const anchorPointsLength = this.connectLastAndFirstAnchor ? this.anchorPoints.length : this.anchorPoints.length - 1;
    for (let i = 0; i < anchorPointsLength; i++) {
      const pair = [
        this.anchorPoints[i],
        this.anchorPoints[(i + 1) % this.anchorPoints.length]
      ];
      this._anchorPairs.push(pair);
    }
    this.points = this._anchorPairs.map((pair, i) => {
      const p1position = pair[0] ? pair[0].position : [0, 0, 0];
      const p2position = pair[1] ? pair[1].position : [0, 0, 0];
      return vectorsOnLine(
        p1position,
        p2position,
        this._numPoints,
        i % 2 ? true : false,
        this.positionFunctionX,
        this.positionFunctionY,
        this.positionFunctionZ
      ).map((p) => new ColorPoint({ xyz: p }));
    });
  }
  addAnchorPoint({
    xyz,
    color,
    insertAtIndex
  }) {
    const newAnchor = new ColorPoint({ xyz, color });
    if (insertAtIndex) {
      this.anchorPoints.splice(insertAtIndex, 0, newAnchor);
    } else {
      this.anchorPoints.push(newAnchor);
    }
    this.updateAnchorPairs();
    return newAnchor;
  }
  removeAnchorPoint({
    point,
    index
  }) {
    if (!point && index === void 0) {
      throw new Error("Must provide a point or index");
    }
    let apid;
    if (index !== void 0) {
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
  updateAnchorPoint({
    point,
    pointIndex,
    xyz,
    color
  }) {
    if (pointIndex) {
      point = this.anchorPoints[pointIndex];
    }
    if (!point) {
      throw new Error("Must provide a point or pointIndex");
    }
    if (!xyz && !color) {
      throw new Error("Must provide a new xyz position or color");
    }
    if (xyz)
      point.position = xyz;
    if (color)
      point.hsl = color;
    this.updateAnchorPairs();
    return point;
  }
  getClosestAnchorPoint({
    xyz,
    hsl,
    maxDistance = 1
  }) {
    if (!xyz && !hsl) {
      throw new Error("Must provide a xyz or hsl");
    }
    let distances;
    if (xyz) {
      distances = this.anchorPoints.map(
        (anchor) => distance(anchor.position, xyz)
      );
    } else if (hsl) {
      distances = this.anchorPoints.map(
        (anchor) => distance(anchor.hsl, hsl, true)
      );
    }
    const minDistance = Math.min(...distances);
    if (minDistance > maxDistance) {
      return null;
    }
    const closestAnchorIndex = distances.indexOf(minDistance);
    return this.anchorPoints[closestAnchorIndex] || null;
  }
  set closedLoop(newStatus) {
    this.connectLastAndFirstAnchor = newStatus;
    this.updateAnchorPairs();
  }
  get closedLoop() {
    return this.connectLastAndFirstAnchor;
  }
  get flattenedPoints() {
    return this.points.flat().filter((p, i) => i != 0 ? i % this._numPoints : true);
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
  shiftHue(hShift = 20) {
    this.anchorPoints.forEach((p) => p.shiftHue(hShift));
    this.updateAnchorPairs();
  }
};
var { p5 } = globalThis;
if (p5) {
  console.info("p5 detected, adding poline to p5 prototype");
  const poline = new Poline();
  p5.prototype.poline = poline;
  const polineColors = () => poline.colors.map(
    (c) => /*p5.Color(c)*/
    `hsl(${Math.round(c[0])},${c[1] * 100}%,${c[2] * 100}%)`
  );
  p5.prototype.polineColors = polineColors;
  p5.prototype.registerMethod("polineColors", p5.prototype.polineColors);
  globalThis.poline = poline;
  globalThis.polineColors = polineColors;
}
