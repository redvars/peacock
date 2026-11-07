import { LitElement } from 'lit';
/**
 * @label Card Content
 * @tag wc-card-content
 * @rawTag card-content
 * @summary A padded block inside a card. A card can hold several, next to edge-to-edge media.
 *
 * @overview
 * <p>A card adds no padding of its own, so put text and actions in <code>wc-card-content</code> and
 * leave images and other media outside it to run to the card's edges. It is a block with 1rem of
 * padding on all sides, set with <code>--card-content-padding</code>, and no other behaviour.</p>
 *
 * @cssprop --card-content-padding - Padding on all sides. Defaults to 1rem.
 */
export declare class CardContent extends LitElement {
    static styles: import("lit").CSSResult;
    render(): import("lit-html").TemplateResult<1>;
}
