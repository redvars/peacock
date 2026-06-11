import { LitElement } from 'lit';
declare const Link_base: typeof LitElement & import("../__internal/mixins/MixinConstructor.js").MixinConstructor<import("@/__internal/mixins/NativeHyperlinkMixin.js").NativeHyperlinkInterface>;
/**
 * @label Link
 * @tag wc-link
 * @rawTag link
 * @summary The link component is used to navigate to a new page or section within the current page.
 * @cssprop --link-color - Controls the color of the link.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-link href="#">Link</wc-link>
 * ```
 */
export declare class Link extends Link_base {
    static styles: import("lit").CSSResultGroup[];
    render(): import("lit-html").TemplateResult<1>;
}
export {};
