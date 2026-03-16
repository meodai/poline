# Code Review Plan

## Bugs / Correctness

- [ ] **Remove unused `_animationFrame` field** (`index.ts:426`) — dead code
- [ ] **Deduplicate constructor defaults** (`index.ts:432-448`) — the fallback object is mostly redundant and calls `randomHSLPair()` twice
- [ ] **Tighten `removeAnchorPoint` typing** (`index.ts:658`) — `apid` is untyped `let`, could be clearer

## Design / API

- [ ] **`clampToCircle` setter should call `updateAnchorPairs()`** (`index.ts:561-563`) — every other state-changing setter does this; current behavior may surprise users
- [ ] **Document that OKLCH/LCH CSS outputs are approximations** (`index.ts:366-378`) — these are linear HSL rescalings, not real colorimetric conversions
- [ ] **Consider `positionFunction` getter always returning array** (`index.ts:514`) — the union return type `PositionFunction | PositionFunction[]` is awkward for callers

## Minor Cleanup

- [ ] **Scope `eslint-disable` to specific lines** (`index.ts:1`) — instead of blanket file-level disable
- [ ] **Simplify `shouldInvertEase ? true : false`** (`index.ts:602`) — already boolean, redundant ternary
- [ ] **Cache `matchMedia("(pointer: coarse)")`** (`webcomponent.ts:485, 613`) — called on every pointer event, could be set once in `connectedCallback`
- [ ] **Simplify `pointerToNormalizedCoordinates`** (`webcomponent.ts:678-685`) — normalizes then callers un-normalize; could return SVG coords directly

## Test Gaps

- [ ] **Add tests for `cssColors()` method directly**
- [ ] **Add tests for closed-loop color count** — verify `colors.pop()` behaves correctly with various anchor counts
