import { css, html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import type { MenuItem } from '../menu/menu-item/menu-item.js';

/**
 * @label Select Option
 * @tag wc-option
 * @rawTag option
 * @parentRawTag select
 *
 * @summary A declarative option element for use inside wc-select.
 *
 * @example
 * ```html
 * <wc-select label="Fruit">
 *   <wc-option value="apple">Apple</wc-option>
 *   <wc-option value="banana">Banana</wc-option>
 * </wc-select>
 * ```
 */
export class SelectOptionElement extends LitElement {
  static override styles = [
    css`
      :host([filtered]) {
        display: none;
      }
    `,
  ];

  /**
   * The option's submitted value.
   */
  @property({ type: String, reflect: true })
  value: string = '';

  /**
   * Optional Material Symbol icon name shown before the label.
   */
  @property({ type: String, reflect: true })
  icon: string = '';

  /**
   * Disables the option so it cannot be selected.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  // ── Managed by wc-select ──────────────────────────────────────────────────

  /** Reflects whether this option is currently selected. Set by wc-select. */
  @property({ type: Boolean, reflect: true })
  selected: boolean = false;

  /**
   * When true the menu stays open after selection (used for multi-select).
   * Set by wc-select.
   */
  @property({ type: Boolean, attribute: 'keep-open' })
  keepOpen: boolean = false;

  /**
   * When true the option is hidden and excluded from keyboard navigation
   * because it does not match the current typeahead search query.
   * Set by wc-select.
   */
  @property({ type: Boolean, reflect: true })
  filtered: boolean = false;

  @query('wc-menu-item')
  private readonly _menuItemEl?: HTMLElement;

  /**
   * Returns the inner `wc-menu-item` element.
   * `wc-menu` discovers this via its `items` getter which checks `el.item`
   * as a `MenuItem` proxy, so keyboard navigation and activation work
   * without `wc-option` extending `MenuItem` directly.
   */
  get item(): MenuItem | null {
    const el = this._menuItemEl;
    // Narrow to MenuItem — the shadow DOM only ever contains a wc-menu-item
    // (a MenuItem subclass), so this cast is safe by construction.
    return el != null ? (el as unknown as MenuItem) : null;
  }

  override render() {
    return html`
      <wc-menu-item
        value=${this.value}
        ?disabled=${this.disabled || this.filtered}
        ?selected=${this.selected}
        ?keep-open=${this.keepOpen}
      >
        ${this.icon
          ? html`<wc-icon name=${this.icon} slot="leading-icon"></wc-icon>`
          : nothing}
        <slot></slot>
        ${this.selected && this.keepOpen
          ? html`<wc-icon
              name="check"
              slot="trailing-supporting-text"
            ></wc-icon>`
          : nothing}
      </wc-menu-item>
    `;
  }
}
