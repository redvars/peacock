import { html, LitElement, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import {
  adoptCollapsed,
  COLLAPSED_ATTRIBUTE,
  NAV_PARTS,
} from './site-nav-shared.js';
import styles from './site-nav-menu.scss';

/** Why a menu's panel closed. */
export type SiteNavMenuCloseReason = 'action' | 'escape' | 'light-dismiss';

/** Detail of the `close` event. */
export interface SiteNavMenuCloseDetail {
  /** Why the panel closed. */
  reason: SiteNavMenuCloseReason;
}

/** How long a mouse rests on a menu before it opens, and is away before it closes (`open-on-hover`). */
const HOVER_OPEN_DELAY = 120;
const HOVER_CLOSE_DELAY = 250;

/**
 * @label Site Nav Menu
 * @tag wc-site-nav-menu
 * @rawTag site-nav-menu
 *
 * @summary A section of a site header that opens a panel of links.
 * @overview
 * <p>A disclosure button in a <code>wc-site-header</code> that shows a panel of
 * <code>wc-site-nav-link</code> elements under the bar. The default <code>layout="list"</code> is a
 * short list under the button. <code>layout="columns"</code> is a wide panel of
 * <code>wc-site-nav-group</code> columns, with an optional featured card in the
 * <code>feature</code> slot.</p>
 * <p>It follows the disclosure navigation pattern, not the ARIA menu pattern: the button has
 * <code>aria-expanded</code>, and the links follow it in the Tab order while the panel is open.
 * Click, Enter or Space opens the panel; Escape closes it and returns focus to the button, and so
 * does a click outside or moving focus out of it. Only one menu in a header is open at a time.
 * Arrow Down on the button opens the panel at its first link, and the arrow keys, Home and End move
 * between the links.</p>
 * <p>The menu shows as current when one of its links is <code>current</code>. When the header is
 * collapsed into its drawer, the menu becomes an expandable section of the drawer, expanded when it
 * holds the current page.</p>
 *
 * @slot - The panel's `wc-site-nav-link` and `wc-site-nav-group` elements.
 * @slot feature - A card shown at the end of a `columns` panel, such as a `wc-card` announcing news. Left out of the drawer.
 *
 * @fires {CustomEvent} open - Dispatched when the person opens the panel.
 * @fires {CustomEvent<{reason: 'action' | 'escape' | 'light-dismiss'}>} close - Dispatched when the person closes the panel: the button, Escape, or a click or focus outside.
 *
 * @csspart trigger - The disclosure button.
 * @csspart panel - The panel of links.
 *
 * @cssprop --site-nav-menu-panel-width - Width of a `list` panel. Defaults to 16rem.
 * @cssprop --site-nav-menu-columns-max-width - Widest a `columns` panel grows. Defaults to 60rem.
 *
 * @example
 * ```html
 * <wc-site-nav-menu label="Product" layout="columns">
 *   <wc-site-nav-group label="Build">
 *     <wc-site-nav-link href="/tables" description="Describe data, get secured screens">
 *       <wc-icon slot="icon" name="table"></wc-icon>Tables and forms
 *     </wc-site-nav-link>
 *   </wc-site-nav-group>
 *   <wc-card slot="feature" href="/blog/1-0">…</wc-card>
 * </wc-site-nav-menu>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class SiteNavMenu extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = [styles];

  static override get observedAttributes() {
    return [...super.observedAttributes, COLLAPSED_ATTRIBUTE];
  }

  // ── Properties ───────────────────────────────────────────────────────────

  /** The button's text. */
  @property() label = '';

  /** Whether the panel is open. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** `"list"`: a short list under the button; `"columns"`: a wide panel of groups. */
  @property({ reflect: true }) layout: 'list' | 'columns' = 'list';

  // ── State ────────────────────────────────────────────────────────────────

  /** True when the `feature` slot has content. */
  @state() private hasFeature = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('#trigger') private triggerElement?: HTMLButtonElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Pending open or close from `open-on-hover`. */
  private hoverTimer?: ReturnType<typeof setTimeout>;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    adoptCollapsed(this);
  }

  override disconnectedCallback() {
    this.stopListeningOutside();
    clearTimeout(this.hoverTimer);
    super.disconnectedCallback();
  }

  override attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null,
  ) {
    super.attributeChangedCallback(name, old, value);
    // In the drawer, a menu starts expanded when it holds the current page; in the bar, closed.
    if (name === COLLAPSED_ATTRIBUTE && (old === null) !== (value === null)) {
      this.open = value !== null && this.holdsCurrent();
    }
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('open')) {
      if (this.open && !this.collapsed) this.listenOutside();
      else this.stopListeningOutside();
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.triggerElement?.focus();
  }

  override blur() {
    this.triggerElement?.blur();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** Whether the header has moved the navigation into its drawer. */
  private get collapsed() {
    return this.hasAttribute(COLLAPSED_ATTRIBUTE);
  }

  private holdsCurrent(): boolean {
    return Array.from(this.querySelectorAll(NAV_PARTS.link)).some(
      link =>
        link.hasAttribute('current') || (link as { current?: boolean }).current,
    );
  }

  private links(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>(NAV_PARTS.link));
  }

  private header(): (HTMLElement & { openOnHover?: boolean }) | null {
    return this.closest(NAV_PARTS.header);
  }

  /** Opens or closes as the person asked, and says so. */
  private setOpen(open: boolean, reason: SiteNavMenuCloseReason = 'action') {
    if (open === this.open) return;
    this.open = open;
    if (open) {
      // One panel at a time in the bar.
      if (!this.collapsed) {
        this.header()
          ?.querySelectorAll<SiteNavMenu>(`${NAV_PARTS.menu}[open]`)
          .forEach(menu => {
            if (menu !== this) menu.setOpen(false, 'light-dismiss');
          });
      }
      this.dispatchEvent(new CustomEvent('open'));
    } else {
      this.dispatchEvent(
        new CustomEvent<SiteNavMenuCloseDetail>('close', {
          detail: { reason },
        }),
      );
    }
  }

  private listenOutside() {
    document.addEventListener(
      'pointerdown',
      this.handleDocumentPointerDown,
      true,
    );
  }

  private stopListeningOutside() {
    document.removeEventListener(
      'pointerdown',
      this.handleDocumentPointerDown,
      true,
    );
  }

  private handleDocumentPointerDown = (event: PointerEvent) => {
    if (!event.composedPath().includes(this)) {
      this.setOpen(false, 'light-dismiss');
    }
  };

  private handleTriggerClick() {
    this.setOpen(!this.open);
  }

  private handleKeydown(event: KeyboardEvent) {
    if (this.collapsed) return;
    const path = event.composedPath();
    const onTrigger =
      !!this.triggerElement && path.includes(this.triggerElement);
    if (event.key === 'Escape' && this.open) {
      event.preventDefault();
      event.stopPropagation();
      this.setOpen(false, 'escape');
      this.triggerElement?.focus();
      return;
    }
    const links = this.links();
    if (!links.length) return;
    if (onTrigger) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.setOpen(true);
        this.updateComplete.then(() => links[0]?.focus());
      }
      return;
    }
    const index = links.findIndex(link => path.includes(link));
    if (index < 0) return;
    let next: number | undefined;
    if (event.key === 'ArrowDown') next = (index + 1) % links.length;
    else if (event.key === 'ArrowUp')
      next = (index - 1 + links.length) % links.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = links.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    links[next]?.focus();
  }

  /** Focus leaving the menu (to the next link in the bar, say) closes its panel. */
  private handleFocusOut(event: FocusEvent) {
    if (this.collapsed || !this.open) return;
    const next = event.relatedTarget as Node | null;
    if (!next) return;
    if (this.contains(next) || this.shadowRoot?.contains(next)) return;
    this.setOpen(false, 'light-dismiss');
  }

  private handlePointerEnter(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || this.collapsed) return;
    if (!this.header()?.openOnHover) return;
    clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(() => this.setOpen(true), HOVER_OPEN_DELAY);
  }

  private handlePointerLeave(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || this.collapsed) return;
    if (!this.header()?.openOnHover) return;
    clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(
      () => this.setOpen(false, 'light-dismiss'),
      HOVER_CLOSE_DELAY,
    );
  }

  private handleFeatureSlotChange(event: Event) {
    this.hasFeature =
      (event.target as HTMLSlotElement).assignedElements().length > 0;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const current = this.holdsCurrent();
    // Keyboard handling is for the button and the links inside; the wrapper only listens.
    return html`<div
      class=${classMap({ menu: true, open: this.open, current })}
      @keydown=${this.handleKeydown}
      @focusout=${this.handleFocusOut}
      @pointerenter=${this.handlePointerEnter}
      @pointerleave=${this.handlePointerLeave}
    >
      <button
        id="trigger"
        class="trigger"
        part="trigger"
        type="button"
        aria-expanded=${this.open ? 'true' : 'false'}
        aria-controls="panel"
        @click=${this.handleTriggerClick}
      >
        <wc-focus-ring class="focus-ring" for="trigger"></wc-focus-ring>
        <span class="label">${this.label}</span>
        <wc-icon
          class="chevron"
          name="keyboard_arrow_down"
          aria-hidden="true"
        ></wc-icon>
      </button>
      <div
        id="panel"
        class=${classMap({ panel: true, 'has-feature': this.hasFeature })}
        part="panel"
        ?hidden=${!this.open}
      >
        <div class="content"><slot></slot></div>
        <div class="feature" ?hidden=${!this.hasFeature}>
          <slot
            name="feature"
            @slotchange=${this.handleFeatureSlotChange}
          ></slot>
        </div>
      </div>
    </div>`;
  }
}
