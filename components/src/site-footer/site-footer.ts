import { html, LitElement } from 'lit';
import { state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { SiteFooterGroup } from './site-footer-group.js';
import styles from './site-footer.scss';

/**
 * @label Site Footer
 * @tag wc-site-footer
 * @rawTag site-footer
 *
 * @summary The footer of a website or portal: brand, columns of links, legal links and social links.
 * @overview
 * <p>Site footer is the page's <code>contentinfo</code> landmark. The <code>brand</code> slot and
 * the <code>wc-site-footer-group</code> columns sit at the top; a bottom row holds the
 * <code>legal</code> slot (copyright and policy links) and the <code>social</code> slot (icon
 * buttons that link to the site's profiles).</p>
 * <p>Slots that are empty take no room, so the same component is a full website footer or a slim
 * portal footer with one row of text and links.</p>
 * <p>The footer responds to its own width, not the viewport's: narrower than 48rem the columns wrap
 * two to a row, and narrower than 24rem they stack. Links stay visible at every width, one tap away,
 * rather than folded into an accordion.</p>
 *
 * @slot brand - The site's logo and name, and an optional line of text under it.
 * @slot - The footer's `wc-site-footer-group` columns.
 * @slot legal - Copyright and policy links, in small type.
 * @slot social - Links to the site's profiles, usually `wc-icon-button shape="round"` with an `aria-label` each.
 *
 * @csspart base - The `<footer>` element.
 * @csspart top - The row of the brand and the columns.
 * @csspart groups - The columns.
 * @csspart bottom - The row of the legal and social slots.
 *
 * @cssprop --site-footer-background - Background of the footer. Defaults to `--color-surface-container-low`.
 * @cssprop --site-footer-max-width - Width the footer's content is centred in. Defaults to `none`.
 *
 * @example
 * ```html
 * <wc-site-footer>
 *   <a slot="brand" href="/">Redvars</a>
 *   <p slot="brand">Code less. Scale everywhere. Build natively.</p>
 *   <wc-site-footer-group label="Product">
 *     <a href="/tables">Tables and forms</a>
 *     <a href="/pricing">Pricing</a>
 *   </wc-site-footer-group>
 *   <wc-site-footer-group label="Company">
 *     <a href="/about">About</a>
 *     <a href="/blog">Blog</a>
 *   </wc-site-footer-group>
 *   <span slot="legal">© 2026 Redvars</span>
 *   <a slot="legal" href="/privacy">Privacy</a>
 *   <wc-icon-button slot="social" variant="text" shape="round" href="https://github.com/redvars" aria-label="GitHub">
 *     <wc-icon name="code"></wc-icon>
 *   </wc-icon-button>
 * </wc-site-footer>
 * ```
 * @example
 * ```html
 * <wc-site-footer>
 *   <span slot="legal">© Acme Corp. Support hours 08:00–18:00 CET.</span>
 *   <a slot="legal" href="/p/support/contact">Contact us</a>
 *   <a slot="legal" href="/p/support/privacy">Privacy</a>
 * </wc-site-footer>
 * ```
 * @tags navigation layout
 */
@IndividualComponent
export class SiteFooter extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  static Group = SiteFooterGroup;

  // ── State ────────────────────────────────────────────────────────────────

  /** Which slots have content. */
  @state() private filled = {
    brand: false,
    groups: false,
    legal: false,
    social: false,
  };

  // ── Private fields ───────────────────────────────────────────────────────

  /** Watches the children, so the rows show and hide with their content. */
  private readonly childObserver = new MutationObserver(() => this.syncSlots());

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.syncSlots();
    this.childObserver.observe(this, {
      childList: true,
      attributes: true,
      attributeFilter: ['slot'],
    });
  }

  override disconnectedCallback() {
    this.childObserver.disconnect();
    super.disconnectedCallback();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private syncSlots() {
    const slots = Array.from(this.children).map(
      child => child.getAttribute('slot') ?? '',
    );
    const filled = {
      brand: slots.includes('brand'),
      groups: slots.includes(''),
      legal: slots.includes('legal'),
      social: slots.includes('social'),
    };
    const changed = (Object.keys(filled) as (keyof typeof filled)[]).some(
      key => filled[key] !== this.filled[key],
    );
    if (changed) this.filled = filled;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const { brand, groups, legal, social } = this.filled;
    const top = brand || groups;
    return html`<footer
      class=${classMap({ footer: true, slim: !top })}
      part="base"
    >
      <div class="inner">
        <div class="top" part="top" ?hidden=${!top}>
          <div class="brand" ?hidden=${!brand}><slot name="brand"></slot></div>
          <div class="groups" part="groups" ?hidden=${!groups}>
            <slot></slot>
          </div>
        </div>
        <div class="bottom" part="bottom" ?hidden=${!legal && !social}>
          <div class="legal" ?hidden=${!legal}><slot name="legal"></slot></div>
          <div class="social" ?hidden=${!social}>
            <slot name="social"></slot>
          </div>
        </div>
      </div>
    </footer>`;
  }
}
