import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import styles from './accordion.scss';
import { AccordionItem } from './accordion-item.js';
import IndividualComponent from '@/IndividualComponent.js';
import { RovingFocusController } from '@/__internal/controllers/roving-focus-controller.js';

/**
 * @label Accordion
 * @tag wc-accordion
 * @rawTag accordion
 * @summary A stack of panels whose headers the person opens to show or hide their content.
 * @overview
 * <p>Every panel header is in the Tab order; the Up and Down arrow keys also move focus between
 * the headers, Home and End jump to the first and last. Disabled panels are skipped. Without
 * <code>multiple</code>, opening a panel (by the person or by setting <code>open</code>) closes
 * the others.</p>
 * <p>Items fire <code>open</code> and <code>close</code>.</p>
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
@IndividualComponent
export class Accordion extends LitElement {
  // ── Static

  static styles = [styles];

  static Item = AccordionItem;

  // ── Properties

  /**
   * Whether multiple panels can be expanded simultaneously.
   * When `false` (default), expanding one panel collapses all others.
   */
  @property({ type: Boolean, reflect: true })
  multiple = false;

  /**
   * Variant for the accordion.
   * `'default'` renders panels with a subtle background on expand and dividers between items.
   * `'flat'` renders panels without borders or background changes — suitable for use inside cards.
   */
  @property({ type: String, reflect: true })
  variant: 'default' | 'flat' = 'default';

  /**
   * When `true`, the toggle icon is placed at the leading start of the header.
   * When `false` (default), the icon is placed at the trailing end.
   */
  @property({ type: Boolean, reflect: true, attribute: 'leading-toggle' })
  leadingToggle = false;

  // ── Queries

  /** The `wc-accordion-item` children slotted into the accordion. */
  @queryAssignedElements({ selector: 'wc-accordion-item' })
  items!: Array<AccordionItem>;

  // ── Private fields

  /** Up/Down, Home and End move focus between the header buttons. */
  private readonly roving = new RovingFocusController(this, {
    items: () =>
      (this.items ?? [])
        .map(item => item.headerButton)
        .filter((button): button is HTMLButtonElement => !!button),
    orientation: () => 'vertical',
    // WAI-ARIA accordion: every header stays in the Tab order; the arrow keys are a shortcut.
    manageTabIndex: () => false,
  });

  // ── Lifecycle

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('open', this.__handleItemOpen);
  }

  disconnectedCallback() {
    this.removeEventListener('open', this.__handleItemOpen);
    super.disconnectedCallback();
  }

  // ── Private

  private __handleItemOpen = (event: Event) => {
    const targetItem = event.target as AccordionItem;

    // Ignore events from nested accordions — only handle direct children
    if (targetItem.parentElement !== this || this.multiple) return;

    for (const item of this.items) {
      if (item !== targetItem && item.open) item.open = false;
    }
  };

  private __handleSlotChange = async () => {
    // The header buttons exist once the items have rendered.
    await Promise.all(this.items.map(item => item.updateComplete));
    this.roving.sync();
  };

  // ── Render

  render() {
    return html`<div
      class="accordion"
      @keydown=${this.roving.handleKeyDown}
      @focusin=${this.roving.handleFocusIn}
    >
      <slot @slotchange=${this.__handleSlotChange}></slot>
    </div>`;
  }
}
