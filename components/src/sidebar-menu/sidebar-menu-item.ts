import { html, LitElement, nothing } from 'lit';
import IndividualComponent from '@/IndividualComponent.js';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import styles from './sidebar-menu-item.scss';

/**
 * @label Sidebar Menu Item
 * @tag wc-sidebar-menu-item
 * @rawTag sidebar-menu-item
 * @summary Deprecated: use `wc-navigation-drawer-item`. A selectable leaf item in the sidebar menu.
 * @overview
 * <p><strong>Deprecated.</strong> Use <code>wc-navigation-drawer-item</code> instead; this element
 * keeps working until 4.0 and logs a warning.</p>
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
@IndividualComponent
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

  /** The focusable element: the link or the treeitem, both rendered with `id="item"`. */
  @query('#item')
  private readonly _nativeElement!: HTMLElement | null;

  override connectedCallback() {
    super.connectedCallback();
    deprecate(
      'wc-sidebar-menu-item',
      '<wc-sidebar-menu-item>',
      '<wc-navigation-drawer-item>',
    );
  }

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
      <span class="background"></span>
      <wc-ripple class="ripple"></wc-ripple>
      <span class="sidebar-menu-item-content">
        ${this.icon ? html`<wc-icon name="${this.icon}"></wc-icon>` : ''}
        <span class="sidebar-menu-item-label">${this.label}</span>
      </span>
    `;

    if (this.href) {
      return html`
        <a
          id="item"
          href="${this.href}"
          target="${this.target}"
          class="${classes}"
          aria-current=${this.selected ? 'page' : nothing}
          aria-disabled=${this.disabled ? 'true' : nothing}
          tabindex="${this.disabled ? -1 : 0}"
          @click="${this._onClick}"
        >
          ${content}
        </a>
      `;
    }

    // A button, not a `treeitem`: the tree's items live in separate shadow roots, so the tree
    // pattern could not hold together. Enter and Space activate it natively.
    return html`
      <button
        id="item"
        class="${classes}"
        aria-current=${this.selected ? 'page' : nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
        tabindex="${this.disabled ? -1 : 0}"
        @click="${this._onClick}"
      >
        ${content}
      </button>
    `;
  }
}
