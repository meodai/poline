import { Poline, positionFunctions, ColorPoint } from "./index";
export { Poline, positionFunctions };
export declare class PolinePicker extends HTMLElement {
    private poline;
    private svg;
    private interactive;
    private wheel;
    private line;
    private anchors;
    private points;
    private currentPoint;
    private allowAddPoints;
    constructor();
    connectedCallback(): void;
    setPoline(poline: Poline): void;
    setAllowAddPoints(allow: boolean): void;
    addPointAtPosition(x: number, y: number): ColorPoint | null;
    private updateLightnessBackground;
    private render;
    private createSVG;
    updateSVG(): void;
    private pointToCartesian;
    private addEventListeners;
    private getPointerPosition;
}
