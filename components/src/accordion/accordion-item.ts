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

  @query('#accordion-heading')
  private readonly accordionHeading!: HTMLElement | null;

  override focus() {
    this.accordionHeading?.focus();
  }

  override blur() {
    this.accordionHeading?.blur();
  }

  private __handleToggle() {
    if (this.disabled) return;

    // 1. Create the "before" event
    const beforeEvent = new CustomEvent('before-toggle', {
      detail: { nextState: !this.open },
      bubbles: true,
      composed: true,
      cancelable: true
    });

    // 2. Dispatch it
    this.dispatchEvent(beforeEvent);

    // 3. Check if the developer called .preventDefault()
    if (beforeEvent.defaultPrevented) {
      console.log('Toggle was canceled by an external listener.');
      return; // Exit early! Do not change the state.
    }

    // 4. If not canceled, proceed as normal
    this.open = !this.open;
    
    this.dispatchEvent(
      new CustomEvent('toggle', {
        detail: { open: this.open },
        bubbles: true,
        composed: true,
      })
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
        id="accordion-heading"
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
