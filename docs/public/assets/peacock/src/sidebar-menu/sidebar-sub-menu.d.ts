import { LitElement } from 'lit';
/**
 * @label Sidebar Sub Menu
 * @tag wc-sidebar-sub-menu
 * @rawTag sidebar-sub-menu
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
export declare class SidebarSubMenu extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    value: string;
    label: string;
    icon: string;
    disabled: boolean;
    selected: boolean;
    expanded: boolean;
    level: number;
    private readonly _nativeElement;
    focus(): void;
    blur(): void;
    connectedCallback(): void;
    updated(changedProps: Map<string, unknown>): void;
    private _getChildNodes;
    private _updateChildLevels;
    private _onClick;
    render(): import("lit-html").TemplateResult<1>;
}
