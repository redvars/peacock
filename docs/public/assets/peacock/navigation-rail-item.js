import { _ as __decorate, I as IndividualComponent } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { I as IndicatorNavigationItem } from './indicator-navigation-item-rlDwOUwW.js';
import './state-BCeDVCI9.js';
import './observe-slot-change-DPxaZrZF.js';
import './navigation-item-base-YtzLu9UE.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './class-map-NDIkZErE.js';
import './directive-ZPhl09Yt.js';
import './throttle-SQ9t-HL7.js';

/**
 * @label Navigation Rail Item
 * @tag wc-navigation-rail-item
 * @rawTag navigation-rail-item
 *
 * @summary A destination in a navigation rail.
 * @overview
 * <p>Shows an icon inside the active-indicator pill with an optional label below. The current
 * item (<code>current</code>) gets the indicator and <code>aria-current="page"</code>. With
 * <code>href</code> it renders a link, otherwise a button.</p>
 *
 * @slot - The label.
 * @slot icon - The icon.
 * @slot active-icon - Icon shown instead of `icon` while the item is current, such as a filled variant.
 * @slot badge - Badge on the icon, such as a count. Overrides the `badge` attribute.
 *
 * @example
 * ```html
 * <wc-navigation-rail-item current>
 *   <wc-icon slot="icon" name="home"></wc-icon>
 *   Home
 * </wc-navigation-rail-item>
 * ```
 * @tags navigation
 */
let NavigationRailItem = class NavigationRailItem extends IndicatorNavigationItem {
    constructor() {
        // ── Properties ───────────────────────────────────────────────────────────
        super(...arguments);
        /** Whether the parent rail is in collapsed mode (labels hidden). Set by the rail. */
        this.collapsed = false;
    }
    // ── Protected methods ────────────────────────────────────────────────────
    get labelHidden() {
        return this.collapsed;
    }
};
__decorate([
    n({ type: Boolean, reflect: true })
], NavigationRailItem.prototype, "collapsed", void 0);
NavigationRailItem = __decorate([
    IndividualComponent
], NavigationRailItem);

export { NavigationRailItem };
//# sourceMappingURL=navigation-rail-item.js.map
