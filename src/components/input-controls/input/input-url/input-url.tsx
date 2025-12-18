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
 * @name Input URL
 * @description A specialized input field for URL validation.
 * @category Up coming
 * @tags input, form, url
 * @example <goat-input-url value="https://shivajivarma.com"></goat-input-url>
 */
@Component({
  tag: 'goat-input-url',
  styleUrl: 'input-url.scss',
  shadow: true,
})
export class InputUrl implements ComponentInterface, InputComponentInterface {
  gid: string = getComponentIndex();

  /**
   * The input field name.
   */
  @Prop() name: string = `goat-input-url-${this.gid}`;

  @Prop() skeleton: boolean = false;

  /**
   * The input field placeholder.
   */
  @Prop() placeholder: string;

  @Prop() label: string;

  /**
   * The input field value.
   */
  @Prop({ mutable: true }) value: string;

  /**
   * If true, the user cannot interact with the input. Defaults to `false`.
   */
  @Prop({ reflect: true }) disabled: boolean = false;

  @Prop({ mutable: true, reflect: true }) editing: boolean = false;

  /**
   * Set the amount of time, in milliseconds, to wait to trigger the `valueChange` event after each keystroke.
   */
  @Prop() debounce = 300;

  /**
   * If true, required icon is show. Defaults to `false`.
   */
  @Prop({ reflect: true }) required: boolean = false;

  /**
   * The input field size.
   * Possible values are: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
   */
  @Prop({ reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Emitted when a keyboard input occurred.
   */
  @Event() valueChange: EventEmitter<string>;

  /**
   * Emitted when the URL input is invalid.
   */
  @Event() inputInvalid: EventEmitter<boolean>;

  @Element() elm!: HTMLElement;
  private nativeElement?: HTMLInputElement;

  @State() hasFocus = false;
  @State() isValid = true;
  @State() endSlotHasContent = false;
  @State() startSlotHasContent = false;

  #startEditing() {
    this.editing = true;
    setTimeout(() => this.setFocus(), 80);
  }

  #closeEditing() {
    this.isValid = this.validateUrl(this.value);
    this.inputInvalid.emit(!this.isValid);

    if (this.isValid) this.editing = false;
  }

  /**
   * Validate if the given string is a valid URL
   */
  private validateUrl(url: string): boolean {
    if (!url) return true; // Empty value is considered valid (not invalid)

    try {
      // Use built-in URL constructor for validation
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  }

  private inputHandler = (ev: Event) => {
    const input = ev.target as HTMLInputElement | null;
    const oldValue = this.value;

    if (input) {
      this.value = input.value;
    }

    if (oldValue !== this.value) {
      this.valueChange.emit(this.value);
    }
  };

  private blurHandler = () => {
    this.hasFocus = false;

    // Validate on blur for better user experience
    this.#closeEditing();
  };

  private focusHandler = () => {
    this.hasFocus = true;
  };

  @Watch('debounce')
  protected debounceChanged() {
    this.valueChange = debounceEvent(this.valueChange, this.debounce);
  }

  componentWillLoad() {
    this.debounceChanged();
  }

  componentDidLoad() {
    this.startSlotHasContent =
      this.elm.querySelector('[slot="start"]') !== null;
    this.endSlotHasContent = this.elm.querySelector('[slot="end"]') !== null;
  }

  /**
   * Sets focus on the native `input`. Use this method instead of the global
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
   * Sets blur on the native `input`. Use this method instead of the global
   * `input.blur()`.
   */
  @Method()
  async setBlur() {
    if (this.nativeElement) {
      this.nativeElement.blur();
      this.hasFocus = false;
    }
  }

  /**
   * Get the component's unique ID
   */
  @Method()
  async getComponentId() {
    return this.gid;
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
    return (
      <div class={{ 'url-input': true, 'editing': this.editing }}>
        <div class={{ 'url-container': true }}>
          <goat-link
            href={this.value || 'javascript:void(0)'}
            target={this.value ? '_blank' : '_self'}
          >
            {this.value}
          </goat-link>
          <pc-button
            size="sm"
            variant="text"
            onGoat-button--click={() => {
              this.#startEditing();
            }}
          >
            <pc-icon slot="icon" name="edit" />
          </pc-button>
        </div>

        <div
          class={{
            'input-container': true,
            'disabled': this.disabled,
            'has-focus': this.hasFocus,
            'invalid': !this.isValid,
            'start-slot-has-content': this.startSlotHasContent,
            'end-slot-has-content': this.endSlotHasContent,
          }}
        >
          <input
            class="input input-native"
            name={this.name}
            ref={input => (this.nativeElement = input)}
            type="url"
            placeholder={this.placeholder}
            value={this.value}
            onInput={evt => this.inputHandler(evt)}
            onBlur={this.blurHandler}
            onFocus={this.focusHandler}
            disabled={this.disabled}
          />
        </div>
      </div>
    );
  }

  renderHelper() {
    if (!this.isValid) {
      return <div class="helper invalid">Please enter a valid URL</div>;
    }
    return null;
  }

  render() {
    return (
      <Host has-focus={this.hasFocus} invalid={!this.isValid}>
        <div class="form-control">
          {this.label && this.getLabel()}
          <div class="field">{this.renderInput()}</div>
          {this.renderHelper()}
        </div>
      </Host>
    );
  }
}
