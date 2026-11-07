import { LitElement } from 'lit';
import { TimelineItem } from './timeline-item.js';
/**
 * @label Timeline
 * @tag wc-timeline
 * @rawTag timeline
 *
 * @summary A vertical list of events in order, such as the history of a record, each with a marker and details.
 * @overview
 * <p>The timeline is a list (<code>role="list"</code>) of <code>wc-timeline-item</code>s. Each
 * item takes its title in the default slot, its details in the <code>content</code> slot and its
 * marker icon in the <code>dot</code> slot.</p>
 *
 * @slot - The `wc-timeline-item`s.
 *
 * @example
 * ```html
 * <wc-timeline>
 *   <wc-timeline-item>
 *     <span>Task title</span>
 *     <span slot="content">Task completed</span>
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
