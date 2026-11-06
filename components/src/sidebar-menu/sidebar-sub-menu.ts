import { html, LitElement, nothing } from 'lit';
import IndividualComponent from '@/IndividualComponent.js';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import styles from './sidebar-sub-menu.scss';

/**
 * @label Sidebar Sub Menu
 * @tag wc-sidebar-sub-menu
 * @rawTag sidebar-sub-menu
 * @summary Deprecated: use `wc-navigation-drawer-group`. Groups sidebar menu items and expands or collapses them.
 * @overview
 * <p><strong>Deprecated.</strong> Use <code>wc-navigation-drawer-group</code> instead; this element
 * keeps working until 4.0 and logs a warning.</p>
 *
 * @example
 * ```html
 * <wc-sidebar-sub-menu label="Parent" expanded>
 *   <wc-sidebar-menu-item label="Child"></wc-sidebar-menu-item>
 * </wc-sidebar-sub-menu>
 * ```
 * @tags navigation
 */
@IndividualComponent
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
    deprecate(
      'wc-sidebar-sub-menu',
      '<wc-sidebar-sub-menu>',
      '<wc-navigation-drawer-group>',
    );
    this._updateChildLevels();
  }

  updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);

    // `aria-expanded` lives on the inner button, which the attribute describes.
    if (changedProps.has('expanded')) {
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
      paddingInlineStart: `calc(var(--sidebar-menu-item-height, 2.5rem) * ${this.level})`,
    });

    return html`
      <div class="${wrapperClasses}" style="${inlineStyles}">
        <button
          id="item"
          class="${innerClasses}"
          aria-current=${this.selected ? 'page' : nothing}
          aria-disabled=${this.disabled ? 'true' : nothing}
          aria-expanded=${hasChildren ? String(this.expanded) : nothing}
          aria-controls=${hasChildren ? 'children' : nothing}
          @click="${this._onClick}"
          tabindex="${this.disabled ? -1 : 0}"
        >
          <wc-focus-ring class="focus-ring" for="item"></wc-focus-ring>
          <span class="background"></span>
          <wc-ripple class="ripple"></wc-ripple>
          <span class="sidebar-sub-menu-content">
            ${this.icon ? html`<wc-icon name="${this.icon}"></wc-icon>` : ''}
            <span class="sidebar-sub-menu-label">${this.label}</span>
          </span>
          ${hasChildren
            ? html`
                <wc-icon class="expand-icon" name="arrow_drop_down" aria-hidden="true"></wc-icon>
              `
            : ''}
        </button>
        <div id="children" class="sidebar-sub-menu-children ${(!hasChildren || !this.expanded) ? 'hidden' : ''}">
          <slot @slotchange="${this._updateChildLevels}"></slot>
        </div>
      </div>
    `;
  }
}
