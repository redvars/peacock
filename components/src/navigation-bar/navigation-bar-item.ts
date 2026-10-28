import IndividualComponent from '@/IndividualComponent.js';
import { NavigationRailItem } from '../navigation-rail/navigation-rail-item.js';

/**
 * @label Navigation Bar Item
 * @tag wc-navigation-bar-item
 * @rawTag navigation-bar-item
 *
 * @summary A destination in a navigation bar.
 * @overview
 * <p>Shows an icon inside the active-indicator pill with a label below. It has the same API as
 * <code>wc-navigation-rail-item</code>: <code>active</code>, <code>disabled</code>, <code>href</code>,
 * <code>value</code>, and the <code>icon</code> and <code>active-icon</code> slots.</p>
 *
 * @example
 * ```html
 * <wc-navigation-bar-item active>
 *   <wc-icon slot="icon" name="home"></wc-icon>
 *   Home
 * </wc-navigation-bar-item>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class NavigationBarItem extends NavigationRailItem {}
