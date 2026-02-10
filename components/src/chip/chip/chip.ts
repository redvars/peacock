import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './chip.scss';
import colorStyles from './chip-colors.scss';
import sizeStyles from './chip-sizes.scss';

/**
 * @label Chip
 * @tag p-chip
 * @rawTag chip
 * @summary
 *
 * @example
 * ```html
 * <p-tag>Link</p-tag>
 * ```
 * @tags display
 */
export class Chip extends LitElement {
  // Define styles (Lit handles Scoping via Shadow DOM by default)
  // You would typically import your tag.scss.js here or use the css tag
  static styles = [styles, colorStyles, sizeStyles];

  /** If true, the tag will have a close icon. */
  @property({ type: Boolean }) dismissible = false;

  /** Tag color. */
  @property({ type: String, reflect: true }) color?:
    | 'default'
    | 'blue'
    | 'green'
    | 'red'
    | 'yellow' = 'default';

  /** Tag value. */
  @property({ type: String, reflect: true }) value = '';

  /** If true, the tag will be selected. */
  @property({ type: Boolean, reflect: true }) selected = false;

  /** Image source. */
  @property({ type: String }) imageSrc?: string;

  private _dismissClickHandler(e: MouseEvent) {
    e.stopPropagation();
    const detail = { value: this.value || this.textContent?.trim() };

    // Custom Event: tag--dismiss
    this.dispatchEvent(
      new CustomEvent('tag--dismiss', {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _renderCloseButton() {
    if (!this.dismissible) return null;

    return html`
      <button
        class="close-btn"
        @click=${this._dismissClickHandler}
        aria-label="Dismiss"
      >
        <p-icon class="close-btn-icon" name="close"></p-icon>
      </button>
    `;
  }

  private _renderImage() {
    if (this.imageSrc)
      return html`<img
        src=${this.imageSrc}
        class="tag-image"
        alt="Tag Logo"
      />`;
    return nothing;
  }

  render() {
    const classes = {
      chip: true,
      selected: this.selected,
      dismissible: this.dismissible,
      [`color-${this.color}`]: true,
    };

    return html`
      <div class="${classMap(classes)}">
        <p-elevation class="elevation"></p-elevation>
        <div class="background"></div>
        <div class="outline"></div>

        <div class="tag-content">
          <slot name="icon"></slot>
          <slot></slot>
          ${this._renderCloseButton()}
        </div>
      </div>
    `;
  }
}
