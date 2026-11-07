import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  type CloseReason,
  OverlayController,
} from '@/__internal/controllers/overlay-controller.js';
import styles from './app-shell.scss';

/** Detail of the `close` event. */
export interface AppShellCloseDetail {
  /** Why the navigation drawer closed. */
  reason: CloseReason;
}

/** Slotted elements that already are, or render, a navigation landmark. */
const NAVIGATION_LANDMARK =
  'nav, [role="navigation"], wc-navigation-drawer, wc-navigation-rail, wc-navigation-bar';

/**
 * @label App Shell
 * @tag wc-app-shell
 * @rawTag app-shell
 *
 * @summary The page frame of an app: header, navigation, main content, side panel and footer.
 * @overview
 * <p>App shell lays out a whole app screen at the full viewport height (<code>100dvh</code>).
 * The <code>header</code> slot (usually a <code>wc-app-bar</code>) stays at the top, the
 * <code>navigation</code> slot (usually a <code>wc-navigation-drawer</code>) sits at the start,
 * the optional <code>aside</code> slot at the end, and the <code>footer</code> slot at the
 * bottom. Only the main region scrolls.</p>
 * <p>The shell supplies the page landmarks: a <code>&lt;header&gt;</code>, a
 * <code>&lt;main&gt;</code>, an <code>&lt;aside&gt;</code> and a <code>&lt;footer&gt;</code>.
 * The navigation drawer, rail and bar are navigation landmarks themselves, so the shell only
 * marks the navigation region as one when the slotted content is not. A visually hidden
 * <em>Skip to main content</em> link is the first focusable element.</p>
 * <p>When the shell is narrower than <code>breakpoint</code> (840px by default), the navigation
 * moves into a modal drawer that slides in from the start edge. The shell renders a menu button
 * before the header to open it (<code>hide-menu-button</code> hides it, for apps that call
 * <code>toggleNavigation()</code> from their own button). Choosing an item, Escape and a click on
 * the scrim close it. <code>navigation-open</code> reflects that drawer's state.</p>
 * <p>On wider screens, <code>navigation-collapsed</code> narrows the navigation to rail width.
 * Put a <code>wc-navigation-rail</code> in the <code>rail</code> slot to show it instead of the
 * drawer while collapsed; without one, the drawer is clipped to the rail width.</p>
 * <p>A <code>wc-navigation-drawer</code> in the shell keeps <code>variant="standard"</code> and
 * <code>open</code>: the shell moves it into its own modal drawer on narrow screens.</p>
 *
 * @slot header - The app bar, kept at the top.
 * @slot navigation - The app's navigation, usually a `wc-navigation-drawer`.
 * @slot rail - Optional navigation shown while `navigation-collapsed`, usually a `wc-navigation-rail`.
 * @slot - The main content: the only region that scrolls.
 * @slot aside - Optional panel at the end, such as details or help.
 * @slot footer - Content at the bottom, such as a `wc-navigation-bar` or a status line.
 *
 * @fires {CustomEvent} open - Dispatched when the modal navigation drawer opens on a narrow screen.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Dispatched when the modal navigation drawer closes: Escape, a scrim click, choosing an item, or `hideNavigation()` (and widening the shell past the breakpoint).
 *
 * @csspart header - The `<header>` around the header slot and the menu button.
 * @csspart navigation - The navigation region on wide screens.
 * @csspart main - The `<main>` region.
 * @csspart aside - The `<aside>` region.
 * @csspart footer - The `<footer>` region.
 * @csspart modal-navigation - The modal drawer on narrow screens.
 *
 * @cssprop --app-shell-background - Background of the main region. Defaults to `--color-surface`.
 * @cssprop --app-shell-header-color - Background of the header region. Defaults to the app bar's color.
 * @cssprop --app-shell-rail-width - Width of the collapsed navigation without a rail. Defaults to 6rem.
 * @cssprop --app-shell-aside-width - Width of the aside region. Defaults to its content's width.
 * @cssprop --app-shell-modal-navigation-width - Width of the modal drawer. Defaults to 22.5rem.
 *
 * @example
 * ```html
 * <wc-app-shell>
 *   <wc-app-bar slot="header">Inbox</wc-app-bar>
 *   <wc-navigation-drawer slot="navigation" open headline="Mail">
 *     <wc-navigation-drawer-item current href="#inbox">
 *       <wc-icon slot="icon" name="inbox"></wc-icon>Inbox
 *     </wc-navigation-drawer-item>
 *     <wc-navigation-drawer-item href="#sent">
 *       <wc-icon slot="icon" name="send"></wc-icon>Sent
 *     </wc-navigation-drawer-item>
 *   </wc-navigation-drawer>
 *   <p>Main content</p>
 * </wc-app-shell>
 * ```
 * @example
 * ```html
 * <wc-app-shell navigation-collapsed>
 *   <wc-app-bar slot="header">Projects</wc-app-bar>
 *   <wc-navigation-drawer slot="navigation" open>…</wc-navigation-drawer>
 *   <wc-navigation-rail slot="rail">…</wc-navigation-rail>
 *   <p>Main content</p>
 *   <div slot="aside">Details</div>
 * </wc-app-shell>
 * ```
 * @tags layout navigation
 */
@IndividualComponent
export class AppShell extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Whether the modal navigation drawer is open. Only has an effect below the breakpoint. */
  @property({ type: Boolean, reflect: true, attribute: 'navigation-open' })
  navigationOpen = false;

  /** Narrows the navigation to rail width on screens at or above the breakpoint. */
  @property({ type: Boolean, reflect: true, attribute: 'navigation-collapsed' })
  navigationCollapsed = false;

  /** Shell width in pixels below which the navigation becomes a modal drawer. */
  @property({ type: Number }) breakpoint = 840;

  /** Hides the menu button the shell renders on narrow screens. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-menu-button' })
  hideMenuButton = false;

  // ── State ────────────────────────────────────────────────────────────────

  /** Whether the shell is narrower than the breakpoint. */
  @state() private compact = false;

  /** Which slots have content. */
  @state() private filled = {
    header: false,
    navigation: false,
    rail: false,
    aside: false,
    footer: false,
  };

  /** Whether the slotted navigation is already a navigation landmark. */
  @state() private navigationIsLandmark = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.modal-navigation') private dialogElement?: HTMLDialogElement;

  @query('main') private mainElement?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the skip link, the menu button and the landmark labels. */
  private readonly i18n = new I18nController(this);

  private readonly overlay = new OverlayController(this, {
    surface: () => this.dialogElement,
    modal: true,
    initialFocus: () =>
      this.navigationElements()
        .map(element =>
          element.matches('[current]')
            ? element
            : element.querySelector<HTMLElement>('[current]'),
        )
        .find(element => !!element) ?? null,
    requestClose: reason => this.closeNavigation(reason),
  });

  /** Watches the shell's width against the breakpoint. */
  private resizeObserver?: ResizeObserver;

  /** Watches the children, since a slot that is not rendered fires no `slotchange`. */
  private readonly childObserver = new MutationObserver(() => this.syncSlots());

  /** The last measured width of the shell. */
  private width = 0;

  /** Why the drawer is closing, for the next `close` event. */
  private closeReason: CloseReason = 'api';

  /** Whether the drawer was open at the last `open`/`close` event, so each change fires once. */
  private announcedOpen?: boolean;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.syncSlots();
    this.childObserver.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['slot', 'role'],
    });
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(entries => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        this.width = entry.contentRect.width;
        this.syncCompact();
      });
      this.resizeObserver.observe(this);
    }
  }

  override disconnectedCallback() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.childObserver.disconnect();
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues) {
    // Measure now on the first render, so a narrow screen never flashes the wide layout.
    if (!this.hasUpdated || changed.has('breakpoint')) {
      this.width = this.getBoundingClientRect().width;
      this.syncCompact();
    }
    // Widening past the breakpoint closes the modal drawer; the region shows instead.
    if (
      changed.has('compact') &&
      changed.get('compact') === true &&
      !this.compact &&
      this.navigationOpen
    ) {
      this.closeReason = 'api';
      this.navigationOpen = false;
    }
  }

  protected override updated(changed: PropertyValues) {
    if (changed.has('navigationOpen') || changed.has('compact')) {
      this.overlay.sync(this.drawerShown);
    }
    const shown = this.drawerShown;
    if (this.announcedOpen === undefined) {
      // `navigation-open` set in markup is not a user action.
      this.announcedOpen = shown;
      return;
    }
    if (shown === this.announcedOpen) return;
    this.announcedOpen = shown;
    if (shown) {
      this.dispatchEvent(
        new CustomEvent('open', { bubbles: true, composed: true }),
      );
    } else {
      this.dispatchEvent(
        new CustomEvent<AppShellCloseDetail>('close', {
          detail: { reason: this.closeReason },
          bubbles: true,
          composed: true,
        }),
      );
    }
    this.closeReason = 'api';
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Opens the modal navigation drawer (below the breakpoint). */
  showNavigation() {
    this.navigationOpen = true;
  }

  /** Closes the modal navigation drawer. */
  hideNavigation() {
    this.closeNavigation('api');
  }

  /**
   * Below the breakpoint, opens or closes the modal navigation drawer; at or above it, toggles
   * `navigation-collapsed`.
   */
  toggleNavigation() {
    if (!this.compact) {
      this.navigationCollapsed = !this.navigationCollapsed;
    } else if (this.navigationOpen) {
      this.hideNavigation();
    } else {
      this.showNavigation();
    }
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** Whether the modal drawer is showing right now. */
  private get drawerShown() {
    return this.compact && this.navigationOpen;
  }

  private closeNavigation(reason: CloseReason) {
    if (!this.navigationOpen) return;
    this.closeReason = reason;
    this.navigationOpen = false;
  }

  private syncCompact() {
    if (this.width > 0) this.compact = this.width < this.breakpoint;
  }

  private navigationElements(): HTMLElement[] {
    return Array.from(
      this.querySelectorAll<HTMLElement>(':scope > [slot="navigation"]'),
    );
  }

  /** Reads which slots have content from the light DOM, so it does not depend on what is rendered. */
  private syncSlots = () => {
    const has = (name: string) =>
      !!this.querySelector(`:scope > [slot="${name}"]`);
    const filled = {
      header: has('header'),
      navigation: has('navigation'),
      rail: has('rail'),
      aside: has('aside'),
      footer: has('footer'),
    };
    if (JSON.stringify(filled) !== JSON.stringify(this.filled)) {
      this.filled = filled;
    }
    const navigation = Array.from(
      this.querySelectorAll<HTMLElement>(
        ':scope > [slot="navigation"], :scope > [slot="rail"]',
      ),
    );
    this.navigationIsLandmark = navigation.some(
      element =>
        element.matches(NAVIGATION_LANDMARK) ||
        !!element.querySelector(NAVIGATION_LANDMARK),
    );
  };

  /** Fragment links do not reach into shadow roots, so move focus to the main region directly. */
  private handleSkipClick(event: MouseEvent) {
    event.preventDefault();
    this.mainElement?.focus();
  }

  private handleMenuClick() {
    this.toggleNavigation();
  }

  /** Choosing a destination in the modal drawer closes it. */
  private handleNavigationChange(event: Event) {
    if (event.target === this) return;
    this.closeNavigation('action');
  }

  /** The native Escape `cancel`: keep `navigation-open` in charge. */
  private handleCancel(event: Event) {
    event.preventDefault();
    this.closeNavigation('escape');
  }

  /** The browser closed the dialog on its own: keep `navigation-open` in step. */
  private handleNativeClose(event: Event) {
    if (event.target !== this.dialogElement) return;
    if (this.overlay.takeOwnClose()) return;
    this.closeNavigation('escape');
  }

  /** A click outside the drawer's box lands on its backdrop: a light dismiss. */
  private handleDialogClick(event: MouseEvent) {
    const dialog = this.dialogElement;
    if (!dialog || event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) this.closeNavigation('light-dismiss');
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderMenuButton() {
    if (!this.compact || !this.filled.navigation || this.hideMenuButton) {
      return nothing;
    }
    return html`<wc-icon-button
      class="menu-button"
      variant="text"
      shape="round"
      aria-label=${this.i18n.t('openNavigation')}
      aria-expanded=${String(this.navigationOpen)}
      aria-controls="modal-navigation"
      @click=${this.handleMenuClick}
    >
      <wc-icon name="menu"></wc-icon>
    </wc-icon-button>`;
  }

  private renderNavigationRegion() {
    if (this.compact) return nothing;
    const { navigation, rail } = this.filled;
    if (!navigation && !rail) return nothing;
    const collapsed = this.navigationCollapsed;
    const showRail = rail && (collapsed || !navigation);
    const showDrawer = navigation && !showRail;
    const landmark = !this.navigationIsLandmark;
    return html`<div
      class=${classMap({
        navigation: true,
        clipped: collapsed && showDrawer,
      })}
      part="navigation"
      role=${landmark ? 'navigation' : nothing}
      aria-label=${landmark ? this.i18n.t('mainNavigation') : nothing}
    >
      <div class="drawer-slot" ?hidden=${!showDrawer}>
        <slot name="navigation" @slotchange=${this.syncSlots}></slot>
      </div>
      <div class="rail-slot" ?hidden=${!showRail}>
        <slot name="rail" @slotchange=${this.syncSlots}></slot>
      </div>
    </div>`;
  }

  private renderModalNavigation() {
    if (!this.compact) return nothing;
    const landmark = !this.navigationIsLandmark;
    // The scrim click has its keyboard equivalent in Escape, which the overlay controller handles.
    /* eslint-disable lit-a11y/click-events-have-key-events */
    return html`<dialog
      id="modal-navigation"
      class="modal-navigation"
      part="modal-navigation"
      aria-label=${this.i18n.t('navigation')}
      @cancel=${this.handleCancel}
      @close=${this.handleNativeClose}
      @click=${this.handleDialogClick}
      @change=${this.handleNavigationChange}
    >
      <div
        class="modal-content"
        role=${landmark ? 'navigation' : nothing}
        aria-label=${landmark ? this.i18n.t('mainNavigation') : nothing}
      >
        <slot name="navigation" @slotchange=${this.syncSlots}></slot>
      </div>
    </dialog>`;
    /* eslint-enable lit-a11y/click-events-have-key-events */
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const { header, aside, footer } = this.filled;
    const menuButton = this.renderMenuButton();
    return html`
      <a class="skip-link" href="#main" @click=${this.handleSkipClick}
        >${this.i18n.t('skipToMainContent')}</a
      >
      <div
        class=${classMap({ shell: true, compact: this.compact })}
        part="base"
      >
        <header
          class="header"
          part="header"
          ?hidden=${!header && menuButton === nothing}
        >
          ${menuButton}
          <div class="header-content">
            <slot name="header" @slotchange=${this.syncSlots}></slot>
          </div>
        </header>
        <div class="body">
          ${this.renderNavigationRegion()}
          <main id="main" class="main" part="main" tabindex="-1">
            <slot></slot>
          </main>
          <aside class="aside" part="aside" ?hidden=${!aside}>
            <slot name="aside" @slotchange=${this.syncSlots}></slot>
          </aside>
        </div>
        <footer class="footer" part="footer" ?hidden=${!footer}>
          <slot name="footer" @slotchange=${this.syncSlots}></slot>
        </footer>
      </div>
      ${this.renderModalNavigation()}
    `;
  }
}
