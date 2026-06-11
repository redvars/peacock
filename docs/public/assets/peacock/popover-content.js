import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-index-popover, 1000);
  pointer-events: none;
  /**
   * @prop --popover-content-background: Background color of the popover content
   */
  --popover-content-background: var(--color-surface-container);
  /**
   * @prop --popover-content-padding: Padding of the popover content
   */
  --popover-content-padding: var(--spacing-200);
  /**
   * @prop --popover-content-border-radius: Border radius of the popover content
   */
  --popover-content-border-radius: var(--shape-corner-small);
  /**
   * @prop --popover-content-min-width: Minimum width of the popover content
   */
  --popover-content-min-width: 10rem;
}

:host([open]) {
  pointer-events: auto;
}

.popover-content {
  position: relative;
  background: var(--popover-content-background);
  padding: var(--popover-content-padding);
  border-radius: var(--popover-content-border-radius);
  min-width: var(--popover-content-min-width);
  color: var(--color-on-surface);
  transform: scale(0.9);
  opacity: 0;
  transition: transform var(--duration-short2, 0.1s) var(--easing-standard, ease-in-out), opacity var(--duration-short2, 0.1s) var(--easing-standard, ease-in-out);
}
.popover-content.open {
  transform: scale(1);
  opacity: 1;
}

.elevation {
  --elevation-level: 2;
  --elevation-container-shape: var(--popover-content-border-radius, var(--shape-corner-small));
}

.arrow {
  width: 0.75rem;
  height: 0.75rem;
  background: var(--popover-content-background);
  position: absolute;
  z-index: -1;
  display: none;
}`;

/**
 * @label Popover Content
 * @tag wc-popover-content
 * @rawTag popover-content
 * @summary Content container for the wc-popover component.
 * @tags display
 *
 * @cssprop --popover-content-background - Background color of the popover content. Defaults to `var(--color-surface-container)`.
 * @cssprop --popover-content-padding - Padding of the popover content. Defaults to `var(--spacing-200)`.
 * @cssprop --popover-content-border-radius - Border radius of the popover content. Defaults to `var(--shape-corner-small)`.
 * @cssprop --popover-content-min-width - Minimum width of the popover content. Defaults to `10rem`.
 *
 * @example
 * ```html
 * <wc-popover-content>
 *   <p>Popover body text</p>
 * </wc-popover-content>
 * ```
 */
let PopoverContent = class PopoverContent extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Whether the popover content is visible.
         */
        this.open = false;
    }
    render() {
        return b `
      <div
        class=${e({
            'popover-content': true,
            open: this.open,
        })}
        part="container"
      >
        <slot></slot>
        <wc-elevation class="elevation"></wc-elevation>
        <div class="arrow" part="arrow"></div>
      </div>
    `;
    }
};
PopoverContent.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], PopoverContent.prototype, "open", void 0);
PopoverContent = __decorate([
    IndividualComponent
], PopoverContent);

export { PopoverContent };
//# sourceMappingURL=popover-content.js.map
