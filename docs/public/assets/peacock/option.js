import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';

/**
 * @label Select Option
 * @tag wc-option
 * @rawTag option
 *
 * @summary A declarative option element for use inside wc-select.
 *
 * @example
 * ```html
 * <wc-select label="Fruit">
 *   <wc-option value="apple">Apple</wc-option>
 *   <wc-option value="banana">Banana</wc-option>
 * </wc-select>
 * ```
 */
let SelectOptionElement = class SelectOptionElement extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * The option's submitted value.
         */
        this.value = '';
        /**
         * Optional Material Symbol icon name shown before the label.
         */
        this.icon = '';
        /**
         * Disables the option so it cannot be selected.
         */
        this.disabled = false;
        // ── Managed by wc-select ──────────────────────────────────────────────────
        /** Reflects whether this option is currently selected. Set by wc-select. */
        this.selected = false;
        /**
         * When true the menu stays open after selection (used for multi-select).
         * Set by wc-select.
         */
        this.keepOpen = false;
        /**
         * When true the option is hidden and excluded from keyboard navigation
         * because it does not match the current typeahead search query.
         * Set by wc-select.
         */
        this.filtered = false;
    }
    /**
     * Returns the inner `wc-menu-item` element.
     * `wc-menu` discovers this via its `items` getter which checks `el.item`
     * as a `MenuItem` proxy, so keyboard navigation and activation work
     * without `wc-option` extending `MenuItem` directly.
     */
    get item() {
        const el = this._menuItemEl;
        // Narrow to MenuItem — the shadow DOM only ever contains a wc-menu-item
        // (a MenuItem subclass), so this cast is safe by construction.
        return el != null ? el : null;
    }
    render() {
        return b `
      <wc-menu-item
        value=${this.value}
        ?disabled=${this.disabled || this.filtered}
        ?selected=${this.selected}
        ?keep-open=${this.keepOpen}
      >
        ${this.icon
            ? b `<wc-icon name=${this.icon} slot="start"></wc-icon>`
            : A}
        <slot>${this.value === '' ? 'None' : ''}</slot>
        ${this.selected && this.keepOpen
            ? b `<wc-icon
              name="check"
              slot="trailing-supporting-text"
            ></wc-icon>`
            : A}
      </wc-menu-item>
    `;
    }
};
SelectOptionElement.styles = [
    i `
      :host {
        display: contents;
      }
      :host([filtered]) {
        display: none;
      }
    `,
];
__decorate([
    n({ type: String, reflect: true })
], SelectOptionElement.prototype, "value", void 0);
__decorate([
    n({ type: String, reflect: true })
], SelectOptionElement.prototype, "icon", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SelectOptionElement.prototype, "disabled", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SelectOptionElement.prototype, "selected", void 0);
__decorate([
    n({ type: Boolean, attribute: 'keep-open' })
], SelectOptionElement.prototype, "keepOpen", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SelectOptionElement.prototype, "filtered", void 0);
__decorate([
    e('wc-menu-item')
], SelectOptionElement.prototype, "_menuItemEl", void 0);
SelectOptionElement = __decorate([
    IndividualComponent
], SelectOptionElement);

export { SelectOptionElement };
//# sourceMappingURL=option.js.map
