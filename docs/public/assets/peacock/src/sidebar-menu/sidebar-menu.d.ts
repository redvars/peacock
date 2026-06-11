import { LitElement } from 'lit';
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
export declare class SidebarMenu extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The value of the currently selected item.
     */
    selectedItem: string;
    connectedCallback(): void;
    updated(changedProps: Map<string, unknown>): void;
    disconnectedCallback(): void;
    private _isSidebarNode;
    private _getTopLevelItems;
    private _getChildNodes;
    private _getAllVisibleItems;
    private _onItemClick;
    private _updateSelectedState;
    private _collectAllItems;
    private _syncSelectedStateFromProperty;
    private _onKeyDown;
    render(): import("lit-html").TemplateResult<1>;
}
