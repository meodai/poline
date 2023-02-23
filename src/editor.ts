/**
 * Poline Visual Editor
 *
 * This file is part of Poline.
 * it is meant to be used with the Poline Library
 * to visualize and edits its properties and settings.
 */

let svgscale = 100;
let uuid = 0;

const namespaceURI = "http://www.w3.org/2000/svg";
const $wheel = document.createElement("div");
const $huelabels = document.createElement("div");

$wheel.classList.add(`poline-picker-${uuid}`);
$huelabels.classList.add(`poline-picker-${uuid}__huelabels`);

const styles = `
  .poline-picker-${uuid} {
    --poline-diameter:  100%;

    position: relative;
    width: var(--poline-diameter);
    aspect-ratio: 1;
  }
`;

const $style = document.createElement("style");
$style.innerHTML = styles;

// creates the hue labels
const createLabel = (step: number, totalSteps: number): HTMLSpanElement => {
  const $label = document.createElement("span");
  $label.classList.add(`poline-picker-${uuid}__huelabel`);
  if (step > 9 && step < 31) {
    $label.classList.add(`poline-picker-${uuid}__huelabel--flipped`);
  }
  $label.setAttribute("data-huelabel", step.toString());
  $label.style.setProperty("--i", (step / totalSteps).toString());

  const $b = document.createElement("b");
  $b.setAttribute("aria-label", `${step * 10}°`);
  $b.innerText = `${step * 10}`;
  $label.appendChild($b);

  return $label;
};

// create a map of hue labels where the key is the hue value (step)
const huelabelsMap = new Map(
  new Array(36).fill("").map((_, i) => [i, createLabel(i, 36)])
);

const createCSSRainbowGradient = (steps = 360 / 10) =>
  new Array(steps)
    .fill("")
    .map(
      (_, i) =>
        `hsl(${
          (i / (steps - 1)) * 360
        }, calc(var(--s) * 100%), calc(var(--l,0) * 100%))`
    )
    .join(",");

const createSVG = (svgscale = 100) => {
  const $svg = document.createElementNS(namespaceURI, "svg");
  $svg.setAttribute("viewBox", `0 0 ${svgscale} ${svgscale}`);
  return $svg;
};

const $svg = createSVG(svgscale);

function updateSVG() {
  $huelabels.forEach(($huelabel, i) => {
    $huelabel.classList.remove("wheel__huelabel--active");
    // if the HUE label is within the range of the current anchor point
    poline.anchorPoints.forEach((anchor) => {
      const currentHue = anchor.color[0];
      currentHue - hueSteps / 2 < i * 10 &&
        currentHue + hueSteps / 2 > i * 10 &&
        $huelabel.classList.add("wheel__huelabel--active");
    });
  });

  $svg.innerHTML = "";

  poline.anchorPoints.forEach((anchor) => {
    const $circle = document.createElementNS(namespaceURI, "circle");
    $circle.setAttribute("cx", anchor.x * svgscale);
    $circle.setAttribute("cy", anchor.y * svgscale);
    $circle.setAttribute("r", 2);
    //anchor.hslCSS
    $circle.classList.add("wheel__anchor");
    $circle.style.setProperty("--s", anchor.color[1]);
    $svg.appendChild($circle);
  });

  const $polylines = document.createElementNS(namespaceURI, "polyline");
  $polylines.classList.add("wheel__line");
  $polylines.setAttribute(
    "points",
    poline.flattenedPoints
      .map((point) => `${point.x * svgscale},${point.y * svgscale}`)
      .join(" ")
  );
  $svg.appendChild($polylines);

  // calculate the length of the polyline
  // set the stroke-dasharray and stroke-dashoffset to the length of the polyline
  const length = $polylines.getTotalLength();
  $polylines.style.setProperty("--length", length);

  poline.flattenedPoints.forEach((point, i) => {
    const $circle = document.createElementNS(namespaceURI, "circle");
    $circle.setAttribute("cx", point.x * svgscale);
    $circle.setAttribute("cy", point.y * svgscale);
    const radius = 0.5 + point.color[1];
    $circle.setAttribute("r", radius);
    $circle.classList.add("wheel__point");
    $circle.style.setProperty("--i", i);
    $circle.style.setProperty("--circ", 2 * Math.PI * radius);
    $circle.style.setProperty("--s", point.color[1]);
    const c = formatHex({
      mode: currentHueModel,
      ...currentModelFn(point.color),
    });
    $circle.style.setProperty("--c", c);
    $svg.appendChild($circle);
  });

  let cssColors = [...poline.colorsCSS];
  let colors = [...poline.colors].map((c) =>
    formatHex({ mode: currentHueModel, ...currentModelFn(c) })
  );
  //colors = [...poline.colors].map(c => formatCss({ mode: 'p3', ...currentModelFn(c) }));
  document.documentElement.style.setProperty(
    "--prev",
    colorArrToSteppedGradient(colors)
  );

  document.documentElement.style.setProperty("--prev-smooth", colors.join(","));

  document.documentElement.style.setProperty("--c0", colors[colors.length - 1]);

  document.documentElement.style.setProperty("--c1", colors[0]);
}

// create a webcompontent
class PolineEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    [$style, $wheel, $huelabels, $svg].forEach(($el) => {
      this.shadowRoot && this.shadowRoot.appendChild($el.cloneNode(true));
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Value changed from ${oldValue} to ${newValue}`);
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  get text() {
    return this.getAttribute("title");
  }

  render() {
    updateSVG();
  }
}

customElements.define("poline-editor", PolineEditor, { extends: "div" });
