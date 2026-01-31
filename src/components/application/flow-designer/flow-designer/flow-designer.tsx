import {
  Component,
  Element,
  h,
  Host,
  Listen,
  Prop,
  State,
} from '@stencil/core';
import { loadScript, remToPx } from '../../../../utils/utils';

/**
 * @label Flow Designer
 * @name flow-designer
 * @category Up coming
 * @description Flow Designer is a component that allows users to create and edit flows.
 * @img /assets/img/flow-designer.webp
 */
@Component({
  tag: 'pc-flow-designer',
  styleUrl: 'flow-designer.scss',
  shadow: true,
})
export class FlowDesigner {
  @Element() elm!: HTMLElement;

  @Prop() blockSize: number = 16;

  @Prop() data: any[] = [];

  @Prop() disabled: boolean = false;

  private isDrag: boolean = false;
  private isMouseInside: boolean = false;
  private startX: number;
  private startY: number;
  private scrollLeft: number;
  private scrollTop: number;

  private nativeScrollElm?: HTMLElement;

  @State() activityHeight: number = 10;
  @State() activityWidth: number = 5;
  @State() lines: any[] = [];
  @State() zoom: number = 1;
  private gap: number = 10;

  @Listen('mouseup', { target: 'window', passive: false })
  handleMouseUp() {
    this.isDrag = false;
  }

  async componentWillLoad() {
    if (!window['SVG']) {
      await loadScript(
        `https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.1.2/svg.min.js`,
      );
    }
    this.lines = [
      {
        path: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 2 },
          { x: 14, y: 20 },
        ],
      } /*, {P
      start: { x: 1, y: 1, gap: 8, direction: 'down' },
      end: { x: 15, y: 15, direction: 'top' },
      type: 'shape_connector',
    }*/,
    ];
  }

  componentDidLoad() {
    setTimeout(() => {
      // this.nativeScrollElm.scrollLeft = (this.canvasElm.clientWidth - this.nativeScrollElm.clientWidth) / 2;
    }, 100);
  }

  processData() {
    const shapes = [];
    let currentPosition = { x: 5, y: 2 };
    const activities = this.data.map(activity => {
      shapes.push({
        type: 'connector',
        start: { x: currentPosition.x + 3, y: currentPosition.y + 7 },
        showArrow: true,
        path: [{ direction: 'down', length: 7 }],
        clickable: true,
      });

      return (
        <div
          class="activity"
          style={{
            top: this.zoom * (currentPosition.y * this.gap + 1) + 'px',
            left: this.zoom * (currentPosition.x * this.gap + 1) + 'px',
            width: 23 * this.gap * this.zoom + 'px',
            height: 7 * this.gap * this.zoom + 'px',
          }}
          onDrop={event => {
            event.preventDefault();
            alert('drop');
          }}
          onDragOver={ev => {
            ev.preventDefault();
          }}
        >
          <div
            class="activity-icon"
            style={{
              width: 6 * this.gap * this.zoom + 'px',
              height: 6 * this.gap * this.zoom + 'px',
              padding: this.gap * this.zoom + 'px',
            }}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png" />
          </div>
          <div class="activity-content">
            <h1
              class="activity-title"
              style={{
                'font-size': remToPx(this.zoom) + 'px',
              }}
            >
              {activity.title}
            </h1>
            <p
              class="activity-description"
              style={{
                'font-size': 14 * this.zoom + 'px',
              }}
            >
              trigger
            </p>
          </div>
        </div>
      );
    });
    return {
      shapes,
      activities,
    };
  }

  render() {
    const { activities, shapes } = this.processData();

    return (
      <Host disabled={this.disabled}>
        {/* <img
          src="https://cdn.img42.com/4b6f5e63ac50c95fe147052d8a4db676.jpeg"
          style={{ height: '20px', width: '20px' }}
          draggable={true}
        />*/}
        <div class="flow-designer-container">
          <div class="flow-designer" ref={elm => (this.nativeScrollElm = elm)}>
            <div
              class="canvas-container"
              onMouseDown={event => {
                event.preventDefault();
                this.isDrag = true;
                this.isMouseInside = true;
                this.startX = event.pageX - this.nativeScrollElm.offsetLeft;
                this.startY = event.pageY - this.nativeScrollElm.offsetTop;
                this.scrollLeft = this.nativeScrollElm.scrollLeft;
                this.scrollTop = this.nativeScrollElm.scrollTop;
              }}
              onMouseEnter={event => {
                event.preventDefault();
                this.isMouseInside = true;
              }}
              onMouseLeave={event => {
                event.preventDefault();
                this.isMouseInside = false;
              }}
              onMouseMove={event => {
                event.preventDefault();
                if (!this.isDrag || !this.isMouseInside) return;
                const x = event.pageX - this.nativeScrollElm.offsetLeft;
                const walkX = x - this.startX; //scroll-fast
                this.nativeScrollElm.scrollLeft = this.scrollLeft - walkX;
                if (!this.nativeScrollElm.scrollLeft)
                  this.startX = this.startX - (this.scrollLeft - walkX);
                console.log(this.nativeScrollElm.scrollLeft, this.startX);

                const y = event.pageY - this.nativeScrollElm.offsetTop;
                const walkY = y - this.startY; //scroll-fast
                this.nativeScrollElm.scrollTop = this.scrollTop - walkY;
                if (!this.nativeScrollElm.scrollTop)
                  this.startY = this.startY - (this.scrollTop - walkY);
              }}
            >
              <goat-canvas
                class="flow-lines"
                padding={0}
                zoom={this.zoom}
                shapes={[
                  {
                    type: 'circle',
                    x: 200,
                    y: 200,
                    radius: 0.25,
                    color: 'red',
                  },
                  ...shapes,
                  {
                    type: 'connector',
                    start: { x: 4, y: 22 },
                    showArrow: true,
                    path: [{ direction: 'down', length: 7 }],
                    clickable: true,
                    dashed: true,
                  },
                ]}
              />

              <div class="flow-items">
                <div class="flow-items-container">
                  {activities}

                  <div
                    class="new-activity"
                    style={{
                      top: 101 * this.zoom + 'px',
                      left: 31 * this.zoom + 'px',
                      width: 20 * this.zoom + 'px',
                      height: 20 * this.zoom + 'px',
                    }}
                  >
                    <p-icon
                      name={'plus'}
                      style={{ '--icon-size': this.zoom * 20 + 'px' }}
                    />
                  </div>

                  <pc-tag
                    class="test-activity color-blue"
                    style={{
                      top: 121 * this.zoom + 'px',
                      left: 116 * this.zoom + 'px',
                    }}
                  >
                    Testing
                  </pc-tag>

                  <div
                    class="activity"
                    style={{
                      top: this.zoom * 151 + 'px',
                      left: this.zoom * 11 + 'px',
                      width: 230 * this.zoom + 'px',
                      height: 70 * this.zoom + 'px',
                    }}
                    onDrop={event => {
                      event.preventDefault();
                      alert('drop');
                    }}
                    onDragOver={ev => {
                      ev.preventDefault();
                    }}
                  >
                    <div
                      class="activity-icon"
                      style={{
                        width: 60 * this.zoom + 'px',
                        height: 60 * this.zoom + 'px',
                        padding: 10 * this.zoom + 'px',
                      }}
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Circle-icons-mail.svg/1024px-Circle-icons-mail.svg.png" />
                    </div>
                    <div class="activity-content">
                      <h1
                        class="activity-title"
                        style={{
                          'font-size': remToPx(this.zoom) + 'px',
                        }}
                      >
                        Send status update
                      </h1>
                      <p
                        class="activity-description"
                        style={{
                          'font-size': 14 * this.zoom + 'px',
                        }}
                      >
                        email
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="clear"></div>
            </div>
          </div>
          <div class="action-bar">
            <pc-button-group>
              <pc-button
                size="sm"
                variant="outlined"
                onButton--click={() => {
                  this.zoom = this.zoom + 0.1;
                }}
              >
                <p-icon slot="icon" name="plus"></p-icon>
              </pc-button>
              <pc-button
                size="sm"
                variant="outlined"
                onButton--click={() => {
                  this.zoom = this.zoom - 0.1;
                }}
              >
                <p-icon slot="icon" name="dash"></p-icon>
              </pc-button>
            </pc-button-group>
          </div>
        </div>
      </Host>
    );
  }
}
