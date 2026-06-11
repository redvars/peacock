import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';

var css_248z = i`:host {
  display: block;
}

.timeline-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: stretch;
}

.marker-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: var(--timeline-dot-size, 2rem);
}

.marker {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--timeline-dot-size, 2rem);
  height: var(--timeline-dot-size, 2rem);
  flex-shrink: 0;
}

.marker-dot {
  width: var(--timeline-dot-size, 2rem);
  height: var(--timeline-dot-size, 2rem);
  min-width: var(--timeline-dot-size, 2rem);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--timeline-dot-bg, var(--color-primary));
  --icon-color: var(--timeline-dot-color, var(--color-on-primary));
  position: relative;
  z-index: 2;
}

.marker-dot ::slotted(wc-icon) {
  --icon-size: calc(var(--timeline-dot-size, 2rem) * 0.6);
}

.dot-spinner {
  --progress-height: calc(var(--timeline-dot-size, 2rem) * 0.6);
}

/* Flexible connector line that stretches to fill remaining height/width */
.connector {
  width: 2px;
  background: var(--timeline-line-color, var(--color-outline));
  margin-inline: auto;
}

.connector--top {
  height: var(--timeline-connector-top-height, 0.75rem);
  flex-shrink: 0;
}

.connector--bottom {
  flex: 1;
  min-height: 1.5rem;
}

:host(:first-child) .connector--top {
  visibility: hidden;
}

:host(:last-child) .connector--bottom {
  display: none;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.headline {
  padding-top: var(--timeline-connector-top-height, 0.75rem);
  min-height: calc(var(--timeline-dot-size, 2rem) + var(--timeline-connector-top-height, 0.75rem));
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.description {
  color: var(--timeline-description-color, var(--color-on-surface-variant));
  line-height: 1.4;
}`;

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
let TimelineItem = class TimelineItem extends i$1 {
    constructor() {
        super(...arguments);
        this.loading = false;
    }
    connectedCallback() {
        super.connectedCallback();
        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'listitem');
        }
    }
    render() {
        return b `
      <div class="timeline-item">
        <div class="marker-column">
          <div class="connector connector--top"></div>
          <div class="marker">
            <div class="marker-dot">
              ${this.loading
            ? b `<wc-circular-progress
                    class="dot-spinner"
                    indeterminate
                    aria-label="Loading"
                  ></wc-circular-progress>`
            : b `<slot name="dot"></slot>`}
            </div>
          </div>
          <div class="connector connector--bottom"></div>
        </div>

        <div class="content">
          <div class="headline"><slot></slot></div>
          <div class="description">
            <slot name="content"></slot>
          </div>
        </div>
      </div>
    `;
    }
};
TimelineItem.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], TimelineItem.prototype, "loading", void 0);
TimelineItem = __decorate([
    IndividualComponent
], TimelineItem);

export { TimelineItem };
//# sourceMappingURL=timeline-item.js.map
