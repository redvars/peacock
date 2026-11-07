import { LitElement, nothing, type TemplateResult } from 'lit';
/** What a menu item is: an action (`item`), an on/off choice (`checkbox`) or one of a set (`radio`). */
export type MenuItemType = 'item' | 'checkbox' | 'radio';
declare const MenuItem_base: import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<typeof LitElement, import("@/__internal/mixins/element-internals.js").WithElementInternals>, import("@/__internal/mixins/hyperlink.js").Hyperlink>, import("@/button/base-button/base-button.js").BaseButton>;
/**
 * @label Menu Item
 * @tag wc-menu-item
 * @rawTag menu-item
 * @summary One action or choice in a menu; it can be a link, a checkbox or radio choice, or open a submenu.
 * @overview
 * <p>A menu item is a button, or a link when it has an <code>href</code>. A selected item shows a
 * check mark at the end; an item with a submenu shows a chevron. Put an icon in the
 * <code>start</code> slot; the menu lines up the labels of items without one.</p>
 * <p>Set <code>type="checkbox"</code> or <code>type="radio"</code> to make <code>selected</code>
 * accessible: the item becomes a <code>menuitemcheckbox</code> or <code>menuitemradio</code> with
 * <code>aria-checked</code>. A plain item only shows the check mark. Activating a checkbox item
 * toggles it and keeps the menu open; activating a radio item selects it, clears the other radio
 * items of its group (the items between the same dividers) and closes the menu.</p>
 * <p>A link item that stands for the current page sets <code>current</code>
 * (<code>aria-current="page"</code>).</p>
 *
 * @slot - The label.
 * @slot start - Leading icon or avatar.
 * @slot end - Trailing icon or content; replaces the selected check mark.
 * @slot supporting-text - A second line under the label.
 * @slot trailing-supporting-text - Short trailing text, such as a keyboard shortcut.
 * @slot overline - A line above the label.
 * @slot headline - Alternative to the default slot for the label.
 *
 * @cssprop --menu-item-icon-size - Size of leading and trailing icons. Defaults to `1.25rem`.
 *
 * @example
 * ```html
 * <wc-menu-item>Menu Item</wc-menu-item>
 * ```
 * @tags navigation
 */
export declare class MenuItem extends MenuItem_base {
    static styles: import("lit").CSSResultGroup[];
    /** The value associated with this menu item, used to identify it on selection. */
    value: string;
    /**
     * What the item is. `"item"` (default) is an action; `"checkbox"` toggles `selected` and keeps
     * the menu open; `"radio"` selects this item and clears the other radio items of its group.
     * `"checkbox"` and `"radio"` expose `selected` as `aria-checked`.
     */
    type: MenuItemType;
    /**
     * Whether this menu item is selected. Selected items show a check mark. Set `type="checkbox"` or
     * `type="radio"` so assistive technology announces the state.
     */
    selected: boolean;
    /** Marks a link item as the current page (`aria-current="page"`). */
    current: boolean;
    /** When true, the menu stays open after this item is activated. */
    keepOpen: boolean;
    /** When true, indicates this item has an associated submenu and shows a chevron. */
    hasSubmenu: boolean;
    /** Whether the associated submenu is currently open. */
    submenuOpen: boolean;
    readonly itemElement: HTMLElement | null;
    /** MutationObserver that triggers re-render when slotted content changes. */
    private readonly _contentObserver;
    /** Roving tabindex value managed by the parent Menu. */
    private _rovingTabIndex;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected updated(): void;
    get tabIndex(): number;
    set tabIndex(value: number);
    /** Whether the item shows something in its leading column. */
    get hasStartContent(): boolean;
    /** Lower-cased label text the menu matches typed characters against. */
    get typeaheadText(): string;
    focus(): void;
    blur(): void;
    /**
     * Handles clicks on the host: stops them for soft-disabled items and disabled links, and turns
     * a click fired at the host (`item.click()`, Enter in the menu) into a click on the inner button
     * or link, so a link item navigates.
     */
    __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;
    /** ARIA role of the inner control. */
    protected get itemRole(): string;
    /** ARIA state of the inner control, such as `aria-selected` for options. */
    protected get itemAriaSelected(): string | undefined;
    /** `aria-checked` of the inner control: set for checkbox and radio items only. */
    protected get itemAriaChecked(): string | undefined;
    /** Built-in leading content shown when the `start` slot is empty. */
    protected renderStart(): TemplateResult | typeof nothing;
    /** Built-in trailing content shown when the `end` slot is empty. */
    protected renderEnd(): TemplateResult | typeof nothing;
    private _hasNamedSlot;
    render(): TemplateResult<1>;
    renderContent(): TemplateResult<1>;
}
export {};
