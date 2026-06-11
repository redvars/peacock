import { LitElement } from 'lit';
import { TimelineItem } from './timeline-item.js';
/**
 * @label Timeline
 * @tag wc-timeline
 * @rawTag timeline
 *
 * @summary A vertical timeline layout for a series of timeline items.
 *
 * @example
 * ```html
 * <wc-timeline>
 *   <wc-timeline-item description="Task completed">
 *     <span>Task title</span>
 *     <wc-icon slot="dot" name="check"></wc-icon>
 *   </wc-timeline-item>
 * </wc-timeline>
 * ```
 * @tags display
 */
export declare class Timeline extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    static Item: typeof TimelineItem;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
