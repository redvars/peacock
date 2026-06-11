import { LitElement } from 'lit';
/**
 * @label Timeline Item
 * @tag wc-timeline-item
 * @rawTag timeline-item
 *
 * @summary An item for use inside a timeline, with a dot/marker and description.
 *
 * @example
 * ```html
 * <wc-timeline-item description="Step completed">
 *   <span>Step title</span>
 *   <wc-icon slot="dot" name="check"></wc-icon>
 * </wc-timeline-item>
 * ```
 * @tags display
 */
export declare class TimelineItem extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    loading: boolean;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
