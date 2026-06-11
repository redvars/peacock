import { LitElement } from 'lit';
declare const ListItem_base: import("../__internal/mixins/mixin.js").MixinReturn<import("../__internal/mixins/mixin.js").MixinReturn<import("../__internal/mixins/mixin.js").MixinReturn<import("../__internal/mixins/mixin.js").MixinReturn<typeof LitElement, import("@/__internal/mixins/element-internals.js").WithElementInternals>>, import("@/__internal/mixins/hyperlink.js").Hyperlink>, import("@/button/base-button/base-button.js").BaseButton>;
/**
 * @label List Item
 * @tag wc-list-item
 * @rawTag list-item
 *
 * @summary A list item with leading, trailing and content slots.
 *
 * @example
 * ```html
 * <wc-list-item selected>
 *   <wc-icon slot="leading" name="person"></wc-icon>
 *   Profile
 *   <wc-icon slot="trailing" name="chevron_right"></wc-icon>
 * </wc-list-item>
 * ```
 * @tags display
 */
export declare class ListItem extends ListItem_base {
    /** @nocollapse */ static shadowRootOptions: ShadowRootInit;
    static styles: import("lit").CSSResultGroup[];
    selected: boolean;
    /** When true, renders the list-item in a loading skeleton state. */
    skeleton: boolean;
    actionable: boolean;
    readonly itemElement: HTMLElement | null;
    constructor();
    connectedCallback(): void;
    focus(): void;
    blur(): void;
    __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;
    private __hasNamedSlot;
    isClickable(): boolean;
    render(): import("lit-html").TemplateResult<1>;
    renderContent(clickable: boolean): import("lit-html").TemplateResult<1>;
}
export {};
