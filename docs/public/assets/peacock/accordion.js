import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { o } from './query-assigned-elements-BJaGSqM0.js';
import { AccordionItem } from './accordion-item.js';
import './base-Cl6v8-BZ.js';
import './state-DkTK9EGF.js';
import './query-CHb9Ft_d.js';
import './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
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
 * @summary A vertically stacked set of expansion panels.
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
        super(...arguments);
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
    }
    connectedCallback() {
        super.connectedCallback();
        // @ts-ignore
        // eslint-disable-next-line wc/require-listener-teardown
        this.addEventListener('accordion-item-toggle', this._onItemToggle);
        this.addEventListener('keydown', this._onKeyDown);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        // @ts-ignore
        this.removeEventListener('accordion-item-toggle', this._onItemToggle);
        this.removeEventListener('keydown', this._onKeyDown);
    }
    _onItemToggle(e) {
        const targetItem = e.target;
        // Ignore events from nested accordions — only handle direct children
        if (targetItem.parentElement !== this)
            return;
        if (!this.multiple && targetItem.open) {
            this.items.forEach(item => {
                if (item !== targetItem && item.open) {
                    // eslint-disable-next-line no-param-reassign
                    item.open = false;
                }
            });
        }
    }
    _onKeyDown(e) {
        const focusedItemIndex = this.items.findIndex(item => {
            const root = item.shadowRoot;
            return root?.activeElement?.classList.contains('header-button');
        });
        if (focusedItemIndex === -1)
            return;
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
            const button = itemToFocus.shadowRoot?.querySelector('.header-button');
            button?.focus();
        }
    }
    render() {
        return b `<div class="accordion"><slot></slot></div>`;
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
