import IndividualComponent from '@/IndividualComponent.js';
import { IndicatorNavigationItem } from '@/__internal/indicator-navigation-item.js';

/**
 * @label Navigation Bar Item
 * @tag wc-navigation-bar-item
 * @rawTag navigation-bar-item
 *
 * @summary A destination in a navigation bar.
 * @overview
 * <p>Shows an icon inside the active-indicator pill with a label below. The current item
 * (<code>current</code>) gets the indicator and <code>aria-current="page"</code>. With
 * <code>href</code> it renders a link, otherwise a button.</p>
 *
 * @slot - The label.
 * @slot icon - The icon.
 * @slot active-icon - Icon shown instead of `icon` while the item is current, such as a filled variant.
 * @slot badge - Badge on the icon, such as a count. Overrides the `badge` attribute.
 *
 * @example
 * ```html
 * <wc-navigation-bar-item current>
 *   <wc-icon slot="icon" name="home"></wc-icon>
 *   Home
 * </wc-navigation-bar-item>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class NavigationBarItem extends IndicatorNavigationItem {}
