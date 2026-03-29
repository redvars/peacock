import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import styles from './tree-node.scss';

/**
 * @label Tree Node
 * @tag wc-tree-node
 * @rawTag tree-node
 * @parentRawTag tree-view
 * @summary A tree node represents a single item in a hierarchical tree structure. It supports nesting, icons, links, and keyboard navigation.
 *
 * @example
 * ```html
 * <wc-tree-view>
 *   <wc-tree-node label="Parent">
 *     <wc-tree-node label="Child"></wc-tree-node>
 *   </wc-tree-node>
 * </wc-tree-view>
 * ```
 * @tags navigation
 */
export class TreeNode extends LitElement {
  static styles = [styles];

  /**
   * The value used to identify this node when selected.
   */
  @property({ type: String, reflect: true })
  value: string = '';

  /**
   * The display label for this node.
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
   * If true, the user cannot interact with the node.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /**
   * Whether the node is currently selected.
   */
  @property({ type: Boolean, reflect: true })
  selected: boolean = false;

  /**
   * Whether child nodes are visible.
   */
  @property({ type: Boolean, reflect: true })
  expanded: boolean = false;

  /**
   * The nesting depth level (set automatically by the parent tree-view).
   */
  @property({ type: Number, reflect: true })
  level: number = 0;

  @query('.tree-node-content')
  private readonly _nativeElement!: HTMLElement | null;

  override focus() {
    this._nativeElement?.focus();
  }

  override blur() {
    this._nativeElement?.blur();
  }

  private _getChildNodes(): TreeNode[] {
    return Array.from(this.children).filter(
      el => el.tagName.toLowerCase() === 'wc-tree-node',
    ) as TreeNode[];
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateChildLevels();
    this.setAttribute('role', 'treeitem');
    this._syncHostAria();
  }

  private _syncHostAria() {
    const hasChildren = this._getChildNodes().length > 0;
    if (hasChildren) {
      this.setAttribute('aria-expanded', String(this.expanded));
    } else {
      this.removeAttribute('aria-expanded');
    }
    this.setAttribute('aria-selected', String(this.selected));
    this.setAttribute('aria-disabled', String(this.disabled));
    this.setAttribute('aria-level', String(this.level + 1));
  }

  private _updateChildLevels() {
    const children = this._getChildNodes();
    children.forEach(child => {
      // eslint-disable-next-line no-param-reassign
      child.level = this.level + 1;
    });
  }

  private _handleClick(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const hasChildren = this._getChildNodes().length > 0;
    if (hasChildren) {
      this.expanded = !this.expanded;
    }

    this.dispatchEvent(
      new CustomEvent('tree-node:click', {
        bubbles: true,
        composed: true,
        detail: {
          value: this.value || this.label,
          label: this.label,
          expanded: this.expanded,
        },
      }),
    );
  }

  private _handleKeyDown(event: KeyboardEvent) {
    if (this.disabled) return;

    const hasChildren = this._getChildNodes().length > 0;

    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (hasChildren) {
          this.expanded = !this.expanded;
        }
        this.dispatchEvent(
          new CustomEvent('tree-node:click', {
            bubbles: true,
            composed: true,
            detail: {
              value: this.value || this.label,
              label: this.label,
              expanded: this.expanded,
            },
          }),
        );
        if (this.href) {
          window.open(this.href, this.target);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (this.expanded && hasChildren) {
          this.expanded = false;
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (hasChildren) {
          if (!this.expanded) {
            this.expanded = true;
          } else {
            const firstChild = this._getChildNodes()[0];
            firstChild?.focus();
          }
        }
        break;
      default:
        break;
    }
  }

  updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);
    if (changedProps.has('level')) {
      this._updateChildLevels();
    }
    this._syncHostAria();
  }

  private _renderContent(hasChildren: boolean) {
    // 0.125rem offset aligns text visually with the expand/icon space
    const indentStyle = styleMap({
      paddingInlineStart: `calc(${this.level + 1}rem - 0.125rem)`,
    });

    const contentClasses = classMap({
      'tree-node-content': true,
      selected: this.selected,
      disabled: this.disabled,
    });

    const innerContent = html`
      ${hasChildren
        ? html`<wc-icon
            class=${classMap({ 'expand-icon': true, expanded: this.expanded })}
            name="arrow_right"
          ></wc-icon>`
        : html`<span class="icon-space"></span>`}
      ${this.icon
        ? html`<wc-icon class="node-icon" name=${this.icon}></wc-icon>`
        : ''}
      <span class="tree-node-label">${this.label}<slot name="label"></slot></span>
    `;

    if (this.href) {
      return html`<a
        class=${contentClasses}
        style=${indentStyle}
        href=${this.href}
        target=${this.target}
        tabindex=${this.disabled ? '-1' : '0'}
        @click=${this._handleClick}
        @keydown=${this._handleKeyDown}
      >${innerContent}</a>`;
    }

    return html`<div
      class=${contentClasses}
      style=${indentStyle}
      tabindex=${this.disabled ? '-1' : '0'}
      @click=${this._handleClick}
      @keydown=${this._handleKeyDown}
    >${innerContent}</div>`;
  }

  render() {
    const hasChildren = this._getChildNodes().length > 0;

    const nodeSlotClasses = classMap({
      'node-children': true,
      expanded: this.expanded,
    });

    return html`<div class="tree-node">
      ${this._renderContent(hasChildren)}
      <div class=${nodeSlotClasses}>
        <slot></slot>
      </div>
    </div>`;
  }
}
