import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './tag.scss';
import colorStyles from './tag-colors.scss';
import sizeStyles from './tag-sizes.scss';

/**
 * @label Tag
 * @tag p-tag
 * @rawTag tag
 * @summary Tag component for displaying labels or values with optional dismiss functionality.
 *
 * @example
 * ```html
 * <p-tag color=red>Tag</p-tag>
 * ```
 * @tags display
 */
export class Tag extends LitElement {
  // Define styles (Lit handles Scoping via Shadow DOM by default)
  // You would typically import your tag.scss.js here or use the css tag
  static styles = [styles, colorStyles, sizeStyles];

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

  @property() size?: 'sm' | 'md' = 'md';

  private _dismissClickHandler(e: MouseEvent) {
    e.stopPropagation();

    // Custom Event: tag--dismiss
    this.dispatchEvent(
      new CustomEvent('tag--dismiss', {
        bubbles: true,
      }),
    );
  }

  private __renderDismissButton() {
    if (!this.dismissible) return null;

    return html`
      <button
        class="dismiss-button"
        @click=${this._dismissClickHandler}
        aria-label="Dismiss"
      >
        <p-ripple class="ripple"></p-ripple>
        <p-icon class="dismiss-button-icon" name="close"></p-icon>
      </button>
    `;
  }

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
        <p-elevation class="elevation"></p-elevation>
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
