import { html, LitElement, svg } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { spread } from '../spread.js';
import styles from './checkbox.scss';

/**
 * @label Checkbox
 * @tag base-checkbox
 * @rawTag checkbox
 *
 * @summary Captures boolean input with an optional indeterminate mode.
 * @overview
 * <p>Checkboxes allow users to select one or more items from a set. Checkboxes can turn an option on or off.</p>
 * <p>Material Design 3 checkboxes feature a smooth animation and clear visual states for checked, unchecked, and indeterminate.</p>
 *
 * @cssprop --checkbox-size: Size of the checkbox container.
 * @cssprop --checkbox-selected-color: Color of the checkbox when selected.
 * @cssprop --checkbox-unselected-color: Color of the checkbox border when unselected.
 * @cssprop --checkbox-checkmark-color: Color of the checkmark icon.
 * @cssprop --checkbox-state-layer-size: Size of the state layer for touch target.
 *
 * @fires {CustomEvent} change - Dispatched when the checkbox value changes.
 * @fires {CustomEvent} blur - Dispatched when the checkbox loses focus.
 * @fires {CustomEvent} focus - Dispatched when the checkbox receives focus.
 *
 * @example
 * ```html
 * <base-checkbox label="Accept terms"></base-checkbox>
 * ```
 * @tags input, form
 */
export class Checkbox extends LitElement {
  static styles = [styles];

  /**
   * The input field name.
   */
  @property({ type: String })
  name: string = '';

  /**
   * The checkbox label.
   */
  @property({ type: String })
  label: string = '';

  /**
   * The input field value (checked state).
   */
  @property({ type: Boolean, reflect: true })
  value: boolean = false;

  /**
   * If true, displays the checkbox in an indeterminate state.
   */
  @property({ type: Boolean, reflect: true })
  indeterminate: boolean = false;

  /**
   * If true, the checkbox has rounded corners. Defaults to `false`.
   */
  @property({ type: Boolean })
  rounded: boolean = false;

  /**
   * The checkbox size.
   * Possible values are: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
   */
  @property({ type: String })
  size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * If true, required icon is shown. Defaults to `false`.
   */
  @property({ type: Boolean, reflect: true })
  required: boolean = false;

  /**
   * If true, the checkbox is readonly. Defaults to `false`.
   */
  @property({ type: Boolean, reflect: true })
  readonly: boolean = false;

  /**
   * If true, the user cannot interact with the checkbox. Defaults to `false`.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

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

  @query('.container')
  private containerElement?: HTMLElement;

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
      this.indeterminate = false;
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { value: this.value, originalEvent: ev },
          bubbles: true,
          composed: true,
        }),
      );
      this.containerElement?.focus();
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
   * Sets focus on the checkbox.
   */
  focus() {
    this.containerElement?.focus();
  }

  /**
   * Removes focus from the checkbox.
   */
  blur() {
    this.containerElement?.blur();
  }

  render() {
    const cssClasses = {
      checkbox: true,
      'state-checked': this.value,
      'state-indeterminate': !this.value && this.indeterminate,
      [`size-${this.size}`]: true,
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
          class="container"
          tabindex=${this.tabindex || 0}
          @keyup=${this.handleKeyUp}
          @mousedown=${this.mouseDownHandler}
          @keydown=${this.keyDownHandler}
          @blur=${this.blurHandler}
          @focus=${this.focusHandler}
          role="checkbox"
          aria-disabled=${this.disabled}
          aria-required=${this.required}
          aria-checked=${this.value
            ? 'true'
            : this.indeterminate
              ? 'mixed'
              : 'false'}
          ${spread(this.configAria)}
        >
          <div class="state-layer"></div>
          <div class="outline"></div>
          <div class="background"></div>
          <svg class="icon" viewBox="0 0 12 12">
            ${this.value
              ? svg`
                  <path
                    class="checkmark"
                    d="M2 6L5 9L10 2"
                  />
                `
              : this.indeterminate
                ? svg`<rect
                    class="indeterminate"
                    x="2"
                    y="5"
                    width="8"
                    height="2"
                  />`
                : ''}
          </svg>
        </div>

        <input
          type="checkbox"
          class="input-native"
          name=${this.name}
          .checked=${this.value}
          .indeterminate=${this.indeterminate}
          aria-hidden="true"
          ?required=${this.required}
          tabindex="-1"
          @click=${this.clickHandler}
        />

        ${this.label
          ? html`<div class="label">${this.label}</div>`
          : html`<div class="label slot-container"><slot></slot></div>`}
      </label>
    `;
  }
}
