<h1><a href="https://meodai.github.io/poline/"><img width="200" src="https://meodai.github.io/poline/poline-logo.png" alt="poline" /></a></h1>

## Esoteric Color Palette Generator Micro-Lib

"**poline**" is an enigmatic color palette generator, that harnesses the mystical witchcraft of polar coordinates. Its methodology, defying conventional color science, is steeped in the esoteric knowledge of the early 20th century. This magical technology defies explanation, drawing lines between anchors to produce visually striking and otherworldly palettes. It is an indispensable tool for the modern generative sorcerer, and a delight for the eye.

![Poline DEMO UI](./dist/poline-wheel.png)

## Installation

"**poline**" is available as an [npm package](https://www.npmjs.com/package/poline). Alternatively you can clone it on [GitHub](https://github.com/meodai/poline).

```bash
npm install poline
```

You can also use the [unpkg CDN](https://unpkg.com/poline) to include the library in your project.
I recommend using the **mjs** version of the library. This will allow you to use the **import** syntax. But you can also use the **umd** version if you prefer to use the **script** tag.

```html
<script type="module">
  import { 
    Poline 
  } from 'https://unpkg.com/poline?module'
</script>
```

## Getting Started

Begin your journey with **poline** by following this simple incantation:

```js
// Import the magical construct
import { Poline } from 'poline';

// Summon a new palette with default settings (random anchor colors)
const poline = new Poline();

// Behold the colors in HSL format
console.log(poline.colors);

// Or as CSS strings ready for your spells
console.log(poline.colorsCSS);
```

## Summoning

The use of "**Poline**" begins with the invocation of its command, which can be performed with or without arguments. If called without, the tool will generate a mesmerizing palette featuring two randomly selected **anchors.**
On the other hand, one can choose to provide their own **anchor** points, represented as a list of **hsl** values, for a more personal touch. The power to shape and mold the colors lies in your hands."

```js
new Poline({
  anchorColors: [
    [309, 0.72, 0.80],
    [67, 0.32, 0.08],
    //...
  ],
});
```

## Points

The magic of "**Poline**" is revealed through its technique of drawing lines between anchor points. The richness of the palette is determined by the number of **points**, with each connection producing a unique color.

Increasing the number of **points** will yield an even greater array of colors. By default, four points are used, but this can easily be adjusted through the 'numPoints' property on your Poline instance, as demonstrated in the code example.

```js
new Poline({
  numPoints: 6,
});
```

The resulting palette is a product of points multiplied by the number of anchor pairs. It can be changed after initialization by setting the **numPoints** property on your "**Poline**" instance.

## Anchors

At the heart of "**Poline**" lies the concept of **anchors**, the fixed points that serve as the foundation for the creation of color palettes. **Anchors** are represented as a **list of hsl** values, which consist of three components: **hue** \[0…360\], **saturation** \[0…1\], and **lightness** \[0…1\].

The choice is yours, whether to provide your own anchor points during initialization or to allow "**Poline**" to generate a random selection for you by omitting the 'anchorColors' argument. The versatility of Poline extends "**Poline**" its initial setup, as you can also add anchors to your palette at any time using the '**addAnchorPoint**' method. This method accepts either a **color** as HSL array values or an array of **X, Y, Z** coordinates, further expanding the possibilities of your color creation.

```js
poline.addAnchorPoint({
  color: [100, 0.91, 0.80]
});

// or

poline.addAnchorPoint({
  xyz: [0.43, 0.89, 0.91]
});
```

You can also specify where to insert the new anchor by providing an `insertAtIndex` parameter:

```js
poline.addAnchorPoint({
  color: [200, 0.5, 0.6],
  insertAtIndex: 1 // Insert after the first anchor
});
```

## Updating Anchors

With this feature, you have the power to fine-tune your palette and make adjustments as your creative vision evolves. So whether you are looking to make subtle changes or bold alterations, "**Poline**" is always ready to help you achieve your desired result.

The ability to update existing anchors is made possible through the '**updateAnchorPoint**' method. This method accepts the **reference to the anchor** you wish to modify and either a color in the form of **HSL** representation or an **XYZ** position array.

```js
poline.updateAnchorPoint({
  point: poline.anchorPoints[0],
  color: [286, 0.22, 0.22]
});
```

You can also update an anchor by its index:

```js
poline.updateAnchorPoint({
  pointIndex: 1,
  color: [120, 0.8, 0.5]
});
```

## Position Function

The **position function** in "**Poline**" plays a crucial role in determining the **distribution of colors between the anchors**. It works similar to easing functions and can be imported from the "**Poline**" module.

A position function is a mathematical function that maps a value **between 0 and 1** to another value between 0 and 1. By definition the same position function for all axes "**Poline**" will draw a straight line between the anchors. The chosen function will determine the distribution of colors between the anchors.

```js
import {
Poline, positionFunctions
} from 'poline';

new Poline({
  positionFunction: 
    positionFunctions.linearPosition,
});
```

If none is provided, "**Poline**" will use the default function, which is a sinusoidal function.
The following position functions are available and can be included by importing the **positionFunctions** object from the "**Poline**" module:

- linearPosition
- exponentialPosition
- quadraticPosition
- cubicPosition
- quarticPosition
- sinusoidalPosition **(default)**
- asinusoidalPosition
- arcPosition
- smoothStepPosition

Here's a visual representation of how these functions affect the distribution:

| Function Name | Effect on Color Distribution |
|---------------|------------------------------|
| linearPosition | Even distribution of colors along the path |
| exponentialPosition | Colors cluster near one end, spreading out toward the other |
| sinusoidalPosition | Smooth acceleration and deceleration of colors |
| arcPosition | Colors follow an arc-like distribution |

## Arcs

By defining **different position functions for each axis**, you can control the distribution of colors along each axis (**positionFunctionX**, **positionFunctionY**, **positionFunctionZ**). This will draw different arcs and create a diverse range of color palettes.

```js
new Poline({
  positionFunctionX: 
    positionFunctions.sinusoidalPosition,
  positionFunctionY: 
    positionFunctions.quadraticPosition,
  positionFunctionZ: 
    positionFunctions.linearPosition,
});
```

## Palette

By default, the palette is not a closed loop. This means that the last color generated is not the same as the first color. If you want the palette to be a closed loop, you can set the **closedLoop** argument to true.

```js
poline.closedLoop = true;
```

It is also possible to close the loop after the fact by setting **poline.closedLoop = true|false**.

## Hue Shifting

With the power of hue shifting, "**Poline**" provides yet another level of customization. This feature allows you to **shift the hue** of the colors generated by a certain amount, giving you the ability to animate your palette or create similar color combinations with different hues."

"**poline**" supports hue shifting. This means that the hue of the colors will be shifted by a certain amount. This can be useful if you want to animate the palette or generate a palette that looks similar to your current palette but using different hues.

```js
poline.shiftHue(1);
```
The amount is a int or float between -Infinity and Infinity. It will permanently shift the hue of all colors in the palette.

## Closest Anchor

In some situations, you might want to know which anchor is closest to a certain position or color. This method is used in the visualizer to highlight to select the closest anchor on click.

```js
poline.getClosestAnchorPoint(
  {xyz: [x, y, null], maxDistance: .1}
)
```

The **maxDistance** argument is optional and will return null if the closest anchor is further away than the maxDistance.
Any of the **xyz** or **hsl** components can be null. If they are **null**, they will be ignored.

## Color List

The '**poline**' instance returns all colors as an array of **hsl**, **lch** or 
**oklch** arrays or alternatively as an array of **CSS** strings.

```js
poline.colors           // Array of HSL values [[h, s, l], [h, s, l], ...]
poline.colorsCSS        // Array of CSS HSL strings ['hsl(h, s%, l%)', ...]
poline.colorsCSSlch     // Array of CSS LCH strings ['lch(l% c h)', ...]
poline.colorsCSSoklch   // Array of CSS OKLCH strings ['oklch(l% c h)', ...]
```

## Remove Anchors

To remove an anchor, you can use the **removeAnchorPoint** method. It either takes an **anchor** reference or an **index** as an argument.

```js
poline.removeAnchorPoint({
  point: poline.anchorPoints[
    poline.anchorPoints.length - 1
  ]
});
  // or
poline.removeAnchorPoint({
  index: poline.anchorPoints.length - 1
});
```

## Inverted Lightness

The magical construct of "**poline**" offers the power to invert the lightness calculation, creating palettes with different visual characteristics. You can toggle this option during initialization or later through the instance property.

```js
// During initialization
const poline = new Poline({
  invertedLightness: true
});

// Or later
poline.invertedLightness = true;
```

When inverted, colors near the center of the coordinate system will have higher lightness values, while colors at the edge will be darker, creating a different aesthetic in your palette.

## Color Model

To keep the library as lightweight as possible, "**poline**" only supports the **hsl** color model out of the box. However, it is easily possible to use other color models by using a library like [culori](https://culorijs.org/api/).

```js
import {Poline} from "poline";
import {formatHex} from "culori";
const poline = new Poline(/** options */);

const OKHslColors = [...poline.colors].map(
  c => formatHex({ 
    mode: 'okhsl', 
    h: c[0], 
    s: c[1], 
    l: c[2]
  })
);
const LCHColors = [...poline.colors].map(
  c => formatHex({ 
    mode: 'lch', 
    h: c[0],
    c: c[1] * 51.484,
    l: c[2] * 100,  
  })
);
```

## Common Use Cases

### Creating a Gradient

"**poline**" can be used to generate CSS gradients with unique color distributions:

```js
const poline = new Poline({
  anchorColors: [
    [210, 0.8, 0.6],  // Blue
    [30, 0.8, 0.6]    // Orange
  ],
  numPoints: 8
});

// Generate a CSS linear gradient
const colors = poline.colorsCSS;
const gradient = `linear-gradient(in oklab, ${colors.join(', ')})`;

// Apply to an element
document.getElementById('gradient').style.background = gradient;
```

### Generating Color Schemes for Data Visualization

"**poline**" excels at creating color schemes for data visualization. In this
case, this makes a great diverging color scheme for a chart:

```js
// Create a palette with perceptually distinct colors
const poline = new Poline({
  anchorColors: [
    [10, 0.70, 0.90],
    [70, 0.97, 0],
    [260, 0.70, 0.0]
  ],
  positionFunction: positionFunctions.linearPosition,
  numPoints: 7,
  closedLoop: true
});

// Use the colors for chart elements
const chartColors = poline.colorsCSS;
```

### Animating Palettes

You can animate your "**poline**" palette to create mesmerizing effects:

```js
const poline = new Poline();
let animationFrame;

function animatePalette() {
  // Shift the hue slightly each frame
  poline.shiftHue(0.5);
  
  // Update elements with new colors
  const elements = document.querySelectorAll('.color-element');
  const colors = poline.colorsCSS;
  
  elements.forEach((el, i) => {
    el.style.backgroundColor = colors[i % colors.length];
  });
  
  animationFrame = requestAnimationFrame(animatePalette);
}

// Start/stop animation
document.getElementById('toggle-animation').addEventListener('click', () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  } else {
    animatePalette();
  }
});
```

## Error Handling

"**poline**" will conjure mystical errors when improper incantations are attempted. Be prepared to handle these manifestations:

- When providing fewer than two anchor colors: `"Must have at least two anchor colors"`
- When setting `numPoints` to less than 1: `"Must have at least one point"`
- When removing too many anchors: `"Must have at least two anchor points"`
- When providing invalid parameters: `"Point must be initialized with either x,y,z or hsl"`
- When the anchor point is not found: `"Point not found"`

Example of proper error handling:

```js
try {
  const poline = new Poline({
    anchorColors: [[100, 0.5, 0.5]] // Only one anchor color!
  });
} catch (error) {
  console.error('Failed to summon palette:', error.message);
  // Fallback to default settings
  const poline = new Poline();
}
```

## TypeScript Support

"**poline**" is written in TypeScript and provides type definitions for all its features. The main types you'll encounter:

```typescript
// Basic vector types
type Vector2 = [number, number];
type Vector3 = [number, ...Vector2];
type PartialVector3 = [number | null, number | null, number | null];

// Position function type
type PositionFunction = (t: number, reverse?: boolean) => number;

// Options for creating a Poline instance
type PolineOptions = {
  anchorColors: Vector3[];
  numPoints: number;
  positionFunction?: PositionFunction;
  positionFunctionX?: PositionFunction;
  positionFunctionY?: PositionFunction;
  positionFunctionZ?: PositionFunction;
  invertedLightness?: boolean;
  closedLoop?: boolean;
};

// Color point collection
type ColorPointCollection = {
  xyz?: Vector3;
  color?: Vector3;
  invertedLightness?: boolean;
};
```

## API Reference

Behold the arcane interface of "**poline**", detailed in full for your enlightenment:

### Poline Class

#### Constructor (ColorPoint Class)

```typescript
constructor(options?: PolineOptions)
```

#### Properties of the Poline Class

- `numPoints: number` - Get/set the number of points between anchors
- `positionFunction: PositionFunction | PositionFunction[]` - Get/set the position function(s)
- `positionFunctionX: PositionFunction` - Get/set the X-axis position function
- `positionFunctionY: PositionFunction` - Get/set the Y-axis position function
- `positionFunctionZ: PositionFunction` - Get/set the Z-axis position function
- `anchorPoints: ColorPoint[]` - Get/set the anchor points
- `closedLoop: boolean` - Get/set whether the palette forms a closed loop
- `invertedLightness: boolean` - Get/set whether lightness calculation is inverted
- `flattenedPoints: ColorPoint[]` - Get all points in a flat array
- `colors: Vector3[]` - Get all colors as HSL arrays
- `colorsCSS: string[]` - Get all colors as CSS HSL strings
- `colorsCSSlch: string[]` - Get all colors as CSS LCH strings
- `colorsCSSoklch: string[]` - Get all colors as CSS OKLCH strings

#### Methods of the ColorPoint Class

- `updateAnchorPairs(): void` - Update internal anchor pairs
- `addAnchorPoint(options: ColorPointCollection & { insertAtIndex?: number }): ColorPoint` - Add a new anchor point
- `removeAnchorPoint(options: { point?: ColorPoint; index?: number }): void` - Remove an anchor point
- `updateAnchorPoint(options: { point?: ColorPoint; pointIndex?: number } & ColorPointCollection): ColorPoint` - Update an anchor point
- `getClosestAnchorPoint(options: { xyz?: PartialVector3; hsl?: PartialVector3; maxDistance?: number }): ColorPoint | null` - Find closest anchor point
- `shiftHue(hShift?: number): void` - Shift the hue of all colors

### ColorPoint Class

#### Constructor

```typescript
constructor(options?: ColorPointCollection)
```

#### Properties

- `position: Vector3` - Get/set the XYZ position
- `hsl: Vector3` - Get/set the HSL color
- `hslCSS: string` - Get the CSS HSL string
- `oklchCSS: string` - Get the CSS OKLCH string
- `lchCSS: string` - Get the CSS LCH string

#### Methods

- `positionOrColor(options: ColorPointCollection): void` - Set position or color
- `shiftHue(angle: number): void` - Shift the hue of the color

### Position Functions

All position functions have the signature:

```typescript
(t: number, reverse?: boolean) => number
```

Available functions:

- `linearPosition`
- `exponentialPosition`
- `quadraticPosition`
- `cubicPosition`
- `quarticPosition`
- `sinusoidalPosition`
- `asinusoidalPosition`
- `arcPosition`
- `smoothStepPosition`

## Web Component

"**poline**" also provides a web component called `<poline-picker>` that creates an interactive color wheel for visualizing and manipulating your color palettes. This interface allows users to drag anchor points and see real-time updates to their palette. A simple demo is available at [poline-picker demo](https://meodai.github.io/poline/picker.html).

### Basic Usage and Setup

```html
<script type="module">
  import { Poline, PolinePicker } from 'https://unpkg.com/poline/dist/picker.mjs';
</script>

<poline-picker id="picker" interactive allow-add-points></poline-picker>

<script>
  const picker = document.getElementById('picker');
  
  // Create and set a palette
  const poline = new Poline({
    anchorColors: [[300, 0.8, 0.7], [60, 0.9, 0.5]],
    numPoints: 6
  });
  picker.setPoline(poline);
  
  // Listen for changes
  picker.addEventListener('poline-change', (event) => {
    console.log('New colors:', event.detail.poline.colorsCSS);
  });
</script>
```

### Attributes

The `<poline-picker>` component supports the following attributes:

- `interactive` - Enables dragging of anchor points
- `allow-add-points` - Allows adding new anchor points by clicking on empty areas

### Styling the Component

The picker can be styled using CSS custom properties:

```css
poline-picker {
  width: 300px;
  height: 300px;
  
  /* Customize the appearance */
  --poline-picker-line-color: #333;
  --poline-picker-bg-color: #fff;
}
```

### API Methods

The `<poline-picker>` element provides several methods for programmatic control:

```javascript
const picker = document.querySelector('poline-picker');

// Set a new palette
picker.setPoline(myPoline);

// Enable/disable adding points
picker.setAllowAddPoints(true);

// Add a point at specific coordinates (x, y in pixels)
const newPoint = picker.addPointAtPosition(150, 100);
```

### Events

The component dispatches a `poline-change` event whenever the palette is modified:

```javascript
picker.addEventListener('poline-change', (event) => {
  const { poline } = event.detail;
  // Access the updated palette
  console.log('Updated palette:', poline.colorsCSS);
});
```

## Web Component Installation

"**poline**" is available as an [npm package](https://www.npmjs.com/package/poline). Alternatively you can clone it on [GitHub](https://github.com/meodai/poline).

```bash
npm install poline
```

```html
<script type="module">
  import { 
    Poline, 
    PolinePicker 
  } from 'https://unpkg.com/poline/dist/picker.mjs'
</script>
```

```html
<poline-picker id="picker" interactive allow-add-points></poline-picker>
```

### Using the Web Component

For the interactive `<poline-picker>` web component, use the picker build:

```html
<script type="module">
  import { 
    Poline, 
    PolinePicker 
  } from 'https://unpkg.com/poline/dist/picker.mjs'
</script>
```

Or install via npm and import:

```javascript
import { Poline, PolinePicker } from 'poline/dist/picker.mjs';
```

## License

And thus, the tome of "**poline**" has been written. Its mystical powers, steeped in the arcane knowledge of the ancients, now reside within these pages. May this compendium serve you in your quest for the ultimate color palette.

The project is [MIT licensed](https://github.com/meodai/poline/blob/main/LICENSE) and open source. If you find any bugs or have any suggestions please open an issue on [GitHub](https://github.com/meodai/poline/issues).

Inspired and created with the blessing of [Anatoly Zenkov](https://anatolyzenkov.com/)
