import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './sidebar-menu-item.scss';

/**
 * @label Sidebar Menu Item
 * @tag wc-sidebar-menu-item
 * @rawTag sidebar-menu-item
 * @parentRawTag sidebar-menu
 * @summary A sidebar menu item represents a selectable leaf item in the sidebar navigation tree.
 *
 * @example
 * ```html
 * <wc-sidebar-menu>
 *   <wc-sidebar-sub-menu label="Parent" expanded>
 *     <wc-sidebar-menu-item label="Child"></wc-sidebar-menu-item>
 *   </wc-sidebar-sub-menu>
 * </wc-sidebar-menu>
 * ```
 * @tags navigation
 */
export class SidebarMenuItem extends LitElement {
  static styles = [styles];

  /**
   * The value used to identify this item when selected.
   */
  @property({ type: String, reflect: true })
  value: string = '';

  /**
   * The display label for this item.
   */
  @property({ type: String, reflect: true })
  label: string = '';

  /**
   * Optional icon name to display before the label.
   */
  @property({ type: String, reflect: true })
  icon: string = '';

  /**
   * Optional hyperlink to navigate to on click.
   */
  @property({ type: String, reflect: true })
  href: string = '';

  /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @property({ type: String, reflect: true })
  target: string = '_self';

  /**
   * If true, the user cannot interact with the item.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /**
   * Whether the item is currently selected.
   */
  @property({ type: Boolean, reflect: true })
  selected: boolean = false;

  /**
   * The nesting depth level (set automatically by the parent sidebar-menu).
   */
  @property({ type: Number, reflect: true })
  level: number = 0;

  @query('.sidebar-menu-item-content')
  private readonly _nativeElement!: HTMLElement | null;

  override focus() {
    this._nativeElement?.focus();
  }

  override blur() {
    this._nativeElement?.blur();
  }

  private _onClick = () => {
    if (this.disabled) return;

    this.dispatchEvent(
      new CustomEvent('sidebar-menu-item:click', {
        bubbles: true,
        composed: true,
        detail: { value: this.value, label: this.label },
      }),
    );
  };

  override render() {
    const classes = classMap({
      'sidebar-menu-item': true,
      disabled: this.disabled,
      selected: this.selected,
    });

    const content = html`
      <wc-focus-ring class="focus-ring" for="item"></wc-focus-ring>
      <div class="background"></div>
      <wc-ripple class="ripple"></wc-ripple>
      <div class="sidebar-menu-item-content">
        ${this.icon ? html`<wc-icon name="${this.icon}"></wc-icon>` : ''}
        <span class="sidebar-menu-item-label">${this.label}</span>
      </div>
    `;

    if (this.href) {
      return html`
        <a
          id="item"
          href="${this.href}"
          target="${this.target}"
          class="${classes}"
          aria-disabled="${this.disabled}"
          tabindex="${this.disabled ? -1 : 0}"
          @click="${this._onClick}"
        >
          ${content}
        </a>
      `;
    }

    return html`
      <div
        id="item"
        class="${classes}"
        role="treeitem"
        aria-label="${this.label}"
        aria-selected="${String(this.selected)}"
        aria-disabled="${this.disabled}"
        tabindex="${this.disabled ? -1 : 0}"
        @click="${this._onClick}"
        @keydown="${(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this._onClick();
          }
        }}"
      >
        ${content}
      </div>
    `;
  }
}
