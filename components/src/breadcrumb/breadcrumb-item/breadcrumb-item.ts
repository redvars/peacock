import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './breadcrumb-item.scss';

/**
 * @label Breadcrumb Item
 * @tag p-breadcrumb-item
 * @rawTag breadcrumb-item
 * @summary A breadcrumb item component that represents a single item in a breadcrumb navigation.
 *
 * @example
 * ```html
 * <p-breadcrumb-item href="#">Home</p-breadcrumb-item>
 * <p-breadcrumb-item active>Current Page</p-breadcrumb-item>
 * ```
 * @tags navigation
 */
export class BreadcrumbItem extends LitElement {
  static styles = [styles];

  /**
   * Hyperlink to navigate to on click.
   */
  @property({ reflect: true }) href?: string;

  /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @property() target?: string;

  /**
   * Indicates if this is the active (current) breadcrumb item.
   */
  @property({ type: Boolean, reflect: true }) active = false;

  /**
   * Custom separator character. If not provided, default "/" is used.
   */
  @property({ type: String }) separator?: string;

  @state()
  private position = 1;

  connectedCallback() {
    super.connectedCallback();
    this.calculatePosition();
  }

  private calculatePosition() {
    // Calculate position by counting sibling breadcrumb items of the same type
    if (this.parentElement) {
      const items = Array.from(
        this.parentElement.querySelectorAll(this.tagName.toLowerCase()),
      );
      this.position = items.indexOf(this) + 1;
    }
  }

  render() {
    return html`
      <li
        class=${classMap({ 'breadcrumb-item': true, active: this.active })}
        itemprop="itemListElement"
        itemscope
        itemtype="https://schema.org/ListItem"
      >
        ${this.active
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
                ${this.target === '_blank'
                  ? html`rel="noopener noreferrer"`
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
      </li>
    `;
  }
}
