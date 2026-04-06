import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import styles from './sidebar-sub-menu.scss';

/**
 * @label Sidebar Sub Menu
 * @tag wc-sidebar-sub-menu
 * @rawTag sidebar-sub-menu
 * @parentRawTag sidebar-menu
 * @summary A sidebar sub menu groups sidebar menu items and handles expand/collapse behavior.
 *
 * @example
 * ```html
 * <wc-sidebar-sub-menu label="Parent" expanded>
 *   <wc-sidebar-menu-item label="Child"></wc-sidebar-menu-item>
 * </wc-sidebar-sub-menu>
 * ```
 * @tags navigation
 */
export class SidebarSubMenu extends LitElement {
  static styles = [styles];

  @property({ type: String, reflect: true })
  value: string = '';

  @property({ type: String, reflect: true })
  label: string = '';

  @property({ type: String, reflect: true })
  icon: string = '';

  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  @property({ type: Boolean, reflect: true })
  selected: boolean = false;

  @property({ type: Boolean, reflect: true })
  expanded: boolean = false;

  @property({ type: Number, reflect: true })
  level: number = 0;

  @query('.sidebar-sub-menu-inner')
  private readonly _nativeElement!: HTMLElement | null;

  override focus() {
    this._nativeElement?.focus();
  }

  override blur() {
    this._nativeElement?.blur();
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateChildLevels();
  }

  updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);

    if (changedProps.has('expanded')) {
      this.setAttribute('aria-expanded', String(this.expanded));
      if (this.expanded) {
        this.setAttribute('data-expanded', '');
      } else {
        this.removeAttribute('data-expanded');
      }
    }
  }

  private _getChildNodes(): Element[] {
    return Array.from(this.children).filter(el => {
      const tag = el.tagName.toLowerCase();
      return tag === 'wc-sidebar-menu-item' || tag === 'wc-sidebar-sub-menu';
    });
  }

  private _updateChildLevels = () => {
    this._getChildNodes().forEach(child => {
      if ('level' in child) {
        // eslint-disable-next-line no-param-reassign
        (child as { level: number }).level = this.level + 1;
      }
    });
  };

  private _onClick = () => {
    if (this.disabled) return;

    if (this._getChildNodes().length > 0) {
      this.expanded = !this.expanded;
    }

    this.dispatchEvent(
      new CustomEvent('sidebar-menu-item:click', {
        bubbles: true,
        composed: true,
        detail: { value: this.value, label: this.label },
      }),
    );
  };

  override render() {
    const hasChildren = this._getChildNodes().length > 0;
    const wrapperClasses = classMap({
      'sidebar-sub-menu': true,
    });
    const innerClasses = classMap({
      'sidebar-sub-menu-inner': true,
      disabled: this.disabled,
      selected: this.selected,
    });

    const inlineStyles = styleMap({
      paddingLeft: `calc(var(--sidebar-menu-item-height, 2.5rem) * ${this.level})`,
    });

    return html`
      <div class="${wrapperClasses}" style="${inlineStyles}">
        <div
          id="item"
          class="${innerClasses}"
          role="treeitem"
          aria-label="${this.label}"
          aria-selected="${String(this.selected)}"
          aria-disabled="${this.disabled}"
          aria-expanded="${this.expanded}"
          @click="${this._onClick}"
          @keydown="${(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this._onClick();
            }
          }}"
          tabindex="${this.disabled ? -1 : 0}"
        >
          <wc-focus-ring class="focus-ring" for="item"></wc-focus-ring>
          <div class="background"></div>
          <wc-ripple class="ripple"></wc-ripple>
          <div class="sidebar-sub-menu-content">
            ${this.icon ? html`<wc-icon name="${this.icon}"></wc-icon>` : ''}
            <span class="sidebar-sub-menu-label">${this.label}</span>
          </div>
          ${hasChildren
            ? html`
                <wc-icon class="expand-icon" name="arrow_drop_down" aria-hidden="true"></wc-icon>
              `
            : ''}
        </div>
        <div class="sidebar-sub-menu-children ${(!hasChildren || !this.expanded) ? 'hidden' : ''}">
          <slot @slotchange="${this._updateChildLevels}"></slot>
        </div>
      </div>
    `;
  }
}
