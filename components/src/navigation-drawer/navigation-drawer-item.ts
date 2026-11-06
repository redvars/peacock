import { html } from 'lit';
import { state } from 'lit/decorators.js';
import { ClassInfo } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { NavigationItemBase } from '@/__internal/navigation-item-base.js';
import styles from './navigation-drawer-item.scss';

/**
 * @label Navigation Drawer Item
 * @tag wc-navigation-drawer-item
 * @rawTag navigation-drawer-item
 *
 * @summary A destination in a navigation drawer.
 * @overview
 * <p>A full-width row with an optional icon, a label and an optional badge. The current item
 * (<code>current</code>) gets the pill-shaped active indicator and <code>aria-current="page"</code>.
 * With <code>href</code> it renders a link, otherwise a button.</p>
 * <p>Place items directly in <code>wc-navigation-drawer</code> or inside a
 * <code>wc-navigation-drawer-group</code>. <code>active</code> is a deprecated alias of
 * <code>current</code> and is removed in 4.0.</p>
 *
 * @slot - The label.
 * @slot icon - Leading icon.
 * @slot badge - Trailing content, such as a count. Overrides the `badge` attribute.
 *
 * @cssprop --navigation-drawer-item-height - Height of the row. Defaults to 3.5rem (56dp).
 * @cssprop --navigation-drawer-item-indent - Extra start padding. Groups set it for their items.
 *
 * @example
 * ```html
 * <wc-navigation-drawer-item current badge="24">
 *   <wc-icon slot="icon" name="inbox"></wc-icon>
 *   Inbox
 * </wc-navigation-drawer-item>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class NavigationDrawerItem extends NavigationItemBase {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── State ────────────────────────────────────────────────────────────────

  /** True when the `icon` slot has content. */
  @state() private hasIcon = false;

  // ── Protected methods ────────────────────────────────────────────────────

  protected override itemClasses(): ClassInfo {
    return { 'has-icon': this.hasIcon };
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private handleIconSlotChange(event: Event) {
    this.hasIcon =
      (event.target as HTMLSlotElement).assignedElements().length > 0;
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  protected renderContent() {
    return html`
      <wc-focus-ring class="focus-ring" for="item"></wc-focus-ring>
      <wc-ripple class="ripple" for="item"></wc-ripple>
      <span class="icon"
        ><slot name="icon" @slotchange=${this.handleIconSlotChange}></slot
      ></span>
      <span class="label"><slot></slot></span>
      ${this.renderBadge()}
    `;
  }
}
