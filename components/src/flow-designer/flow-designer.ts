import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './flow-designer.scss';
import type { CanvasShape } from '../canvas/canvas.js';

export interface FlowActivity {
  name: string;
  title: string;
  description?: string;
  icon?: string;
  type?: string;
}

/**
 * @label Flow Designer
 * @tag wc-flow-designer
 * @rawTag flow-designer
 * @summary A Material 3 inspired flow diagram designer for creating and editing workflow activities with drag-to-scroll canvas interaction.
 *
 * @cssprop --flow-designer-height - Height of the flow designer container. Defaults to 400px.
 * @cssprop --flow-designer-border-color - Border color of the flow designer. Defaults to outline-variant.
 * @cssprop --flow-designer-background - Background color of the designer. Defaults to surface.
 * @cssprop --flow-designer-border-radius - Corner radius. Defaults to medium shape.
 * @cssprop --flow-designer-action-bar-bg - Background color of the action bar. Defaults to surface-container.
 *
 * @example
 * ```html
 * <wc-flow-designer id="editor"></wc-flow-designer>
 * <script>
 *   document.querySelector('#editor').data = [
 *     { name: 'step1', title: 'First Step', type: 'activity' },
 *   ];
 * </script>
 * ```
 */
@IndividualComponent
export class FlowDesigner extends LitElement {
  static styles = [styles];

  /**
   * The grid block size in pixels.
   */
  @property({ type: Number, attribute: 'block-size' })
  blockSize: number = 16;

  /**
   * Array of activity data objects to render in the flow.
   */
  @property({ type: Array })
  data: FlowActivity[] = [];

  /**
   * Whether the flow designer is disabled.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  @state()
  private _zoom: number = 1;

  @query('.flow-designer')
  private scrollElm?: HTMLElement;

  private isDrag: boolean = false;
  private isMouseInside: boolean = false;
  private _startX: number = 0;
  private _startY: number = 0;
  private _scrollLeftPos: number = 0;
  private _scrollTopPos: number = 0;
  private gap: number = 10;

  private _handleMouseUp = () => {
    this.isDrag = false;
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mouseup', this._handleMouseUp);
  }

  disconnectedCallback() {
    window.removeEventListener('mouseup', this._handleMouseUp);
    super.disconnectedCallback();
  }

  private _handleMouseDown(event: MouseEvent) {
    if (!this.scrollElm || this.disabled) return;
    event.preventDefault();
    this.isDrag = true;
    this.isMouseInside = true;
    this._startX = event.pageX - this.scrollElm.offsetLeft;
    this._startY = event.pageY - this.scrollElm.offsetTop;
    this._scrollLeftPos = this.scrollElm.scrollLeft;
    this._scrollTopPos = this.scrollElm.scrollTop;
  }

  private _handleMouseMove(event: MouseEvent) {
    if (!this.isDrag || !this.isMouseInside || !this.scrollElm) return;
    event.preventDefault();

    const x = event.pageX - this.scrollElm.offsetLeft;
    const walkX = x - this._startX;
    this.scrollElm.scrollLeft = this._scrollLeftPos - walkX;
    if (!this.scrollElm.scrollLeft)
      this._startX = this._startX - (this._scrollLeftPos - walkX);

    const y = event.pageY - this.scrollElm.offsetTop;
    const walkY = y - this._startY;
    this.scrollElm.scrollTop = this._scrollTopPos - walkY;
    if (!this.scrollElm.scrollTop)
      this._startY = this._startY - (this._scrollTopPos - walkY);
  }

  private _handleMouseEnter(event: MouseEvent) {
    event.preventDefault();
    this.isMouseInside = true;
  }

  private _handleMouseLeave(event: MouseEvent) {
    event.preventDefault();
    this.isMouseInside = false;
  }

  private _zoomIn() {
    this._zoom = Math.round((this._zoom + 0.1) * 10) / 10;
  }

  private _zoomOut() {
    this._zoom = Math.round((this._zoom - 0.1) * 10) / 10;
  }

  private _processData() {
    const shapes: CanvasShape[] = [];
    let currentPosition = { x: 5, y: 2 };

    const renderedActivities = this.data.map((activity) => {
      shapes.push({
        type: 'connector',
        start: { x: currentPosition.x + 3, y: currentPosition.y + 7 },
        showArrow: true,
        path: [{ direction: 'down', length: 7 }],
        clickable: true,
      });

      const activityTemplate = html`
        <div
          class="activity"
          style="
            top: ${this._zoom * (currentPosition.y * this.gap + 1)}px;
            left: ${this._zoom * (currentPosition.x * this.gap + 1)}px;
            width: ${23 * this.gap * this._zoom}px;
            height: ${7 * this.gap * this._zoom}px;
          "
        >
          <div
            class="activity-icon"
            style="
              width: ${6 * this.gap * this._zoom}px;
              height: ${6 * this.gap * this._zoom}px;
              padding: ${this.gap * this._zoom}px;
            "
          >
            ${activity.icon
              ? html`<img src=${activity.icon} alt=${activity.title} />`
              : html`<wc-icon name="activity" style="--icon-size: ${4 * this.gap * this._zoom}px;"></wc-icon>`}
          </div>
          <div class="activity-content">
            <h1
              class="activity-title"
              style="font-size: ${this._zoom * 16}px;"
            >
              ${activity.title}
            </h1>
            <p
              class="activity-description"
              style="font-size: ${14 * this._zoom}px;"
            >
              ${activity.description || activity.type || 'activity'}
            </p>
          </div>
        </div>
      `;

      // Advance position for next activity (7 grid units for activity + 7 for connector)
      currentPosition = { x: currentPosition.x, y: currentPosition.y + 14 };

      return activityTemplate;
    });

    return { shapes, activities: renderedActivities };
  }

  protected render() {
    const { activities, shapes } = this._processData();

    const allShapes: CanvasShape[] = [
      ...shapes,
      {
        type: 'connector',
        start: { x: 4, y: 22 },
        showArrow: true,
        path: [{ direction: 'down', length: 7 }],
        clickable: true,
        variant: 'dashed',
      },
    ];

    return html`
      <div class="flow-designer-container">
        <div class="flow-designer">
          <div
            class="canvas-container"
            @mousedown=${this._handleMouseDown}
            @mousemove=${this._handleMouseMove}
            @mouseenter=${this._handleMouseEnter}
            @mouseleave=${this._handleMouseLeave}
          >
            <wc-canvas
              class="flow-lines"
              .padding=${0}
              .zoom=${this._zoom}
              .shapes=${allShapes}
            ></wc-canvas>

            <div class="flow-items">
              <div class="flow-items-container">
                ${activities}

                <div
                  class="new-activity"
                  style="
                    top: ${101 * this._zoom}px;
                    left: ${31 * this._zoom}px;
                    width: ${20 * this._zoom}px;
                    height: ${20 * this._zoom}px;
                  "
                >
                  <wc-icon
                    name="plus"
                    style="--icon-size: ${this._zoom * 20}px;"
                  ></wc-icon>
                </div>
              </div>
            </div>
            <div class="clear"></div>
          </div>
        </div>
        <div class="action-bar">
          <wc-button-group>
            <wc-button
              size="sm"
              variant="outlined"
              @click=${this._zoomIn}
            >
              <wc-icon slot="icon" name="plus"></wc-icon>
            </wc-button>
            <wc-button
              size="sm"
              variant="outlined"
              @click=${this._zoomOut}
            >
              <wc-icon slot="icon" name="dash"></wc-icon>
            </wc-button>
          </wc-button-group>
        </div>
      </div>
    `;
  }
}
