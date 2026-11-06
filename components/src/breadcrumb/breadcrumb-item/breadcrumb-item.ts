import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './breadcrumb-item.scss';
import IndividualComponent from '@/IndividualComponent.js';
import { deprecate } from '@/__internal/utils/deprecate.js';

/**
 * @label Breadcrumb Item
 * @tag wc-breadcrumb-item
 * @rawTag breadcrumb-item
 * @summary A breadcrumb item component that represents a single item in a breadcrumb navigation.
 * @overview
 * <p>The item is the list item of the breadcrumb's list (<code>role="listitem"</code> on the
 * element itself, since the list sits in the breadcrumb's shadow root). Mark the page the user is on
 * with <code>current</code>: it renders as text with <code>aria-current="page"</code>.
 * <code>active</code> is a deprecated alias of <code>current</code> and is removed in 4.0.</p>
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-breadcrumb-item href="#">Home</wc-breadcrumb-item>
 * ```
 */
@IndividualComponent
export class BreadcrumbItem extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * Hyperlink to navigate to on click.
   */
  @property({ reflect: true }) href?: string;

  /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @property() target?: string;

  /** Whether this item is the current page. Sets `aria-current="page"`. */
  @property({ type: Boolean, reflect: true }) current = false;

  /**
   * Deprecated alias of `current`, kept until 4.0.
   * @deprecated Use `current`.
   */
  @property({ type: Boolean, attribute: 'active' })
  get active(): boolean {
    return this.current;
  }

  set active(value: boolean) {
    deprecate('wc-breadcrumb-item', 'active', 'current');
    this.current = value;
  }

  /**
   * Custom separator character. If not provided, default "/" is used.
   */
  @property({ type: String }) separator?: string;

  // ── State ────────────────────────────────────────────────────────────────

  /** 1-based position among sibling breadcrumb items, used for schema.org `ListItem` metadata. */
  @state()
  private position = 1;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    // The breadcrumb's `<ol>` is in its shadow root, so the item itself is the list item.
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
    this.calculatePosition();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private calculatePosition() {
    // Calculate position by counting sibling breadcrumb items
    if (this.parentElement) {
      const items = Array.from(
        this.parentElement.querySelectorAll(':scope > wc-breadcrumb-item'),
      );
      this.position = items.indexOf(this) + 1;
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`
      <div
        class=${classMap({ 'breadcrumb-item': true, active: this.current })}
        itemprop="itemListElement"
        itemscope
        itemtype="https://schema.org/ListItem"
      >
        ${this.current
          ? html`
              <span aria-current="page" itemprop="name">
                <slot></slot>
              </span>
            `
          : html`
              <a
                class="breadcrumb-link"
                itemprop="item"
                href=${ifDefined(this.href)}
                target=${ifDefined(this.target)}
                rel=${this.target === '_blank'
                  ? 'noopener noreferrer'
                  : nothing}
              >
                <span itemprop="name">
                  <slot></slot>
                </span>
              </a>
            `}
        <meta itemprop="position" content=${String(this.position)} />
        ${this.separator
          ? html`<span class="separator" aria-hidden="true"
              >${this.separator}</span
            >`
          : nothing}
      </div>
    `;
  }
}
