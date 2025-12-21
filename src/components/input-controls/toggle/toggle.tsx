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
} from '@stencil/core';
import { getComponentIndex } from '../../../utils/utils';

/**
 * @label Toggle
 * @name toggle
 * @description Captures boolean input with an optional indeterminate mode.
 * @category Form Inputs
 * @tags input, form
 * @example <pc-toggle value='true'>Want ice cream?</pc-toggle>
 */
@Component({
  tag: 'pc-toggle',
  styleUrl: 'toggle.scss',
  shadow: true,
})
export class Toggle implements ComponentInterface, InputComponentInterface {
  gid: string = getComponentIndex();

  /**
   * The input field name.
   */
  @Prop() name: string = `pc-input-${this.gid}`;

  /**
   * The checkbox label.
   */
  @Prop() label: string;

  /**
   * The input field value.
   */
  @Prop({ mutable: true }) value: boolean = false;

  @Prop() rounded: boolean = true;

  /**
   * The button size.
   * Possible values are: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
   */
  @Prop() size: 'md' | 'lg' = 'md';

  /**
   * If true, required icon is show. Defaults to `false`.
   */
  @Prop({ reflect: true }) required: boolean = false;

  @Prop({ reflect: true }) readonly: boolean = false;

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @Prop({ reflect: true }) disabled: boolean = false;

  @Prop({ reflect: true, mutable: true }) configAria: any = {};

  /**
   * On change of input a CustomEvent 'goat-change' will be triggered. Event details contains parent event, oldValue, newValue of input.
   */
  @Event({ eventName: 'pc-toggle--change' }) goatChange: EventEmitter;

  /**
   * Emitted when the input loses focus.
   */
  @Event({ eventName: 'pc-toggle--blur' }) goatBlur: EventEmitter;

  /**
   * Emitted when the input has focus.
   */
  @Event({ eventName: 'pc-toggle--focus' }) goatFocus: EventEmitter;

  @Method()
  async getComponentId() {
    return this.gid;
  }

  /**
   * Sets focus on the native `input` in `pc-toggle`. Use this method instead of the global
   * `input.focus()`.
   */
  @Method()
  async setFocus() {
    if (this.nativeElement) {
      this.nativeElement.focus();
    }
  }

  /**
   * Sets blur on the native `input` in `pc-toggle`. Use this method instead of the global
   * `input.blur()`.
   */
  @Method()
  async setBlur() {
    if (this.nativeElement) {
      this.nativeElement.blur();
    }
  }

  @Listen('mouseup', { target: 'window' })
  windowMouseUp() {
    if (this.isActive) this.isActive = false;
  }

  @Listen('keyup', { target: 'window' })
  windowKeyUp(evt) {
    if (this.isActive && evt.key == ' ') this.isActive = false;
  }

  private mouseDownHandler = () => {
    this.isActive = true;
  };

  private keyDownHandler = evt => {
    if (evt.key == ' ') {
      evt.preventDefault();
      this.isActive = true;
      this.clickHandler(evt);
    }
  };

  @Element() elm!: HTMLElement;
  private nativeElement?: HTMLInputElement;
  private iconContainer?: HTMLElement;
  private tabindex?: string | number = 1;
  @State() hasFocus = false;
  @State() isActive = false;
  @State() slotHasContent = false;

  private clickHandler = (ev: MouseEvent | KeyboardEvent) => {
    if (!this.disabled && !this.readonly) {
      this.value = !JSON.parse(this.nativeElement.value);
      this.goatChange.emit(ev);
      this.iconContainer.focus();
    }
  };

  private blurHandler = (ev: FocusEvent) => {
    this.hasFocus = false;
    this.goatBlur.emit(ev);
  };

  private focusHandler = (ev: FocusEvent) => {
    this.hasFocus = true;
    this.goatFocus.emit(ev);
  };

  componentWillLoad() {
    // If the ion-input has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // pc-input to avoid causing tabbing twice on the same element
    if (this.elm.hasAttribute('tabindex')) {
      const tabindex = this.elm.getAttribute('tabindex');
      this.tabindex = tabindex !== null ? tabindex : undefined;
      this.elm.removeAttribute('tabindex');
    }
    this.elm.getAttributeNames().forEach((name: string) => {
      if (name.includes('aria-')) {
        this.configAria[name] = this.elm.getAttribute(name);
        this.elm.removeAttribute(name);
      }
    });
    this.slotHasContent = this.elm.hasChildNodes();
  }

  render() {
    return (
      <Host has-focus={this.hasFocus}>
        <label
          class={{
            'toggle': true,
            'state-checked': this.value,
            [`size-${this.size}`]: true,
            'has-focus': this.hasFocus,
            'active': this.isActive,
            'disabled': this.disabled,
            'readonly': this.readonly,
            'required': this.required,
            'rounded': this.rounded,
            'has-content': this.slotHasContent,
          }}
        >
          <div
            class="track"
            tabindex={this.tabindex}
            ref={elm => (this.iconContainer = elm)}
            onKeyUp={evt => {
              if (evt.keyCode === 13) {
                this.clickHandler(evt);
              }
            }}
            onMouseDown={this.mouseDownHandler}
            onKeyDown={this.keyDownHandler}
            onBlur={this.blurHandler}
            onFocus={this.focusHandler}
            role="checkbox"
            aria-disabled={this.disabled + ''}
            aria-required={this.required + ''}
            aria-checked={this.value + ''}
            {...this.configAria}
          >
            <div class="handle" />
          </div>

          <input
            type="checkbox"
            class="input-native"
            name={this.name}
            value={this.value + ''}
            checked={this.value}
            aria-hidden="true"
            required={this.required}
            ref={elm => (this.nativeElement = elm)}
            tabindex="-1"
            onClick={this.clickHandler}
          />

          {(() => {
            if (this.label) {
              return <div class="label">{this.label}</div>;
            } else {
              return (
                <div class="slot-container">
                  <slot />
                </div>
              );
            }
          })()}
        </label>
      </Host>
    );
  }
}
