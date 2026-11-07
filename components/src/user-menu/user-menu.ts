import { LitElement, html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import IndividualComponent from '../IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { MenuTriggerController } from '@/__internal/menu-trigger-controller.js';
import type { OverlayPlacement } from '@/__internal/utils/placement.js';
import type { Menu, MenuCloseDetail } from '../menu/menu/menu.js';
import type { MenuItem } from '../menu/menu-item/menu-item.js';
import styles from './user-menu.scss';

/** The person's presence, shown in the menu header. */
export type UserMenuStatus = 'online' | 'away' | 'busy' | 'offline';

/** The color theme the person picked; `system` follows the operating system. */
export type UserMenuTheme = 'light' | 'dark' | 'system';

/** Status indicator intent and string key of each presence. */
/** The status text under the email; the dot on the avatar is a wc-presence-indicator. */
const STATUS_LABELS = {
  online: 'presenceOnline',
  away: 'presenceAway',
  busy: 'presenceBusy',
  offline: 'presenceOffline',
} as const;

/** The theme choices, in menu order. */
const THEMES = [
  { value: 'light', icon: 'light_mode', key: 'userMenuThemeLight' },
  { value: 'dark', icon: 'dark_mode', key: 'userMenuThemeDark' },
  { value: 'system', icon: 'contrast', key: 'userMenuThemeSystem' },
] as const;

/**
 * @label User Menu
 * @tag wc-user-menu
 * @rawTag user-menu
 * @summary The account menu at the end of an app bar: an avatar that opens the person's menu.
 * @overview
 * <p>The user menu is an avatar button (from <code>name</code> and <code>src</code>) named
 * "Account menu for <em>name</em>". It opens a <code>wc-menu</code> with a header (the avatar,
 * <code>name</code>, <code>email</code> and an optional presence <code>status</code>), then the
 * <code>wc-menu-item</code>s you put inside it, such as Profile and Settings. Items in the
 * <code>footer</code> slot, such as Sign out, come last.</p>
 * <p>Set <code>theme</code> (<code>light</code>, <code>dark</code> or <code>system</code>) to add
 * a theme section with the three choices and a check on the current one. Picking one sets
 * <code>theme</code> and fires <code>theme-change</code>; the component does not touch the page,
 * so the app applies it, for example with <code>data-theme</code> on <code>&lt;html&gt;</code>
 * (remove the attribute for <code>system</code>), and stores the choice.</p>
 *
 * @slot - Menu items (`wc-menu-item`, `wc-divider`), such as Profile and Settings.
 * @slot footer - Menu items after the theme section, such as Sign out.
 *
 * @cssprop --user-menu-header-color - Background of the menu header.
 *
 * @fires {CustomEvent<{value: 'light' | 'dark' | 'system'}>} theme-change - Fired when the person picks a theme in the theme section.
 * @fires {CustomEvent} open - Fired when the menu opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Fired when the menu closes.
 *
 * @example
 * ```html
 * <wc-user-menu name="Ada Lovelace" email="ada@example.com" status="online" theme="system">
 *   <wc-menu-item href="/profile"><wc-icon slot="start" name="person"></wc-icon>Profile</wc-menu-item>
 *   <wc-menu-item href="/settings"><wc-icon slot="start" name="settings"></wc-icon>Settings</wc-menu-item>
 *   <wc-menu-item slot="footer"><wc-icon slot="start" name="logout"></wc-icon>Sign out</wc-menu-item>
 * </wc-user-menu>
 * <script>
 *   document.querySelector('wc-user-menu').addEventListener('theme-change', event => {
 *     const { value } = event.detail;
 *     if (value === 'system') delete document.documentElement.dataset.theme;
 *     else document.documentElement.dataset.theme = value;
 *   });
 * </script>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class UserMenu extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The person's name: the avatar's initials, the header and the button's accessible name. */
  @property({ type: String, reflect: true }) name = '';

  /** URL of the person's picture; without one, the initials of `name` show. */
  @property({ type: String }) src?: string;

  /** The person's email address, shown under the name. */
  @property({ type: String }) email = '';

  /** The person's presence, shown in the header: `online`, `away`, `busy` or `offline`. */
  @property({ type: String, reflect: true }) status?: UserMenuStatus;

  /**
   * The current color theme: `light`, `dark` or `system`. Setting it adds the theme section to
   * the menu; picking a choice updates it and fires `theme-change`.
   */
  @property({ type: String, reflect: true }) theme?: UserMenuTheme;

  /**
   * Where the menu opens relative to the avatar: `top`, `bottom`, `start` or `end`, optionally
   * followed by `-start` or `-end`. Defaults to `"bottom-end"`, for the end of an app bar.
   */
  @property({ type: String }) placement: OverlayPlacement = 'bottom-end';

  // ── State ────────────────────────────────────────────────────────────────

  /** Whether the menu is open. */
  @state() private _open = false;

  /** Whether the `footer` slot has content. */
  @state() private _hasFooter = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.trigger') private _triggerEl?: HTMLButtonElement;

  @query('wc-menu') private _menu?: Menu;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the button name, the theme section and the status. */
  private readonly i18n = new I18nController(this);

  /** Opens and closes the menu, anchored to the host. */
  private readonly _trigger = new MenuTriggerController(this, {
    menu: () => this._menu,
    disabled: () => false,
    idPrefix: 'user-menu',
    tag: 'wc-user-menu',
  });

  // ── Public methods ───────────────────────────────────────────────────────

  /** Moves focus to the avatar button. */
  // eslint-disable-next-line no-undef
  override focus(options?: FocusOptions) {
    this._triggerEl?.focus(options);
  }

  /** Opens the menu. */
  show() {
    this._trigger.show('first');
  }

  /** Closes the menu. */
  hide() {
    this._trigger.close();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** The menu's events are internal; the user menu reports its own `open` / `close`. */
  private _handleMenuOpen(event: Event) {
    event.stopPropagation();
    if (event.target !== event.currentTarget) return;
    this._open = true;
    this.dispatchEvent(
      new CustomEvent('open', { bubbles: true, composed: true }),
    );
  }

  private _handleMenuClose(event: CustomEvent<MenuCloseDetail>) {
    event.stopPropagation();
    if (event.target !== event.currentTarget) return;
    this._open = false;
    this.dispatchEvent(
      new CustomEvent('close', {
        detail: { reason: event.detail.reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** A theme choice: update `theme` and tell the app. Other items are the consumer's. */
  private _handleItemActivate(event: CustomEvent<{ item: MenuItem }>) {
    const { item } = event.detail;
    if (!item.classList.contains('theme-item')) return;
    event.stopPropagation();
    const value = item.value as UserMenuTheme;
    if (value === this.theme) return;
    this.theme = value;
    this.dispatchEvent(
      new CustomEvent('theme-change', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleFooterSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this._hasFooter = slot.assignedElements({ flatten: true }).length > 0;
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private _renderHeader() {
    const statusKey = this.status ? STATUS_LABELS[this.status] : undefined;
    // The avatar is decorative (the name is shown next to it), so the status is also written out
    // as text; the presence dot on the avatar is the visual cue.
    const avatar = html`<wc-avatar
      class="header-avatar"
      size="lg"
      name=${this.name}
      src=${this.src ?? nothing}
    ></wc-avatar>`;
    return html`<div class="header" role="none">
      <div aria-hidden="true">
        ${this.status
          ? html`<wc-presence-indicator status=${this.status}
              >${avatar}</wc-presence-indicator
            >`
          : avatar}
      </div>
      <div class="identity">
        ${this.name ? html`<span class="name">${this.name}</span>` : nothing}
        ${this.email ? html`<span class="email">${this.email}</span>` : nothing}
        ${statusKey
          ? html`<span class="status">${this.i18n.t(statusKey)}</span>`
          : nothing}
      </div>
    </div>`;
  }

  private _renderThemeSection() {
    if (!this.theme) return nothing;
    return html`<wc-divider></wc-divider>
      <div class="section-heading" role="none">
        ${this.i18n.t('userMenuTheme')}
      </div>
      ${THEMES.map(
        theme =>
          html`<wc-menu-item
            class="theme-item"
            type="radio"
            .value=${theme.value}
            ?selected=${this.theme === theme.value}
          >
            <wc-icon
              slot="start"
              name=${theme.icon}
              aria-hidden="true"
            ></wc-icon>
            ${this.i18n.t(theme.key)}
          </wc-menu-item>`,
      )}
      ${this._hasFooter ? html`<wc-divider></wc-divider>` : nothing}`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const label = this.i18n.t('userMenuTrigger')(this.name);
    return html`
      <div class="trigger-wrapper">
        <wc-focus-ring class="focus-ring" for="trigger"></wc-focus-ring>
        <button
          id="trigger"
          class="trigger"
          type="button"
          aria-label=${label}
          aria-haspopup="menu"
          aria-expanded=${String(this._open)}
          aria-controls=${this._trigger.menuId}
          @click=${this._trigger.handleTriggerClick}
          @keydown=${this._trigger.handleTriggerKeyDown}
        >
          <wc-avatar
            class="avatar"
            name=${this.name}
            src=${this.src ?? nothing}
            aria-hidden="true"
          ></wc-avatar>
        </button>
      </div>
      <wc-menu
        id=${this._trigger.menuId}
        class="menu"
        aria-label=${label}
        .placement=${this.placement}
        @open=${this._handleMenuOpen}
        @close=${this._handleMenuClose}
        @menu-item-activate=${this._handleItemActivate}
      >
        ${this._renderHeader()}
        <wc-divider></wc-divider>
        <slot></slot>
        ${this._renderThemeSection()}
        <slot name="footer" @slotchange=${this._handleFooterSlotChange}></slot>
      </wc-menu>
    `;
  }
}
