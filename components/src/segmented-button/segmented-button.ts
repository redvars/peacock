import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './segmented-button.scss';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label Segmented Button
 * @tag wc-segmented-button
 * @rawTag segmented-button
 * @summary One option of a segmented button group.
 * @overview
 * <p>Use it inside a <code>wc-segmented-button-group</code>, which manages the selection.</p>
 *
 * @cssprop --segmented-button-height: Height of the segmented button.
 * @cssprop --segmented-button-selected-container-color: Background color when the segment is selected.
 * @cssprop --segmented-button-selected-label-text-color: Text color when the segment is selected.
 * @cssprop --segmented-button-unselected-label-text-color: Text color when the segment is unselected.
 * @cssprop --segmented-button-outline-color: Outline / border color.
 * @cssprop --segmented-button-disabled-opacity: Opacity when the segment is disabled.
 *
 * @fires {CustomEvent<{value: string, selected: boolean, originalEvent: MouseEvent | KeyboardEvent}>} change - Dispatched when the segment is activated; `selected` is the requested state. Inside a `wc-segmented-button-group` the group swallows it and fires its own `change` instead.
 * @fires {CustomEvent<FocusEvent>} focus - Dispatched when the segment gains focus. Bubbles; `detail` is the native focus event.
 * @fires {CustomEvent<FocusEvent>} blur - Dispatched when the segment loses focus. Bubbles; `detail` is the native blur event.
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
@IndividualComponent
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

  /**
   * How the segment is exposed: `radio` (with `aria-checked`) in a single-select group, `button`
   * (with `aria-pressed`) otherwise. Set by `wc-segmented-button-group`.
   */
  @property({ attribute: false })
  groupRole: 'button' | 'radio' = 'button';

  /**
   * Tab index of the segment; a single-select group gives only one segment `0` (roving tabindex).
   * Set by `wc-segmented-button-group`.
   */
  @property({ attribute: false })
  groupTabIndex?: number;

  /** True while the segment has keyboard focus. */
  @state()
  private hasFocus = false;

  /** True while the user is actively pressing the segment. */
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
    const detail = {
      value: this.value || this.textContent?.trim(),
      selected: !this.selected,
      originalEvent: ev,
    };
    this.dispatchEvent(
      new CustomEvent('change', { detail, bubbles: true, composed: true }),
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
        role=${this.groupRole}
        tabindex=${this.disabled ? -1 : (this.groupTabIndex ?? 0)}
        aria-pressed=${this.groupRole === 'button'
          ? String(this.selected)
          : nothing}
        aria-checked=${this.groupRole === 'radio'
          ? String(this.selected)
          : nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
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
