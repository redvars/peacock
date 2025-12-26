import { Component, Element, h, Host, Prop } from '@stencil/core';

/**
 * @label Canvas
 * @name canvas
 * @category Up coming
 * @description Canvas for drawing lines and shapes on.
 * @img /assets/img/canvas.webp
 */
@Component({
  tag: 'pc-canvas',
  styleUrl: 'canvas.scss',
  shadow: true,
})
export class Canvas {
  @Prop() shapes: any[] = [];
  @Prop() padding: number = 1;
  @Prop() zoom: number = 1;

  @Prop() viewbox?: string;

  private drawingArea = {
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
  };

  private unitSize: number = 1;
  private dotRadius: number = this.unitSize;
  private gap: number = this.unitSize * 10;

  @Element() elm!: HTMLElement;

  componentDidLoad() {
    setTimeout(() => {
      this.renderCanvas();
    });
  }

  renderCanvas() {}

  updateDrawingArea(position) {
    if (position.x > this.drawingArea.maxX) {
      this.drawingArea.maxX = position.x;
    }
    if (position.y > this.drawingArea.maxY) {
      this.drawingArea.maxY = position.y;
    }
    if (position.x < this.drawingArea.minX) {
      this.drawingArea.minX = position.x;
    }
    if (position.y < this.drawingArea.minY) {
      this.drawingArea.minY = position.y;
    }
  }

  renderShapes(computedViewbox) {
    const dotRadius = this.unitSize;

    const shapes = this.shapes.map(shape => {
      switch (shape.type) {
        case 'circle': {
          if (shape.x + Math.ceil(shape.radius) > computedViewbox.width) {
            computedViewbox.width = shape.x + Math.ceil(shape.radius);
          }
          if (shape.x - Math.ceil(shape.radius) < computedViewbox.x) {
            computedViewbox.x = shape.x - Math.ceil(shape.radius);
          }
          if (shape.y + Math.ceil(shape.radius) > computedViewbox.height) {
            computedViewbox.height = shape.y + Math.ceil(shape.radius);
          }
          if (shape.y - Math.ceil(shape.radius) < computedViewbox.y) {
            computedViewbox.y = shape.y - Math.ceil(shape.radius);
          }
          return (
            <circle
              cx={shape.x * this.gap + dotRadius}
              cy={shape.y * this.gap + dotRadius}
              r={shape.radius * this.gap}
              fill={shape.color || 'black'}
            />
          );
        }
        case 'rect': {
          if (shape.x + Math.ceil(shape.width) > computedViewbox.width) {
            computedViewbox.width = shape.x + Math.ceil(shape.width);
          }
          if (shape.x - Math.ceil(shape.width) < computedViewbox.x) {
            computedViewbox.x = shape.x - Math.ceil(shape.width);
          }
          if (shape.y + Math.ceil(shape.height) > computedViewbox.height) {
            computedViewbox.height = shape.y + Math.ceil(shape.height);
          }
          if (shape.y - Math.ceil(shape.height) < computedViewbox.y) {
            computedViewbox.y = shape.y - Math.ceil(shape.height);
          }
          return (
            <rect
              x={shape.x * this.gap + dotRadius}
              y={shape.y * this.gap}
              width={shape.width * this.gap + dotRadius}
              height={shape.height * this.gap + dotRadius}
              fill={shape.color || 'black'}
            />
          );
        }
        case 'line': {
          const pathString = `M${shape.start.x * this.gap + this.dotRadius} ${
            shape.start.y * this.gap + this.dotRadius
          } L${shape.end.x * this.gap + this.dotRadius} ${
            shape.end.y * this.gap + this.dotRadius
          }`;
          return (
            <path
              class="line clickable"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke="#000"
              d={pathString}
              fill="none"
            />
          );
        }
        case 'connector': {
          let pathString = `M${shape.start.x * this.gap + this.dotRadius} ${
            shape.start.y * this.gap + this.dotRadius
          }`;
          let current = { ...shape.start };
          this.updateComputationArea(current, computedViewbox);

          for (let i = 0; i < shape.path.length; i++) {
            // draw line
            const path = shape.path[i];
            let point: any = {};

            if (i == 0) {
              point = this.getNextPoint(current, path.direction, 1);
              pathString += ` L${point.x * this.gap + this.dotRadius} ${
                point.y * this.gap + this.dotRadius
              }`;
              current = { ...point };
              this.updateComputationArea(current, computedViewbox);
            }

            point = this.getNextPoint(current, path.direction, path.length - 2);
            pathString += ` L${point.x * this.gap + this.dotRadius} ${
              point.y * this.gap + this.dotRadius
            }`;
            current = { ...point };
            this.updateComputationArea(current, computedViewbox);

            if (i == shape.path.length - 1) {
              point = this.getNextPoint(current, path.direction, 1);
              pathString += ` L${point.x * this.gap + this.dotRadius} ${
                point.y * this.gap + this.dotRadius
              }`;
              current = { ...point };
              this.updateComputationArea(current, computedViewbox);
            } else {
              // draw curve
              const nextPath = shape.path[i + 1];
              const midPoint: any = this.getNextPoint(
                current,
                path.direction,
                1,
              );
              const nextPoint = this.getNextPoint(
                midPoint,
                nextPath.direction,
                1,
              );
              pathString += ` Q ${midPoint.x * this.gap + this.dotRadius} ${
                midPoint.y * this.gap + this.dotRadius
              } ${nextPoint.x * this.gap + this.dotRadius} ${
                nextPoint.y * this.gap + this.dotRadius
              }`;
              current = { ...nextPoint };
              this.updateComputationArea(current, computedViewbox);
            }
          }

          //draw curve

          return (
            <g class="clickable">
              <path
                class={{ 'line': true, 'no-color': !shape.color }}
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke={shape.color || '#000'}
                marker-end={shape.showArrow ? 'url(#endarrow)' : ''}
                d={pathString}
                stroke-dasharray={shape.dashed ? '6,6' : null}
                fill="none"
              />
              <path
                stroke-width="10"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke="transparent"
                d={pathString}
                fill="none"
              />
            </g>
          );
        }
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

  updateComputationArea(point, computationArea) {
    if (point.x > computationArea.width) {
      computationArea.width = point.x;
    } else if (point.x < computationArea.x) {
      computationArea.x = point.x;
    }
    if (point.y > computationArea.height) {
      computationArea.height = point.y;
    } else if (point.y < computationArea.y) {
      computationArea.y = point.y;
    }
  }

  render() {
    const dotRadius = this.unitSize;

    let computedViewBox: any = { width: 0, height: 0, x: 0, y: 0 };

    const shapes = this.renderShapes(computedViewBox);

    if (this.viewbox) {
      const viewBox = this.viewbox.split(' ');
      computedViewBox = {
        x: parseInt(viewBox[0], 10),
        y: parseInt(viewBox[1], 10),
        width: parseInt(viewBox[2], 10),
        height: parseInt(viewBox[3], 10),
      };
    }

    return (
      <Host>
        <div
          class="canvas-wrapper"
          style={{
            width:
              (computedViewBox.width * this.gap + 2) * dotRadius * this.zoom +
              'px',
            height:
              (computedViewBox.height * this.gap + 2) * dotRadius * this.zoom +
              'px',
          }}
        >
          <svg
            class="canvas"
            height="100%"
            width="100%"
            viewBox={`${computedViewBox.x * this.gap} ${
              computedViewBox.y * this.gap
            } ${computedViewBox.width * this.gap + 2 * dotRadius} ${
              computedViewBox.height * this.gap + 2 * dotRadius
            }`}
          >
            <defs>
              <pattern
                id="canvas-background"
                patternUnits="userSpaceOnUse"
                width={this.gap}
                height={this.gap}
              >
                <circle cx={1} cy={1} r={this.dotRadius} />
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
              x={computedViewBox.x * this.gap}
              y={computedViewBox.y * this.gap}
              width="100%"
              height="100%"
              fill="url(#canvas-background)"
            />

            {shapes}
          </svg>
        </div>
      </Host>
    );
  }

  private getNextPoint = (point, direction, length) => {
    const nextPoint: any = {};
    if (direction == 'down') {
      nextPoint.x = point.x;
      nextPoint.y = point.y + length;
    } else if (direction == 'up') {
      nextPoint.x = point.x;
      nextPoint.y = point.y - length;
    } else if (direction == 'left') {
      nextPoint.x = point.x - length;
      nextPoint.y = point.y;
    } else if (direction == 'right') {
      nextPoint.x = point.x + length;
      nextPoint.y = point.y;
    }
    return nextPoint;
  };
}
