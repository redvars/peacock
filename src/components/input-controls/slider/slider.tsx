import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Listen,
  Method,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import {
  debounceEvent,
  DRAG_EVENT_TYPES,
  DRAG_STOP_EVENT_TYPES,
  getComponentIndex,
  isInViewport,
  throttle,
} from '../../../utils/utils';

/**
 * @label Slider
 * @name slider
 * @description Sliders allow users to make selections from a range of values.
 * @category Form Inputs
 * @tags input, form
 * @img /assets/img/slider.webp
 * @imgDark /assets/img/slider-dark.webp
 */
@Component({
  tag: 'pc-slider',
  styleUrl: 'slider.scss',
  shadow: true,
})
export class Slider implements ComponentInterface, InputComponentInterface {
  gid: string = getComponentIndex();

  /**
   * The input field name.
   */
  @Prop() name: string = `pc-input-${this.gid}`;

  @Prop() min: number = 0;

  @Prop() max: number = 100;

  @Prop() showOnlySlider: boolean = false;

  /**
   * function to format the value of the input
   */
  @Prop() formatter: (value: string | number) => string;

  /**
   * The input field value.
   */
  @Prop({ mutable: true }) value?: number = 0;

  @Prop({ mutable: true }) step: number = 1;

  /**
   * If true, required icon is show. Defaults to `false`.
   */
  @Prop({ reflect: true }) required: boolean = false;

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @Prop({ reflect: true }) disabled: boolean = false;

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @Prop({ reflect: true }) readonly: boolean = false;

  @Prop({ reflect: true, mutable: true }) configAria: any = {};

  /**
   * Set the amount of time, in milliseconds, to wait to trigger the `goatChange` event after each keystroke.
   */
  @Prop() debounce = 300;

  /**
   * Emitted when the value has changed.
   */
  @Event({ eventName: 'goat-slider--change' }) goatChange: EventEmitter;

  /**
   * Emitted when a keyboard input occurred.
   */
  @Event({ eventName: 'goat-slider--input' }) goatInput: EventEmitter;

  /**
   * Sets focus on the native `input` in `ion-input`. Use this method instead of the global
   * `input.focus()`.
   */
  @Method()
  async setFocus(): Promise<void> {
    this.displayElement.focus();
  }

  /**
   * Sets blur on the native `input` in `pc-input`. Use this method instead of the global
   * `input.blur()`.
   */
  @Method()
  async setBlur() {
    if (this.nativeElement) {
      this.nativeElement.blur();
    }
  }

  @Watch('debounce')
  protected debounceChanged() {
    this.goatChange = debounceEvent(this.goatChange, this.debounce);
  }

  @Listen('click', { target: 'window' })
  windowClick(evt) {
    const path = evt.path || evt.composedPath();
    for (const elm of path) {
      if (elm == this.elm) return;
    }
  }

  @Method()
  async getComponentId() {
    return this.gid;
  }

  @Element() elm!: HTMLElement;
  private nativeElement?: HTMLInputElement;

  private inputValue: number;
  @State() hasFocus = false;
  @State() needsOnRelease = false;
  private displayElement?: HTMLElement;

  private hasValue(): boolean {
    return (this.value || '').toString().length > 0;
  }

  componentWillLoad() {
    this.elm.getAttributeNames().forEach((name: string) => {
      if (name.includes('aria-')) {
        this.configAria[name] = this.elm.getAttribute(name);
        this.elm.removeAttribute(name);
      }
    });

    this.inputValue = this.value;
  }

  componentDidLoad() {
    this.#computeSliderWidth();

    const resizeObserver = new ResizeObserver(() => {
      this.#computeSliderWidth();
    });

    resizeObserver.observe(this.elm);
  }

  onWheel = event => {
    // Do nothing if component is disabled
    if (this.disabled || this.readonly) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    let delta = 0;
    if (event.wheelDelta) {
      delta = event.wheelDelta / 120;
    } else if (event.detail) {
      delta = -event.detail / 3;
    }

    this.updateValue(parseInt(String(this.value)) + delta * this.step);
  };

  onDragStart = event => {
    // Do nothing if component is disabled
    if (this.disabled || this.readonly) {
      return;
    }

    // Register drag stop handlers
    DRAG_STOP_EVENT_TYPES.forEach(element => {
      this.elm?.ownerDocument.addEventListener(element, this.onDragStop);
    });

    // Register drag handlers
    DRAG_EVENT_TYPES.forEach(element => {
      this.elm?.ownerDocument.addEventListener(element, this.onDrag);
    });

    this.hasFocus = true;

    //@ts-ignore
    this.onDrag(event);
  };

  /**
   * Unregisters "drag" and "drag stop" event handlers and calls sets the flag
   * indicating that the `onRelease` callback should be called.
   */
  onDragStop = event => {
    // Do nothing if component is disabled
    if (this.disabled || this.readonly) {
      return;
    }

    // Remove drag stop handlers
    DRAG_STOP_EVENT_TYPES.forEach(element => {
      this.elm?.ownerDocument.removeEventListener(element, this.onDragStop);
    });

    // Remove drag handlers
    DRAG_EVENT_TYPES.forEach(element => {
      this.elm?.ownerDocument.removeEventListener(element, this.onDrag);
    });

    let clientX: number;
    if (event.type === 'touchend') {
      clientX = event.changedTouches[0].clientX;
    } else {
      clientX = event.clientX;
    }

    this.updateByPosition(clientX);
  };

  openTooltip = (target, open) => {
    window.dispatchEvent(
      new CustomEvent('goat-tooltip-open', {
        detail: {
          target: target,
          open: open,
        },
      }),
    );
  };

  _onDrag = event => {
    // Do nothing if component is disabled
    if (this.disabled || this.readonly) {
      return;
    }

    this.openTooltip(this.thumbElement, true);

    let clientX: number;
    if (event.type === 'touchstart' || event.type === 'touchmove') {
      clientX = event.touches[0].clientX;
    } else {
      clientX = event.clientX;
    }

    this.updateByPosition(clientX);
  };

  updateByPosition(current) {
    const start = this.slideElement.getBoundingClientRect().left;
    const total = this.slideElement.getBoundingClientRect().width;
    const value = parseInt(
      String(((current - start) / total) * (this.max - this.min)),
    );
    this.updateValue(value);
    this.inputValue = this.value;
  }

  updateValue = newValue => {
    const oldValue = this.value;

    this.value = Math.round(newValue / this.step) * this.step;

    if (this.value == null || this.value < this.min) {
      this.value = this.min;
    } else if (this.value > this.max) {
      this.value = this.max;
    }

    this.goatInput.emit({
      value: this.value,
    });

    if (oldValue !== this.value) {
      this.goatChange.emit({
        value: this.value,
      });
    }
  };

  onDrag = throttle(this._onDrag, 1);

  connectedCallback() {
    this.debounceChanged();
  }

  @State()
  slideElementWidth: number | null = null;

  private slideElement?: HTMLElement;
  private thumbElement?: HTMLElement;

  private blurHandler = () => {
    this.hasFocus = false;
    this.openTooltip(this.thumbElement, false);
  };

  private focusHandler = () => {
    this.hasFocus = true;
  };

  private getFormattedValue(value: string | number) {
    if (this.formatter) return this.formatter(value);
    return value;
  }

  #computeSliderWidth() {
    if (this.slideElementWidth == null && !isInViewport(this.elm)) {
      setTimeout(() => this.#computeSliderWidth(), 100);
      return;
    }

    this.slideElementWidth = this.slideElement.getBoundingClientRect().width;
  }

  render() {
    return (
      <Host has-value={this.hasValue()} has-focus={this.hasFocus}>
        <div class="slider-container">
          <div class="slider-wrapper">
            {!this.showOnlySlider && (
              <div class="slider-range-label">
                <span>{this.getFormattedValue(this.min)}</span>
              </div>
            )}
            <div
              class={{ 'slider': true, 'has-focus': this.hasFocus }}
              ref={elm => (this.slideElement = elm)}
              onMouseDown={this.onDragStart}
              onWheel={this.onWheel}
            >
              <div
                class="slider__thumb"
                onBlur={this.blurHandler}
                onTouchStart={this.onDragStart}
                onFocus={this.focusHandler}
                ref={elm => (this.thumbElement = elm)}
                onMouseOver={_e => {
                  this.openTooltip(this.thumbElement, true);
                }}
                onMouseLeave={_e => {
                  if (!this.hasFocus)
                    this.openTooltip(this.thumbElement, false);
                }}
                tooltip-target={`slider-tooltip-${this.gid}`}
                tabIndex={0}
                style={{
                  left: `${
                    (this.value * (this.slideElementWidth | 0)) /
                      (this.max - this.min) -
                    8
                  }px`,
                }}
              ></div>
              <div class="slider__track"></div>
              <div
                class="slider__track--filled"
                style={{
                  width: `${
                    (this.value * (this.slideElementWidth | 0)) /
                    (this.max - this.min)
                  }px`,
                }}
              ></div>
            </div>
            {!this.showOnlySlider && (
              <div class="slider-range-label">
                <span>{this.getFormattedValue(this.max)}</span>
              </div>
            )}
          </div>
          {!this.showOnlySlider ? (
            <div class="slide-input">
              <goat-number
                class="input"
                value={this.inputValue}
                size="sm"
                hide-actions={true}
                onGoat-number--input={e => {
                  e.stopPropagation();
                  this.updateValue(e.target.value);
                }}
                onGoat-input={e => {
                  e.stopPropagation();
                }}
              ></goat-number>
            </div>
          ) : null}
        </div>
        <goat-tooltip
          id={`slider-tooltip-${this.gid}`}
          placements="top,bottom"
          trigger={'manual'}
        >
          {this.getFormattedValue(this.value)}
        </goat-tooltip>
      </Host>
    );
  }
}
