import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { e } from './class-map-NDIkZErE.js';
import { ListItem } from './list-item.js';
import { R as RovingFocusController } from './roving-focus-controller-fm95JkZJ.js';
import './directive-ZPhl09Yt.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './is-link-Dk2OV3PM.js';
import './throttle-SQ9t-HL7.js';
import './base-button-BJMGMcMv.js';
import './warn-once-BNxX1Y98.js';
import './hyperlink-DycWPKwU.js';
import './delegate-Bw2wdPFP.js';
import './element-internals-QME0yEz4.js';

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

.list {
  display: flex;
  flex-direction: column;
}

:host([variant=segmented]) {
  --list-item-container-color: var(--color-surface-container);
  --list-item-container-shape: var(--shape-corner-medium);
  --list-item-outer-container-shape: var(--shape-corner-large);
}
:host([variant=segmented]) .list {
  gap: 0.125rem;
}`;

var List_1;
/**
 * @label List
 * @tag wc-list
 * @rawTag list
 *
 * @summary A vertical list of rows, such as contacts or settings; rows that act are reached with the arrow keys.
 * @overview
 * <p>A list shows rows of content. Rows that act (<code>actionable</code> or with an
 * <code>href</code>) form one tab stop: the Up and Down arrow keys move between them, Home and
 * End jump to the first and last, and disabled rows are skipped.</p>
 * <p>For a navigation list, mark the row of the page the person is on with
 * <code>current</code> (<code>aria-current</code>). To let the person choose items, use
 * <code>wc-listbox</code>.</p>
 *
 * @example
 * ```html
 * <wc-list>
 *   <wc-list-item href="/inbox" current>
 *     <wc-icon slot="start" name="inbox"></wc-icon>
 *     Inbox
 *     <span slot="trailing-supporting-text">24</span>
 *   </wc-list-item>
 *   <wc-list-item actionable>
 *     <wc-avatar slot="start" name="Ada Lovelace"></wc-avatar>
 *     Ada Lovelace
 *     <span slot="supporting-text">Software Engineer</span>
 *     <wc-icon slot="end" name="chevron_right"></wc-icon>
 *   </wc-list-item>
 * </wc-list>
 * ```
 * @tags display
 */
let List = List_1 = class List extends i$1 {
    constructor() {
        // ── Static
        super(...arguments);
        // ── Properties
        /**
         * `standard` rows sit on the surface; `segmented` rows each get a
         * surface-container fill, a small gap and rounded outer corners.
         */
        this.variant = 'standard';
        // ── Private fields
        /** One tab stop across the actionable rows, moved with Up/Down, Home and End. */
        this.roving = new RovingFocusController(this, {
            items: () => this.items,
            orientation: () => 'vertical',
            isFocusable: item => {
                const row = item;
                return row.isClickable() && !row.disabled && !row.hidden;
            },
        });
        // ── Private
        /** Only keys from this list's own rows, not from a nested list. */
        this.__handleKeyDown = (event) => {
            const owner = event.composedPath().find(target => target instanceof List_1);
            if (owner !== this)
                return;
            this.roving.handleKeyDown(event);
        };
        this.__handleSlotChange = () => {
            this.__syncPositions();
            this.roving.sync();
        };
    }
    // ── Lifecycle
    connectedCallback() {
        super.connectedCallback();
        this.setAttribute('role', 'list');
    }
    // ── Public
    focus(options) {
        this.roving.sync();
        this.roving.activeItem?.focus(options);
    }
    get items() {
        const slot = this.shadowRoot?.querySelector('slot');
        const elements = slot?.assignedElements({ flatten: true }) ?? [];
        return elements.filter(el => el instanceof ListItem);
    }
    /** Marks each item first / middle / last / only, for the segmented shape. */
    __syncPositions() {
        const { items } = this;
        const last = items.length - 1;
        items.forEach((item, index) => {
            let position = 'middle';
            if (last === 0)
                position = 'only';
            else if (index === 0)
                position = 'first';
            else if (index === last)
                position = 'last';
            // eslint-disable-next-line no-param-reassign
            item.listPosition = position;
        });
    }
    // ── Render
    render() {
        const cssClasses = {
            list: true,
            [`variant-${this.variant}`]: true,
        };
        return b `
      <div
        class=${e(cssClasses)}
        @keydown=${this.__handleKeyDown}
        @focusin=${this.roving.handleFocusIn}
      >
        <slot @slotchange=${this.__handleSlotChange}></slot>
      </div>
    `;
    }
};
List.styles = [css_248z];
List.Item = ListItem;
__decorate([
    n({ type: String, reflect: true })
], List.prototype, "variant", void 0);
List = List_1 = __decorate([
    IndividualComponent
], List);

export { List };
//# sourceMappingURL=list.js.map
