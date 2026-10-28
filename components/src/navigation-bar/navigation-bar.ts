import { html, LitElement } from 'lit';
import IndividualComponent from '@/IndividualComponent.js';
import { NavigationBarItem } from './navigation-bar-item.js';
import styles from './navigation-bar.scss';

/**
 * @label Navigation Bar
 * @tag wc-navigation-bar
 * @rawTag navigation-bar
 *
 * @summary A bottom bar with three to five primary destinations, for small screens.
 * @overview
 * <p>Navigation bar lays its <code>wc-navigation-bar-item</code> children out in a row of equal
 * widths. Clicking an item makes it the active one and fires <code>change</code>.</p>
 * <p>The bar does not position itself: place it at the bottom of your layout, or give it
 * <code>position: fixed; inset-inline: 0; bottom: 0</code>.</p>
 *
 * @fires {CustomEvent<{value: string | undefined, index: number, item: NavigationBarItem}>} change - Dispatched when the user activates an item.
 *
 * @cssprop --navigation-bar-container-color - Background of the bar. Defaults to `--color-surface-container`.
 * @cssprop --navigation-bar-height - Height of the bar. Defaults to 5rem (80dp).
 * @cssprop --navigation-bar-elevation - Shadow of the bar. Defaults to `--elevation-level2`.
 *
 * @example
 * ```html
 * <wc-navigation-bar>
 *   <wc-navigation-bar-item active value="home">
 *     <wc-icon slot="icon" name="home"></wc-icon>
 *     Home
 *   </wc-navigation-bar-item>
 *   <wc-navigation-bar-item value="search">
 *     <wc-icon slot="icon" name="search"></wc-icon>
 *     Search
 *   </wc-navigation-bar-item>
 * </wc-navigation-bar>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class NavigationBar extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  static Item = NavigationBarItem;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleItemClick);
    this.setAttribute('role', 'navigation');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Main navigation');
    }
  }

  override disconnectedCallback() {
    this.removeEventListener('click', this.handleItemClick);
    super.disconnectedCallback();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private getItems(): NavigationBarItem[] {
    return Array.from(
      this.querySelectorAll<NavigationBarItem>('wc-navigation-bar-item'),
    );
  }

  private handleItemClick = (event: Event) => {
    const item = (event.target as Element).closest?.(
      'wc-navigation-bar-item',
    ) as NavigationBarItem | null;
    if (!item || item.disabled) return;

    const items = this.getItems();
    for (const barItem of items) {
      barItem.active = barItem === item;
    }

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: item.value, index: items.indexOf(item), item },
        bubbles: true,
        composed: true,
      }),
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`<div class="bar"><slot></slot></div>`;
  }
}
