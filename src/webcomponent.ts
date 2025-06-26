import { Poline, positionFunctions, ColorPoint } from "./index";

// Re-export for convenience when using the picker standalone
export { Poline, positionFunctions };

const namespaceURI = "http://www.w3.org/2000/svg";
const svgscale = 100;

export class PolinePicker extends HTMLElement {
  private poline: Poline;
  private svg: SVGElement;
  private interactive: boolean;
  private wheel: SVGGElement;
  private line: SVGPolylineElement;
  private anchors: SVGGElement;
  private points: SVGGElement;
  private currentPoint: ColorPoint | null = null;
  private allowAddPoints = false;

  constructor() {
    super();
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

    // Convert to normalized coordinates (0-1) like the main demo
    const normalizedX = x / this.svg.clientWidth;
    const normalizedY = y / this.svg.clientHeight;

    // Use the normalized Y coordinate as the Z (lightness) coordinate like the main demo
    const newPoint = this.poline.addAnchorPoint({
      xyz: [normalizedX, normalizedY, normalizedY],
    });
    this.updateSVG();
    this.dispatchEvent(
      new CustomEvent("poline-change", {
        detail: { poline: this.poline },
      })
    );
    return newPoint;
  }

  private updateLightnessBackground() {
    const picker = this.shadowRoot?.querySelector(".picker") as HTMLElement;
    if (picker && this.poline) {
      if (this.poline.invertedLightness) {
        picker.style.setProperty("--maxL", "#202125");
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
          display: inline-block;
          width: 200px;
          height: 200px;
          position: relative;
        }
        .picker {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          --s: .4;
          --l: .5;
          --minL: #000;
          --maxL: #fff;
          --grad: #ff0000 0deg, #ffff00 60deg, #00ff00 120deg, #00ffff 180deg, #0000ff 240deg, #ff00ff 300deg, #ff0000 360deg;
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
          overflow: visible !important;
          width: 100%;
        }
        .wheel__line {
          stroke: var(--poline-picker-line-color, #000);
          stroke-width: 0.15;
          fill: none;
        }
        .wheel__anchor {
          cursor: grab;
          stroke: var(--poline-picker-line-color, #000);
          stroke-width: 0.2;
          fill: var(--poline-picker-bg-color, #fff);
        }
        .wheel__anchor:hover {
          cursor: grabbing;
        }
        .wheel__bg {
          stroke-width: 10;
          fill: transparent;
        }
        .wheel__point {
          stroke: var(--poline-picker-line-color, #000);
          stroke-width: 0.15;
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

    // Draw the line path
    const pathPoints = this.poline.flattenedPoints
      .map((p) => {
        const cartesian = this.pointToCartesian(p);
        if (!cartesian) return "";
        const [x, y] = cartesian;
        return `${x},${y}`;
      })
      .filter((point) => point !== "")
      .join(" ");

    this.line.setAttribute("points", pathPoints);

    // Clear existing elements
    this.anchors.innerHTML = "";
    this.points.innerHTML = "";

    // 1) Lines are already drawn above

    // 2) Draw anchor points (white dots at the ends) - MIDDLE layer
    this.poline.anchorPoints.forEach((point) => {
      const cartesian = this.pointToCartesian(point);
      if (!cartesian) return;
      const [x = 0, y = 0] = cartesian;
      const anchor = document.createElementNS(namespaceURI, "circle");
      anchor.setAttribute("class", "wheel__anchor");
      anchor.setAttribute("cx", x.toString());
      anchor.setAttribute("cy", y.toString());
      anchor.setAttribute("r", "2");
      anchor.setAttribute("fill", point.hslCSS);
      this.anchors.appendChild(anchor);
    });

    // 3) Draw intermediate points (sample dots along the lines) - TOP layer
    this.poline.flattenedPoints.forEach((point) => {
      // Skip anchor points (they're already drawn above)
      const isAnchorPoint = this.poline.anchorPoints.some(
        (anchor) =>
          anchor.x === point.x && anchor.y === point.y && anchor.z === point.z
      );

      if (isAnchorPoint) return;

      const cartesian = this.pointToCartesian(point);
      if (!cartesian) return;
      const [x = 0, y = 0] = cartesian;
      const circle = document.createElementNS(namespaceURI, "circle");
      circle.setAttribute("class", "wheel__point");
      circle.setAttribute("cx", x.toString());
      circle.setAttribute("cy", y.toString());
      // Use the same radius calculation as the main demo
      const radius = 0.5 + point.color[1];
      circle.setAttribute("r", radius.toString());
      circle.setAttribute("fill", point.hslCSS);
      this.points.appendChild(circle);
    });
  }

  private pointToCartesian(point: ColorPoint) {
    const half = svgscale / 2;
    const x = half + (point.x - 0.5) * svgscale;
    const y = half + (point.y - 0.5) * svgscale;
    return [x, y];
  }

  private addEventListeners() {
    this.svg.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      const svgRect = this.svg.getBoundingClientRect();
      // Map pointer to SVG viewBox coordinates (0-100)
      const svgX = ((e.clientX - svgRect.left) / svgRect.width) * svgscale;
      const svgY = ((e.clientY - svgRect.top) / svgRect.height) * svgscale;
      // Normalize to 0-1 for Poline
      const normalizedX = svgX / svgscale;
      const normalizedY = svgY / svgscale;
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
        this.dispatchEvent(
          new CustomEvent("poline-change", {
            detail: { poline: this.poline },
          })
        );
      }
    });

    this.svg.addEventListener("pointermove", (e) => {
      if (this.currentPoint) {
        const svgRect = this.svg.getBoundingClientRect();
        const svgX = ((e.clientX - svgRect.left) / svgRect.width) * svgscale;
        const svgY = ((e.clientY - svgRect.top) / svgRect.height) * svgscale;
        const normalizedX = svgX / svgscale;
        const normalizedY = svgY / svgscale;
        this.poline.updateAnchorPoint({
          point: this.currentPoint,
          xyz: [normalizedX, normalizedY, this.currentPoint.z],
        });
        this.updateSVG();
        this.dispatchEvent(
          new CustomEvent("poline-change", {
            detail: { poline: this.poline },
          })
        );
      }
    });

    this.svg.addEventListener("pointerup", () => {
      this.currentPoint = null;
    });
  }

  private getPointerPosition(e: PointerEvent) {
    const rect = this.svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }
}

customElements.define("poline-picker", PolinePicker);
