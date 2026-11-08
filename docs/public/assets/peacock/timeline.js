import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { TimelineItem } from './timeline-item.js';
import './property-B2TG3KEE.js';
import './i18n-controller-Cp43HjJl.js';
import './strings-BJPuhKJk.js';
import './locale-DEsJZCQG.js';

var css_248z = i`:host {
  display: block;
}

.timeline {
  display: grid;
  gap: 0;
  position: relative;
  padding-inline-start: calc(var(--timeline-dot-size, 2rem) / 2);
}`;

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
let Timeline = class Timeline extends i$1 {
    connectedCallback() {
        super.connectedCallback();
        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'list');
        }
    }
    render() {
        return b `<div class="timeline"><slot></slot></div>`;
    }
};
Timeline.styles = [css_248z];
Timeline.Item = TimelineItem;
Timeline = __decorate([
    IndividualComponent
], Timeline);

export { Timeline };
//# sourceMappingURL=timeline.js.map
