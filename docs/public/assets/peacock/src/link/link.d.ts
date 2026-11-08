import { LitElement } from 'lit';
declare const Link_base: typeof LitElement & import("../__internal/mixins/MixinConstructor.js").MixinConstructor<import("../__internal/mixins/NativeHyperlinkMixin.js").NativeHyperlinkInterface>;
/**
 * @label Link
 * @tag wc-link
 * @rawTag link
 * @summary A text link to another page, or to a section of the current one.
 *
 * @overview
 * <p>Renders a native <code>&lt;a&gt;</code> around its content, so it behaves and is announced
 * like any link. Set <code>href</code>, and <code>target</code>, <code>rel</code> and
 * <code>download</code> as on a native anchor. Its color is set with <code>--link-color</code>.</p>
 * <p>Use a link to go somewhere. For an action that does something on the page use
 * <code>wc-button</code>, and for a link styled as a button use <code>wc-link-button</code>.</p>
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
