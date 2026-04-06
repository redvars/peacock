import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './sidebar-menu.scss';
import { SidebarMenuItem } from './sidebar-menu-item.js';
import { SidebarSubMenu } from './sidebar-sub-menu.js';

type SidebarNode = SidebarMenuItem | SidebarSubMenu;

/**
 * @label Sidebar Menu
 * @tag wc-sidebar-menu
 * @rawTag sidebar-menu
 * @summary A sidebar menu is a hierarchical structure that provides nested levels of navigation. It supports keyboard navigation, single/multi select, and expandable items.
 *
 * @example
 * ```html
 * <wc-sidebar-menu>
 *   <wc-sidebar-sub-menu label="Parent" expanded>
 *     <wc-sidebar-menu-item label="Child 1"></wc-sidebar-menu-item>
 *     <wc-sidebar-menu-item label="Child 2"></wc-sidebar-menu-item>
 *   </wc-sidebar-sub-menu>
 * </wc-sidebar-menu>
 * ```
 * @tags navigation
 */
export class SidebarMenu extends LitElement {
  static styles = [styles];

  /**
   * The value of the currently selected item.
   */
  @property({ type: String, attribute: 'selected-item', reflect: true })
  selectedItem: string = '';

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('sidebar-menu-item:click', this._onItemClick as EventListener);
    this.addEventListener('keydown', this._onKeyDown);
    this.setAttribute('role', 'tree');
  }

  updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);

    if (changedProps.has('selectedItem')) {
      this._syncSelectedStateFromProperty();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('sidebar-menu-item:click', this._onItemClick as EventListener);
    this.removeEventListener('keydown', this._onKeyDown);
  }

  private _isSidebarNode(element: Element): element is SidebarNode {
    const tag = element.tagName.toLowerCase();
    return tag === 'wc-sidebar-menu-item' || tag === 'wc-sidebar-sub-menu';
  }

  private _getTopLevelItems(): SidebarNode[] {
    return Array.from(this.children).filter(
      el => this._isSidebarNode(el),
    ) as SidebarNode[];
  }

  private _getChildNodes(item: SidebarSubMenu): SidebarNode[] {
    return Array.from(item.children).filter(
      child => this._isSidebarNode(child),
    ) as SidebarNode[];
  }

  private _getAllVisibleItems(): SidebarNode[] {
    const result: SidebarNode[] = [];
    const collect = (items: SidebarNode[]) => {
      items.forEach(item => {
        result.push(item);
        if (item instanceof SidebarSubMenu && item.expanded) {
          collect(this._getChildNodes(item));
        }
      });
    };
    collect(this._getTopLevelItems());
    return result;
  }

  private _onItemClick = (event: CustomEvent) => {
    const item = event.target as SidebarNode;
    if (item.disabled) return;

    const value = event.detail?.value ?? item.value ?? item.label;
    this.selectedItem = value;

    // Update selected state on all items
    this._updateSelectedState(value);

    this.dispatchEvent(
      new CustomEvent('sidebar-menu:change', {
        bubbles: true,
        composed: true,
        detail: { value, item },
      }),
    );
  };

  private _updateSelectedState(selectedValue: string) {
    const allItems = this._collectAllItems(this._getTopLevelItems());
    allItems.forEach(item => {
      const itemValue = item.value || item.label;
      // eslint-disable-next-line no-param-reassign
      item.selected = itemValue === selectedValue;
    });
  }

  private _collectAllItems(items: SidebarNode[]): SidebarNode[] {
    const result: SidebarNode[] = [];
    items.forEach(item => {
      result.push(item);
      if (item instanceof SidebarSubMenu) {
        result.push(...this._collectAllItems(this._getChildNodes(item)));
      }
    });
    return result;
  }

  private _syncSelectedStateFromProperty() {
    const allItems = this._collectAllItems(this._getTopLevelItems());
    allItems.forEach(item => {
      const itemValue = item.value || item.label;
      item.selected = itemValue === this.selectedItem;
    });
  }

  private _onKeyDown = (event: KeyboardEvent) => {
    const allVisible = this._getAllVisibleItems();
    const currentElement = event.composedPath().find(
      target => target instanceof SidebarMenuItem || target instanceof SidebarSubMenu,
    ) as SidebarNode | undefined;

    if (!currentElement) {
      return;
    }

    if (!allVisible.includes(currentElement)) {
      return;
    }

    const currentIndex = allVisible.indexOf(currentElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % allVisible.length;
      allVisible[nextIndex].focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = currentIndex === 0 ? allVisible.length - 1 : currentIndex - 1;
      allVisible[prevIndex].focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      currentElement.click();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (currentElement instanceof SidebarSubMenu && !currentElement.expanded) {
        currentElement.expanded = true;
      } else if (currentElement instanceof SidebarSubMenu) {
        const children = this._getChildNodes(currentElement);
        if (children.length > 0) {
          children[0].focus();
        }
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (currentElement instanceof SidebarSubMenu && currentElement.expanded) {
        currentElement.expanded = false;
      }
    }
  };

  override render() {
    return html` <div class="sidebar-menu"><slot></slot></div> `;
  }
}
