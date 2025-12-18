import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Method,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import { debounceEvent, getComponentIndex } from '../../../../utils/utils';

/**
 * @name Input
 * @description Enables native inputs to be used within a Form field.
 * @category Form Inputs
 * @tags input, form
 * @example <goat-input placeholder="Enter your name"></goat-input>
 */
@Component({
  tag: 'goat-input',
  styleUrl: './input.scss',
  shadow: true,
})
export class Input implements ComponentInterface, InputComponentInterface {
  gid: string = getComponentIndex();

  /**
   * The input field name.
   */
  @Prop() name: string = `goat-input-${this.gid}`;

  /**
   * The input field placeholder.
   */
  @Prop() placeholder: string;

  @Prop() label: string;

  @Prop() helperText: string;

  @Prop() invalid: boolean = false;

  @Prop() invalidText: string;

  @Prop() warn: boolean = false;

  @Prop() warnText: string;

  @Prop({ reflect: true }) inline: boolean = false;

  @Prop() skeleton: boolean = false;

  /**
   * The input field value.
   */
  @Prop({ mutable: true }) value: string;

  /**
   * The input field size.
   * Possible values are: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
   */
  @Prop({ reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * The type of control to display.
   * Possible values are: `"text"`, `"password"`, `"email"`, `"tel"`. Defaults to `"text"`.
   */
  @Prop() type: 'text' | 'password' | 'email' | 'tel' = 'text';

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @Prop({ reflect: true }) disabled: boolean = false;

  /**
   * If true, the user read the value cannot modify it. Defaults to `false`.
   */
  @Prop({ reflect: true }) readonly: boolean = false;

  /**
   * If true, required icon is show. Defaults to `false`.
   */
  @Prop({ reflect: true }) required: boolean = false;

  /**
   * Set the amount of time, in milliseconds, to wait to trigger the `goatChange` event after each keystroke.
   */
  @Prop() debounce = 300;

  /**
   * Indicates whether the value of the control can be automatically completed by the browser.
   */
  @Prop() autocomplete: 'on' | 'off' = 'off';

  @Prop({ reflect: true, mutable: true }) configAria: any = {};

  /**
   * Emitted when a keyboard input occurred.
   */
  @Event({ eventName: 'goat-input--input' }) goatInput: EventEmitter;

  /**
   * Emitted when the value has changed.
   */
  @Event({ eventName: 'goat-input--change' }) goatChange: EventEmitter;

  /**
   * Emitted when the input loses focus.
   */
  @Event({ eventName: 'goat-input--blur' }) goatBlur: EventEmitter;

  /**
   * Emitted when the input has focus.
   */
  @Event({ eventName: 'goat-input--focus' }) goatFocus: EventEmitter;

  @Element() elm!: HTMLElement;
  private nativeElement?: HTMLInputElement;
  private tabindex?: string | number;

  @State() startSlotHasContent = false;
  @State() endSlotHasContent = false;
  @State() hasFocus = false;
  @State() passwordVisible = false;

  private inputHandler = (ev: Event) => {
    const input = ev.target as HTMLInputElement | null;
    const oldValue = this.value;
    if (input) {
      this.value = input.value;
    }
    this.goatInput.emit(ev as KeyboardEvent);
    if (oldValue !== this.value) {
      this.goatChange.emit(ev as KeyboardEvent);
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

  @Method()
  async getComponentId() {
    return this.gid;
  }

  /**
   * Sets focus on the native `input` in `goat-input`. Use this method instead of the global
   * `input.focus()`.
   */
  @Method()
  async setFocus() {
    if (this.nativeElement) {
      this.nativeElement.focus();
      this.hasFocus = true;
    }
  }

  /**
   * Sets blur on the native `input` in `goat-input`. Use this method instead of the global
   * `input.blur()`.
   */
  @Method()
  async setBlur() {
    if (this.nativeElement) {
      this.nativeElement.blur();
      this.hasFocus = false;
    }
  }

  @Watch('debounce')
  protected debounceChanged() {
    this.goatChange = debounceEvent(this.goatChange, this.debounce);
  }

  componentWillLoad() {
    // If the ion-input has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // goat-input to avoid causing tabbing twice on the same element
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
    this.startSlotHasContent = !!this.elm.querySelector('[slot="start"]');
    this.endSlotHasContent = !!this.elm.querySelector('[slot="end"]');
  }

  connectedCallback() {
    this.debounceChanged();
  }

  private getValue(): string {
    return (this.value || '').toString();
  }

  private hasValue(): boolean {
    return this.getValue().length > 0;
  }

  renderHelper() {
    if (this.invalid)
      return <div class="helper invalid">{this.invalidText}</div>;
    else if (this.warn) return <div class="helper warn">{this.warnText}</div>;
    else if (this.helperText || this.helperText === '')
      return <div class="helper text">{this.helperText}</div>;
  }

  getLabel() {
    if (this.skeleton) return <div class="label skeleton" />;
    else {
      return (
        <label class="label">
          {this.required && <span class="required">*</span>}
          {this.label}
        </label>
      );
    }
  }

  renderInput() {
    const type =
      this.type === 'password' && this.passwordVisible ? 'text' : this.type;

    return (
      <div
        class={{
          'input-container': true,
          'disabled': this.disabled,
          'has-focus': this.hasFocus,
          'start-slot-has-content': this.startSlotHasContent,
          'end-slot-has-content': this.endSlotHasContent,
        }}
      >
        <div class="slot-container start">
          <slot name="start" />
        </div>

        <input
          class="input input-native"
          name={this.name}
          ref={input => (this.nativeElement = input)}
          type={type}
          placeholder={this.placeholder}
          autoComplete={this.autocomplete}
          value={this.value}
          tabIndex={this.tabindex}
          readOnly={this.readonly}
          required={this.required}
          onInput={evt => this.inputHandler(evt)}
          onBlur={this.blurHandler}
          onFocus={this.focusHandler}
          disabled={this.disabled}
          {...this.configAria}
        />

        {this.type === 'password' && (
          <goat-tooltip
            content={this.passwordVisible ? 'Show password' : 'Hide password'}
          >
            <pc-button
              color={'secondary'}
              variant="text"
              size={this.size}
              onGoat-button--click={() => {
                this.passwordVisible = !this.passwordVisible;
              }}
            >
              <pc-icon
                slot="icon"
                name={this.passwordVisible ? 'view--off' : 'view'}
              />
            </pc-button>
          </goat-tooltip>
        )}

        <div class="slot-container end">
          <slot name="end" />
        </div>
      </div>
    );
  }

  render() {
    return (
      <Host
        has-focus={this.hasFocus}
        has-value={this.hasValue()}
        invalid={this.invalid}
        warn={this.warn}
      >
        <div class={{ 'form-control': true, 'inline': this.inline }}>
          {this.label && this.getLabel()}
          <div class="field">
            {this.skeleton ? (
              <div class="input-container-skeleton skeleton" />
            ) : (
              this.renderInput()
            )}
          </div>
          {this.renderHelper()}
        </div>
      </Host>
    );
  }
}
