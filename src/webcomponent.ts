import { Poline, positionFunctions, ColorPoint } from "./index";

// Re-export for convenience when using the picker standalone
export { Poline, positionFunctions };

const namespaceURI = "http://www.w3.org/2000/svg";
const svgscale = 100;

export class PolinePicker extends HTMLElement {
  private poline: Poline;
  private svg: SVGElement;
  private interactive: boolean;
  private line: SVGPolylineElement;
  private wheel: SVGGElement;
  private anchors: SVGGElement;
  private points: SVGGElement;
  private currentPoint: ColorPoint | null = null;
  private allowAddPoints = false;

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
      </style>
    `;

    this.svg = this.createSVG();
    const pickerDiv = document.createElement("div");
    pickerDiv.className = "picker";
    pickerDiv.appendChild(this.svg);
    this.shadowRoot.appendChild(pickerDiv);

    this.wheel = this.svg.querySelector(".wheel") as SVGGElement;
    this.line = this.svg.querySelector(".wheel__line") as SVGPolylineElement;
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

    // 2) Draw anchor points (white dots at the ends)
    updateCircles(
      this.anchors,
      this.poline.anchorPoints,
      "wheel__anchor",
      () => 2
    );

    // 3) Draw intermediate points (sample dots along the lines) - TOP layer
    updateCircles(
      this.points,
      flattenedPoints,
      "wheel__point",
      (p) => 0.5 + p.color[1]
    );
  }

  private pointToCartesian(point: ColorPoint) {
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

    const closestAnchor = this.poline.getClosestAnchorPoint({
      xyz: [normalizedX, normalizedY, null],
      maxDistance: 0.1,
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
    if (this.currentPoint) {
      const { normalizedX, normalizedY } =
        this.pointerToNormalizedCoordinates(e);

      this.poline.updateAnchorPoint({
        point: this.currentPoint,
        xyz: [normalizedX, normalizedY, this.currentPoint.z],
      });
      this.updateSVG();
      this.dispatchPolineChange();
    }
  }

  private handlePointerUp() {
    this.currentPoint = null;
  }

  private getPointerPosition(e: PointerEvent) {
    const rect = this.svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
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

  private createCircleElement(
    point: ColorPoint,
    className: string,
    radius: number | string
  ): SVGCircleElement | null {
    const cartesian = this.pointToCartesian(point);
    if (!cartesian) return null;

    const [x = 0, y = 0] = cartesian;
    const circle = document.createElementNS(namespaceURI, "circle");
    circle.setAttribute("class", className);
    circle.setAttribute("cx", x.toString());
    circle.setAttribute("cy", y.toString());
    circle.setAttribute("r", radius.toString());
    circle.setAttribute("fill", point.hslCSS);
    return circle;
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
