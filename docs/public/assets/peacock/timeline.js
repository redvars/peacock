import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { TimelineItem } from './timeline-item.js';
import './property-B49QQ8pS.js';

var css_248z = i`:host {
  display: block;
}

.timeline {
  display: grid;
  gap: 0;
  position: relative;
  padding-left: calc(var(--timeline-dot-size, 2rem) / 2);
}`;

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
