import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '../IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import { MenuTriggerController } from '@/__internal/menu-trigger-controller.js';
import type { OverlayPlacement } from '@/__internal/utils/placement.js';
import type { Menu, MenuCloseDetail } from '../menu/menu/menu.js';
import type { MenuItem } from '../menu/menu-item/menu-item.js';
import styles from './workspace-switcher.scss';

/** A workspace (tenant, organization, project) the person can switch to. */
export interface Workspace {
  /** Unique value; the switcher's `value` is the current workspace's. */
  value: string;
  /** Name shown in the trigger and the list. */
  label: string;
  /** A second line, such as the plan or the member count. */
  description?: string;
  /** URL of the logo; without one, the initials of `label` show. */
  avatar?: string;
}

/**
 * @label Workspace Switcher
 * @tag wc-workspace-switcher
 * @rawTag workspace-switcher
 * @summary The tenant, organization or project picker at the top of an app's navigation.
 * @overview
 * <p>The workspace switcher shows the current workspace (logo or initials, name and a chevron)
 * and opens a menu of the person's workspaces, with a check on the current one. Set
 * <code>workspaces</code> to an array of <code>{value, label, description, avatar}</code> and
 * <code>value</code> to the current workspace's value. Picking another fires <code>change</code>
 * with <code>detail.value</code>; the switcher updates <code>value</code> itself.</p>
 * <p>The menu starts with a search field that filters the list by name and description (Arrow
 * Down moves into the list, Enter picks the first match); <code>hide-search</code> removes it for
 * short lists. <code>creatable</code> adds a "Create workspace" action at the end, which fires
 * <code>create</code> with the search text, if any, as <code>detail.value</code>.</p>
 * <p>In a collapsed <code>wc-navigation-rail</code>, set <code>collapsed</code>: the trigger shows
 * only the logo, with the name in a tooltip; open the menu to the side with
 * <code>placement="end-start"</code>. The strings, including "workspace", can be renamed per
 * instance through <code>strings</code>, for example for projects.</p>
 *
 * @cssprop --workspace-switcher-avatar-shape - Corner radius of the workspace logos. Defaults to a small rounded square.
 * @cssprop --workspace-switcher-container-shape - Corner radius of the trigger.
 *
 * @fires {CustomEvent<{value: string}>} change - Fired when the person picks another workspace.
 * @fires {CustomEvent<{value: string}>} create - Fired when the person picks "Create workspace" (`creatable`); `value` is the search text.
 * @fires {CustomEvent} open - Fired when the menu opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Fired when the menu closes.
 *
 * @example
 * ```html
 * <wc-workspace-switcher id="workspaces" value="acme" creatable></wc-workspace-switcher>
 * <script>
 *   const switcher = document.getElementById('workspaces');
 *   switcher.workspaces = [
 *     { value: 'acme', label: 'Acme Inc', description: 'Enterprise' },
 *     { value: 'globex', label: 'Globex', description: 'Free' },
 *   ];
 *   switcher.addEventListener('change', event => openWorkspace(event.detail.value));
 * </script>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class WorkspaceSwitcher extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The workspaces to list. */
  @property({ attribute: false }) workspaces: Workspace[] = [];

  /** Value of the current workspace. */
  @property({ type: String, reflect: true }) value = '';

  /** Adds a "Create workspace" action to the menu, which fires `create`. */
  @property({ type: Boolean, reflect: true }) creatable = false;

  /** Shows only the logo, with the name in a tooltip, for a collapsed navigation rail. */
  @property({ type: Boolean, reflect: true }) collapsed = false;

  /** Removes the search field from the menu, for short lists. */
  @property({ type: Boolean, attribute: 'hide-search' }) hideSearch = false;

  /** Whether the switcher is disabled. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Where the menu opens relative to the trigger: `top`, `bottom`, `start` or `end`, optionally
   * followed by `-start` or `-end`. Defaults to `"bottom-start"`; use `"end-start"` in a rail.
   */
  @property({ type: String }) placement: OverlayPlacement = 'bottom-start';

  /** Per-instance overrides of Peacock's strings, for example to say "project" instead of "workspace". */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── State ────────────────────────────────────────────────────────────────

  /** The search text. */
  @state() private _query = '';

  /** Whether the menu is open. */
  @state() private _open = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.trigger') private _triggerEl?: HTMLButtonElement;

  @query('wc-menu') private _menu?: Menu;

  @query('.search-input') private _searchInput?: HTMLInputElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the trigger name, search field, empty state and create action. */
  private readonly i18n = new I18nController(this);

  /** Opens and closes the menu, anchored to the host. */
  private readonly _trigger = new MenuTriggerController(this, {
    menu: () => this._menu,
    disabled: () => this.disabled,
    idPrefix: 'workspace-menu',
  });

  /** Typing while a workspace has focus goes back to the search field. */
  private readonly _handleMenuKeydownCapture = {
    handleEvent: (event: KeyboardEvent) => {
      if (this.hideSearch || !this._open) return;
      if (event.composedPath()[0] === this._searchInput) return;
      const printable =
        event.key.length === 1 &&
        event.key !== ' ' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey;
      if (!printable && event.key !== 'Backspace') return;
      // Stop the menu's typeahead; the character lands in the field once it has focus.
      event.stopPropagation();
      this._searchInput?.focus();
    },
    capture: true,
  };

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override updated(changed: PropertyValues) {
    if (changed.has('_query') || changed.has('workspaces')) {
      this._menu?.syncItems();
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Moves focus to the trigger. */
  // eslint-disable-next-line no-undef
  override focus(options?: FocusOptions) {
    this._triggerEl?.focus(options);
  }

  /** Opens the menu. */
  show() {
    this._openMenu();
  }

  /** Closes the menu. */
  hide() {
    this._trigger.close();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private get _current(): Workspace | undefined {
    return this.workspaces.find(workspace => workspace.value === this.value);
  }

  /** The workspaces whose name or description contains the search text. */
  private get _filtered(): Workspace[] {
    const text = this._query.trim().toLowerCase();
    if (!text) return this.workspaces;
    return this.workspaces.filter(workspace =>
      `${workspace.label} ${workspace.description ?? ''}`
        .toLowerCase()
        .includes(text),
    );
  }

  private _openMenu(focusTarget: 'first' | 'last' = 'first') {
    const menu = this._menu;
    if (!menu || this.disabled) return;
    // At least as wide as the trigger, so it lines up under it.
    if (!this.collapsed) {
      menu.style.setProperty(
        '--menu-min-width',
        `${Math.ceil(this.getBoundingClientRect().width)}px`,
      );
    }
    this._trigger.show(focusTarget);
  }

  private _handleTriggerClick(event: MouseEvent) {
    event.stopPropagation();
    if (this._menu?.open) this._trigger.close();
    else this._openMenu();
  }

  private _handleTriggerKeydown(event: KeyboardEvent) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    this._openMenu(event.key === 'ArrowDown' ? 'first' : 'last');
  }

  /** The menu's events are internal; the switcher reports its own `open` / `close`. */
  private _handleMenuOpen(event: Event) {
    event.stopPropagation();
    if (event.target !== event.currentTarget) return;
    this._open = true;
    if (!this.hideSearch) {
      this.updateComplete.then(() => this._searchInput?.focus());
    }
    this.dispatchEvent(
      new CustomEvent('open', { bubbles: true, composed: true }),
    );
  }

  private _handleMenuClose(event: CustomEvent<MenuCloseDetail>) {
    event.stopPropagation();
    if (event.target !== event.currentTarget) return;
    this._open = false;
    this._query = '';
    this.dispatchEvent(
      new CustomEvent('close', {
        detail: { reason: event.detail.reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleItemActivate(event: CustomEvent<{ item: MenuItem }>) {
    event.stopPropagation();
    const { item } = event.detail;
    if (item.classList.contains('create-item')) {
      this.dispatchEvent(
        new CustomEvent('create', {
          detail: { value: this._query.trim() },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }
    if (item.value === this.value) return;
    this.value = item.value;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleSearchInput(event: Event) {
    event.stopPropagation();
    this._query = (event.target as HTMLInputElement).value;
  }

  /** Keys in the search field: arrows move into the list, Enter picks the first match. */
  private _handleSearchKeydown(event: KeyboardEvent) {
    // Escape and Tab go on to the menu, which closes.
    if (event.key === 'Escape' || event.key === 'Tab') return;
    // Everything else is typing: keep it from the menu's typeahead and Space handling.
    event.stopPropagation();
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this._menu?.focus(event.key === 'ArrowDown' ? 'first' : 'last');
    } else if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      // Without a match, Enter creates (when the switcher is `creatable`) from the search text.
      this.renderRoot
        .querySelector<MenuItem>(
          'wc-menu-item.workspace-item, wc-menu-item.create-item',
        )
        ?.click();
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private _renderAvatar(workspace: Workspace | undefined, size: 'sm' | 'md') {
    // The name is in the text next to it; the avatar is decoration.
    return html`<wc-avatar
      class="avatar"
      size=${size}
      name=${workspace?.label ?? ''}
      src=${workspace?.avatar ?? nothing}
      aria-hidden="true"
    ></wc-avatar>`;
  }

  private _renderTrigger() {
    const current = this._current;
    const name = current?.label ?? '';
    return html`<div class="trigger-wrapper">
      <wc-focus-ring class="focus-ring" for="trigger"></wc-focus-ring>
      <wc-ripple class="ripple" for="trigger"></wc-ripple>
      <button
        id="trigger"
        class="trigger"
        type="button"
        aria-label=${this.i18n.t('workspaceSwitcherTrigger')(name)}
        aria-haspopup="menu"
        aria-expanded=${String(this._open)}
        aria-controls=${this._trigger.menuId}
        ?disabled=${this.disabled}
        @click=${this._handleTriggerClick}
        @keydown=${this._handleTriggerKeydown}
      >
        ${this._renderAvatar(current, 'md')}
        ${this.collapsed
          ? nothing
          : html`<span class="text">
                <span class="name">${name}</span>
                ${current?.description
                  ? html`<span class="description"
                      >${current.description}</span
                    >`
                  : nothing}
              </span>
              <wc-icon
                class="chevron"
                name="unfold_more"
                aria-hidden="true"
              ></wc-icon>`}
      </button>
    </div>`;
  }

  private _renderSearch() {
    if (this.hideSearch) return nothing;
    const label = this.i18n.t('workspaceSwitcherSearch');
    return html`<div class="search" role="none">
      <wc-icon class="search-icon" name="search" aria-hidden="true"></wc-icon>
      <input
        class="search-input"
        type="search"
        autocomplete="off"
        spellcheck="false"
        aria-label=${label}
        placeholder=${label}
        .value=${this._query}
        @input=${this._handleSearchInput}
        @change=${(event: Event) => event.stopPropagation()}
        @keydown=${this._handleSearchKeydown}
      />
    </div>`;
  }

  private _renderItems() {
    const filtered = this._filtered;
    if (!filtered.length && this._query.trim()) {
      return html`<div class="empty" role="none">
        ${this.i18n.t('workspaceSwitcherNoResults')(this._query.trim())}
      </div>`;
    }
    return filtered.map(
      workspace =>
        html`<wc-menu-item
          class="workspace-item"
          type="radio"
          .value=${workspace.value}
          ?selected=${workspace.value === this.value}
        >
          <wc-avatar
            slot="start"
            class="avatar"
            size="sm"
            name=${workspace.label}
            src=${workspace.avatar ?? nothing}
            aria-hidden="true"
          ></wc-avatar>
          ${workspace.label}
          ${workspace.description
            ? html`<span slot="supporting-text">${workspace.description}</span>`
            : nothing}
        </wc-menu-item>`,
    );
  }

  private _renderCreate() {
    if (!this.creatable) return nothing;
    return html`<wc-divider></wc-divider>
      <wc-menu-item class="create-item">
        <wc-icon slot="start" name="add" aria-hidden="true"></wc-icon>
        ${this.i18n.t('workspaceSwitcherCreate')}
      </wc-menu-item>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`
      ${this._renderTrigger()}
      ${this.collapsed && this._current
        ? html`<wc-tooltip for="trigger" placement="end"
            >${this._current.label}</wc-tooltip
          >`
        : nothing}
      <wc-menu
        id=${this._trigger.menuId}
        class=${classMap({ menu: true, searchable: !this.hideSearch })}
        aria-label=${this.i18n.t('workspaceSwitcherMenu')}
        .placement=${this.placement}
        ?no-autofocus=${!this.hideSearch}
        @open=${this._handleMenuOpen}
        @close=${this._handleMenuClose}
        @menu-item-activate=${this._handleItemActivate}
        @keydown=${this._handleMenuKeydownCapture}
      >
        ${this._renderSearch()} ${this._renderItems()} ${this._renderCreate()}
      </wc-menu>
    `;
  }
}
