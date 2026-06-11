import { LitElement } from "lit";
declare const MenuItem_base: typeof LitElement & import("../../__internal/mixins/MixinConstructor.js").MixinConstructor<import("@/__internal/mixins/NativeHyperlinkMixin.js").NativeHyperlinkInterface> & import("../../__internal/mixins/MixinConstructor.js").MixinConstructor<import("@/__internal/mixins/NativeButtonMixin.js").NativeButtonInterface>;
/**
 * @label Menu Item
 * @tag wc-menu-item
 * @rawTag menu-item
 * @summary An item in a menu list.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-menu-item>Menu Item</wc-menu-item>
 * ```
 */
export declare class MenuItem extends MenuItem_base {
    static styles: import("lit").CSSResultGroup[];
    /** The value associated with this menu item, used to identify it on selection. */
    value: string;
    /** Whether this menu item is currently selected/highlighted. */
    selected: boolean;
    /** When true, the menu stays open after this item is activated. */
    keepOpen: boolean;
    /** When true, indicates this item has an associated submenu. */
    hasSubmenu: boolean;
    /** Whether the associated submenu is currently open. */
    submenuOpen: boolean;
    /** Visual variant of the menu item. */
    variant: "standard" | "vibrant";
    readonly itemElement: HTMLElement | null;
    /** MutationObserver that triggers re-render when slotted content changes. */
    private readonly _contentObserver;
    /** Roving tabindex value managed by the parent Menu. */
    private _rovingTabIndex;
    connectedCallback(): void;
    disconnectedCallback(): void;
    get tabIndex(): number;
    set tabIndex(value: number);
    focus(): void;
    blur(): void;
    private _hasNamedSlot;
    private _hasDefaultSlot;
    render(): import("lit-html").TemplateResult<1>;
    renderContent(): import("lit-html").TemplateResult<1>;
}
export {};
