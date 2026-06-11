import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, w, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  display: block;
  --canvas-background: var(--color-surface-container-low);
  --canvas-dot-color: var(--color-outline-variant);
  --canvas-line-color: var(--color-on-surface);
  --canvas-hover-color: var(--color-primary);
  --canvas-arrow-color: var(--color-on-surface);
}

.canvas-wrapper {
  position: relative;
  background: var(--canvas-background);
}

.canvas {
  display: block;
}

.canvas-background,
.canvas-shapes {
  position: absolute;
  inset: 0;
}

.canvas-nodes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transform-origin: top left;
}
.canvas-nodes > * {
  pointer-events: auto;
}

.canvas-background {
  pointer-events: none;
}

#canvas-background circle {
  fill: var(--canvas-dot-color);
}

#endarrow polyline {
  fill: none;
  stroke: context-stroke;
  vector-effect: non-scaling-stroke;
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.line.variant-dashed {
  stroke-dasharray: 6 6;
}
.line.variant-animated-dashed {
  animation: canvas-dash-flow 600ms linear infinite;
}

.clickable {
  cursor: pointer;
}
.clickable:hover .line {
  stroke: var(--canvas-hover-color);
}

.line.clickable:hover {
  stroke: var(--canvas-hover-color);
}

@keyframes canvas-dash-flow {
  to {
    stroke-dashoffset: -12;
  }
}`;

var Canvas_1;
const GRID_GAP = 10;
const GRID_DOT_RADIUS = 1;
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
let Canvas = Canvas_1 = class Canvas extends i$1 {
    constructor() {
        super(...arguments);
        this.data = [];
        this.padding = 1;
        this.zoom = 1;
    }
    static getNextPoint(point, direction, length) {
        if (direction === 'down')
            return { x: point.x, y: point.y + length };
        if (direction === 'up')
            return { x: point.x, y: point.y - length };
        if (direction === 'left')
            return { x: point.x - length, y: point.y };
        if (direction === 'right')
            return { x: point.x + length, y: point.y };
        return { x: point.x, y: point.y };
    }
    static updateExtents(extents, x, y) {
        if (x < extents.minX)
            extents.minX = x;
        if (x > extents.maxX)
            extents.maxX = x;
        if (y < extents.minY)
            extents.minY = y;
        if (y > extents.maxY)
            extents.maxY = y;
    }
    static getStrokeVariantClasses(variant) {
        return {
            line: true,
            'variant-dashed': variant === 'dashed' || variant === 'animated-dashed',
            'variant-animated-dashed': variant === 'animated-dashed',
        };
    }
    computeShapes(initialBounds) {
        const extents = {
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
                    Canvas_1.updateExtents(extents, x, y);
                    Canvas_1.updateExtents(extents, x + width, y + height);
                    break;
                }
                case 'line': {
                    const start = shape.start || { x: 0, y: 0 };
                    const end = shape.end || { x: 0, y: 0 };
                    Canvas_1.updateExtents(extents, start.x, start.y);
                    Canvas_1.updateExtents(extents, end.x, end.y);
                    break;
                }
                case 'connector': {
                    const start = shape.start || { x: 0, y: 0 };
                    let current = { ...start };
                    Canvas_1.updateExtents(extents, current.x, current.y);
                    const pathSegments = shape.path || [];
                    for (let i = 0; i < pathSegments.length; i += 1) {
                        const path = pathSegments[i];
                        if (i === 0) {
                            const point = Canvas_1.getNextPoint(current, path.direction, 1);
                            current = { ...point };
                            Canvas_1.updateExtents(extents, current.x, current.y);
                        }
                        const point = Canvas_1.getNextPoint(current, path.direction, path.length - 2);
                        current = { ...point };
                        Canvas_1.updateExtents(extents, current.x, current.y);
                        if (i === pathSegments.length - 1) {
                            const endPoint = Canvas_1.getNextPoint(current, path.direction, 1);
                            current = { ...endPoint };
                            Canvas_1.updateExtents(extents, current.x, current.y);
                        }
                        else {
                            const nextPath = pathSegments[i + 1];
                            const midPoint = Canvas_1.getNextPoint(current, path.direction, 1);
                            Canvas_1.updateExtents(extents, midPoint.x, midPoint.y);
                            const nextPoint = Canvas_1.getNextPoint(midPoint, nextPath.direction, 1);
                            current = { ...nextPoint };
                            Canvas_1.updateExtents(extents, current.x, current.y);
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
                        content: b `<div
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
                    const strokeColor = shape.color ||
                        'var(--canvas-line-color, var(--color-on-surface))';
                    return {
                        type: 'svg-shape',
                        content: w `<path
              class=${e({
                            ...Canvas_1.getStrokeVariantClasses(shape.variant),
                            clickable: !!shape.clickable,
                        })}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke=${strokeColor}
              marker-end=${shape.showArrow ? 'url(#endarrow)' : ''}
              d=${pathString}
              stroke-dasharray=${shape.variant === 'dashed' || shape.variant === 'animated-dashed' ? '6,6' : A}
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
                            const point = Canvas_1.getNextPoint(current, path.direction, 1);
                            pathString += ` L${point.x * GRID_GAP + GRID_DOT_RADIUS} ${point.y * GRID_GAP + GRID_DOT_RADIUS}`;
                            current = { ...point };
                        }
                        const point = Canvas_1.getNextPoint(current, path.direction, path.length - 2);
                        pathString += ` L${point.x * GRID_GAP + GRID_DOT_RADIUS} ${point.y * GRID_GAP + GRID_DOT_RADIUS}`;
                        current = { ...point };
                        if (i === pathSegments.length - 1) {
                            const endPoint = Canvas_1.getNextPoint(current, path.direction, 1);
                            pathString += ` L${endPoint.x * GRID_GAP + GRID_DOT_RADIUS} ${endPoint.y * GRID_GAP + GRID_DOT_RADIUS}`;
                            current = { ...endPoint };
                        }
                        else {
                            const nextPath = pathSegments[i + 1];
                            const midPoint = Canvas_1.getNextPoint(current, path.direction, 1);
                            const nextPoint = Canvas_1.getNextPoint(midPoint, nextPath.direction, 1);
                            pathString += ` Q ${midPoint.x * GRID_GAP + GRID_DOT_RADIUS} ${midPoint.y * GRID_GAP + GRID_DOT_RADIUS} ${nextPoint.x * GRID_GAP + GRID_DOT_RADIUS} ${nextPoint.y * GRID_GAP + GRID_DOT_RADIUS}`;
                            current = { ...nextPoint };
                        }
                    }
                    const strokeColor = shape.color ||
                        'var(--canvas-line-color, var(--color-on-surface))';
                    return {
                        type: 'svg-shape',
                        content: w `<g class=${e({ clickable: !!shape.clickable })}>
              <path
                class=${e({
                            ...Canvas_1.getStrokeVariantClasses(shape.variant),
                        })}
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke=${strokeColor}
                marker-end=${shape.showArrow ? 'url(#endarrow)' : ''}
                d=${pathString}
                stroke-dasharray=${shape.variant === 'dashed' || shape.variant === 'animated-dashed' ? '6,6' : A}
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
                    return { type: 'unknown', content: A };
            }
        });
        return { shapes, computedViewbox };
    }
    renderBackgroundSvg(computedViewBox, svgViewBox) {
        return b `
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
    renderShapesSvg(shapes, svgViewBox) {
        return b `
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
    render() {
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
        const svgShapes = [];
        const nodeShapes = [];
        shapes.forEach((shape) => {
            if (shape && shape.type === 'html-node') {
                nodeShapes.push(shape.content);
            }
            else if (shape && shape.type === 'svg-shape') {
                svgShapes.push(shape.content);
            }
        });
        return b `
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
};
Canvas.styles = [css_248z];
__decorate([
    n({ type: Array })
], Canvas.prototype, "data", void 0);
__decorate([
    n({ type: Number, reflect: true })
], Canvas.prototype, "padding", void 0);
__decorate([
    n({ type: Number, reflect: true })
], Canvas.prototype, "zoom", void 0);
__decorate([
    n({ type: String })
], Canvas.prototype, "viewbox", void 0);
Canvas = Canvas_1 = __decorate([
    IndividualComponent
], Canvas);

export { Canvas };
//# sourceMappingURL=flow-canvas.js.map
