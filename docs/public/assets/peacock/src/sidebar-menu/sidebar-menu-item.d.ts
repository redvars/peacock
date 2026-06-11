import { LitElement } from 'lit';
/**
 * @label Sidebar Menu Item
 * @tag wc-sidebar-menu-item
 * @rawTag sidebar-menu-item
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
export declare class SidebarMenuItem extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The value used to identify this item when selected.
     */
    value: string;
    /**
     * The display label for this item.
     */
    label: string;
    /**
     * Optional icon name to display before the label.
     */
    icon: string;
    /**
     * Optional hyperlink to navigate to on click.
     */
    href: string;
    /**
     * Sets or retrieves the window or frame at which to target content.
     */
    target: string;
    /**
     * If true, the user cannot interact with the item.
     */
    disabled: boolean;
    /**
     * Whether the item is currently selected.
     */
    selected: boolean;
    /**
     * The nesting depth level (set automatically by the parent sidebar-menu).
     */
    level: number;
    private readonly _nativeElement;
    focus(): void;
    blur(): void;
    private _onClick;
    render(): import("lit-html").TemplateResult<1>;
}
