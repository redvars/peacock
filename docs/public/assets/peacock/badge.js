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
  display: inline-block;
  --badge-color: var(--global-badge-color);
  z-index: var(--z-index-badge);
}

.badge {
  pointer-events: none;
  color: var(--color-white);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--badge-color);
  border-radius: var(--shape-corner-full);
}
.badge.has-value {
  height: 1rem;
  min-width: 1rem;
  padding-inline: var(--spacing-050);
  font-family: var(--typography-label-small-font-family) !important;
  font-size: var(--typography-label-small-font-size) !important;
  font-weight: var(--typography-label-small-font-weight) !important;
  line-height: var(--typography-label-small-line-height) !important;
  letter-spacing: var(--typography-label-small-letter-spacing) !important;
  color: var(--color-on-error);
}
.badge:not(.has-value) {
  height: 0.375rem;
  width: 0.375rem;
}`;

/**
 * @label Badge
 * @tag wc-badge
 * @rawTag badge
 * @summary The badge component is used to display a small amount of information to the user.
 *
 * @cssprop --badge-color - Controls the color of the badge.
 *
 * @example
 * ```html
 * <wc-badge value="1"></wc-badge>
 * ```
 * @tags display
 */
let Badge = class Badge extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * The value to display in the badge.
         */
        this.value = '';
    }
    render() {
        return b `<div
      class=${e({
            badge: true,
            'has-value': !!this.value,
        })}
    >
      ${this.value}
    </div>`;
    }
};
Badge.styles = [css_248z];
__decorate([
    n({ type: String })
], Badge.prototype, "value", void 0);
Badge = __decorate([
    IndividualComponent
], Badge);

export { Badge };
//# sourceMappingURL=badge.js.map
