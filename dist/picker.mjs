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
var clampToCircle = (x, y) => {
  const cx = 0.5;
  const cy = 0.5;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.hypot(dx, dy);
  if (dist <= 0.5) {
    return [x, y];
  }
  return [cx + dx / dist * 0.5, cy + dy / dist * 0.5];
};
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
    this._invertedLightness = invertedLightness;
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
  set invertedLightness(val) {
    this._invertedLightness = val;
    this.color = pointToHSL(
      [this.x, this.y, this.z],
      this._invertedLightness
    );
  }
  get invertedLightness() {
    return this._invertedLightness;
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
    invertedLightness,
    clampToCircle: clampToCircle2
  } = {
    anchorColors: randomHSLPair(),
    numPoints: 4,
    positionFunction: sinusoidalPosition,
    closedLoop: false
  }) {
    this._positionFunctionX = sinusoidalPosition;
    this._positionFunctionY = sinusoidalPosition;
    this._positionFunctionZ = sinusoidalPosition;
    this.connectLastAndFirstAnchor = false;
    this._animationFrame = null;
    this._invertedLightness = false;
    this._clampToCircle = false;
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
    this._clampToCircle = clampToCircle2 || false;
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
  get clampToCircle() {
    return this._clampToCircle;
  }
  set clampToCircle(clamp) {
    this._clampToCircle = clamp;
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
    insertAtIndex,
    clamp
  }) {
    let finalXyz = xyz;
    const shouldClamp = clamp ?? this._clampToCircle;
    if (shouldClamp && xyz) {
      const [x, y, z] = xyz;
      const [cx, cy] = clampToCircle(x, y);
      finalXyz = [cx, cy, z];
    }
    const newAnchor = new ColorPoint({
      xyz: finalXyz,
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
    color,
    clamp
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
    if (xyz) {
      const shouldClamp = clamp ?? this._clampToCircle;
      if (shouldClamp) {
        const [x, y, z] = xyz;
        const [cx, cy] = clampToCircle(x, y);
        point.position = [cx, cy, z];
      } else {
        point.position = xyz;
      }
    }
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
    this.anchorPoints.forEach((p) => p.invertedLightness = newStatus);
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
        color: this.anchorPoints[0]?.color || [0, 0, 0],
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
var UI_METRICS = {
  anchorRadius: 2,
  // Core anchor point radius
  ringOuterRadius: 5,
  // Outer radius of the ring interaction zone
  ringThickness: 1,
  // Visual thickness of the saturation arc
  ringThicknessHover: 2,
  // Thickness when hovered
  ringGap: 0.5,
  // Gap between anchor and ring
  tickLength: 1.5,
  // Length of the tick at end of arc (pointing outward)
  tickGap: 0.5
  // Gap between ring and tick
};
var ROTARY_TURNS_TO_FULL = 1;
var ROTARY_TURNS_TO_FULL_SHIFT = 2.5;
var PolinePicker = class extends HTMLElement {
  constructor() {
    super();
    this.currentPoint = null;
    this.allowAddPoints = false;
    // Ring adjustment state
    this.ringAdjust = null;
    this.ringHoverIndex = null;
    // Store bound event handlers for cleanup
    this.boundPointerDown = this.handlePointerDown.bind(this);
    this.boundPointerMove = this.handlePointerMove.bind(this);
    this.boundPointerUp = this.handlePointerUp.bind(this);
    this.attachShadow({ mode: "open" });
    this.interactive = this.hasAttribute("interactive");
    this.allowAddPoints = this.hasAttribute("allow-add-points");
  }
  connectedCallback() {
    this.interactive = this.hasAttribute("interactive");
    this.allowAddPoints = this.hasAttribute("allow-add-points");
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
    const picker = this.shadowRoot?.querySelector(".picker");
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
        .wheel__saturation-ring {
          fill: none;
          stroke: var(--poline-picker-line-color, #000);
          stroke-width: calc(0.75 * var(--poline-picker-line-width, 0.2));
          stroke-linecap: round;
          pointer-events: none;
        }
        .wheel__ring-tick {
          fill: none;
          stroke: var(--poline-picker-line-color, #000);
          stroke-width: calc(0.75 * var(--poline-picker-line-width, 0.2));
          stroke-linecap: round;
          pointer-events: none;
          opacity: 0;
        }
        .wheel__ring-bg {
          fill: none;
          stroke: var(--poline-picker-bg-color, #fff);
          stroke-width: var(--poline-picker-ring-width, 0.5);
          pointer-events: none;
          vector-effect: non-scaling-stroke;
          opacity: 0;
        }
        .wheel__ring-group--hover .wheel__ring-tick {
          opacity: 1;
        }
        .wheel__ring-group--hover .wheel__ring-bg {
          opacity: 1;
        }
        @media (pointer: coarse) {
          .wheel__ring-group {
            display: none;
          }
        }
        :host(.ring-hover) svg {
          cursor: ew-resize;
        }
        :host(.ring-adjusting) svg {
          cursor: grabbing;
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
    this.saturationRings = this.svg.querySelector(
      ".wheel__saturation-rings"
    );
    this.anchors = this.svg.querySelector(".wheel__anchors");
    this.points = this.svg.querySelector(".wheel__points");
    if (this.poline) {
      this.updateSVG();
      this.updateLightnessBackground();
    }
  }
  createSVG() {
    const svg = document.createElementNS(namespaceURI, "svg");
    svg.setAttribute("viewBox", `0 0 ${svgscale} ${svgscale}`);
    svg.innerHTML = `
      <g class="wheel">
        <polyline class="wheel__line" points="" />
        <g class="wheel__saturation-rings"></g>
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
    const flattenedPoints = this.poline.flattenedPoints;
    const pathPoints = flattenedPoints.map((p) => {
      const cartesian = this.pointToCartesian(p);
      if (!cartesian)
        return "";
      const [x, y] = cartesian;
      return `${x},${y}`;
    }).filter((point) => point !== "").join(" ");
    this.line.setAttribute("points", pathPoints);
    const updateCircles = (container, points, className, radiusFn) => {
      const existing = container.children;
      while (existing.length > points.length) {
        const last = existing[existing.length - 1];
        if (last)
          container.removeChild(last);
      }
      points.forEach((point, i) => {
        let circle = existing[i];
        const cartesian = this.pointToCartesian(point);
        if (!cartesian)
          return;
        const [x = 0, y = 0] = cartesian;
        const r = radiusFn(point);
        const fill = point.hslCSS;
        if (!circle) {
          circle = document.createElementNS(namespaceURI, "circle");
          circle.setAttribute("class", className);
          container.appendChild(circle);
        }
        circle.setAttribute("cx", x.toString());
        circle.setAttribute("cy", y.toString());
        circle.setAttribute("r", r.toString());
        circle.setAttribute("fill", fill);
      });
    };
    this.updateSaturationRings();
    updateCircles(
      this.anchors,
      this.poline.anchorPoints,
      "wheel__anchor",
      () => UI_METRICS.anchorRadius
    );
    updateCircles(
      this.points,
      flattenedPoints,
      "wheel__point",
      (p) => 0.5 + p.color[1]
    );
  }
  updateSaturationRings() {
    if (!this.poline || !this.saturationRings)
      return;
    const anchors = this.poline.anchorPoints;
    const ringGroups = Array.from(
      this.saturationRings.querySelectorAll(".wheel__ring-group")
    );
    while (ringGroups.length > anchors.length) {
      const last = ringGroups.pop();
      if (last)
        last.remove();
    }
    anchors.forEach((anchor, i) => {
      const cartesian = this.pointToCartesian(anchor);
      if (!cartesian)
        return;
      const [cx, cy] = cartesian;
      const saturation = anchor.z;
      const ringRadius = UI_METRICS.anchorRadius + UI_METRICS.ringGap + 1;
      const isHovered = this.ringHoverIndex === i || this.ringAdjust && this.ringAdjust.anchorIndex === i;
      let group = ringGroups[i];
      if (!group) {
        group = document.createElementNS(namespaceURI, "g");
        group.setAttribute("class", "wheel__ring-group");
        const bgRing2 = document.createElementNS(namespaceURI, "circle");
        bgRing2.setAttribute("class", "wheel__ring-bg");
        group.appendChild(bgRing2);
        const satArc2 = document.createElementNS(namespaceURI, "path");
        satArc2.setAttribute("class", "wheel__saturation-ring");
        group.appendChild(satArc2);
        const tick2 = document.createElementNS(namespaceURI, "line");
        tick2.setAttribute("class", "wheel__ring-tick");
        group.appendChild(tick2);
        this.saturationRings.appendChild(group);
        ringGroups.push(group);
      }
      group.classList.toggle("wheel__ring-group--hover", !!isHovered);
      const bgRing = group.querySelector(".wheel__ring-bg");
      bgRing.setAttribute("cx", cx.toString());
      bgRing.setAttribute("cy", cy.toString());
      bgRing.setAttribute("r", ringRadius.toString());
      const satArc = group.querySelector(
        ".wheel__saturation-ring"
      );
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + saturation * Math.PI * 2;
      const arcPath = this.describeArc(
        cx,
        cy,
        ringRadius,
        startAngle,
        endAngle
      );
      satArc.setAttribute("d", arcPath);
      const tick = group.querySelector(".wheel__ring-tick");
      const tickStartX = cx + (ringRadius + UI_METRICS.tickGap) * Math.cos(endAngle);
      const tickStartY = cy + (ringRadius + UI_METRICS.tickGap) * Math.sin(endAngle);
      const tickEndX = tickStartX + Math.cos(endAngle) * UI_METRICS.tickLength;
      const tickEndY = tickStartY + Math.sin(endAngle) * UI_METRICS.tickLength;
      tick.setAttribute("x1", tickStartX.toString());
      tick.setAttribute("y1", tickStartY.toString());
      tick.setAttribute("x2", tickEndX.toString());
      tick.setAttribute("y2", tickEndY.toString());
    });
  }
  describeArc(cx, cy, r, startAngle, endAngle) {
    const angleDiff = endAngle - startAngle;
    if (Math.abs(angleDiff) < 1e-3) {
      return "";
    }
    if (Math.abs(angleDiff) > Math.PI * 2 - 0.01) {
      const midAngle = startAngle + Math.PI;
      const startX2 = cx + r * Math.cos(startAngle);
      const startY2 = cy + r * Math.sin(startAngle);
      const midX = cx + r * Math.cos(midAngle);
      const midY = cy + r * Math.sin(midAngle);
      return `M ${startX2} ${startY2} A ${r} ${r} 0 1 1 ${midX} ${midY} A ${r} ${r} 0 1 1 ${startX2} ${startY2}`;
    }
    const startX = cx + r * Math.cos(startAngle);
    const startY = cy + r * Math.sin(startAngle);
    const endX = cx + r * Math.cos(endAngle);
    const endY = cy + r * Math.sin(endAngle);
    const largeArc = angleDiff > Math.PI ? 1 : 0;
    const sweep = 1;
    return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} ${sweep} ${endX} ${endY}`;
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
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const ringHit = isTouch ? null : this.pickRing(normalizedX, normalizedY);
    if (ringHit !== null) {
      const anchor = this.poline.anchorPoints[ringHit];
      if (!anchor)
        return;
      const cartesian = this.pointToCartesian(anchor);
      if (!cartesian)
        return;
      const [anchorX, anchorY] = cartesian;
      const svgX = normalizedX * svgscale;
      const svgY = normalizedY * svgscale;
      const startAngle = Math.atan2(svgY - anchorY, svgX - anchorX);
      this.ringAdjust = {
        anchorIndex: ringHit,
        startSaturation: anchor.color[1],
        startAngle,
        prevAngle: startAngle,
        accumulatedAngle: 0
      };
      this.ringHoverIndex = ringHit;
      this.classList.add("ring-adjusting");
      this.updateSaturationRings();
      try {
        this.svg.setPointerCapture(e.pointerId);
      } catch {
      }
      return;
    }
    const closestAnchor = this.poline.getClosestAnchorPoint({
      xyz: [normalizedX, normalizedY, null],
      maxDistance: 0.05
      // Smaller hit area for core
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
    const { normalizedX, normalizedY } = this.pointerToNormalizedCoordinates(e);
    if (this.ringAdjust) {
      const anchor = this.poline.anchorPoints[this.ringAdjust.anchorIndex];
      if (!anchor)
        return;
      const cartesian = this.pointToCartesian(anchor);
      if (!cartesian)
        return;
      const [anchorX, anchorY] = cartesian;
      const svgX = normalizedX * svgscale;
      const svgY = normalizedY * svgscale;
      const curAngle = Math.atan2(svgY - anchorY, svgX - anchorX);
      let dA = curAngle - this.ringAdjust.prevAngle;
      if (dA > Math.PI)
        dA -= Math.PI * 2;
      else if (dA < -Math.PI)
        dA += Math.PI * 2;
      this.ringAdjust.accumulatedAngle += dA;
      this.ringAdjust.prevAngle = curAngle;
      const turns = this.ringAdjust.accumulatedAngle / (Math.PI * 2);
      const turnsToFull = e.shiftKey ? ROTARY_TURNS_TO_FULL_SHIFT : ROTARY_TURNS_TO_FULL;
      const deltaSat = turns / turnsToFull;
      let newSaturation = this.clamp01(
        this.ringAdjust.startSaturation + deltaSat
      );
      if (newSaturation > 0.99)
        newSaturation = 1;
      if (newSaturation < 0.01)
        newSaturation = 0;
      const atBound = newSaturation === 0 || newSaturation === 1;
      const movingPastBound = newSaturation === 1 && deltaSat > 0 || newSaturation === 0 && deltaSat < 0;
      if (atBound && movingPastBound) {
        this.ringAdjust.startSaturation = newSaturation;
        this.ringAdjust.accumulatedAngle = 0;
        this.ringAdjust.prevAngle = curAngle;
      }
      this.poline.updateAnchorPoint({
        point: anchor,
        color: [anchor.color[0], newSaturation, anchor.color[2]]
      });
      this.updateSVG();
      this.dispatchPolineChange();
      return;
    }
    if (this.currentPoint) {
      this.poline.updateAnchorPoint({
        point: this.currentPoint,
        xyz: [normalizedX, normalizedY, this.currentPoint.z]
      });
      this.updateSVG();
      this.dispatchPolineChange();
      return;
    }
    if (!window.matchMedia("(pointer: coarse)").matches) {
      const ringHover = this.pickRing(normalizedX, normalizedY);
      if (ringHover !== this.ringHoverIndex) {
        this.ringHoverIndex = ringHover;
        this.classList.toggle("ring-hover", ringHover !== null);
        this.updateSaturationRings();
      }
    }
  }
  handlePointerUp(e) {
    if (this.ringAdjust) {
      try {
        this.svg.releasePointerCapture(e.pointerId);
      } catch {
      }
      this.classList.remove("ring-adjusting");
    }
    this.ringAdjust = null;
    this.currentPoint = null;
    const { normalizedX, normalizedY } = this.pointerToNormalizedCoordinates(e);
    const ringHover = this.pickRing(normalizedX, normalizedY);
    if (ringHover !== this.ringHoverIndex) {
      this.ringHoverIndex = ringHover;
      this.classList.toggle("ring-hover", ringHover !== null);
      this.updateSaturationRings();
    }
  }
  pickRing(normalizedX, normalizedY) {
    if (!this.poline)
      return null;
    const svgX = normalizedX * svgscale;
    const svgY = normalizedY * svgscale;
    for (let i = 0; i < this.poline.anchorPoints.length; i++) {
      const anchor = this.poline.anchorPoints[i];
      if (!anchor)
        continue;
      const cartesian = this.pointToCartesian(anchor);
      if (!cartesian)
        continue;
      const [cx, cy] = cartesian;
      const dist = Math.hypot(svgX - cx, svgY - cy);
      if (dist > UI_METRICS.anchorRadius && dist <= UI_METRICS.ringOuterRadius) {
        return i;
      }
    }
    return null;
  }
  clamp01(value) {
    return Math.max(0, Math.min(1, value));
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
  dispatchPolineChange() {
    this.dispatchEvent(
      new CustomEvent("poline-change", {
        detail: { poline: this.poline }
      })
    );
  }
};
customElements.define("poline-picker", PolinePicker);
export {
  Poline,
  PolinePicker,
  positionFunctions
};
