import { LitElement } from 'lit';
/**
 * @label Skeleton
 * @tag wc-skeleton
 * @rawTag skeleton
 * @summary A placeholder shape that stands in for content that has not arrived yet.
 *
 * @overview
 * <p>A skeleton fills the size you give it and, while <code>visible</code> is set, shows a
 * sweeping animation. Size it to match the content it replaces, and match its corners with the
 * <code>--skeleton-container-shape</code> properties, for example round for an avatar. It ignores
 * pointer events.</p>
 * <p>A skeleton is a look, not a busy state: a component working on something uses
 * <code>loading</code>. Chips, list items and buttons have their own <code>skeleton</code>
 * attribute for this placeholder look.</p>
 * @tags display
 *
 * @example
 * ```html
 * <wc-skeleton visible></wc-skeleton>
 * ```
 */
export declare class Skeleton extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * When true, the skeleton animation is shown. A skeleton is the placeholder look of content
     * that has not arrived yet, not a busy state: components that are working on something use
     * `loading` (ADR-030001), and `skeleton` on a component (chip, list item, button) asks for
     * this placeholder look.
     */
    visible: boolean;
    render(): import("lit-html").TemplateResult<1>;
}
