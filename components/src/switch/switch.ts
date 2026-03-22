import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { spread } from '../spread.js';
import styles from './switch.scss';
import BaseInput from '../input/BaseInput.js';

/**
 * @label Switch
 * @tag wc-switch
 * @rawTag switch
 *
 * @summary Captures boolean input with an on/off switch interaction.
 * @overview
 * <p>Toggles are used to enable or disable a single option. They provide immediate feedback about whether an option is active or inactive.</p>
 *
 * @cssprop --switch-track-color: Color of the switch track when checked.
 * @cssprop --switch-track-off-color: Color of the switch track when unchecked.
 * @cssprop --switch-width: Width of the switch track.
 * @cssprop --switch-height: Height of the switch track.
 * @cssprop --switch-handle-radius: Size of the switch handle.
 * @cssprop --switch-handle-color: Color of the switch handle.
 *
 * @fires {CustomEvent} change - Dispatched when the switch value changes.
 * @fires {CustomEvent} blur - Dispatched when the switch loses focus.
 * @fires {CustomEvent} focus - Dispatched when the switch receives focus.
 *
 * @example
 * ```html
 * <wc-switch value="true"></wc-switch>
 * ```
 * @tags input, form
 */
export class Switch extends BaseInput {
  static styles = [styles];

  @property({ type: Boolean })
  value: boolean = false;

  /**
   * The input field name.
   */
  @property({ type: String })
  name: string = '';

  /**
   * The switch label.
   */
  @property({ type: String })
  label: string = '';

  /**
   * If true, the toggle has rounded corners. Defaults to `true`.
   */
  @property({ type: Boolean })
  rounded: boolean = true;

  /**
   * If true, required icon is shown. Defaults to `false`.
   */
  @property({ type: Boolean, reflect: true })
  required: boolean = false;

  /**
   * If true, the toggle is readonly. Defaults to `false`.
   */
  @property({ type: Boolean, reflect: true })
  readonly: boolean = false;

  /**
   * If true, the user cannot interact with the toggle. Defaults to `false`.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  @property({ type: Boolean, reflect: true, attribute: 'with-icon' })
  withIcon: boolean = false;

  /**
   * Configuration object for aria attributes.
   */
  @property({ type: Object })
  configAria: Record<string, string> = {};

  @state()
  private hasFocus = false;

  @state()
  private isActive = false;

  @state()
  private slotHasContent = false;

  @query('.track')
  private trackElement?: HTMLElement;

  @query('.input-native')
  private nativeElement?: HTMLInputElement;

  private tabindex?: string;

  connectedCallback() {
    super.connectedCallback();
    this.handleInitialAttributes();
    window.addEventListener('mouseup', this.windowMouseUp);
    window.addEventListener('keyup', this.windowKeyUp);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mouseup', this.windowMouseUp);
    window.removeEventListener('keyup', this.windowKeyUp);
  }

  firstUpdated() {
    this.slotHasContent = this.hasChildNodes();
  }

  private handleInitialAttributes() {
    if (this.hasAttribute('tabindex')) {
      this.tabindex = this.getAttribute('tabindex') || undefined;
      this.removeAttribute('tabindex');
    }

    Array.from(this.attributes).forEach(attr => {
      if (attr.name.startsWith('aria-')) {
        this.configAria[attr.name] = attr.value;
        this.removeAttribute(attr.name);
      }
    });
  }

  private windowMouseUp = () => {
    if (this.isActive) {
      this.isActive = false;
    }
  };

  private windowKeyUp = (evt: KeyboardEvent) => {
    if (this.isActive && evt.key === ' ') {
      this.isActive = false;
    }
  };

  private mouseDownHandler = () => {
    this.isActive = true;
  };

  private keyDownHandler = (evt: KeyboardEvent) => {
    if (evt.key === ' ') {
      evt.preventDefault();
      this.isActive = true;
      this.clickHandler(evt);
    }
  };

  private clickHandler = (ev: MouseEvent | KeyboardEvent) => {
    if (!this.disabled && !this.readonly) {
      this.value = !this.value;
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { value: this.value, originalEvent: ev },
          bubbles: true,
          composed: true,
        }),
      );
      this.trackElement?.focus();
    }
  };

  private blurHandler = (ev: FocusEvent) => {
    this.hasFocus = false;
    this.dispatchEvent(
      new CustomEvent('blur', {
        detail: ev,
        bubbles: true,
        composed: true,
      }),
    );
  };

  private focusHandler = (ev: FocusEvent) => {
    this.hasFocus = true;
    this.dispatchEvent(
      new CustomEvent('focus', {
        detail: ev,
        bubbles: true,
        composed: true,
      }),
    );
  };

  private handleKeyUp = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') {
      this.clickHandler(evt);
    }
  };

  /**
   * Sets focus on the toggle.
   */
  focus() {
    this.trackElement?.focus();
  }

  /**
   * Removes focus from the toggle.
   */
  blur() {
    this.trackElement?.blur();
  }

  __renderIcon() {
    if (this.withIcon) {
      if (this.value)
        return html`<base-icon name="check" class="icon"></base-icon>`;
      return html`<base-icon name="close" class="icon"></base-icon>`;
    }
    return nothing;
  }

  render() {
    const cssClasses = {
      switch: true,
      'state-checked': this.value,
      'has-focus': this.hasFocus,
      active: this.isActive,
      disabled: this.disabled,
      readonly: this.readonly,
      required: this.required,
      rounded: this.rounded,
      'has-content': this.slotHasContent,
    };

    return html`
      <label class=${classMap(cssClasses)}>
        <div
          class="track"
          tabindex=${this.tabindex || 0}
          @keyup=${this.handleKeyUp}
          @mousedown=${this.mouseDownHandler}
          @keydown=${this.keyDownHandler}
          @blur=${this.blurHandler}
          @focus=${this.focusHandler}
          role="checkbox"
          aria-disabled=${this.disabled}
          aria-required=${this.required}
          aria-checked=${this.value}
          ${spread(this.configAria)}
        >
          <div class="handle">${this.__renderIcon()}</div>
        </div>

        <input
          type="checkbox"
          class="input-native"
          name=${this.name}
          .checked=${this.value}
          aria-hidden="true"
          ?required=${this.required}
          tabindex="-1"
          @click=${this.clickHandler}
        />

        ${this.label
          ? html`<div class="label">${this.label}</div>`
          : html`<div class="slot-container"><slot></slot></div>`}
      </label>
    `;
  }
}
