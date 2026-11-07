import { LitElement } from 'lit';
/**
 * @label Timeline Item
 * @tag wc-timeline-item
 * @rawTag timeline-item
 *
 * @summary An item for use inside a timeline, with a marker, a title and details.
 * @overview
 * <p>The title goes in the default slot and the details (a timestamp, a comment, a card) in the
 * <code>content</code> slot; there is no <code>description</code> attribute. Set
 * <code>loading</code> while the step is in progress: the marker becomes a spinner.</p>
 *
 * @slot - The item's title.
 * @slot content - Details shown under the title.
 * @slot dot - The marker, usually a `wc-icon`. Replaced by a spinner while `loading`.
 *
 * @cssprop [--timeline-dot-size=2rem] - Size of the marker.
 * @cssprop --timeline-dot-bg - Background of the marker.
 * @cssprop --timeline-dot-color - Color of the marker icon.
 * @cssprop --timeline-line-color - Color of the connector line.
 * @cssprop --timeline-description-color - Color of the `content` slot text.
 *
 * @example
 * ```html
 * <wc-timeline-item>
 *   <span>Step title</span>
 *   <span slot="content">Step completed</span>
 *   <wc-icon slot="dot" name="check"></wc-icon>
 * </wc-timeline-item>
 * ```
 * @tags display
 */
export declare class TimelineItem extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Marks the step as in progress (busy): the marker shows a spinner instead of the `dot` slot. */
    loading: boolean;
    /** Peacock's strings for the loading spinner label. */
    private readonly i18n;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
