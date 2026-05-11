import { html, LitElement, svg, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './canvas.scss';

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

export interface CanvasCircleShape extends BaseCanvasShape {
  type: 'circle';
  x?: number;
  y?: number;
  radius?: number;
}

export interface CanvasRectShape extends BaseCanvasShape {
  type: 'rect';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
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
  | CanvasCircleShape
  | CanvasRectShape
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
 *
 * @example
 * ```html
 * <wc-canvas id="my-canvas"></wc-canvas>
 * <script>
 *   document.querySelector('#my-canvas').shapes = [
 *     { type: 'circle', x: 0, y: 0, radius: 0.25, color: 'red' },
 *   ];
 * </script>
 * ```
 */
@IndividualComponent
export class Canvas extends LitElement {
  static styles = [styles];

  /**
   * Array of shape objects to render on the canvas.
   */
  @property({ type: Array })
  shapes: CanvasShape[] = [];

  /**
   * Padding around the computed viewbox (in grid units).
   */
  @property({ type: Number, reflect: true })
  padding: number = 1;

  /**
   * Zoom multiplier for the canvas dimensions.
   */
  @property({ type: Number, reflect: true })
  zoom: number = 1;

  /**
   * Optional viewbox override string (e.g. "0 0 100 100").
   */
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

  private static updateExtents(
    extents: CanvasExtents,
    x: number,
    y: number,
  ) {
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
    // Track world-space bounds (grid units) as shapes are processed.
    const extents: CanvasExtents = {
      minX: initialBounds.x,
      minY: initialBounds.y,
      maxX: initialBounds.x + initialBounds.width,
      maxY: initialBounds.y + initialBounds.height,
    };

    const shapes = this.shapes.map(shape => {
      switch (shape.type) {
        case 'circle': {
          const r = shape.radius || 1;
          const cx = shape.x || 0;
          const cy = shape.y || 0;
          Canvas.updateExtents(extents, cx - r, cy - r);
          Canvas.updateExtents(extents, cx + r, cy + r);

          // Convert from grid units to SVG pixels using the fixed gap.
          return svg`<circle
            cx=${cx * GRID_GAP + GRID_DOT_RADIUS}
            cy=${cy * GRID_GAP + GRID_DOT_RADIUS}
            r=${r * GRID_GAP}
            fill=${shape.color || 'var(--canvas-line-color, var(--color-on-surface))'}
          />`;
        }
        case 'rect': {
          const w = shape.width || 1;
          const h = shape.height || 1;
          const rx = shape.x || 0;
          const ry = shape.y || 0;
          Canvas.updateExtents(extents, rx, ry);
          Canvas.updateExtents(extents, rx + w, ry + h);

          return svg`<rect
            x=${rx * GRID_GAP + GRID_DOT_RADIUS}
            y=${ry * GRID_GAP}
            width=${w * GRID_GAP + GRID_DOT_RADIUS}
            height=${h * GRID_GAP + GRID_DOT_RADIUS}
            fill=${shape.color || 'var(--canvas-line-color, var(--color-on-surface))'}
          />`;
        }
        case 'line': {
          const start = shape.start || { x: 0, y: 0 };
          const end = shape.end || { x: 0, y: 0 };
          Canvas.updateExtents(extents, start.x, start.y);
          Canvas.updateExtents(extents, end.x, end.y);
          const pathString = `M${start.x * GRID_GAP + GRID_DOT_RADIUS} ${start.y * GRID_GAP + GRID_DOT_RADIUS} L${end.x * GRID_GAP + GRID_DOT_RADIUS} ${end.y * GRID_GAP + GRID_DOT_RADIUS}`;
          const strokeColor =
            shape.color ||
            'var(--canvas-line-color, var(--color-on-surface))';

          return svg`<path
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
          />`;
        }
        case 'connector': {
          const start = shape.start || { x: 0, y: 0 };
          let pathString = `M${start.x * GRID_GAP + GRID_DOT_RADIUS} ${start.y * GRID_GAP + GRID_DOT_RADIUS}`;
          let current = { ...start };
          Canvas.updateExtents(extents, current.x, current.y);

          const pathSegments = shape.path || [];
          for (let i = 0; i < pathSegments.length; i += 1) {
            const path = pathSegments[i];

            if (i === 0) {
              // Move one unit first so curved corner joins don't overlap start.
              const point = Canvas.getNextPoint(current, path.direction, 1);
              pathString += ` L${point.x * GRID_GAP + GRID_DOT_RADIUS} ${point.y * GRID_GAP + GRID_DOT_RADIUS}`;
              current = { ...point };
              Canvas.updateExtents(extents, current.x, current.y);
            }

            const point = Canvas.getNextPoint(
              current,
              path.direction,
              path.length - 2,
            );
            pathString += ` L${point.x * GRID_GAP + GRID_DOT_RADIUS} ${point.y * GRID_GAP + GRID_DOT_RADIUS}`;
            current = { ...point };
            Canvas.updateExtents(extents, current.x, current.y);

            if (i === pathSegments.length - 1) {
              const endPoint = Canvas.getNextPoint(current, path.direction, 1);
              pathString += ` L${endPoint.x * GRID_GAP + GRID_DOT_RADIUS} ${endPoint.y * GRID_GAP + GRID_DOT_RADIUS}`;
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
              // Use a quadratic segment to round corners between directions.
              pathString += ` Q ${midPoint.x * GRID_GAP + GRID_DOT_RADIUS} ${midPoint.y * GRID_GAP + GRID_DOT_RADIUS} ${nextPoint.x * GRID_GAP + GRID_DOT_RADIUS} ${nextPoint.y * GRID_GAP + GRID_DOT_RADIUS}`;
              current = { ...nextPoint };
              Canvas.updateExtents(extents, current.x, current.y);
            }
          }

          const strokeColor =
            shape.color ||
            'var(--canvas-line-color, var(--color-on-surface))';

          return svg`<g class=${classMap({ clickable: !!shape.clickable })}>
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
          </g>`;
        }
        default:
          return nothing;
      }
    });

    // Expand bounds with padding so shapes are not flush to the edge.
    const computedViewbox = {
      x: extents.minX - this.padding,
      y: extents.minY - this.padding,
      width: Math.max(extents.maxX - extents.minX + this.padding * 2, 0),
      height: Math.max(extents.maxY - extents.minY + this.padding * 2, 0),
    };

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

    // Zoom scales the outer viewport size while the SVG viewBox stays in world units.
    const wrapperWidth =
      (computedViewBox.width * GRID_GAP + 2) * GRID_DOT_RADIUS * this.zoom;
    const wrapperHeight =
      (computedViewBox.height * GRID_GAP + 2) * GRID_DOT_RADIUS * this.zoom;

    // viewBox maps world-space extents into the internal SVG coordinate system.
    const svgViewBox = `${computedViewBox.x * GRID_GAP} ${computedViewBox.y * GRID_GAP} ${computedViewBox.width * GRID_GAP + 2 * GRID_DOT_RADIUS} ${computedViewBox.height * GRID_GAP + 2 * GRID_DOT_RADIUS}`;

    return html`
      <div
        class="canvas-wrapper"
        style="width: ${wrapperWidth}px; height: ${wrapperHeight}px;"
      >
        ${this.renderBackgroundSvg(computedViewBox, svgViewBox)}
        ${this.renderShapesSvg(shapes, svgViewBox)}
      </div>
    `;
  }
}
