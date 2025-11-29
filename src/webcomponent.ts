import { Poline, positionFunctions, ColorPoint } from "./index";

// Re-export for convenience when using the picker standalone
export { Poline, positionFunctions };

const namespaceURI = "http://www.w3.org/2000/svg";
const svgscale = 100;

// UI metrics for the saturation ring control (in SVG units)
const UI_METRICS = {
  anchorRadius: 2, // Core anchor point radius
  ringOuterRadius: 5, // Outer radius of the ring interaction zone
  ringThickness: 1, // Visual thickness of the saturation arc
  ringThicknessHover: 2, // Thickness when hovered
  ringGap: 0.5, // Gap between anchor and ring
  tickLength: 1.5, // Length of the tick at end of arc (pointing outward)
  tickGap: 0.5, // Gap between ring and tick
};

// Rotary interaction sensitivity
const ROTARY_TURNS_TO_FULL = 1.0; // 1 full turn = full saturation range
const ROTARY_TURNS_TO_FULL_SHIFT = 2.5; // With shift: slower adjustment

type RingAdjustState = {
  anchorIndex: number;
  startSaturation: number;
  startAngle: number;
  prevAngle: number;
  accumulatedAngle: number;
};

export class PolinePicker extends HTMLElement {
  private poline: Poline;
  private svg: SVGElement;
  private interactive: boolean;
  private line: SVGPolylineElement;
  private wheel: SVGGElement;
  private anchors: SVGGElement;
  private points: SVGGElement;
  private saturationRings: SVGGElement;
  private currentPoint: ColorPoint | null = null;
  private allowAddPoints = false;

  // Ring adjustment state
  private ringAdjust: RingAdjustState | null = null;
  private ringHoverIndex: number | null = null;

  // Store bound event handlers for cleanup
  private boundPointerDown = this.handlePointerDown.bind(this);
  private boundPointerMove = this.handlePointerMove.bind(this);
  private boundPointerUp = this.handlePointerUp.bind(this);

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.interactive = this.hasAttribute("interactive");
    this.allowAddPoints = this.hasAttribute("allow-add-points");
  }

  connectedCallback() {
    // Re-check attributes in case they were set after constructor
    this.interactive = this.hasAttribute("interactive");
    this.allowAddPoints = this.hasAttribute("allow-add-points");

    this.render();
    if (this.interactive) {
      this.addEventListeners();
    }
  }

  disconnectedCallback() {
    // Clean up event listeners when component is removed from DOM
    this.removeEventListeners();
  }

  setPoline(poline: Poline) {
    this.poline = poline;
    this.updateSVG();
    this.updateLightnessBackground();
  }

  setAllowAddPoints(allow: boolean) {
    this.allowAddPoints = allow;
  }

  addPointAtPosition(x: number, y: number) {
    if (!this.poline) return null;

    // Convert to normalized coordinates (0-1)
    const normalizedX = x / this.svg.clientWidth;
    const normalizedY = y / this.svg.clientHeight;

    // Use the normalized Y coordinate as the Z (lightness) coordinate
    const newPoint = this.poline.addAnchorPoint({
      xyz: [normalizedX, normalizedY, normalizedY],
    });

    this.updateSVG();
    this.dispatchPolineChange();
    return newPoint;
  }

  private updateLightnessBackground() {
    const picker = this.shadowRoot?.querySelector(".picker") as HTMLElement;
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

  private render() {
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

    this.wheel = this.svg.querySelector(".wheel") as SVGGElement;
    this.line = this.svg.querySelector(".wheel__line") as SVGPolylineElement;
    this.saturationRings = this.svg.querySelector(
      ".wheel__saturation-rings"
    ) as SVGGElement;
    this.anchors = this.svg.querySelector(".wheel__anchors") as SVGGElement;
    this.points = this.svg.querySelector(".wheel__points") as SVGGElement;

    if (this.poline) {
      this.updateSVG();
      this.updateLightnessBackground();
    }
  }

  private createSVG() {
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

  public updateSVG() {
    if (!this.poline || !this.svg) {
      return;
    }

    // 1) Draw line paths
    const flattenedPoints = this.poline.flattenedPoints;
    const pathPoints = flattenedPoints
      .map((p) => {
        const cartesian = this.pointToCartesian(p);
        if (!cartesian) return "";
        const [x, y] = cartesian;
        return `${x},${y}`;
      })
      .filter((point) => point !== "")
      .join(" ");

    this.line.setAttribute("points", pathPoints);

    // Helper to update or create circles efficiently
    const updateCircles = (
      container: SVGGElement,
      points: ColorPoint[],
      className: string,
      radiusFn: (p: ColorPoint) => number
    ) => {
      const existing = container.children;

      // Remove excess elements if we have fewer points than before
      while (existing.length > points.length) {
        const last = existing[existing.length - 1];
        if (last) container.removeChild(last);
      }

      points.forEach((point, i) => {
        let circle = existing[i] as SVGCircleElement;
        const cartesian = this.pointToCartesian(point);
        if (!cartesian) return;

        const [x = 0, y = 0] = cartesian;
        const r = radiusFn(point);
        const fill = point.hslCSS;

        // Create if doesn't exist
        if (!circle) {
          circle = document.createElementNS(namespaceURI, "circle");
          circle.setAttribute("class", className);
          container.appendChild(circle);
        }

        // Update attributes
        circle.setAttribute("cx", x.toString());
        circle.setAttribute("cy", y.toString());
        circle.setAttribute("r", r.toString());
        circle.setAttribute("fill", fill);
      });
    };

    // 2) Draw saturation rings around anchor points
    this.updateSaturationRings();

    // 3) Draw anchor points (white dots at the ends)
    updateCircles(
      this.anchors,
      this.poline.anchorPoints,
      "wheel__anchor",
      () => UI_METRICS.anchorRadius
    );

    // 4) Draw intermediate points (sample dots along the lines) - TOP layer
    updateCircles(
      this.points,
      flattenedPoints,
      "wheel__point",
      (p) => 0.5 + p.color[1]
    );
  }

  private updateSaturationRings() {
    if (!this.poline || !this.saturationRings) return;

    const anchors = this.poline.anchorPoints;
    const ringGroups = Array.from(
      this.saturationRings.querySelectorAll(".wheel__ring-group")
    ) as SVGGElement[];

    // Remove excess groups
    while (ringGroups.length > anchors.length) {
      const last = ringGroups.pop();
      if (last) last.remove();
    }

    anchors.forEach((anchor, i) => {
      const cartesian = this.pointToCartesian(anchor);
      if (!cartesian) return;

      const [cx, cy] = cartesian;
      // Use anchor.z directly - this is the saturation in the xyz coordinate system
      // (z corresponds to saturation, which is the same as color[1] in HSL)
      const saturation = anchor.z;
      const ringRadius = UI_METRICS.anchorRadius + UI_METRICS.ringGap + 1;
      const isHovered =
        this.ringHoverIndex === i ||
        (this.ringAdjust && this.ringAdjust.anchorIndex === i);

      // Get or create the group for this anchor's ring elements
      let group = ringGroups[i];
      if (!group) {
        group = document.createElementNS(namespaceURI, "g");
        group.setAttribute("class", "wheel__ring-group");
        // Create elements inside the group
        const bgRing = document.createElementNS(namespaceURI, "circle");
        bgRing.setAttribute("class", "wheel__ring-bg");
        group.appendChild(bgRing);
        const satArc = document.createElementNS(namespaceURI, "path");
        satArc.setAttribute("class", "wheel__saturation-ring");
        group.appendChild(satArc);
        const tick = document.createElementNS(namespaceURI, "line");
        tick.setAttribute("class", "wheel__ring-tick");
        group.appendChild(tick);
        this.saturationRings.appendChild(group);
        ringGroups.push(group);
      }

      // Toggle hover on the group
      group.classList.toggle("wheel__ring-group--hover", !!isHovered);

      // Update bg ring
      const bgRing = group.querySelector(".wheel__ring-bg") as SVGCircleElement;
      bgRing.setAttribute("cx", cx.toString());
      bgRing.setAttribute("cy", cy.toString());
      bgRing.setAttribute("r", ringRadius.toString());

      // Saturation arc (shows current value as arc length)
      const satArc = group.querySelector(
        ".wheel__saturation-ring"
      ) as SVGPathElement;

      // Create arc path from top (12 o'clock) going clockwise
      const startAngle = -Math.PI / 2; // Start at top
      const endAngle = startAngle + saturation * Math.PI * 2;
      const arcPath = this.describeArc(
        cx,
        cy,
        ringRadius,
        startAngle,
        endAngle
      );

      satArc.setAttribute("d", arcPath);

      // Tick mark at end of arc (pointing outward from center)
      const tick = group.querySelector(".wheel__ring-tick") as SVGLineElement;

      // Calculate tick position and direction (radial, pointing outward)
      const tickStartX =
        cx + (ringRadius + UI_METRICS.tickGap) * Math.cos(endAngle);
      const tickStartY =
        cy + (ringRadius + UI_METRICS.tickGap) * Math.sin(endAngle);
      // Tick extends outward from the ring
      const tickEndX = tickStartX + Math.cos(endAngle) * UI_METRICS.tickLength;
      const tickEndY = tickStartY + Math.sin(endAngle) * UI_METRICS.tickLength;

      tick.setAttribute("x1", tickStartX.toString());
      tick.setAttribute("y1", tickStartY.toString());
      tick.setAttribute("x2", tickEndX.toString());
      tick.setAttribute("y2", tickEndY.toString());
    });
  }

  private describeArc(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ): string {
    const angleDiff = endAngle - startAngle;

    // Handle near-zero case
    if (Math.abs(angleDiff) < 0.001) {
      return ""; // No arc to draw
    }

    // Handle near-full-circle case (saturation close to 1)
    // SVG arcs can't draw from a point to itself, so we draw two half-circles
    if (Math.abs(angleDiff) > Math.PI * 2 - 0.01) {
      const midAngle = startAngle + Math.PI;
      const startX = cx + r * Math.cos(startAngle);
      const startY = cy + r * Math.sin(startAngle);
      const midX = cx + r * Math.cos(midAngle);
      const midY = cy + r * Math.sin(midAngle);
      // Draw two arcs to complete the circle
      return `M ${startX} ${startY} A ${r} ${r} 0 1 1 ${midX} ${midY} A ${r} ${r} 0 1 1 ${startX} ${startY}`;
    }

    const startX = cx + r * Math.cos(startAngle);
    const startY = cy + r * Math.sin(startAngle);
    const endX = cx + r * Math.cos(endAngle);
    const endY = cy + r * Math.sin(endAngle);

    // Large arc flag: 1 if arc > 180 degrees
    const largeArc = angleDiff > Math.PI ? 1 : 0;
    // Sweep flag: 1 for clockwise
    const sweep = 1;

    return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} ${sweep} ${endX} ${endY}`;
  }

  private pointToCartesian(point: ColorPoint): [number, number] {
    const half = svgscale / 2;
    const x = half + (point.x - 0.5) * svgscale;
    const y = half + (point.y - 0.5) * svgscale;
    return [x, y];
  }

  private addEventListeners() {
    if (!this.svg) return;

    this.svg.addEventListener("pointerdown", this.boundPointerDown);
    this.svg.addEventListener("pointermove", this.boundPointerMove);
    this.svg.addEventListener("pointerup", this.boundPointerUp);
  }

  private removeEventListeners() {
    if (!this.svg) return;

    this.svg.removeEventListener("pointerdown", this.boundPointerDown);
    this.svg.removeEventListener("pointermove", this.boundPointerMove);
    this.svg.removeEventListener("pointerup", this.boundPointerUp);
  }

  private handlePointerDown(e: PointerEvent) {
    e.stopPropagation();
    const { normalizedX, normalizedY } = this.pointerToNormalizedCoordinates(e);

    // Check if we're clicking on a ring (outer band of an anchor)
    // Skip on touch devices
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const ringHit = isTouch ? null : this.pickRing(normalizedX, normalizedY);
    if (ringHit !== null) {
      const anchor = this.poline.anchorPoints[ringHit];
      if (!anchor) return;

      const cartesian = this.pointToCartesian(anchor);
      if (!cartesian) return;

      const [anchorX, anchorY] = cartesian;
      // Convert to SVG coordinates for angle calculation
      const svgX = normalizedX * svgscale;
      const svgY = normalizedY * svgscale;

      const startAngle = Math.atan2(svgY - anchorY, svgX - anchorX);

      this.ringAdjust = {
        anchorIndex: ringHit,
        startSaturation: anchor.color[1],
        startAngle,
        prevAngle: startAngle,
        accumulatedAngle: 0,
      };

      this.ringHoverIndex = ringHit;
      this.classList.add("ring-adjusting");
      this.updateSaturationRings();

      try {
        this.svg.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      return;
    }

    // Check if we're clicking on an anchor core
    const closestAnchor = this.poline.getClosestAnchorPoint({
      xyz: [normalizedX, normalizedY, null],
      maxDistance: 0.05, // Smaller hit area for core
    });

    if (closestAnchor) {
      this.currentPoint = closestAnchor;
    } else if (this.allowAddPoints) {
      this.currentPoint = this.poline.addAnchorPoint({
        xyz: [normalizedX, normalizedY, normalizedY],
      });
      this.updateSVG();
      this.dispatchPolineChange();
    }
  }

  private handlePointerMove(e: PointerEvent) {
    const { normalizedX, normalizedY } = this.pointerToNormalizedCoordinates(e);

    // Handle ring adjustment (rotary drag)
    if (this.ringAdjust) {
      const anchor = this.poline.anchorPoints[this.ringAdjust.anchorIndex];
      if (!anchor) return;

      const cartesian = this.pointToCartesian(anchor);
      if (!cartesian) return;

      const [anchorX, anchorY] = cartesian;
      const svgX = normalizedX * svgscale;
      const svgY = normalizedY * svgscale;

      const curAngle = Math.atan2(svgY - anchorY, svgX - anchorX);

      // Calculate delta angle, normalized to [-PI, PI]
      let dA = curAngle - this.ringAdjust.prevAngle;
      if (dA > Math.PI) dA -= Math.PI * 2;
      else if (dA < -Math.PI) dA += Math.PI * 2;

      this.ringAdjust.accumulatedAngle += dA;
      this.ringAdjust.prevAngle = curAngle;

      // Map accumulated angle to saturation delta
      const turns = this.ringAdjust.accumulatedAngle / (Math.PI * 2);
      const turnsToFull = e.shiftKey
        ? ROTARY_TURNS_TO_FULL_SHIFT
        : ROTARY_TURNS_TO_FULL;
      const deltaSat = turns / turnsToFull;

      let newSaturation = this.clamp01(
        this.ringAdjust.startSaturation + deltaSat
      );

      // Snap to avoid floating point issues at bounds
      if (newSaturation > 0.99) newSaturation = 1;
      if (newSaturation < 0.01) newSaturation = 0;

      // Reset baseline if we hit a bound (prevents dead zone)
      const atBound = newSaturation === 0 || newSaturation === 1;
      const movingPastBound =
        (newSaturation === 1 && deltaSat > 0) ||
        (newSaturation === 0 && deltaSat < 0);

      if (atBound && movingPastBound) {
        this.ringAdjust.startSaturation = newSaturation;
        this.ringAdjust.accumulatedAngle = 0;
        this.ringAdjust.prevAngle = curAngle;
      }

      // Update the anchor point's saturation (z coordinate = saturation)
      this.poline.updateAnchorPoint({
        point: anchor,
        color: [anchor.color[0], newSaturation, anchor.color[2]],
      });

      this.updateSVG();
      this.dispatchPolineChange();
      return;
    }

    // Handle anchor point dragging
    if (this.currentPoint) {
      this.poline.updateAnchorPoint({
        point: this.currentPoint,
        xyz: [normalizedX, normalizedY, this.currentPoint.z],
      });
      this.updateSVG();
      this.dispatchPolineChange();
      return;
    }

    // Handle ring hover detection (skip on touch devices)
    if (!window.matchMedia("(pointer: coarse)").matches) {
      const ringHover = this.pickRing(normalizedX, normalizedY);
      if (ringHover !== this.ringHoverIndex) {
        this.ringHoverIndex = ringHover;
        this.classList.toggle("ring-hover", ringHover !== null);
        this.updateSaturationRings();
      }
    }
  }

  private handlePointerUp(e: PointerEvent) {
    if (this.ringAdjust) {
      try {
        this.svg.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      this.classList.remove("ring-adjusting");
    }

    this.ringAdjust = null;
    this.currentPoint = null;

    // Re-check hover state after release
    const { normalizedX, normalizedY } = this.pointerToNormalizedCoordinates(e);
    const ringHover = this.pickRing(normalizedX, normalizedY);
    if (ringHover !== this.ringHoverIndex) {
      this.ringHoverIndex = ringHover;
      this.classList.toggle("ring-hover", ringHover !== null);
      this.updateSaturationRings();
    }
  }

  private pickRing(normalizedX: number, normalizedY: number): number | null {
    if (!this.poline) return null;

    const svgX = normalizedX * svgscale;
    const svgY = normalizedY * svgscale;

    for (let i = 0; i < this.poline.anchorPoints.length; i++) {
      const anchor = this.poline.anchorPoints[i];
      if (!anchor) continue;

      const cartesian = this.pointToCartesian(anchor);
      if (!cartesian) continue;

      const [cx, cy] = cartesian;
      const dist = Math.hypot(svgX - cx, svgY - cy);

      // Check if within ring zone (between anchor radius and outer ring radius)
      if (
        dist > UI_METRICS.anchorRadius &&
        dist <= UI_METRICS.ringOuterRadius
      ) {
        return i;
      }
    }

    return null;
  }

  private clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  private pointerToNormalizedCoordinates(e: PointerEvent) {
    const svgRect = this.svg.getBoundingClientRect();
    const svgX = ((e.clientX - svgRect.left) / svgRect.width) * svgscale;
    const svgY = ((e.clientY - svgRect.top) / svgRect.height) * svgscale;
    return {
      normalizedX: svgX / svgscale,
      normalizedY: svgY / svgscale,
    };
  }

  private dispatchPolineChange() {
    this.dispatchEvent(
      new CustomEvent("poline-change", {
        detail: { poline: this.poline },
      })
    );
  }
}

customElements.define("poline-picker", PolinePicker);
