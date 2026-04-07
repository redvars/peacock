import { html, LitElement, svg, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './canvas.scss';

export interface CanvasShape {
  type: 'circle' | 'rect' | 'line' | 'connector';
  x?: number;
  y?: number;
  radius?: number;
  width?: number;
  height?: number;
  color?: string;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  path?: { direction: 'up' | 'down' | 'left' | 'right'; length: number }[];
  showArrow?: boolean;
  dashed?: boolean;
  clickable?: boolean;
}

/**
 * @label Canvas
 * @tag wc-canvas
 * @rawTag canvas
 * @summary A Material 3 inspired SVG canvas for drawing shapes, lines, and connectors on a dotted grid.
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

  private unitSize: number = 1;
  private gap: number = this.unitSize * 10;

  private getNextPoint(
    point: { x: number; y: number },
    direction: string,
    length: number,
  ): { x: number; y: number } {
    if (direction === 'down') return { x: point.x, y: point.y + length };
    if (direction === 'up') return { x: point.x, y: point.y - length };
    if (direction === 'left') return { x: point.x - length, y: point.y };
    if (direction === 'right') return { x: point.x + length, y: point.y };
    return { x: point.x, y: point.y };
  }

  private updateComputationArea(
    point: { x: number; y: number },
    area: { x: number; y: number; width: number; height: number },
  ) {
    if (point.x > area.width) area.width = point.x;
    else if (point.x < area.x) area.x = point.x;
    if (point.y > area.height) area.height = point.y;
    else if (point.y < area.y) area.y = point.y;
  }

  private computeShapes(computedViewbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    const dotRadius = this.unitSize;

    const shapes = this.shapes.map((shape, index) => {
      switch (shape.type) {
        case 'circle': {
          const r = shape.radius || 1;
          const cx = shape.x || 0;
          const cy = shape.y || 0;
          if (cx + Math.ceil(r) > computedViewbox.width)
            computedViewbox.width = cx + Math.ceil(r);
          if (cx - Math.ceil(r) < computedViewbox.x)
            computedViewbox.x = cx - Math.ceil(r);
          if (cy + Math.ceil(r) > computedViewbox.height)
            computedViewbox.height = cy + Math.ceil(r);
          if (cy - Math.ceil(r) < computedViewbox.y)
            computedViewbox.y = cy - Math.ceil(r);

          return svg`<circle
            cx=${cx * this.gap + dotRadius}
            cy=${cy * this.gap + dotRadius}
            r=${r * this.gap}
            fill=${shape.color || 'var(--canvas-line-color, var(--color-on-surface))'}
          />`;
        }
        case 'rect': {
          const w = shape.width || 1;
          const h = shape.height || 1;
          const rx = shape.x || 0;
          const ry = shape.y || 0;
          if (rx + Math.ceil(w) > computedViewbox.width)
            computedViewbox.width = rx + Math.ceil(w);
          if (rx - Math.ceil(w) < computedViewbox.x)
            computedViewbox.x = rx - Math.ceil(w);
          if (ry + Math.ceil(h) > computedViewbox.height)
            computedViewbox.height = ry + Math.ceil(h);
          if (ry - Math.ceil(h) < computedViewbox.y)
            computedViewbox.y = ry - Math.ceil(h);

          return svg`<rect
            x=${rx * this.gap + dotRadius}
            y=${ry * this.gap}
            width=${w * this.gap + dotRadius}
            height=${h * this.gap + dotRadius}
            fill=${shape.color || 'var(--canvas-line-color, var(--color-on-surface))'}
          />`;
        }
        case 'line': {
          const start = shape.start || { x: 0, y: 0 };
          const end = shape.end || { x: 0, y: 0 };
          const pathString = `M${start.x * this.gap + dotRadius} ${start.y * this.gap + dotRadius} L${end.x * this.gap + dotRadius} ${end.y * this.gap + dotRadius}`;

          return svg`<path
            class="line clickable"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke="var(--canvas-line-color, var(--color-on-surface))"
            d=${pathString}
            fill="none"
          />`;
        }
        case 'connector': {
          const start = shape.start || { x: 0, y: 0 };
          let pathString = `M${start.x * this.gap + dotRadius} ${start.y * this.gap + dotRadius}`;
          let current = { ...start };
          this.updateComputationArea(current, computedViewbox);

          const pathSegments = shape.path || [];
          for (let i = 0; i < pathSegments.length; i++) {
            const path = pathSegments[i];

            if (i === 0) {
              const point = this.getNextPoint(current, path.direction, 1);
              pathString += ` L${point.x * this.gap + dotRadius} ${point.y * this.gap + dotRadius}`;
              current = { ...point };
              this.updateComputationArea(current, computedViewbox);
            }

            const point = this.getNextPoint(
              current,
              path.direction,
              path.length - 2,
            );
            pathString += ` L${point.x * this.gap + dotRadius} ${point.y * this.gap + dotRadius}`;
            current = { ...point };
            this.updateComputationArea(current, computedViewbox);

            if (i === pathSegments.length - 1) {
              const endPoint = this.getNextPoint(current, path.direction, 1);
              pathString += ` L${endPoint.x * this.gap + dotRadius} ${endPoint.y * this.gap + dotRadius}`;
              current = { ...endPoint };
              this.updateComputationArea(current, computedViewbox);
            } else {
              const nextPath = pathSegments[i + 1];
              const midPoint = this.getNextPoint(current, path.direction, 1);
              const nextPoint = this.getNextPoint(
                midPoint,
                nextPath.direction,
                1,
              );
              pathString += ` Q ${midPoint.x * this.gap + dotRadius} ${midPoint.y * this.gap + dotRadius} ${nextPoint.x * this.gap + dotRadius} ${nextPoint.y * this.gap + dotRadius}`;
              current = { ...nextPoint };
              this.updateComputationArea(current, computedViewbox);
            }
          }

          const strokeColor =
            shape.color ||
            'var(--canvas-line-color, var(--color-on-surface))';

          return svg`<g class=${classMap({ clickable: !!shape.clickable })}>
            <path
              class=${'line' + (!shape.color ? ' no-color' : '')}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke=${strokeColor}
              marker-end=${shape.showArrow ? 'url(#endarrow)' : ''}
              d=${pathString}
              stroke-dasharray=${shape.dashed ? '6,6' : nothing}
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

    // Padding
    computedViewbox.x = computedViewbox.x - this.padding;
    computedViewbox.y = computedViewbox.y - this.padding;
    computedViewbox.width = computedViewbox.width + this.padding;
    computedViewbox.height = computedViewbox.height + this.padding;
    computedViewbox.width = computedViewbox.width - computedViewbox.x;
    computedViewbox.height = computedViewbox.height - computedViewbox.y;

    return shapes;
  }

  protected render() {
    const dotRadius = this.unitSize;
    let computedViewBox = { width: 0, height: 0, x: 0, y: 0 };

    const shapes = this.computeShapes(computedViewBox);

    if (this.viewbox) {
      const viewBox = this.viewbox.split(' ');
      computedViewBox = {
        x: parseInt(viewBox[0], 10),
        y: parseInt(viewBox[1], 10),
        width: parseInt(viewBox[2], 10),
        height: parseInt(viewBox[3], 10),
      };
    }

    const wrapperWidth =
      (computedViewBox.width * this.gap + 2) * dotRadius * this.zoom;
    const wrapperHeight =
      (computedViewBox.height * this.gap + 2) * dotRadius * this.zoom;

    const svgViewBox = `${computedViewBox.x * this.gap} ${computedViewBox.y * this.gap} ${computedViewBox.width * this.gap + 2 * dotRadius} ${computedViewBox.height * this.gap + 2 * dotRadius}`;

    return html`
      <div
        class="canvas-wrapper"
        style="width: ${wrapperWidth}px; height: ${wrapperHeight}px;"
      >
        <svg
          class="canvas"
          height="100%"
          width="100%"
          viewBox=${svgViewBox}
        >
          <defs>
            <pattern
              id="canvas-background"
              patternUnits="userSpaceOnUse"
              width=${this.gap}
              height=${this.gap}
            >
              <circle cx="1" cy="1" r=${dotRadius} />
            </pattern>

            <marker
              id="endarrow"
              markerWidth="15"
              markerHeight="22.5"
              refX="9"
              refY="15"
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <polyline points="0 22.5, 7.5 15, 0 7.5"></polyline>
            </marker>
          </defs>

          <rect
            x=${computedViewBox.x * this.gap}
            y=${computedViewBox.y * this.gap}
            width="100%"
            height="100%"
            fill="url(#canvas-background)"
          />

          ${shapes}
        </svg>
      </div>
    `;
  }
}
