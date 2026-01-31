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
 * @label Checkbox
 * @name checkbox
 * @description Captures boolean input with an optional indeterminate mode.
 * @category Form Inputs
 * @tags input, form
 * @example <pc-checkbox value='true'>Want ice cream?</pc-checkbox>
 */
@Component({
  tag: 'pc-checkbox',
  styleUrl: 'checkbox.scss',
  shadow: true,
})
export class Checkbox implements ComponentInterface, InputComponentInterface {
  gid: string = getComponentIndex();

  /**
   * The input field name.
   */
  @Prop() name: string = `pc-input-${this.gid}`;

  /**
   * The checkbox label.
   */
  @Prop() label: string;

  @Prop({ reflect: true }) layer?: 'background' | '01' | '02';

  /**
   * The input field value.
   */
  @Prop({ mutable: true }) value: boolean = false;

  @Prop({ mutable: true }) intermediate: boolean = false;

  @Prop() rounded: boolean = false;

  /**
   * The button size.
   * Possible values are: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
   */
  @Prop() size: 'sm' | 'md' | 'lg' = 'md';

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
   * On change of input a CustomEvent 'goat-checkbox--change' will be triggered. Event details contains parent event, oldValue, newValue of input.
   */
  @Event({ eventName: 'goat-checkbox--change' }) goatChange: EventEmitter;

  /**
   * Emitted when the input loses focus.
   */
  @Event({ eventName: 'goat-checkbox--blur' }) goatBlur: EventEmitter;

  /**
   * Emitted when the input has focus.
   */
  @Event({ eventName: 'goat-checkbox--focus' }) goatFocus: EventEmitter;

  @Method()
  async getComponentId() {
    return this.gid;
  }

  /**
   * Sets focus on the native `input` in `pc-input`. Use this method instead of the global
   * `input.focus()`.
   */
  @Method()
  async setFocus() {
    if (this.nativeElement) {
      this.nativeElement.focus();
    }
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
      this.intermediate = false;
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
      <Host has-focus={this.hasFocus} active={this.isActive}>
        <label
          class={{
            'checkbox': true,
            'state-checked': this.value,
            'state-intermediate': !this.value && this.intermediate,
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
            class="box"
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
            <p-icon
              name={
                this.value
                  ? 'check'
                  : this.intermediate
                  ? 'minus'
                  : 'empty-square'
              }
            ></p-icon>
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
                <div class="label slot-container">
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
