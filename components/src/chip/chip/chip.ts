import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { observerSlotChangesWithCallback } from '@/__utils/observe-slot-change.js';
import styles from './chip.scss';
import sizeStyles from './chip-sizes.scss';
import BaseHyperlinkMixin from '@/__mixins/BaseHyperlinkMixin.js';

/**
 * @label Chip
 * @tag wc-chip
 * @rawTag chip
 * @summary Chip component for displaying compact information with optional actions.
 * @tags display
 *
 * @example
 * ```html
 * <wc-chip>Chip content</wc-chip>
 * ```
 */
export class Chip extends BaseHyperlinkMixin(LitElement) {
  // Define styles (Lit handles Scoping via Shadow DOM by default)
  // You would typically import your tag.scss.js here or use the css tag
  static styles = [styles, sizeStyles];

  /** If true, the tag will have a close icon. */
  @property({ type: Boolean }) dismissible = false;

  @property({ type: Boolean, reflect: true })
  actionable: boolean = false;

  /** Tag value. */
  @property({ type: String, reflect: true }) value = '';

  /** If true, the tag will be selected. */
  @property({ type: Boolean, reflect: true }) selected = false;

  /** Image source. */
  @property({ type: String }) imageSrc?: string;

  @state() private _hasIconSlotContent = false;

  override firstUpdated() {
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot[name="icon"]'),
      hasContent => {
        this._hasIconSlotContent = hasContent;
        this.requestUpdate();
      },
    );
  }

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
        <wc-icon class="close-btn-icon" name="close"></wc-icon>
      </button>
    `;
  }

  render() {
    const classes = {
      chip: true,
      selected: this.selected,
      dismissible: this.dismissible,
      'icon-slot-has-content': this._hasIconSlotContent,
    };

    return html`
      <div class="${classMap(classes)}">
        <wc-elevation class="elevation"></wc-elevation>
        <div class="background"></div>
        <div class="outline"></div>cccccdderedrktiikbggjhhtiuvkcjdrjjcvuvbghndl
        

        <div class="tag-content">
          <div class="icon-slot-container">
            ${this.selected ? html`<wc-icon class="selected-icon" name="check"></wc-icon>` : html`<slot name="icon"></slot>`  }
          </div>
          <slot></slot>
          ${this._renderCloseButton()}
        </div>
      </div>
    `;
  }
}
