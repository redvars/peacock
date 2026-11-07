import { IndicatorNavigationItem } from '@/__internal/indicator-navigation-item.js';
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
export declare class NavigationRailItem extends IndicatorNavigationItem {
    /** Whether the parent rail is in collapsed mode (labels hidden). Set by the rail. */
    collapsed: boolean;
    protected get labelHidden(): boolean;
}
