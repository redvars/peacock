import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import styles from './accordion.scss';
import { AccordionItem } from './accordion-item.js';

/**
 * @label Accordion
 * @tag wc-accordion
 * @rawTag accordion
 * @summary A vertically stacked set of expansion panels. Follows Material Design 3 expansion panel guidelines.
 *
 * @example
 * ```html
 * <wc-accordion>
 *   <wc-accordion-item>
 *     <span slot="heading">Panel 1</span>
 *     <span slot="description">Summary text</span>
 *     Content
 *   </wc-accordion-item>
 *   <wc-accordion-item>
 *     <span slot="heading">Panel 2</span>
 *     Content
 *   </wc-accordion-item>
 * </wc-accordion>
 * ```
 * @tags display
 */
export class Accordion extends LitElement {
  static styles = [styles];

  /**
   * Whether multiple panels can be expanded simultaneously.
   * When `false` (default), expanding one panel collapses all others.
   */
  @property({ type: Boolean, reflect: true })
  multi = false;

  /**
   * Display mode for the accordion.
   * `'default'` renders panels with a subtle background on expand and dividers between items.
   * `'flat'` renders panels without borders or background changes — suitable for use inside cards.
   */
  @property({ type: String, reflect: true, attribute: 'display-mode' })
  displayMode: 'default' | 'flat' = 'default';

  @queryAssignedElements({ selector: 'wc-accordion-item' })
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
    this.removeEventListener('accordion-item:toggle', this._onItemToggle);
    this.removeEventListener('keydown', this._onKeyDown);
  }

  private _onItemToggle(e: CustomEvent) {
    const targetItem = e.target as AccordionItem;

    // Ignore events from nested accordions — only handle direct children
    if (targetItem.parentElement !== this) return;

    if (!this.multi && targetItem.open) {
      this.items.forEach(item => {
        if (item !== targetItem && item.open) {
          // eslint-disable-next-line no-param-reassign
          item.open = false;
        }
      });
    }
  }

  private _onKeyDown(e: KeyboardEvent) {
    const focusedItemIndex = this.items.findIndex(item => {
      const root = item.shadowRoot;
      return root?.activeElement?.classList.contains('header-button');
    });

    if (focusedItemIndex === -1) return;

    let nextIndex = -1;

    // eslint-disable-next-line default-case
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (focusedItemIndex + 1) % this.items.length;
        break;
      case 'ArrowUp':
        e.preventDefault();
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

    if (nextIndex !== -1) {
      const itemToFocus = this.items[nextIndex];
      const button = itemToFocus.shadowRoot?.querySelector(
        '.header-button',
      ) as HTMLElement;
      button?.focus();
    }
  }

  render() {
    return html`<div class="accordion"><slot></slot></div>`;
  }

  static Item = AccordionItem;
}
