import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import styles from './accordion.scss';
import { AccordionItem } from '../accordion-item/accordion-item.js';

/**
 * @label Accordion
 * @tag p-accordion
 * @rawTag accordion
 * @summary An accordion is a vertically stacked list of headers that reveal or hide associated sections of content.
 *
 * @example
 * ```html
 * <p-accordion>
 *     <p-accordion-item heading="Accordion">
 *         Content
 *     </p-accordion-item>
 * </p-accordion>
 * ```
 * @tags display
 */
export class Accordion extends LitElement {
  static styles = [styles];

  @property({ type: Boolean, attribute: 'allow-multiple' })
  allowMultiple = false;

  @queryAssignedElements({ selector: 'p-accordion-item' })
  items!: Array<AccordionItem>;

  connectedCallback() {
    super.connectedCallback();
    // @ts-ignore
    // eslint-disable-next-line wc/require-listener-teardown
    this.addEventListener('accordion-item:toggle', this._onItemToggle);
    this.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // @ts-ignore
    // eslint-disable-next-line no-undef
    this.removeEventListener('accordion-item:toggle', this._onItemToggle);
    this.removeEventListener('keydown', this._onKeyDown);
  }

  private _onItemToggle(e: CustomEvent) {
    const targetItem = e.target as AccordionItem;

    // Stop event bubbling if it came from a nested accordion
    // We check if the target item is a direct child of *this* accordion
    if (targetItem.parentElement !== this) return;

    if (!this.allowMultiple && targetItem.open) {
      this.items.forEach(item => {
        if (item !== targetItem && item.open) {
          // eslint-disable-next-line no-param-reassign
          item.open = false;
        }
      });
    }
  }

  private _onKeyDown(e: KeyboardEvent) {
    // 1. Find which item currently has its HEADER focused.
    // We check the shadowRoot of each item to see if the internal <button> is the active element.
    const focusedItemIndex = this.items.findIndex(item => {
      // Access the Shadow DOM of the item
      const root = item.shadowRoot;
      // Check if the focused element inside that shadow DOM is the toggle button
      return root?.activeElement?.classList.contains('accordion-heading');
    });

    // 2. If no header is focused (e.g., focus is on body content or outside), do nothing.
    // This prevents stealing focus when the user is typing in a form inside the accordion.
    if (focusedItemIndex === -1) return;

    let nextIndex = -1;

    // eslint-disable-next-line default-case
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        // Cycle next
        nextIndex = (focusedItemIndex + 1) % this.items.length;
        break;
      case 'ArrowUp':
        e.preventDefault();
        // Cycle previous
        nextIndex =
          (focusedItemIndex - 1 + this.items.length) % this.items.length;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = this.items.length - 1;
        break;
    }

    // 3. Apply Focus
    if (nextIndex !== -1) {
      const itemToFocus = this.items[nextIndex];
      // Select the button inside the Shadow DOM of the target item
      const button = itemToFocus.shadowRoot?.querySelector(
        '.accordion-heading',
      ) as HTMLElement;
      button?.focus();
    }
  }

  render() {
    return html`<div class="accordion"><slot></slot></div>`;
  }

  static Item = AccordionItem;
}
