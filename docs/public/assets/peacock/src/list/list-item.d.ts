import { LitElement } from 'lit';
/** Where a list item sits among its sibling items; set by `wc-list`. */
export type ListItemPosition = 'first' | 'middle' | 'last' | 'only';
declare const ListItem_base: import("../__internal/mixins/mixin.js").MixinReturn<import("../__internal/mixins/mixin.js").MixinReturn<import("../__internal/mixins/mixin.js").MixinReturn<import("../__internal/mixins/mixin.js").MixinReturn<typeof LitElement, import("@/__internal/mixins/element-internals.js").WithElementInternals>>, import("@/__internal/mixins/hyperlink.js").Hyperlink>, import("@/button/base-button/base-button.js").BaseButton>;
/**
 * @label List Item
 * @tag wc-list-item
 * @rawTag list-item
 *
 * @summary One row of a list, with a label, optional text above and below it, and leading and trailing content.
 *
 * @slot - The item's label.
 * @slot start - Leading content, such as an icon or avatar.
 * @slot end - Trailing content, such as an icon.
 * @slot overline - Text above the label.
 * @slot headline - The label, as an alternative to the default slot.
 * @slot supporting-text - Text below the label.
 * @slot trailing-supporting-text - Short text before the `end` slot, such as a count.
 *
 * @cssprop --list-item-container-color - Row background.
 * @cssprop --list-item-label-text-color - Label color.
 * @cssprop --list-item-icon-color - Color of the `start` and `end` content.
 * @cssprop --list-item-state-color - Hover and press state layer color.
 * @cssprop --list-item-selected-container-color - Row background when current.
 * @cssprop --list-item-selected-label-text-color - Label color when current.
 * @cssprop --list-item-selected-icon-color - `start` and `end` color when current.
 * @cssprop --list-item-container-shape - Corner radius of the row.
 * @cssprop --list-item-outer-container-shape - Corner radius of the outer corners of the first and last rows (set by `wc-list` in the segmented variant).
 *
 * @overview
 * <p>Use <code>current</code> for the row of the current page in a navigation list, or
 * <code>wc-listbox</code> to let the person choose items.</p>
 *
 * @example
 * ```html
 * <wc-list-item href="/profile" current>
 *   <wc-icon slot="start" name="person"></wc-icon>
 *   Profile
 *   <wc-icon slot="end" name="chevron_right"></wc-icon>
 * </wc-list-item>
 * ```
 * @tags display
 */
export declare class ListItem extends ListItem_base {
    /** @nocollapse */ static shadowRootOptions: ShadowRootInit;
    static styles: import("lit").CSSResultGroup[];
    /**
     * Marks the row of the current page or location in a navigation list: `aria-current="page"`
     * on a link row, `aria-current="true"` otherwise.
     */
    current: boolean;
    /**
     * When true, renders the list-item as a placeholder (a skeleton) while its content is not known
     * yet, and ignores clicks. It is a look, not a busy state (which components spell `loading`).
     */
    skeleton: boolean;
    /** Renders the row as a button, with hover, press and focus states. */
    actionable: boolean;
    /**
     * Where the item sits among its siblings. `wc-list` sets this; the segmented
     * variant rounds the outer corners of the first and last rows with it.
     */
    listPosition?: ListItemPosition;
    readonly itemElement: HTMLElement | null;
    /** Re-renders when slotted children are added, removed or re-slotted. */
    private readonly _contentObserver;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected updated(): void;
    focus(): void;
    blur(): void;
    __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;
    private __hasNamedSlot;
    isClickable(): boolean;
    render(): import("lit-html").TemplateResult<1>;
    renderContent(clickable: boolean): import("lit-html").TemplateResult<1>;
}
export {};
