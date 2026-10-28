import { html, LitElement, nothing, PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import { NavigationDrawerItem } from './navigation-drawer-item.js';
import styles from './navigation-drawer.scss';

/**
 * @label Navigation Drawer
 * @tag wc-navigation-drawer
 * @rawTag navigation-drawer
 *
 * @summary A side panel listing an app's destinations.
 * @overview
 * <p>Navigation drawer holds <code>wc-navigation-drawer-item</code> destinations. Clicking an item makes
 * it the active one and fires <code>change</code>.</p>
 * <ul>
 *   <li><code>variant="standard"</code> (default) sits in the page layout, next to the content.</li>
 *   <li><code>variant="modal"</code> opens over the page with a scrim. It traps focus, closes on Escape,
 *   on a scrim click and after an item is chosen.</li>
 * </ul>
 * <p>Both variants show only while <code>open</code> is set.</p>
 *
 * @slot - The drawer items. Other content, such as `wc-divider` or section titles, works too.
 * @slot header - Content above the items, after the headline.
 *
 * @fires {CustomEvent<{value: string | undefined, index: number, item: NavigationDrawerItem}>} change - Dispatched when the user activates an item.
 * @fires {CustomEvent} open - Dispatched when the drawer opens.
 * @fires {CustomEvent} close - Dispatched when the drawer closes.
 *
 * @cssprop --navigation-drawer-width - Width of the drawer. Defaults to 22.5rem (360dp).
 * @cssprop --navigation-drawer-container-color - Background of the drawer. Defaults to `--color-surface-container-low`.
 *
 * @example
 * ```html
 * <wc-navigation-drawer open headline="Mail">
 *   <wc-navigation-drawer-item active badge="24">
 *     <wc-icon slot="icon" name="inbox"></wc-icon>
 *     Inbox
 *   </wc-navigation-drawer-item>
 *   <wc-navigation-drawer-item>
 *     <wc-icon slot="icon" name="send"></wc-icon>
 *     Sent
 *   </wc-navigation-drawer-item>
 * </wc-navigation-drawer>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class NavigationDrawer extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  static Item = NavigationDrawerItem;

  // ── Properties ───────────────────────────────────────────────────────────

  /** Whether the drawer is shown. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** `"standard"` sits in the layout; `"modal"` opens over the page with a scrim. */
  @property({ reflect: true }) variant: 'standard' | 'modal' = 'standard';

  /** Title shown at the top of the drawer. */
  @property() headline = '';

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('dialog') private dialogElement?: HTMLDialogElement;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleItemClick);
  }

  override disconnectedCallback() {
    this.removeEventListener('click', this.handleItemClick);
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('open') || changed.has('variant')) {
      this.syncDialog();
    }
    // Skip the first render: `open` set in markup is not a user action.
    if (changed.has('open') && changed.get('open') !== undefined) {
      this.dispatchEvent(
        new CustomEvent(this.open ? 'open' : 'close', {
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Opens the drawer. */
  show() {
    this.open = true;
  }

  /** Closes the drawer. */
  close() {
    this.open = false;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private getItems(): NavigationDrawerItem[] {
    return Array.from(
      this.querySelectorAll<NavigationDrawerItem>('wc-navigation-drawer-item'),
    );
  }

  private syncDialog() {
    const dialog = this.dialogElement;
    if (!dialog) return;
    if (this.open && !dialog.open) {
      dialog.showModal();
      const items = this.getItems();
      (items.find(item => item.active) ?? items[0])?.focus();
    } else if (!this.open && dialog.open) {
      dialog.close();
    }
  }

  private handleItemClick = (event: Event) => {
    const item = (event.target as Element).closest?.(
      'wc-navigation-drawer-item',
    ) as NavigationDrawerItem | null;
    if (!item || item.disabled) return;

    const items = this.getItems();
    for (const drawerItem of items) {
      drawerItem.active = drawerItem === item;
    }

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: item.value, index: items.indexOf(item), item },
        bubbles: true,
        composed: true,
      }),
    );

    if (this.variant === 'modal') this.close();
  };

  /** Escape: close through `open` so the property stays the source of truth. */
  private handleCancel(event: Event) {
    event.preventDefault();
    this.close();
  }

  /** A click that lands on the dialog itself, not its content, is a scrim click. */
  private handleDialogClick(event: MouseEvent) {
    if (event.target === this.dialogElement) this.close();
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderContent() {
    return html`
      <div class="container" part="container">
        ${this.headline
          ? html`<div class="headline">${this.headline}</div>`
          : nothing}
        <slot name="header"></slot>
        <nav class="items" aria-label=${this.headline || 'Navigation'}>
          <slot></slot>
        </nav>
      </div>
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    if (this.variant === 'modal') {
      return html`<dialog
        class="drawer modal"
        @cancel=${this.handleCancel}
        @click=${this.handleDialogClick}
      >
        ${this.renderContent()}
      </dialog>`;
    }

    return html`<div class="drawer standard" ?hidden=${!this.open}>
      ${this.renderContent()}
    </div>`;
  }
}
