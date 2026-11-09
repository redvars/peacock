import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import IndividualComponent from '@/IndividualComponent.js';
import { adoptCollapsed, NAV_PARTS } from './site-nav-shared.js';
import styles from './site-nav-link.scss';

/**
 * @label Site Nav Link
 * @tag wc-site-nav-link
 * @rawTag site-nav-link
 *
 * @summary A destination in a site header, in the bar or in a menu's panel.
 * @overview
 * <p>A link of a <code>wc-site-header</code>. In the bar it is a compact text link; inside a
 * <code>wc-site-nav-menu</code> it is a row that can show an icon and a description. Mark the page
 * the person is on with <code>current</code>, which sets <code>aria-current="page"</code>.</p>
 * <p>It renders a real <code>&lt;a&gt;</code>, so middle-click, Open in new tab and a router that
 * listens for clicks on links all work.</p>
 *
 * @slot - The link's text.
 * @slot icon - An optional icon, shown in a menu's panel.
 *
 * @csspart link - The `<a>` element.
 * @csspart description - The description text.
 *
 * @example
 * ```html
 * <wc-site-nav-link href="/docs" current>Docs</wc-site-nav-link>
 * ```
 * @example
 * ```html
 * <wc-site-nav-link href="/rules" description="Business logic without servers">
 *   <wc-icon slot="icon" name="rule"></wc-icon>
 *   Rules
 * </wc-site-nav-link>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class SiteNavLink extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The link's address. */
  @property() href = '';

  /** Where to open the link, as on `<a>`. */
  @property() target?: string;

  /** Relationship to the linked page, as on `<a>`. */
  @property() rel?: string;

  /** Marks the page the person is on (`aria-current="page"`). */
  @property({ type: Boolean, reflect: true }) current = false;

  /** A line under the label, shown in a menu's panel. */
  @property() description = '';

  // ── State ────────────────────────────────────────────────────────────────

  /** True when the `icon` slot has content. */
  @state() private hasIcon = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('a') private linkElement?: HTMLAnchorElement;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    adoptCollapsed(this);
    this.toggleAttribute(
      'data-in-menu',
      !!this.parentElement?.closest(NAV_PARTS.menu),
    );
  }

  protected override updated(changed: PropertyValues<this>) {
    // A menu marks itself current when it holds the current page.
    if (changed.has('current')) {
      const menu = this.closest(NAV_PARTS.menu) as LitElement | null;
      menu?.requestUpdate();
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.linkElement?.focus();
  }

  override blur() {
    this.linkElement?.blur();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private handleIconSlotChange(event: Event) {
    this.hasIcon =
      (event.target as HTMLSlotElement).assignedElements().length > 0;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`<a
      id="link"
      class=${classMap({ link: true, 'has-icon': this.hasIcon })}
      part="link"
      href=${this.href}
      target=${ifDefined(this.target)}
      rel=${ifDefined(this.rel)}
      aria-current=${this.current ? 'page' : nothing}
    >
      <wc-focus-ring class="focus-ring" for="link"></wc-focus-ring>
      <span class="icon"
        ><slot name="icon" @slotchange=${this.handleIconSlotChange}></slot
      ></span>
      <span class="text">
        <span class="label"><slot></slot></span>
        ${this.description
          ? html`<span class="description" part="description"
              >${this.description}</span
            >`
          : nothing}
      </span>
    </a>`;
  }
}
