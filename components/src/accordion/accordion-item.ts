import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './accordion-item.scss';

/**
 * @label Accordion Item
 * @tag wc-accordion-item
 * @rawTag accordion-item
 * @summary An accordion item is single item in an accordion list. It contains a header and a content section that can be expanded or collapsed by the user.
 *
 * @example
 * ```html
 * <wc-accordion-item>
 * Testing
 * </wc-accordion-item>
 * ```
 * @tags display
 */
export class AccordionItem extends LitElement {
  static styles = [styles];

  #id = crypto.randomUUID();

  /**
   * The menu item value.
   */
  @property({ type: String, reflect: true })
  heading: string = '';

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /**
   * Menu item selection state.
   */
  @property({ type: Boolean, reflect: true })
  open: boolean = false;

  @query('.accordion-heading')
  private readonly buttonElement!: HTMLElement | null;

  override focus() {
    this.buttonElement?.focus();
  }

  override blur() {
    this.buttonElement?.blur();
  }

  private __handleToggle() {
    if (this.disabled) return;
    this.open = !this.open;
    this.dispatchEvent(
      new CustomEvent('accordion-item--toggle', {
        bubbles: true,
        composed: true,
        detail: { open: this.open, id: this.#id },
      }),
    );
  }

  render() {
    return html`<div
      class=${classMap({
        'accordion-item': true,
        open: this.open,
        disabled: this.disabled,
      })}
    >
      <button
        id=${`accordion-heading-${this.#id}`}
        tabindex="0"
        aria-controls=${`accordion-control-${this.#id}`}
        class="accordion-heading"
        aria-disabled=${this.disabled}
        @click=${this.__handleToggle}
        aria-expanded=${this.open}
      >
        <wc-icon class="accordion-icon" name="keyboard_arrow_down"></wc-icon>
        <div part="title" class="accordion-title">
          <slot name="heading">${this.heading}</slot>
        </div>
      </button>
      <div
        class="item-section slot-main"
        id=${`accordion-control-${this.#id}`}
        aria-labelledby=${`accordion-heading-${this.#id}`}
        role="region"
      >
        <slot></slot>
      </div>
    </div>`;
  }
}
