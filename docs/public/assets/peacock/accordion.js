import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { o } from './query-assigned-elements-BJaGSqM0.js';
import { AccordionItem } from './accordion-item.js';
import { R as RovingFocusController } from './roving-focus-controller-fm95JkZJ.js';
import './base-Cl6v8-BZ.js';
import './state-BCeDVCI9.js';
import './query-CHb9Ft_d.js';
import './class-map-NDIkZErE.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
:host {
  display: block;
}

.accordion {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100);
}

:host([variant=flat]) .accordion {
  gap: 0;
}
:host([variant=flat]) slot::slotted(wc-accordion-item) {
  --_accordion-item-border: none;
  --_accordion-item-background: transparent;
}`;

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
let Accordion = class Accordion extends i$1 {
    constructor() {
        // ── Static
        super(...arguments);
        // ── Properties
        /**
         * Whether multiple panels can be expanded simultaneously.
         * When `false` (default), expanding one panel collapses all others.
         */
        this.multiple = false;
        /**
         * Variant for the accordion.
         * `'default'` renders panels with a subtle background on expand and dividers between items.
         * `'flat'` renders panels without borders or background changes — suitable for use inside cards.
         */
        this.variant = 'default';
        /**
         * When `true`, the toggle icon is placed at the leading start of the header.
         * When `false` (default), the icon is placed at the trailing end.
         */
        this.leadingToggle = false;
        // ── Private fields
        /** Up/Down, Home and End move focus between the header buttons. */
        this.roving = new RovingFocusController(this, {
            items: () => (this.items ?? [])
                .map(item => item.headerButton)
                .filter((button) => !!button),
            orientation: () => 'vertical',
            // WAI-ARIA accordion: every header stays in the Tab order; the arrow keys are a shortcut.
            manageTabIndex: () => false,
        });
        // ── Private
        this.__handleItemOpen = (event) => {
            const targetItem = event.target;
            // Ignore events from nested accordions — only handle direct children
            if (targetItem.parentElement !== this || this.multiple)
                return;
            for (const item of this.items) {
                if (item !== targetItem && item.open)
                    item.open = false;
            }
        };
        this.__handleSlotChange = async () => {
            // The header buttons exist once the items have rendered.
            await Promise.all(this.items.map(item => item.updateComplete));
            this.roving.sync();
        };
    }
    // ── Lifecycle
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('open', this.__handleItemOpen);
    }
    disconnectedCallback() {
        this.removeEventListener('open', this.__handleItemOpen);
        super.disconnectedCallback();
    }
    // ── Render
    render() {
        return b `<div
      class="accordion"
      @keydown=${this.roving.handleKeyDown}
      @focusin=${this.roving.handleFocusIn}
    >
      <slot @slotchange=${this.__handleSlotChange}></slot>
    </div>`;
    }
};
Accordion.styles = [css_248z];
Accordion.Item = AccordionItem;
__decorate([
    n({ type: Boolean, reflect: true })
], Accordion.prototype, "multiple", void 0);
__decorate([
    n({ type: String, reflect: true })
], Accordion.prototype, "variant", void 0);
__decorate([
    n({ type: Boolean, reflect: true, attribute: 'leading-toggle' })
], Accordion.prototype, "leadingToggle", void 0);
__decorate([
    o({ selector: 'wc-accordion-item' })
], Accordion.prototype, "items", void 0);
Accordion = __decorate([
    IndividualComponent
], Accordion);

export { Accordion };
//# sourceMappingURL=accordion.js.map
