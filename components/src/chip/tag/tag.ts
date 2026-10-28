import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './tag.scss';
import colorStyles from './tag-colors.scss';
import sizeStyles from './tag-sizes.scss';

/**
 * @label Tag
 * @tag wc-tag
 * @rawTag tag
 * @summary Tag component for displaying labels or values with optional dismiss functionality.
 * @tags display
 *
 * @fires {CustomEvent} dismiss - Dispatched when the dismiss button is clicked.
 * @fires {CustomEvent} tag--dismiss - Deprecated alias of `dismiss`, fired alongside it.
 *
 * @example
 * ```html
 * <wc-tag color="red">Tag</wc-tag>
 * ```
 */
@IndividualComponent
export class Tag extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles, colorStyles, sizeStyles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** If true, the tag will have a close icon. */
  @property({ type: Boolean }) dismissible = false;

  @property() variant: 'elevated' | 'filled' | 'tonal' | 'outlined' = 'tonal';

  /** Tag color. */
  @property({ type: String, reflect: true }) color?:
    | 'default'
    | 'blue'
    | 'green'
    | 'red'
    | 'yellow' = 'default';

  /** Tag size. Possible values are `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`. */
  @property({ reflect: true }) size?: 'sm' | 'md' | 'lg' = 'md';

  // ── Private methods ──────────────────────────────────────────────────────

  private _dismissClickHandler(e: MouseEvent) {
    e.stopPropagation();

    this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true }));
    // Deprecated: kept for listeners written before `dismiss`.
    this.dispatchEvent(new CustomEvent('tag--dismiss', { bubbles: true }));
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private __renderDismissButton() {
    if (!this.dismissible) return null;

    return html`
      <button
        class="dismiss-button"
        @click=${this._dismissClickHandler}
        aria-label="Dismiss"
      >
        <wc-ripple class="ripple"></wc-ripple>
        <wc-icon class="dismiss-button-icon" name="close"></wc-icon>
      </button>
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const classes = {
      tag: true,
      dismissible: this.dismissible,
      [`color-${this.color}`]: true,
      [`variant-${this.variant}`]: true,
      [`size-${this.size}`]: true,
    };

    return html`
      <div class="${classMap(classes)}">
        <wc-elevation class="elevation"></wc-elevation>
        <div class="background"></div>
        <div class="outline"></div>

        <div class="tag-content">
          <slot name="icon"></slot>

          <div class="slot-content">
            <slot></slot>
          </div>
          ${this.__renderDismissButton()}
        </div>
      </div>
    `;
  }
}
