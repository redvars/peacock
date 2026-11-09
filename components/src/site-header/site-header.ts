import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  type CloseReason,
  OverlayController,
} from '@/__internal/controllers/overlay-controller.js';
import { SiteNavMenu } from './site-nav-menu.js';
import { SiteNavGroup } from './site-nav-group.js';
import { SiteNavLink } from './site-nav-link.js';
import { NAV_PARTS, syncCollapsed } from './site-nav-shared.js';
import styles from './site-header.scss';

/** Detail of the `close` event. */
export interface SiteHeaderCloseDetail {
  /** Why the navigation drawer closed. */
  reason: CloseReason;
}

/**
 * @label Site Header
 * @tag wc-site-header
 * @rawTag site-header
 *
 * @summary The top navigation bar of a website or portal: brand, links, menus and actions.
 * @overview
 * <p>Site header is the banner of a site: the brand at the start, the site's navigation, and actions
 * such as Sign in or a call to action at the end. It is for websites and portals. For an
 * application's own chrome use <code>wc-app-bar</code>, and for a bar at the bottom of a phone
 * screen <code>wc-navigation-bar</code>.</p>
 * <p>Put <code>wc-site-nav-link</code> elements in it for destinations and
 * <code>wc-site-nav-menu</code> elements for sections with several pages. A menu is a disclosure
 * button that opens a panel of links, as a list or, with <code>layout="columns"</code>, as columns
 * of <code>wc-site-nav-group</code> with a featured card. These are links and disclosure buttons,
 * not an ARIA menu, so Tab moves through them as through any links.</p>
 * <p>When the header is narrower than <code>collapse-at</code> (720px by default), or too narrow
 * for the bar's content to fit, the links and
 * menus move into a drawer that slides in from the start edge, opened by a menu button. The
 * <code>actions</code> slot moves to the bottom of the drawer; the <code>end</code> slot stays in
 * the bar, for something that must always show, such as a user menu or one short button.</p>
 * <p>A visually hidden <em>Skip to main content</em> link is the first focusable element. It moves
 * focus to <code>skip-target</code> (<code>#main</code> by default).</p>
 *
 * @slot brand - The site's logo and name, usually a link to the home page.
 * @slot - The navigation: `wc-site-nav-link` and `wc-site-nav-menu` elements.
 * @slot actions - Buttons at the end of the bar, such as Sign in and a call to action. They move to the bottom of the drawer when the header is collapsed.
 * @slot end - Content that always stays in the bar, such as a `wc-user-menu`, a search button or one short call to action.
 *
 * @fires {CustomEvent} open - Dispatched when the navigation drawer opens on a narrow header.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Dispatched when the navigation drawer closes: Escape, a click on the scrim, choosing a link, or `hideDrawer()` (and widening the header past `collapse-at`).
 *
 * @csspart bar - The `<header>` bar.
 * @csspart nav - The navigation landmark in the bar.
 * @csspart skip-link - The skip link.
 * @csspart menu-button - The button that opens the drawer.
 * @csspart drawer - The drawer `<dialog>` on a narrow header.
 *
 * @cssprop --site-header-height - Height of the bar. Defaults to 4rem.
 * @cssprop --site-header-background - Background of the bar. Defaults to `--color-surface`.
 * @cssprop --site-header-max-width - Width the bar's content is centred in, for a full-bleed background with a narrower content column. Defaults to `none`.
 * @cssprop --site-header-z-index - Stacking order of the header and its panels. Defaults to 10.
 * @cssprop --site-header-drawer-width - Width of the drawer. Defaults to 22.5rem.
 *
 * @example
 * ```html
 * <wc-site-header>
 *   <a slot="brand" href="/">Redvars</a>
 *   <wc-site-nav-menu label="Solutions">
 *     <wc-site-nav-link href="/itsm">IT service management</wc-site-nav-link>
 *     <wc-site-nav-link href="/support">Customer support</wc-site-nav-link>
 *   </wc-site-nav-menu>
 *   <wc-site-nav-link href="/docs" current>Docs</wc-site-nav-link>
 *   <wc-site-nav-link href="/pricing">Pricing</wc-site-nav-link>
 *   <wc-link-button slot="actions" variant="text" href="/sign-in">Sign in</wc-link-button>
 *   <wc-link-button slot="actions" href="/waitlist">Join the waitlist</wc-link-button>
 * </wc-site-header>
 * ```
 * @example
 * ```html
 * <wc-site-header sticky hide-on-scroll>
 *   <a slot="brand" href="/p/support">Acme Support</a>
 *   <wc-site-nav-link href="/p/support" current>Home</wc-site-nav-link>
 *   <wc-site-nav-link href="/p/support/tickets">My tickets</wc-site-nav-link>
 *   <wc-user-menu slot="end" name="Ada Lovelace"></wc-user-menu>
 * </wc-site-header>
 * ```
 * @tags navigation layout
 */
@IndividualComponent
export class SiteHeader extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  static Menu = SiteNavMenu;

  static Group = SiteNavGroup;

  static Link = SiteNavLink;

  // ── Properties ───────────────────────────────────────────────────────────

  /** Accessible name of the navigation landmark. Defaults to Peacock's "Main navigation". */
  @property() label = '';

  /** Header width in pixels below which the navigation moves into a drawer. The header also collapses whenever the bar's content does not fit. */
  @property({ type: Number, attribute: 'collapse-at' }) collapseAt = 720;

  /** Keeps the header at the top of the viewport while the page scrolls. */
  @property({ type: Boolean, reflect: true }) sticky = false;

  /** With `sticky`, slides the header away while scrolling down and back while scrolling up. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-on-scroll' })
  hideOnScroll = false;

  /** Selector of the element the skip link moves focus to. */
  @property({ attribute: 'skip-target' }) skipTarget = '#main';

  /** Opens a menu's panel when a mouse rests on it, as well as on click. */
  @property({ type: Boolean, reflect: true, attribute: 'open-on-hover' })
  openOnHover = false;

  /** Whether the navigation drawer is open. Only has an effect while the header is collapsed. */
  @property({ type: Boolean, reflect: true, attribute: 'drawer-open' })
  drawerOpen = false;

  // ── State ────────────────────────────────────────────────────────────────

  /** Whether the header is narrower than `collapse-at`. */
  @state() private compact = false;

  /** Whether the header has slid away while scrolling down. */
  @state() private scrolledAway = false;

  /** Which slots have content. */
  @state() private filled = { nav: false, actions: false, end: false };

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.drawer') private dialogElement?: HTMLDialogElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the skip link, the menu button and the landmark. */
  private readonly i18n = new I18nController(this);

  private readonly overlay = new OverlayController(this, {
    surface: () => this.dialogElement,
    modal: true,
    initialFocus: () => {
      const links = Array.from(
        this.querySelectorAll<SiteNavLink>('wc-site-nav-link'),
      ).filter(link => !link.closest('wc-site-nav-menu:not([open])'));
      return (
        links.find(link => link.current) ??
        this.querySelector<HTMLElement>(
          ':scope > wc-site-nav-link, :scope > wc-site-nav-menu',
        )
      );
    },
    requestClose: reason => this.closeDrawer(reason),
  });

  /** Watches the header's width against `collapse-at`. */
  private resizeObserver?: ResizeObserver;

  /** Watches the children, since a slot that is not rendered fires no `slotchange`. */
  private readonly childObserver = new MutationObserver(() => {
    this.syncSlots();
    syncCollapsed(this, this.compact);
  });

  /** The last measured width of the header. */
  private width = 0;

  /** The header width the bar's content needs, measured while it was last shown wide. */
  private neededWidth = 0;

  /** Watches the bar's parts, whose width changes as links render, fonts load or text changes. */
  private contentObserver?: ResizeObserver;

  /** Pending measurement after the bar's parts changed size. */
  private fitTimer?: ReturnType<typeof setTimeout>;

  /** Scroll position at the last scroll event, to tell the direction. */
  private lastScrollY = 0;

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
      attributes: true,
      attributeFilter: ['slot'],
    });
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(entries => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        this.width = entry.contentRect.width;
        if (!this.compact) this.measureFit();
        this.syncCompact();
      });
      this.resizeObserver.observe(this);
      // On the next task: measuring here could resize what is observed in the same frame.
      this.contentObserver = new ResizeObserver(() => {
        clearTimeout(this.fitTimer);
        this.fitTimer = setTimeout(() => {
          if (!this.isConnected || this.compact) return;
          this.measureFit();
          this.syncCompact();
        });
      });
    }
    window.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  override disconnectedCallback() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.contentObserver?.disconnect();
    this.contentObserver = undefined;
    clearTimeout(this.fitTimer);
    this.childObserver.disconnect();
    window.removeEventListener('scroll', this.handleScroll);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues) {
    // Measure now on the first render, so a narrow screen never flashes the wide bar.
    if (!this.hasUpdated || changed.has('collapseAt')) {
      this.width = this.getBoundingClientRect().width;
      this.syncCompact();
    }
    // Widening past `collapse-at` closes the drawer; the bar shows the links instead.
    if (
      changed.has('compact') &&
      changed.get('compact') === true &&
      !this.compact &&
      this.drawerOpen
    ) {
      this.closeReason = 'api';
      this.drawerOpen = false;
    }
    if (!this.hideOnScroll || !this.sticky) this.scrolledAway = false;
  }

  protected override updated(changed: PropertyValues) {
    if (changed.has('compact')) {
      syncCollapsed(this, this.compact);
      this.close();
    }
    if (!this.compact) {
      this.renderRoot
        .querySelectorAll('.brand, .nav, .actions, .end')
        .forEach(part => this.contentObserver?.observe(part));
      this.measureFit();
      this.syncCompact();
    }
    this.toggleAttribute('data-scrolled-away', this.scrolledAway);
    if (changed.has('drawerOpen') || changed.has('compact')) {
      this.overlay.sync(this.drawerShown);
    }
    const shown = this.drawerShown;
    if (this.announcedOpen === undefined) {
      // `drawer-open` set in markup is not a user action.
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
        new CustomEvent<SiteHeaderCloseDetail>('close', {
          detail: { reason: this.closeReason },
          bubbles: true,
          composed: true,
        }),
      );
    }
    this.closeReason = 'api';
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Whether the header is narrower than `collapse-at`, with its navigation in the drawer. */
  get collapsed(): boolean {
    return this.compact;
  }

  /** Opens the navigation drawer (while collapsed). */
  showDrawer() {
    this.drawerOpen = true;
  }

  /** Closes the navigation drawer. */
  hideDrawer() {
    this.closeDrawer('api');
  }

  /** Closes every open menu panel in the bar. */
  close() {
    if (this.compact) return;
    for (const menu of this.querySelectorAll<SiteNavMenu>(NAV_PARTS.menu)) {
      menu.open = false;
    }
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** Whether the drawer is showing right now. */
  private get drawerShown() {
    return this.compact && this.drawerOpen;
  }

  private closeDrawer(reason: CloseReason) {
    if (!this.drawerOpen) return;
    this.closeReason = reason;
    this.drawerOpen = false;
  }

  private syncCompact() {
    if (this.width <= 0) return;
    this.compact = this.width < Math.max(this.collapseAt, this.neededWidth);
  }

  /**
   * Measures the width the wide bar's content needs: the brand, links, actions and end at their
   * natural widths, with the gaps and padding. The header collapses below it, as below
   * `collapse-at`, so links never run into the actions.
   */
  private measureFit() {
    const inner = this.renderRoot.querySelector<HTMLElement>('.inner');
    if (!inner || !inner.clientWidth) return;
    const style = getComputedStyle(inner);
    const gap = parseFloat(style.columnGap) || 0;
    const padding =
      (parseFloat(style.paddingInlineStart) || 0) +
      (parseFloat(style.paddingInlineEnd) || 0);
    const parts = Array.from(inner.children).filter(
      (part): part is HTMLElement =>
        part instanceof HTMLElement &&
        !part.hidden &&
        getComputedStyle(part).display !== 'none',
    );
    const content = parts.reduce(
      (sum, part) =>
        part.classList.contains('spacer')
          ? sum
          : sum + part.getBoundingClientRect().width,
      0,
    );
    const needed = content + gap * Math.max(0, parts.length - 1) + padding;
    // In header widths, since a max-width can make the bar narrower than the header.
    this.neededWidth = Math.ceil(needed + (this.width - inner.clientWidth));
  }

  /** Reads which slots have content from the light DOM, so it does not depend on what is rendered. */
  private syncSlots = () => {
    const children = Array.from(this.children);
    const filled = {
      nav: children.some(child => !child.hasAttribute('slot')),
      actions: children.some(child => child.getAttribute('slot') === 'actions'),
      end: children.some(child => child.getAttribute('slot') === 'end'),
    };
    if (
      filled.nav !== this.filled.nav ||
      filled.actions !== this.filled.actions ||
      filled.end !== this.filled.end
    ) {
      this.filled = filled;
    }
  };

  private handleScroll = () => {
    const y = window.scrollY;
    const delta = y - this.lastScrollY;
    this.lastScrollY = y;
    if (!this.sticky || !this.hideOnScroll || this.drawerShown) return;
    if (delta < 0 || y <= this.offsetHeight) {
      this.scrolledAway = false;
      return;
    }
    // Never slide away from under focus or an open panel.
    const busy =
      this.matches(':focus-within') ||
      !!this.querySelector(`${NAV_PARTS.menu}[open]`);
    if (delta > 0 && !busy) this.scrolledAway = true;
  };

  /**
   * Fragment links do not reach elements inside shadow roots, so move focus directly. The target is
   * looked for beside the header first, for a header in an app's own shadow root, then in the page.
   */
  private handleSkipClick(event: MouseEvent) {
    let target: HTMLElement | null = null;
    try {
      const root = this.getRootNode() as Document | ShadowRoot;
      target =
        root.querySelector<HTMLElement>(this.skipTarget) ??
        document.querySelector<HTMLElement>(this.skipTarget);
    } catch {
      target = null;
    }
    if (!target) return;
    event.preventDefault();
    if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
    }
    target.focus();
  }

  private handleMenuButtonClick() {
    if (this.drawerOpen) this.hideDrawer();
    else this.showDrawer();
  }

  private handleCloseButtonClick() {
    this.closeDrawer('action');
  }

  /** Choosing a link in the drawer closes it. */
  private handleDrawerLinkClick(event: MouseEvent) {
    const link = event
      .composedPath()
      .find(
        target => target instanceof Element && target.matches(NAV_PARTS.link),
      );
    if (link) this.closeDrawer('action');
  }

  /** The native Escape `cancel`: keep `drawer-open` in charge. */
  private handleCancel(event: Event) {
    event.preventDefault();
    this.closeDrawer('escape');
  }

  /** The browser closed the dialog on its own: keep `drawer-open` in step. */
  private handleNativeClose(event: Event) {
    if (event.target !== this.dialogElement) return;
    if (this.overlay.takeOwnClose()) return;
    this.closeDrawer('escape');
  }

  /** A click outside the drawer's box lands on its backdrop: a light dismiss. */
  private handleDialogClick(event: MouseEvent) {
    const dialog = this.dialogElement;
    if (!dialog) return;
    if (event.target !== dialog) {
      this.handleDrawerLinkClick(event);
      return;
    }
    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) this.closeDrawer('light-dismiss');
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderMenuButton() {
    if (!this.compact || !this.filled.nav) return nothing;
    return html`<wc-icon-button
      class="menu-button"
      part="menu-button"
      variant="text"
      shape="round"
      aria-label=${this.i18n.t('openMenu')}
      aria-expanded=${String(this.drawerOpen)}
      aria-controls="drawer"
      @click=${this.handleMenuButtonClick}
    >
      <wc-icon name="menu"></wc-icon>
    </wc-icon-button>`;
  }

  private renderDrawer() {
    if (!this.compact) return nothing;
    const label = this.label || this.i18n.t('mainNavigation');
    // The scrim click has its keyboard equivalent in Escape, which the overlay controller handles.
    /* eslint-disable lit-a11y/click-events-have-key-events */
    return html`<dialog
      id="drawer"
      class="drawer"
      part="drawer"
      aria-label=${label}
      @cancel=${this.handleCancel}
      @close=${this.handleNativeClose}
      @click=${this.handleDialogClick}
    >
      <div class="drawer-header">
        <wc-icon-button
          class="close-button"
          variant="text"
          shape="round"
          aria-label=${this.i18n.t('close')}
          @click=${this.handleCloseButtonClick}
        >
          <wc-icon name="close"></wc-icon>
        </wc-icon-button>
      </div>
      <nav class="drawer-nav" aria-label=${label}>
        <slot @slotchange=${this.syncSlots}></slot>
      </nav>
      <div class="drawer-actions" ?hidden=${!this.filled.actions}>
        <slot name="actions" @slotchange=${this.syncSlots}></slot>
      </div>
    </dialog>`;
    /* eslint-enable lit-a11y/click-events-have-key-events */
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const label = this.label || this.i18n.t('mainNavigation');
    return html`
      <a
        class="skip-link"
        part="skip-link"
        href=${this.skipTarget}
        @click=${this.handleSkipClick}
        >${this.i18n.t('skipToMainContent')}</a
      >
      <header
        class=${classMap({ bar: true, compact: this.compact })}
        part="bar"
      >
        <div class="inner">
          <div class="brand"><slot name="brand"></slot></div>
          ${this.compact
            ? html`<span class="spacer"></span>`
            : html`<nav class="nav" part="nav" aria-label=${label}>
                  <slot @slotchange=${this.syncSlots}></slot>
                </nav>
                <span class="spacer"></span>
                <div class="actions" ?hidden=${!this.filled.actions}>
                  <slot name="actions" @slotchange=${this.syncSlots}></slot>
                </div>`}
          <div class="end" ?hidden=${!this.filled.end}>
            <slot name="end" @slotchange=${this.syncSlots}></slot>
          </div>
          ${this.renderMenuButton()}
        </div>
      </header>
      ${this.renderDrawer()}
    `;
  }
}
