"use strict";
var polinePicker = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // src/webcomponent.ts
  var webcomponent_exports = {};
  __export(webcomponent_exports, {
    Poline: () => Poline,
    PolinePicker: () => PolinePicker,
    positionFunctions: () => positionFunctions
  });

  // src/index.ts
  var pointToHSL = (xyz, invertedLightness) => {
    const [x, y, z] = xyz;
    const cx = 0.5;
    const cy = 0.5;
    const radians = Math.atan2(y - cy, x - cx);
    let deg = radians * (180 / Math.PI);
    deg = (360 + deg) % 360;
    const s = z;
    const dist = Math.sqrt(Math.pow(y - cy, 2) + Math.pow(x - cx, 2));
    const l = dist / cx;
    return [deg, s, invertedLightness ? 1 - l : l];
  };
  var hslToPoint = (hsl, invertedLightness) => {
    const [h, s, l] = hsl;
    const cx = 0.5;
    const cy = 0.5;
    const radians = h / (180 / Math.PI);
    const dist = (invertedLightness ? 1 - l : l) * cx;
    const x = cx + dist * Math.cos(radians);
    const y = cy + dist * Math.sin(radians);
    const z = s;
    return [x, y, z];
  };
  var randomHSLPair = (startHue = Math.random() * 360, saturations = [Math.random(), Math.random()], lightnesses = [0.75 + Math.random() * 0.2, 0.3 + Math.random() * 0.2]) => [
    [startHue, saturations[0], lightnesses[0]],
    [(startHue + 60 + Math.random() * 180) % 360, saturations[1], lightnesses[1]]
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
      return 1 - (1 - t) ** 2;
    }
    return t ** 2;
  };
  var quadraticPosition = (t, reverse = false) => {
    if (reverse) {
      return 1 - (1 - t) ** 3;
    }
    return t ** 3;
  };
  var cubicPosition = (t, reverse = false) => {
    if (reverse) {
      return 1 - (1 - t) ** 4;
    }
    return t ** 4;
  };
  var quarticPosition = (t, reverse = false) => {
    if (reverse) {
      return 1 - (1 - t) ** 5;
    }
    return t ** 5;
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
      return 1 - Math.sqrt(1 - t ** 2);
    }
    return 1 - Math.sqrt(1 - t);
  };
  var smoothStepPosition = (t) => {
    return t ** 2 * (3 - 2 * t);
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
    constructor({
      xyz,
      color,
      invertedLightness = false
    } = {}) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.color = [0, 0, 0];
      this._invertedLightness = false;
      this._invertedLightness = invertedLightness;
      this.positionOrColor({ xyz, color, invertedLightness });
    }
    positionOrColor({
      xyz,
      color,
      invertedLightness = false
    }) {
      if (xyz && color || !xyz && !color) {
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
    set position([x, y, z]) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.color = pointToHSL(
        [this.x, this.y, this.z],
        this._invertedLightness
      );
    }
    get position() {
      return [this.x, this.y, this.z];
    }
    set hsl([h, s, l]) {
      this.color = [h, s, l];
      [this.x, this.y, this.z] = hslToPoint(
        this.color,
        this._invertedLightness
      );
    }
    get hsl() {
      return this.color;
    }
    get hslCSS() {
      const [h, s, l] = this.color;
      return `hsl(${h.toFixed(2)}, ${(s * 100).toFixed(2)}%, ${(l * 100).toFixed(
        2
      )}%)`;
    }
    get oklchCSS() {
      const [h, s, l] = this.color;
      return `oklch(${(l * 100).toFixed(2)}% ${(s * 0.4).toFixed(3)} ${h.toFixed(
        2
      )})`;
    }
    get lchCSS() {
      const [h, s, l] = this.color;
      return `lch(${(l * 100).toFixed(2)}% ${(s * 150).toFixed(2)} ${h.toFixed(
        2
      )})`;
    }
    shiftHue(angle) {
      this.color[0] = (360 + (this.color[0] + angle)) % 360;
      [this.x, this.y, this.z] = hslToPoint(
        this.color,
        this._invertedLightness
      );
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
      closedLoop,
      invertedLightness
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
      this._invertedLightness = false;
      if (!anchorColors || anchorColors.length < 2) {
        throw new Error("Must have at least two anchor colors");
      }
      this._anchorPoints = anchorColors.map(
        (point) => new ColorPoint({ color: point, invertedLightness })
      );
      this._numPoints = numPoints + 2;
      this._positionFunctionX = positionFunctionX || positionFunction || sinusoidalPosition;
      this._positionFunctionY = positionFunctionY || positionFunction || sinusoidalPosition;
      this._positionFunctionZ = positionFunctionZ || positionFunction || sinusoidalPosition;
      this.connectLastAndFirstAnchor = closedLoop || false;
      this._invertedLightness = invertedLightness || false;
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
          (p) => new ColorPoint({ xyz: p, invertedLightness: this._invertedLightness })
        );
      });
    }
    addAnchorPoint({
      xyz,
      color,
      insertAtIndex
    }) {
      const newAnchor = new ColorPoint({
        xyz,
        color,
        invertedLightness: this._invertedLightness
      });
      if (insertAtIndex !== void 0) {
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
      if (this.anchorPoints.length < 3) {
        throw new Error("Must have at least two anchor points");
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
      if (pointIndex !== void 0) {
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
    set invertedLightness(newStatus) {
      this._invertedLightness = newStatus;
      this.updateAnchorPairs();
    }
    get invertedLightness() {
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
    get flattenedPoints() {
      return this.points.flat().filter((p, i) => i != 0 ? i % this._numPoints : true);
    }
    get colors() {
      const colors = this.flattenedPoints.map((p) => p.color);
      if (this.connectLastAndFirstAnchor && this._anchorPoints.length !== 2) {
        colors.pop();
      }
      return colors;
    }
    cssColors(mode = "hsl") {
      const methods = {
        hsl: (p) => p.hslCSS,
        oklch: (p) => p.oklchCSS,
        lch: (p) => p.lchCSS
      };
      const cssColors = this.flattenedPoints.map(methods[mode]);
      if (this.connectLastAndFirstAnchor) {
        cssColors.pop();
      }
      return cssColors;
    }
    get colorsCSS() {
      return this.cssColors("hsl");
    }
    get colorsCSSlch() {
      return this.cssColors("lch");
    }
    get colorsCSSoklch() {
      return this.cssColors("oklch");
    }
    shiftHue(hShift = 20) {
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
    getColorAt(t) {
      var _a;
      if (t < 0 || t > 1) {
        throw new Error("Position must be between 0 and 1");
      }
      if (this.anchorPoints.length === 0) {
        throw new Error("No anchor points available");
      }
      const totalSegments = this.connectLastAndFirstAnchor ? this.anchorPoints.length : this.anchorPoints.length - 1;
      const effectiveSegments = this.connectLastAndFirstAnchor && this.anchorPoints.length === 2 ? 2 : totalSegments;
      const segmentPosition = t * effectiveSegments;
      const segmentIndex = Math.floor(segmentPosition);
      const localT = segmentPosition - segmentIndex;
      const actualSegmentIndex = segmentIndex >= effectiveSegments ? effectiveSegments - 1 : segmentIndex;
      const actualLocalT = segmentIndex >= effectiveSegments ? 1 : localT;
      const pair = this._anchorPairs[actualSegmentIndex];
      if (!pair || pair.length < 2 || !pair[0] || !pair[1]) {
        return new ColorPoint({
          color: ((_a = this.anchorPoints[0]) == null ? void 0 : _a.color) || [0, 0, 0],
          invertedLightness: this._invertedLightness
        });
      }
      const p1position = pair[0].position;
      const p2position = pair[1].position;
      const shouldInvertEase = this.shouldInvertEaseForSegment(actualSegmentIndex);
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
        invertedLightness: this._invertedLightness
      });
    }
    /**
     * Determines whether easing should be inverted for a given segment
     * @param segmentIndex The index of the segment
     * @returns Whether easing should be inverted
     */
    shouldInvertEaseForSegment(segmentIndex) {
      return !!(segmentIndex % 2 || this.connectLastAndFirstAnchor && this.anchorPoints.length === 2 && segmentIndex === 0);
    }
  };
  var { p5 } = globalThis;
  if (p5 && p5.VERSION && p5.VERSION.startsWith("1.")) {
    console.info("p5 < 1.x detected, adding poline to p5 prototype");
    const poline = new Poline();
    p5.prototype.poline = poline;
    const polineColors = () => poline.colors.map(
      (c) => `hsl(${Math.round(c[0])},${c[1] * 100}%,${c[2] * 100}%)`
    );
    p5.prototype.registerMethod("polineColors", polineColors);
    globalThis.poline = poline;
    globalThis.polineColors = polineColors;
  }

  // src/webcomponent.ts
  var namespaceURI = "http://www.w3.org/2000/svg";
  var svgscale = 100;
  var PolinePicker = class extends HTMLElement {
    constructor() {
      super();
      this.currentPoint = null;
      this.allowAddPoints = false;
      // Store bound event handlers for cleanup
      this.boundPointerDown = this.handlePointerDown.bind(this);
      this.boundPointerMove = this.handlePointerMove.bind(this);
      this.boundPointerUp = this.handlePointerUp.bind(this);
      this.attachShadow({ mode: "open" });
      this.interactive = this.hasAttribute("interactive");
      this.allowAddPoints = this.hasAttribute("allow-add-points");
    }
    connectedCallback() {
      this.render();
      if (this.interactive) {
        this.addEventListeners();
      }
    }
    disconnectedCallback() {
      this.removeEventListeners();
    }
    setPoline(poline) {
      this.poline = poline;
      this.updateSVG();
      this.updateLightnessBackground();
    }
    setAllowAddPoints(allow) {
      this.allowAddPoints = allow;
    }
    addPointAtPosition(x, y) {
      if (!this.poline)
        return null;
      const normalizedX = x / this.svg.clientWidth;
      const normalizedY = y / this.svg.clientHeight;
      const newPoint = this.poline.addAnchorPoint({
        xyz: [normalizedX, normalizedY, normalizedY]
      });
      this.updateSVG();
      this.dispatchPolineChange();
      return newPoint;
    }
    updateLightnessBackground() {
      var _a;
      const picker = (_a = this.shadowRoot) == null ? void 0 : _a.querySelector(".picker");
      if (picker && this.poline) {
        if (this.poline.invertedLightness) {
          picker.style.setProperty("--maxL", "#000");
          picker.style.setProperty("--minL", "#fff");
        } else {
          picker.style.setProperty("--maxL", "#fff");
          picker.style.setProperty("--minL", "#000");
        }
      }
    }
    render() {
      if (!this.shadowRoot) {
        return;
      }
      this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        .picker {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          --wheelS: var(--poline-picker-wheel-saturation, .4);
          --wheelL: var(--poline-picker-wheel-lightness, .5);
          --minL: #000;
          --maxL: #fff;
          --grad: hsl(0deg calc(var(--wheelS) * 100%) calc(var(--wheelL) * 100%)) 0deg, hsl(60deg calc(var(--wheelS) * 100%) calc(var(--wheelL) * 100%)) 60deg, hsl(120deg calc(var(--wheelS) * 100%) calc(var(--wheelL) * 100%)) 120deg, hsl(180deg calc(var(--wheelS) * 100%) calc(var(--wheelL) * 100%)) 180deg, hsl(240deg calc(var(--wheelS) * 100%) calc(var(--wheelL) * 100%)) 240deg, hsl(300deg calc(var(--wheelS) * 100%) calc(var(--wheelL) * 100%)) 300deg, hsl(360deg calc(var(--wheelS) * 100%) calc(var(--wheelL) * 100%)) 360deg;
        }
        .picker::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(closest-side, var(--minL), rgba(255, 255, 255, 0), var(--maxL)), 
                      conic-gradient(from 90deg, var(--grad));
          z-index: 1;
        }
        svg {
          position: relative;
          z-index: 2;
          overflow: visible;
          width: 100%;
        }
        .wheel__line {
          stroke: var(--poline-picker-line-color, #000);
          stroke-width: calc(0.75 * var(--poline-picker-line-width, 0.2));
          fill: none;
        }
        .wheel__anchor {
          cursor: grab;
          stroke: var(--poline-picker-line-color, #000);
          stroke-width: var(--poline-picker-line-width, 0.2);
          fill: var(--poline-picker-bg-color, #fff);
        }
        .wheel__anchor:hover {
          cursor: grabbing;
        }
        .wheel__point {
          stroke: var(--poline-picker-line-color, #000);
          stroke-width: calc(0.75 * var(--poline-picker-line-width, 0.2));
          pointer-events: none;
        }
      </style>
    `;
      this.svg = this.createSVG();
      const pickerDiv = document.createElement("div");
      pickerDiv.className = "picker";
      pickerDiv.appendChild(this.svg);
      this.shadowRoot.appendChild(pickerDiv);
      this.wheel = this.svg.querySelector(".wheel");
      this.line = this.svg.querySelector(".wheel__line");
      this.anchors = this.svg.querySelector(".wheel__anchors");
      this.points = this.svg.querySelector(".wheel__points");
      if (this.poline) {
        this.updateSVG();
      }
    }
    createSVG() {
      const svg = document.createElementNS(namespaceURI, "svg");
      svg.setAttribute("viewBox", `0 0 ${svgscale} ${svgscale}`);
      svg.innerHTML = `
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
      <g class="wheel" filter="url(#goo)">
        <polyline class="wheel__line" points="" />
        <g class="wheel__anchors"></g>
        <g class="wheel__points"></g>
      </g>
    `;
      return svg;
    }
    updateSVG() {
      if (!this.poline || !this.svg) {
        return;
      }
      const pathPoints = this.poline.flattenedPoints.map((p) => {
        const cartesian = this.pointToCartesian(p);
        if (!cartesian)
          return "";
        const [x, y] = cartesian;
        return `${x},${y}`;
      }).filter((point) => point !== "").join(" ");
      this.line.setAttribute("points", pathPoints);
      this.anchors.innerHTML = "";
      this.points.innerHTML = "";
      this.poline.anchorPoints.forEach((point) => {
        const anchor = this.createCircleElement(point, "wheel__anchor", "2");
        if (anchor) {
          this.anchors.appendChild(anchor);
        }
      });
      this.poline.flattenedPoints.forEach((point) => {
        const radius = 0.5 + point.color[1];
        const circle = this.createCircleElement(point, "wheel__point", radius);
        if (circle) {
          this.points.appendChild(circle);
        }
      });
    }
    pointToCartesian(point) {
      const half = svgscale / 2;
      const x = half + (point.x - 0.5) * svgscale;
      const y = half + (point.y - 0.5) * svgscale;
      return [x, y];
    }
    addEventListeners() {
      if (!this.svg)
        return;
      this.svg.addEventListener("pointerdown", this.boundPointerDown);
      this.svg.addEventListener("pointermove", this.boundPointerMove);
      this.svg.addEventListener("pointerup", this.boundPointerUp);
    }
    removeEventListeners() {
      if (!this.svg)
        return;
      this.svg.removeEventListener("pointerdown", this.boundPointerDown);
      this.svg.removeEventListener("pointermove", this.boundPointerMove);
      this.svg.removeEventListener("pointerup", this.boundPointerUp);
    }
    handlePointerDown(e) {
      e.stopPropagation();
      const { normalizedX, normalizedY } = this.pointerToNormalizedCoordinates(e);
      const closestAnchor = this.poline.getClosestAnchorPoint({
        xyz: [normalizedX, normalizedY, null],
        maxDistance: 0.1
      });
      if (closestAnchor) {
        this.currentPoint = closestAnchor;
      } else if (this.allowAddPoints) {
        this.currentPoint = this.poline.addAnchorPoint({
          xyz: [normalizedX, normalizedY, normalizedY]
        });
        this.updateSVG();
        this.dispatchPolineChange();
      }
    }
    handlePointerMove(e) {
      if (this.currentPoint) {
        const { normalizedX, normalizedY } = this.pointerToNormalizedCoordinates(e);
        this.poline.updateAnchorPoint({
          point: this.currentPoint,
          xyz: [normalizedX, normalizedY, this.currentPoint.z]
        });
        this.updateSVG();
        this.dispatchPolineChange();
      }
    }
    handlePointerUp() {
      this.currentPoint = null;
    }
    getPointerPosition(e) {
      const rect = this.svg.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    pointerToNormalizedCoordinates(e) {
      const svgRect = this.svg.getBoundingClientRect();
      const svgX = (e.clientX - svgRect.left) / svgRect.width * svgscale;
      const svgY = (e.clientY - svgRect.top) / svgRect.height * svgscale;
      return {
        normalizedX: svgX / svgscale,
        normalizedY: svgY / svgscale
      };
    }
    createCircleElement(point, className, radius) {
      const cartesian = this.pointToCartesian(point);
      if (!cartesian)
        return null;
      const [x = 0, y = 0] = cartesian;
      const circle = document.createElementNS(namespaceURI, "circle");
      circle.setAttribute("class", className);
      circle.setAttribute("cx", x.toString());
      circle.setAttribute("cy", y.toString());
      circle.setAttribute("r", radius.toString());
      circle.setAttribute("fill", point.hslCSS);
      return circle;
    }
    dispatchPolineChange() {
      this.dispatchEvent(
        new CustomEvent("poline-change", {
          detail: { poline: this.poline }
        })
      );
    }
  };
  customElements.define("poline-picker", PolinePicker);
  return __toCommonJS(webcomponent_exports);
})();
