import { html, LitElement, svg, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './flow-canvas.scss';

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

export type CanvasShape =
  | CanvasNodeShape
  | CanvasLineShape
  | CanvasConnectorShape;

const GRID_GAP = 10;
const GRID_DOT_RADIUS = 1;

interface CanvasBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasExtents {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface CanvasViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

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
@IndividualComponent
export class Canvas extends LitElement {
  static styles = [styles];

  @property({ type: Array })
  data: CanvasShape[] = [];

  @property({ type: Number, reflect: true })
  padding: number = 1;

  @property({ type: Number, reflect: true })
  zoom: number = 1;

  @property({ type: String })
  viewbox?: string;

  private static getNextPoint(
    point: CanvasPoint,
    direction: CanvasDirection,
    length: number,
  ): CanvasPoint {
    if (direction === 'down') return { x: point.x, y: point.y + length };
    if (direction === 'up') return { x: point.x, y: point.y - length };
    if (direction === 'left') return { x: point.x - length, y: point.y };
    if (direction === 'right') return { x: point.x + length, y: point.y };
    return { x: point.x, y: point.y };
  }

  private static updateExtents(extents: CanvasExtents, x: number, y: number) {
    if (x < extents.minX) extents.minX = x;
    if (x > extents.maxX) extents.maxX = x;
    if (y < extents.minY) extents.minY = y;
    if (y > extents.maxY) extents.maxY = y;
  }

  private static getStrokeVariantClasses(variant?: CanvasStrokeVariant) {
    return {
      line: true,
      'variant-dashed': variant === 'dashed' || variant === 'animated-dashed',
      'variant-animated-dashed': variant === 'animated-dashed',
    };
  }

  private computeShapes(initialBounds: CanvasBounds) {
    const extents: CanvasExtents = {
      minX: initialBounds.x,
      minY: initialBounds.y,
      maxX: initialBounds.x + initialBounds.width,
      maxY: initialBounds.y + initialBounds.height,
    };

    // Pass 1: Compute extents
    this.data.forEach(shape => {
      switch (shape.type) {
        case 'node': {
          const x = shape.x || 0;
          const y = shape.y || 0;
          const width = shape.width || 0;
          const height = shape.height || 0;
          Canvas.updateExtents(extents, x, y);
          Canvas.updateExtents(extents, x + width, y + height);
          break;
        }
        case 'line': {
          const start = shape.start || { x: 0, y: 0 };
          const end = shape.end || { x: 0, y: 0 };
          Canvas.updateExtents(extents, start.x, start.y);
          Canvas.updateExtents(extents, end.x, end.y);
          break;
        }
        case 'connector': {
          const start = shape.start || { x: 0, y: 0 };
          let current = { ...start };
          Canvas.updateExtents(extents, current.x, current.y);

          const pathSegments = shape.path || [];
          for (let i = 0; i < pathSegments.length; i += 1) {
            const path = pathSegments[i];

            if (i === 0) {
              const point = Canvas.getNextPoint(current, path.direction, 1);
              current = { ...point };
              Canvas.updateExtents(extents, current.x, current.y);
            }

            const point = Canvas.getNextPoint(
              current,
              path.direction,
              path.length - 2,
            );
            current = { ...point };
            Canvas.updateExtents(extents, current.x, current.y);

            if (i === pathSegments.length - 1) {
              const endPoint = Canvas.getNextPoint(current, path.direction, 1);
              current = { ...endPoint };
              Canvas.updateExtents(extents, current.x, current.y);
            } else {
              const nextPath = pathSegments[i + 1];
              const midPoint = Canvas.getNextPoint(current, path.direction, 1);
              Canvas.updateExtents(extents, midPoint.x, midPoint.y);
              const nextPoint = Canvas.getNextPoint(
                midPoint,
                nextPath.direction,
                1,
              );
              current = { ...nextPoint };
              Canvas.updateExtents(extents, current.x, current.y);
            }
          }
          break;
        }
      }
    });

    const computedViewbox = {
      x: extents.minX - this.padding,
      y: extents.minY - this.padding,
      width: Math.max(extents.maxX - extents.minX + this.padding * 2, 0),
      height: Math.max(extents.maxY - extents.minY + this.padding * 2, 0),
    };

    // If there is an explicit viewbox override, use it for layout coordinates
    let layoutViewBox = { ...computedViewbox };
    if (this.viewbox) {
      const viewBoxParts = this.viewbox.split(' ');
      layoutViewBox = {
        x: parseInt(viewBoxParts[0], 10),
        y: parseInt(viewBoxParts[1], 10),
        width: parseInt(viewBoxParts[2], 10),
        height: parseInt(viewBoxParts[3], 10),
      };
    }

    // Pass 2: Map to Lit templates
    const shapes = this.data.map(shape => {
      switch (shape.type) {
        case 'node': {
          const x = shape.x || 0;
          const y = shape.y || 0;
          const width = shape.width || 0;
          const height = shape.height || 0;
          
          return {
            type: 'html-node',
            content: html`<div
              style="position: absolute; left: ${(x - layoutViewBox.x) * GRID_GAP + GRID_DOT_RADIUS}px; top: ${(y - layoutViewBox.y) * GRID_GAP + GRID_DOT_RADIUS}px; width: ${width * GRID_GAP}px; height: ${height * GRID_GAP}px;"
            >
              ${shape.element}
            </div>`
          };
        }
        case 'line': {
          const start = shape.start || { x: 0, y: 0 };
          const end = shape.end || { x: 0, y: 0 };
          const pathString = `M${start.x * GRID_GAP + GRID_DOT_RADIUS} ${start.y * GRID_GAP + GRID_DOT_RADIUS} L${end.x * GRID_GAP + GRID_DOT_RADIUS} ${end.y * GRID_GAP + GRID_DOT_RADIUS}`;
          const strokeColor =
            shape.color ||
            'var(--canvas-line-color, var(--color-on-surface))';

          return {
            type: 'svg-shape',
            content: svg`<path
              class=${classMap({
                ...Canvas.getStrokeVariantClasses(shape.variant),
                clickable: !!shape.clickable,
              })}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke=${strokeColor}
              marker-end=${shape.showArrow ? 'url(#endarrow)' : ''}
              d=${pathString}
              stroke-dasharray=${shape.variant === 'dashed' || shape.variant === 'animated-dashed' ? '6,6' : nothing}
              fill="none"
            />`
          };
        }
        case 'connector': {
          const start = shape.start || { x: 0, y: 0 };
          let pathString = `M${start.x * GRID_GAP + GRID_DOT_RADIUS} ${start.y * GRID_GAP + GRID_DOT_RADIUS}`;
          let current = { ...start };

          const pathSegments = shape.path || [];
          for (let i = 0; i < pathSegments.length; i += 1) {
            const path = pathSegments[i];

            if (i === 0) {
              const point = Canvas.getNextPoint(current, path.direction, 1);
              pathString += ` L${point.x * GRID_GAP + GRID_DOT_RADIUS} ${point.y * GRID_GAP + GRID_DOT_RADIUS}`;
              current = { ...point };
            }

            const point = Canvas.getNextPoint(
              current,
              path.direction,
              path.length - 2,
            );
            pathString += ` L${point.x * GRID_GAP + GRID_DOT_RADIUS} ${point.y * GRID_GAP + GRID_DOT_RADIUS}`;
            current = { ...point };

            if (i === pathSegments.length - 1) {
              const endPoint = Canvas.getNextPoint(current, path.direction, 1);
              pathString += ` L${endPoint.x * GRID_GAP + GRID_DOT_RADIUS} ${endPoint.y * GRID_GAP + GRID_DOT_RADIUS}`;
              current = { ...endPoint };
            } else {
              const nextPath = pathSegments[i + 1];
              const midPoint = Canvas.getNextPoint(current, path.direction, 1);
              const nextPoint = Canvas.getNextPoint(
                midPoint,
                nextPath.direction,
                1,
              );
              pathString += ` Q ${midPoint.x * GRID_GAP + GRID_DOT_RADIUS} ${midPoint.y * GRID_GAP + GRID_DOT_RADIUS} ${nextPoint.x * GRID_GAP + GRID_DOT_RADIUS} ${nextPoint.y * GRID_GAP + GRID_DOT_RADIUS}`;
              current = { ...nextPoint };
            }
          }

          const strokeColor =
            shape.color ||
            'var(--canvas-line-color, var(--color-on-surface))';

          return {
            type: 'svg-shape',
            content: svg`<g class=${classMap({ clickable: !!shape.clickable })}>
              <path
                class=${classMap({
                  ...Canvas.getStrokeVariantClasses(shape.variant),
                })}
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke=${strokeColor}
                marker-end=${shape.showArrow ? 'url(#endarrow)' : ''}
                d=${pathString}
                stroke-dasharray=${shape.variant === 'dashed' || shape.variant === 'animated-dashed' ? '6,6' : nothing}
                fill="none"
              />
              <path
                stroke-width="10"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke="transparent"
                d=${pathString}
                fill="none"
              />
            </g>`
          };
        }
        default:
          return { type: 'unknown', content: nothing };
      }
    });

    return { shapes, computedViewbox };
  }

  private renderBackgroundSvg(computedViewBox: CanvasViewBox, svgViewBox: string) {
    return html`
      <svg
        class="canvas canvas-background"
        height="100%"
        width="100%"
        viewBox=${svgViewBox}
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="canvas-background"
            patternUnits="userSpaceOnUse"
            width=${GRID_GAP}
            height=${GRID_GAP}
          >
            <circle cx="1" cy="1" r=${GRID_DOT_RADIUS} />
          </pattern>
        </defs>

        <rect
          x=${computedViewBox.x * GRID_GAP}
          y=${computedViewBox.y * GRID_GAP}
          width="100%"
          height="100%"
          fill="url(#canvas-background)"
        />
      </svg>
    `;
  }

  private renderShapesSvg(shapes: unknown[], svgViewBox: string) {
    return html`
      <svg
        class="canvas canvas-shapes"
        height="100%"
        width="100%"
        viewBox=${svgViewBox}
      >
        <defs>
          <marker id="endarrow" markerWidth="10" markerHeight="10" refX="5" refY="5" markerUnits="strokeWidth" orient="auto">
            <polyline  points="0 2, 5 5, 0 8"></polyline>
          </marker>
        </defs>

        ${shapes}
      </svg>
    `;
  }

  protected render() {
    let computedViewBox = { width: 0, height: 0, x: 0, y: 0 };

    const { shapes, computedViewbox } = this.computeShapes(computedViewBox);
    computedViewBox = computedViewbox;

    if (this.viewbox) {
      const viewBox = this.viewbox.split(' ');
      computedViewBox = {
        x: parseInt(viewBox[0], 10),
        y: parseInt(viewBox[1], 10),
        width: parseInt(viewBox[2], 10),
        height: parseInt(viewBox[3], 10),
      };
    }

    const unzoomedWidth = computedViewBox.width * GRID_GAP + 2 * GRID_DOT_RADIUS;
    const unzoomedHeight = computedViewBox.height * GRID_GAP + 2 * GRID_DOT_RADIUS;

    const wrapperWidth = unzoomedWidth * this.zoom;
    const wrapperHeight = unzoomedHeight * this.zoom;

    const svgViewBox = `${computedViewBox.x * GRID_GAP} ${computedViewBox.y * GRID_GAP} ${unzoomedWidth} ${unzoomedHeight}`;

    // Separate nodes (HTML) from paths (SVG)
    const svgShapes: unknown[] = [];
    const nodeShapes: unknown[] = [];
    
    shapes.forEach((shape: any) => {
      if (shape && shape.type === 'html-node') {
        nodeShapes.push(shape.content);
      } else if (shape && shape.type === 'svg-shape') {
        svgShapes.push(shape.content);
      }
    });

    return html`
      <div
        class="canvas-wrapper"
        style="width: ${wrapperWidth}px; height: ${wrapperHeight}px;"
      >
        ${this.renderBackgroundSvg(computedViewBox, svgViewBox)}
        ${this.renderShapesSvg(svgShapes, svgViewBox)}
        <div
          class="canvas-nodes"
          style="position: absolute; left: 0; top: 0; width: ${unzoomedWidth}px; height: ${unzoomedHeight}px; transform: scale(${this.zoom});"
        >
          ${nodeShapes}
        </div>
      </div>
    `;
  }
}
