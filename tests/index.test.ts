import { describe, it, expect } from 'vitest';
import {
  Poline,
  ColorPoint,
  positionFunctions,
  pointToHSL,
  hslToPoint,
  randomHSLPair,
  randomHSLTriple,
} from '../src/index';

describe('ColorPoint', () => {
  it('should initialize with xyz coordinates', () => {
    const point = new ColorPoint({ xyz: [0.5, 0.5, 1] });
    expect(point.x).toBe(0.5);
    expect(point.y).toBe(0.5);
    expect(point.z).toBe(1);
    expect(point.color).toBeDefined();
    expect(point.color.length).toBe(3);
  });

  it('should initialize with HSL color', () => {
    const point = new ColorPoint({ color: [180, 0.5, 0.5] });
    expect(point.color[0]).toBe(180);
    expect(point.color[1]).toBe(0.5);
    expect(point.color[2]).toBe(0.5);
    expect(point.x).toBeDefined();
    expect(point.y).toBeDefined();
    expect(point.z).toBeDefined();
  });

  it('should throw error when initialized with both xyz and color', () => {
    expect(() => {
      new ColorPoint({ xyz: [0.5, 0.5, 1], color: [180, 0.5, 0.5] });
    }).toThrow('Point must be initialized with either x,y,z or hsl');
  });

  it('should throw error when initialized with neither xyz nor color', () => {
    expect(() => {
      new ColorPoint({});
    }).toThrow('Point must be initialized with either x,y,z or hsl');
  });

  it('should update color when position is set', () => {
    const point = new ColorPoint({ xyz: [0.5, 0.5, 1] });
    const initialColor = [...point.color];
    point.position = [0.7, 0.7, 0.8];
    expect(point.x).toBe(0.7);
    expect(point.y).toBe(0.7);
    expect(point.z).toBe(0.8);
    expect(point.color).not.toEqual(initialColor);
  });

  it('should update position when HSL is set', () => {
    const point = new ColorPoint({ color: [180, 0.5, 0.5] });
    const initialPosition = [point.x, point.y, point.z];
    point.hsl = [90, 0.8, 0.3];
    expect(point.color[0]).toBe(90);
    expect(point.color[1]).toBe(0.8);
    expect(point.color[2]).toBe(0.3);
    expect([point.x, point.y, point.z]).not.toEqual(initialPosition);
  });

  it('should generate valid CSS color strings', () => {
    const point = new ColorPoint({ color: [180, 0.5, 0.5] });
    expect(point.hslCSS).toMatch(/^hsl\(\d+\.?\d*, \d+\.?\d*%, \d+\.?\d*%\)$/);
    expect(point.oklchCSS).toMatch(/^oklch\(\d+\.?\d*% \d+\.?\d* \d+\.?\d*\)$/);
    expect(point.lchCSS).toMatch(/^lch\(\d+\.?\d*% \d+\.?\d* \d+\.?\d*\)$/);
  });

  it('should handle invertedLightness correctly', () => {
    const point = new ColorPoint({
      color: [0, 1, 0.2],
      invertedLightness: false,
    });
    expect(point.color[2]).toBeCloseTo(0.2);

    point.invertedLightness = true;
    expect(point.color[2]).toBeCloseTo(0.8);

    point.invertedLightness = false;
    expect(point.color[2]).toBeCloseTo(0.2);
  });

  it('should shift hue correctly', () => {
    const point = new ColorPoint({ color: [100, 0.5, 0.5] });
    point.shiftHue(50);
    expect(point.color[0]).toBe(150);

    point.shiftHue(-200);
    expect(point.color[0]).toBe(310); // (150 - 200 + 360) % 360
  });

  it('should handle hue wrapping at 360 degrees', () => {
    const point = new ColorPoint({ color: [350, 0.5, 0.5] });
    point.shiftHue(20);
    expect(point.color[0]).toBe(10); // (350 + 20) % 360
  });
});

describe('pointToHSL and hslToPoint conversion', () => {
  it('should convert xyz to HSL', () => {
    const hsl = pointToHSL([0.5, 0.5, 1], false);
    expect(hsl).toBeDefined();
    expect(hsl.length).toBe(3);
    expect(hsl[1]).toBe(1); // saturation from z
    expect(hsl[2]).toBeCloseTo(0); // lightness at center
  });

  it('should convert HSL to xyz', () => {
    const xyz = hslToPoint([180, 0.8, 0.5], false);
    expect(xyz).toBeDefined();
    expect(xyz.length).toBe(3);
    expect(xyz[2]).toBe(0.8); // z from saturation
  });

  it('should be reversible (xyz -> HSL -> xyz)', () => {
    const originalXYZ: [number, number, number] = [0.7, 0.3, 0.9];
    const hsl = pointToHSL(originalXYZ, false);
    const convertedXYZ = hslToPoint(hsl, false);

    expect(convertedXYZ[0]).toBeCloseTo(originalXYZ[0], 5);
    expect(convertedXYZ[1]).toBeCloseTo(originalXYZ[1], 5);
    expect(convertedXYZ[2]).toBeCloseTo(originalXYZ[2], 5);
  });

  it('should be reversible (HSL -> xyz -> HSL)', () => {
    const originalHSL: [number, number, number] = [240, 0.6, 0.4];
    const xyz = hslToPoint(originalHSL, false);
    const convertedHSL = pointToHSL(xyz, false);

    expect(convertedHSL[0]).toBeCloseTo(originalHSL[0], 5);
    expect(convertedHSL[1]).toBeCloseTo(originalHSL[1], 5);
    expect(convertedHSL[2]).toBeCloseTo(originalHSL[2], 5);
  });

  it('should handle invertedLightness in conversions', () => {
    const hsl: [number, number, number] = [180, 0.5, 0.3];
    const xyz = hslToPoint(hsl, false);
    const xyzInverted = hslToPoint(hsl, true);

    const hslBack = pointToHSL(xyz, false);
    const hslBackInverted = pointToHSL(xyzInverted, true);

    expect(hslBack[2]).toBeCloseTo(0.3, 5);
    expect(hslBackInverted[2]).toBeCloseTo(0.3, 5);
  });
});

describe('randomHSLPair and randomHSLTriple', () => {
  it('should generate random HSL pair with default values', () => {
    const pair = randomHSLPair();
    expect(pair.length).toBe(2);
    expect(pair[0].length).toBe(3);
    expect(pair[1].length).toBe(3);

    // Check hue range
    expect(pair[0][0]).toBeGreaterThanOrEqual(0);
    expect(pair[0][0]).toBeLessThan(360);
    expect(pair[1][0]).toBeGreaterThanOrEqual(0);
    expect(pair[1][0]).toBeLessThan(360);

    // Check saturation range
    expect(pair[0][1]).toBeGreaterThanOrEqual(0);
    expect(pair[0][1]).toBeLessThanOrEqual(1);
    expect(pair[1][1]).toBeGreaterThanOrEqual(0);
    expect(pair[1][1]).toBeLessThanOrEqual(1);

    // Check lightness range
    expect(pair[0][2]).toBeGreaterThanOrEqual(0);
    expect(pair[0][2]).toBeLessThanOrEqual(1);
    expect(pair[1][2]).toBeGreaterThanOrEqual(0);
    expect(pair[1][2]).toBeLessThanOrEqual(1);
  });

  it('should generate random HSL pair with custom values', () => {
    const pair = randomHSLPair(100, [0.5, 0.8], [0.2, 0.7]);
    expect(pair[0][0]).toBe(100);
    expect(pair[0][1]).toBe(0.5);
    expect(pair[0][2]).toBe(0.2);
    expect(pair[1][1]).toBe(0.8);
    expect(pair[1][2]).toBe(0.7);
  });

  it('should generate random HSL triple with default values', () => {
    const triple = randomHSLTriple();
    expect(triple.length).toBe(3);
    triple.forEach((color) => {
      expect(color.length).toBe(3);
      expect(color[0]).toBeGreaterThanOrEqual(0);
      expect(color[0]).toBeLessThan(360);
      expect(color[1]).toBeGreaterThanOrEqual(0);
      expect(color[1]).toBeLessThanOrEqual(1);
      expect(color[2]).toBeGreaterThanOrEqual(0);
      expect(color[2]).toBeLessThanOrEqual(1);
    });
  });

  it('should generate random HSL triple with custom values', () => {
    const triple = randomHSLTriple(200, [0.3, 0.6, 0.9], [0.1, 0.5, 0.8]);
    expect(triple[0][0]).toBe(200);
    expect(triple[0][1]).toBe(0.3);
    expect(triple[0][2]).toBe(0.1);
    expect(triple[1][1]).toBe(0.6);
    expect(triple[1][2]).toBe(0.5);
    expect(triple[2][1]).toBe(0.9);
    expect(triple[2][2]).toBe(0.8);
  });
});

describe('Poline', () => {
  it('should initialize with default values', () => {
    const poline = new Poline();
    expect(poline.anchorPoints.length).toBe(2); // Default random pair
    expect(poline.numPoints).toBe(4); // Default numPoints
    expect(poline.invertedLightness).toBe(false);
    expect(poline.closedLoop).toBe(false);
  });

  it('should initialize with custom options', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [180, 1, 0.5],
      ],
      numPoints: 10,
      invertedLightness: true,
      closedLoop: true,
    });
    expect(poline.numPoints).toBe(10);
    expect(poline.invertedLightness).toBe(true);
    expect(poline.closedLoop).toBe(true);
    expect(poline.anchorPoints.length).toBe(2);
  });

  it('should throw error when initialized with less than 2 anchor colors', () => {
    expect(() => {
      new Poline({ anchorColors: [[0, 1, 0.5]] });
    }).toThrow('Must have at least two anchor colors');
  });

  it('should update anchor points when invertedLightness is toggled', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [180, 1, 0.5],
      ], // HSL
      invertedLightness: false,
    });

    // Toggle invertedLightness
    poline.invertedLightness = true;

    // Check if the property updated
    expect(poline.invertedLightness).toBe(true);
  });

  it('should correctly invert lightness for anchors', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.2],
        [0, 1, 0.2],
      ], // Dark color
      invertedLightness: false,
    });

    // Initial state: Lightness 0.2
    expect(poline.anchorPoints[0].color[2]).toBeCloseTo(0.2);

    // Invert
    poline.invertedLightness = true;

    // New state: Lightness should be 1 - 0.2 = 0.8
    expect(poline.anchorPoints[0].color[2]).toBeCloseTo(0.8);

    // Invert back
    poline.invertedLightness = false;
    expect(poline.anchorPoints[0].color[2]).toBeCloseTo(0.2);
  });

  it('should add and remove anchor points', () => {
    const poline = new Poline();
    const initialCount = poline.anchorPoints.length;

    poline.addAnchorPoint({ color: [0, 1, 0.5] });
    expect(poline.anchorPoints.length).toBe(initialCount + 1);

    poline.removeAnchorPoint({ index: initialCount });
    expect(poline.anchorPoints.length).toBe(initialCount);
  });

  it('should throw error when removing anchor point with less than 3 remaining', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [180, 1, 0.5],
      ],
    });
    expect(() => {
      poline.removeAnchorPoint({ index: 0 });
    }).toThrow('Must have at least two anchor points');
  });

  it('should get color at specific position', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [0, 1, 0.5],
      ], // Same color for easy check
      positionFunction: positionFunctions.linearPosition,
    });

    const color = poline.getColorAt(0.5);
    expect(color.color[0]).toBeCloseTo(0);
    expect(color.color[1]).toBeCloseTo(1);
    expect(color.color[2]).toBeCloseTo(0.5);
  });

  it('should throw error when getColorAt is called with invalid position', () => {
    const poline = new Poline();
    expect(() => poline.getColorAt(-0.1)).toThrow(
      'Position must be between 0 and 1'
    );
    expect(() => poline.getColorAt(1.1)).toThrow(
      'Position must be between 0 and 1'
    );
  });

  it('should handle getColorAt at edge positions', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.2],
        [180, 1, 0.8],
      ],
      positionFunction: positionFunctions.linearPosition,
    });

    const colorStart = poline.getColorAt(0);
    const colorEnd = poline.getColorAt(1);

    // At start should be close to first anchor
    expect(colorStart.color[0]).toBeCloseTo(0, 0);
    expect(colorStart.color[2]).toBeCloseTo(0.2, 0);

    // At end should be close to second anchor
    expect(colorEnd.color[0]).toBeCloseTo(180, 0);
    expect(colorEnd.color[2]).toBeCloseTo(0.8, 0);
  });

  it('should update numPoints correctly', () => {
    const poline = new Poline({ numPoints: 5 });
    expect(poline.numPoints).toBe(5);

    poline.numPoints = 10;
    expect(poline.numPoints).toBe(10);
  });

  it('should throw error when numPoints is less than 1', () => {
    const poline = new Poline();
    expect(() => {
      poline.numPoints = 0;
    }).toThrow('Must have at least one point');
  });

  it('should update and retrieve position functions', () => {
    const poline = new Poline();
    poline.positionFunction = positionFunctions.exponentialPosition;
    expect(poline.positionFunction).toBe(
      positionFunctions.exponentialPosition
    );
  });

  it('should handle array of position functions', () => {
    const poline = new Poline();
    const funcs = [
      positionFunctions.linearPosition,
      positionFunctions.exponentialPosition,
      positionFunctions.quadraticPosition,
    ];

    poline.positionFunction = funcs;
    expect(poline.positionFunctionX).toBe(funcs[0]);
    expect(poline.positionFunctionY).toBe(funcs[1]);
    expect(poline.positionFunctionZ).toBe(funcs[2]);
  });

  it('should throw error with invalid position function array', () => {
    const poline = new Poline();
    expect(() => {
      poline.positionFunction = [positionFunctions.linearPosition];
    }).toThrow('Position function array must have 3 elements');
  });

  it('should update individual position functions', () => {
    const poline = new Poline();
    poline.positionFunctionX = positionFunctions.linearPosition;
    poline.positionFunctionY = positionFunctions.exponentialPosition;
    poline.positionFunctionZ = positionFunctions.quadraticPosition;

    expect(poline.positionFunctionX).toBe(positionFunctions.linearPosition);
    expect(poline.positionFunctionY).toBe(
      positionFunctions.exponentialPosition
    );
    expect(poline.positionFunctionZ).toBe(positionFunctions.quadraticPosition);
  });

  it('should add anchor point at specific index', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [180, 1, 0.5],
      ],
    });

    poline.addAnchorPoint({ color: [90, 1, 0.5], insertAtIndex: 1 });
    expect(poline.anchorPoints.length).toBe(3);
    expect(poline.anchorPoints[1].color[0]).toBe(90);
  });

  it('should update anchor point by index', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [180, 1, 0.5],
      ],
    });

    poline.updateAnchorPoint({ pointIndex: 0, color: [45, 0.8, 0.6] });
    expect(poline.anchorPoints[0].color[0]).toBe(45);
    expect(poline.anchorPoints[0].color[1]).toBe(0.8);
    expect(poline.anchorPoints[0].color[2]).toBe(0.6);
  });

  it('should update anchor point by reference', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [180, 1, 0.5],
      ],
    });

    const anchor = poline.anchorPoints[0];
    poline.updateAnchorPoint({ point: anchor, color: [90, 0.7, 0.4] });
    expect(poline.anchorPoints[0].color[0]).toBe(90);
  });

  it('should throw error when updating without point or index', () => {
    const poline = new Poline();
    expect(() => {
      poline.updateAnchorPoint({ color: [0, 1, 0.5] });
    }).toThrow('Must provide a point or pointIndex');
  });

  it('should throw error when updating without new values', () => {
    const poline = new Poline();
    expect(() => {
      poline.updateAnchorPoint({ pointIndex: 0 });
    }).toThrow('Must provide a new xyz position or color');
  });

  it('should find closest anchor point by xyz', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [180, 1, 0.5],
      ],
    });

    const anchor0Pos = poline.anchorPoints[0].position;
    const closest = poline.getClosestAnchorPoint({
      xyz: [anchor0Pos[0] + 0.01, anchor0Pos[1] + 0.01, anchor0Pos[2]],
    });

    expect(closest).toBe(poline.anchorPoints[0]);
  });

  it('should find closest anchor point by hsl', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [180, 1, 0.5],
      ],
    });

    const closest = poline.getClosestAnchorPoint({ hsl: [5, 1, 0.5] });
    expect(closest).toBe(poline.anchorPoints[0]);
  });

  it('should return null when no anchor within maxDistance', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [180, 1, 0.5],
      ],
    });

    const closest = poline.getClosestAnchorPoint({
      xyz: [5, 5, 5],
      maxDistance: 0.01,
    });
    expect(closest).toBeNull();
  });

  it('should throw error when getClosestAnchorPoint called without xyz or hsl', () => {
    const poline = new Poline();
    expect(() => {
      poline.getClosestAnchorPoint({ maxDistance: 1 });
    }).toThrow('Must provide a xyz or hsl');
  });

  it('should toggle closedLoop', () => {
    const poline = new Poline({ closedLoop: false });
    expect(poline.closedLoop).toBe(false);

    poline.closedLoop = true;
    expect(poline.closedLoop).toBe(true);
  });

  it('should shift hue for all anchor points', () => {
    const poline = new Poline({
      anchorColors: [
        [100, 1, 0.5],
        [200, 1, 0.5],
      ],
    });

    poline.shiftHue(30);
    expect(poline.anchorPoints[0].color[0]).toBe(130);
    expect(poline.anchorPoints[1].color[0]).toBe(230);
  });

  it('should generate flattenedPoints correctly', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [180, 1, 0.5],
      ],
      numPoints: 4,
    });

    const flattened = poline.flattenedPoints;
    expect(flattened.length).toBeGreaterThan(0);
    expect(flattened[0]).toBeInstanceOf(ColorPoint);
  });

  it('should generate colors array', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [180, 1, 0.5],
      ],
      numPoints: 4,
    });

    const colors = poline.colors;
    expect(colors.length).toBeGreaterThan(0);
    colors.forEach((color) => {
      expect(color.length).toBe(3);
    });
  });

  it('should generate CSS color strings in different formats', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [180, 1, 0.5],
      ],
      numPoints: 2,
    });

    const hslColors = poline.colorsCSS;
    const lchColors = poline.colorsCSSlch;
    const oklchColors = poline.colorsCSSoklch;

    expect(hslColors.length).toBeGreaterThan(0);
    expect(lchColors.length).toBeGreaterThan(0);
    expect(oklchColors.length).toBeGreaterThan(0);

    hslColors.forEach((color) => {
      expect(color).toMatch(/^hsl\(/);
    });
    lchColors.forEach((color) => {
      expect(color).toMatch(/^lch\(/);
    });
    oklchColors.forEach((color) => {
      expect(color).toMatch(/^oklch\(/);
    });
  });

  it('should handle closed loop with 2 anchors correctly', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [180, 1, 0.5],
      ],
      closedLoop: true,
      numPoints: 4,
    });

    expect(poline.closedLoop).toBe(true);
    const colors = poline.colors;
    expect(colors.length).toBeGreaterThan(0);
  });

  it('should handle multiple anchor points in closed loop', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.5],
        [120, 1, 0.5],
        [240, 1, 0.5],
      ],
      closedLoop: true,
      numPoints: 3,
    });

    expect(poline.anchorPoints.length).toBe(3);
    expect(poline.closedLoop).toBe(true);
  });

  it('should interpolate colors correctly across multiple segments', () => {
    const poline = new Poline({
      anchorColors: [
        [0, 1, 0.2],
        [120, 1, 0.5],
        [240, 1, 0.8],
      ],
      positionFunction: positionFunctions.linearPosition,
      numPoints: 2,
    });

    // Test start
    const colorStart = poline.getColorAt(0);
    expect(colorStart.color[0]).toBeCloseTo(0, 0);

    // Test middle (should be in second segment)
    const colorMiddle = poline.getColorAt(0.5);
    expect(colorMiddle.color[0]).toBeGreaterThan(0);
    expect(colorMiddle.color[0]).toBeLessThan(240);

    // Test end
    const colorEnd = poline.getColorAt(1);
    expect(colorEnd.color[0]).toBeCloseTo(240, 0);
  });
});

describe('Position Functions', () => {
  it('should have all expected position functions', () => {
    expect(positionFunctions.linearPosition).toBeDefined();
    expect(positionFunctions.exponentialPosition).toBeDefined();
    expect(positionFunctions.quadraticPosition).toBeDefined();
    expect(positionFunctions.cubicPosition).toBeDefined();
    expect(positionFunctions.quarticPosition).toBeDefined();
    expect(positionFunctions.sinusoidalPosition).toBeDefined();
    expect(positionFunctions.asinusoidalPosition).toBeDefined();
    expect(positionFunctions.arcPosition).toBeDefined();
    expect(positionFunctions.smoothStepPosition).toBeDefined();
  });

  it('should return values between 0 and 1 for t between 0 and 1', () => {
    const functions = Object.values(positionFunctions);
    const testValues = [0, 0.25, 0.5, 0.75, 1];

    functions.forEach((fn) => {
      testValues.forEach((t) => {
        const result = fn(t);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
      });
    });
  });

  it('should return 0 at t=0 for most functions', () => {
    expect(positionFunctions.linearPosition(0)).toBe(0);
    expect(positionFunctions.exponentialPosition(0)).toBe(0);
    expect(positionFunctions.quadraticPosition(0)).toBe(0);
    expect(positionFunctions.cubicPosition(0)).toBe(0);
    expect(positionFunctions.quarticPosition(0)).toBe(0);
    expect(positionFunctions.sinusoidalPosition(0)).toBeCloseTo(0);
    expect(positionFunctions.asinusoidalPosition(0)).toBeCloseTo(0);
    expect(positionFunctions.smoothStepPosition(0)).toBe(0);
  });

  it('should return 1 at t=1 for all functions', () => {
    Object.values(positionFunctions).forEach((fn) => {
      expect(fn(1)).toBeCloseTo(1);
    });
  });

  it('should handle reverse parameter correctly', () => {
    const t = 0.3;

    const expNormal = positionFunctions.exponentialPosition(t, false);
    const expReverse = positionFunctions.exponentialPosition(t, true);
    expect(expReverse).toBeGreaterThan(expNormal);

    const sinNormal = positionFunctions.sinusoidalPosition(t, false);
    const sinReverse = positionFunctions.sinusoidalPosition(t, true);
    // sinReverse should be less than sinNormal for early t values
    // because reverse means 1 - sin((1-t) * PI/2) which is smaller for small t
    expect(sinReverse).toBeLessThan(sinNormal);
  });

  it('linearPosition should return t', () => {
    expect(positionFunctions.linearPosition(0.3)).toBe(0.3);
    expect(positionFunctions.linearPosition(0.7)).toBe(0.7);
  });

  it('smoothStepPosition should have smooth transition', () => {
    const p0 = positionFunctions.smoothStepPosition(0);
    const p25 = positionFunctions.smoothStepPosition(0.25);
    const p50 = positionFunctions.smoothStepPosition(0.5);
    const p75 = positionFunctions.smoothStepPosition(0.75);
    const p100 = positionFunctions.smoothStepPosition(1);

    expect(p0).toBe(0);
    expect(p50).toBe(0.5);
    expect(p100).toBe(1);
    expect(p25).toBeLessThan(0.5);
    expect(p75).toBeGreaterThan(0.5);
  });
});
