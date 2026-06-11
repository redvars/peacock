import { LitElement } from 'lit';
export type CanvasDirection = 'up' | 'down' | 'left' | 'right';
export type CanvasStrokeVariant = 'solid' | 'dashed' | 'animated-dashed';
export interface CanvasPoint {
    x: number;
    y: number;
}
export interface CanvasPathSegment {
    direction: CanvasDirection;
    length: number;
}
interface BaseCanvasShape {
    color?: string;
}
interface BaseCanvasStrokeShape extends BaseCanvasShape {
    variant?: CanvasStrokeVariant;
    showArrow?: boolean;
    clickable?: boolean;
}
export interface CanvasNodeShape extends BaseCanvasShape {
    type: 'node';
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    element: HTMLElement;
}
export interface CanvasLineShape extends BaseCanvasStrokeShape {
    type: 'line';
    start?: CanvasPoint;
    end?: CanvasPoint;
}
export interface CanvasConnectorShape extends BaseCanvasStrokeShape {
    type: 'connector';
    start?: CanvasPoint;
    path?: CanvasPathSegment[];
}
export type CanvasShape = CanvasNodeShape | CanvasLineShape | CanvasConnectorShape;
/**
 * @label Canvas
 * @tag wc-canvas
 * @rawTag canvas
 * @summary A SVG canvas for drawing shapes, lines, and connectors on a dotted grid.
 *
 * @cssprop --canvas-background - Background color for the canvas wrapper. Defaults to surface-container-low.
 * @cssprop --canvas-dot-color - Color of the background grid dots. Defaults to outline-variant.
 * @cssprop --canvas-line-color - Default stroke color for lines and connectors. Defaults to on-surface.
 * @cssprop --canvas-hover-color - Stroke color on hover for clickable shapes. Defaults to primary.
 * @cssprop --canvas-arrow-color - Stroke color for arrow markers. Defaults to on-surface.
 */
export declare class Canvas extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    data: CanvasShape[];
    padding: number;
    zoom: number;
    viewbox?: string;
    private static getNextPoint;
    private static updateExtents;
    private static getStrokeVariantClasses;
    private computeShapes;
    private renderBackgroundSvg;
    private renderShapesSvg;
    protected render(): import("lit-html").TemplateResult<1>;
}
export {};
