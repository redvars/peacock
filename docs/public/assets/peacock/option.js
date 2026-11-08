import { _ as __decorate, I as IndividualComponent, b, A } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { MenuItem } from './menu-item.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './if-defined-D9DEJR_6.js';
import './class-map-NDIkZErE.js';
import './directive-ZPhl09Yt.js';
import './base-button-BJMGMcMv.js';
import './throttle-SQ9t-HL7.js';
import './warn-once-BNxX1Y98.js';
import './hyperlink-DycWPKwU.js';
import './element-internals-QME0yEz4.js';
import './is-link-Dk2OV3PM.js';

/**
 * @label Select Option
 * @tag wc-option
 * @rawTag option
 *
 * @summary One option in a select dropdown, with an optional icon before its label.
 * @overview
 * <p>Options are menu items with the <code>option</code> role. The selected option of a single select
 * shows a check mark at the end; in a multi-select every option shows a checkbox at the start.</p>
 *
 * @example
 * ```html
 * <wc-select label="Fruit">
 *   <wc-option value="apple">Apple</wc-option>
 *   <wc-option value="banana">Banana</wc-option>
 * </wc-select>
 * ```
 */
let SelectOptionElement = class SelectOptionElement extends MenuItem {
    constructor() {
        super(...arguments);
        /**
         * Optional Material Symbol icon name shown before the label.
         */
        this.icon = '';
        // ── Managed by wc-select ──────────────────────────────────────────────────
        /** Whether the option belongs to a multi-select, which shows a checkbox. Set by wc-select. */
        this.multiple = false;
        /**
         * When true the option is hidden and skipped by keyboard navigation because it does not
         * match the current typeahead search query. Set by wc-select.
         */
        this.filtered = false;
    }
    willUpdate(changed) {
        super.willUpdate(changed);
        if (changed.has('filtered')) {
            this.hidden = this.filtered;
        }
        if (changed.has('multiple')) {
            this.keepOpen = this.multiple;
        }
    }
    get itemRole() {
        return 'option';
    }
    get itemAriaSelected() {
        return String(this.selected);
    }
    renderStart() {
        const checkbox = this.multiple
            ? b `<wc-icon
          class="indicator checkbox-indicator"
          name=${this.selected ? 'check_box' : 'check_box_outline_blank'}
          aria-hidden="true"
        ></wc-icon>`
            : A;
        const icon = this.icon
            ? b `<wc-icon name=${this.icon} aria-hidden="true"></wc-icon>`
            : A;
        if (checkbox === A && icon === A) {
            return A;
        }
        return b `${checkbox}${icon}`;
    }
    renderEnd() {
        // A multi-select shows its state in the leading checkbox instead of a trailing check.
        return this.multiple ? A : super.renderEnd();
    }
};
__decorate([
    n({ type: String, reflect: true })
], SelectOptionElement.prototype, "icon", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SelectOptionElement.prototype, "multiple", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SelectOptionElement.prototype, "filtered", void 0);
SelectOptionElement = __decorate([
    IndividualComponent
], SelectOptionElement);

export { SelectOptionElement };
//# sourceMappingURL=option.js.map
