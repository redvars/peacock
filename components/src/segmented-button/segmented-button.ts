import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './segmented-button.scss';

/**
 * @label Segmented Button
 * @tag wc-segmented-button
 * @rawTag segmented-button
 * @summary An individual segment within a segmented button group.
 * @overview
 * <p>Segmented buttons help people select options, switch views, or sort elements. They are used within a <code>wc-segmented-button-group</code>.</p>
 *
 * @cssprop --segmented-button-height: Height of the segmented button.
 * @cssprop --segmented-button-selected-container-color: Background color when the segment is selected.
 * @cssprop --segmented-button-selected-label-text-color: Text color when the segment is selected.
 * @cssprop --segmented-button-unselected-label-text-color: Text color when the segment is unselected.
 * @cssprop --segmented-button-outline-color: Outline / border color.
 * @cssprop --segmented-button-disabled-opacity: Opacity when the segment is disabled.
 *
 * @fires {CustomEvent} segmented-button--change - Dispatched when the selected state changes.
 *
 * @example
 * ```html
 * <wc-segmented-button-group>
 *   <wc-segmented-button value="day">Day</wc-segmented-button>
 *   <wc-segmented-button value="week" selected>Week</wc-segmented-button>
 *   <wc-segmented-button value="month">Month</wc-segmented-button>
 * </wc-segmented-button-group>
 * ```
 *
 * @tags controls
 */
export class SegmentedButton extends LitElement {
  static styles = [styles];

  /**
   * The value associated with this segment.
   */
  @property({ type: String, reflect: true })
  value: string = '';

  /**
   * Whether this segment is currently selected.
   */
  @property({ type: Boolean, reflect: true })
  selected: boolean = false;

  /**
   * If true, the user cannot interact with this segment.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /**
   * Optional icon name to display (uses wc-icon).
   */
  @property({ type: String })
  icon?: string;

  @state()
  private hasFocus = false;

  @state()
  private isActive = false;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mouseup', this._windowMouseUp);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mouseup', this._windowMouseUp);
  }

  private _windowMouseUp = () => {
    if (this.isActive) {
      this.isActive = false;
    }
  };

  private _mouseDownHandler = () => {
    this.isActive = true;
  };

  private _keyDownHandler = (evt: KeyboardEvent) => {
    if (evt.key === ' ' || evt.key === 'Enter') {
      evt.preventDefault();
      this.isActive = true;
      this._toggle(evt);
    }
  };

  private _clickHandler = (ev: MouseEvent) => {
    this._toggle(ev);
  };

  private _toggle(ev: MouseEvent | KeyboardEvent) {
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent('segmented-button--change', {
        detail: {
          value: this.value || this.textContent?.trim(),
          selected: !this.selected,
          originalEvent: ev,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _blurHandler = (ev: FocusEvent) => {
    this.hasFocus = false;
    this.dispatchEvent(
      new CustomEvent('blur', { detail: ev, bubbles: true, composed: true }),
    );
  };

  private _focusHandler = (ev: FocusEvent) => {
    this.hasFocus = true;
    this.dispatchEvent(
      new CustomEvent('focus', { detail: ev, bubbles: true, composed: true }),
    );
  };

  /** Sets focus on the segment. */
  focus() {
    this.renderRoot.querySelector<HTMLElement>('.segment')?.focus();
  }

  /** Removes focus from the segment. */
  blur() {
    this.renderRoot.querySelector<HTMLElement>('.segment')?.blur();
  }

  render() {
    const cssClasses = {
      segment: true,
      selected: this.selected,
      disabled: this.disabled,
      'has-focus': this.hasFocus,
      active: this.isActive,
      'has-icon': !!this.icon,
    };

    return html`
      <div
        class=${classMap(cssClasses)}
        role="button"
        tabindex=${this.disabled ? -1 : 0}
        aria-pressed=${this.selected}
        aria-disabled=${this.disabled}
        @click=${this._clickHandler}
        @mousedown=${this._mouseDownHandler}
        @keydown=${this._keyDownHandler}
        @blur=${this._blurHandler}
        @focus=${this._focusHandler}
      >
        <div class="state-layer"></div>
        <div class="content">
          ${this.selected
            ? html`<wc-icon class="check-icon" name="check"></wc-icon>`
            : this.icon
              ? html`<wc-icon class="leading-icon" name=${this.icon}></wc-icon>`
              : nothing}
          <span class="label"><slot></slot></span>
        </div>
        <div class="segment-outline"></div>
      </div>
    `;
  }
}
