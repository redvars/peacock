import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { e } from './class-map-NDIkZErE.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
:host {
  display: inline-block;
  --badge-color: var(--global-badge-color);
  --badge-text-color: var(--color-on-error);
  z-index: var(--z-index-badge);
}

:host([intent=info]) {
  --badge-color: var(--color-primary);
  --badge-text-color: var(--color-on-primary);
}

:host([intent=success]) {
  --badge-color: var(--color-success);
  --badge-text-color: var(--color-on-success);
}

:host([intent=warning]) {
  --badge-color: var(--color-warning);
  --badge-text-color: var(--color-on-warning);
}

:host([intent=danger]) {
  --badge-color: var(--color-error);
  --badge-text-color: var(--color-on-error);
}

.badge {
  pointer-events: none;
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
  color: var(--badge-text-color);
}
.badge:not(.has-value) {
  height: 0.375rem;
  width: 0.375rem;
}`;

/**
 * @label Badge
 * @tag wc-badge
 * @rawTag badge
 * @summary A small count or dot on an icon or a label, such as the number of unread messages.
 * @overview
 * <p>A badge shows a count, or with <code>dot</code> (or no <code>value</code>) a small dot. A
 * number above <code>max</code> (default 99) shows as <code>99+</code>.</p>
 * <p>A dot alone means nothing to a screen reader, so it is hidden from assistive technology
 * unless it has a <code>label</code>. Give a count a <code>label</code> such as "3 unread
 * messages" when the number alone is not enough. When the badge sits on an icon button, put the
 * full meaning in the button's <code>aria-label</code> instead (for example "Inbox, 3 unread") and
 * leave the badge without a label.</p>
 * <p><code>intent</code> (<code>info</code>, <code>success</code>, <code>warning</code>,
 * <code>danger</code>) sets its color; without it the badge uses the theme's badge color.</p>
 *
 * @cssprop --badge-color - Controls the color of the badge.
 * @cssprop --badge-text-color - Controls the color of the count.
 *
 * @example
 * ```html
 * <wc-badge value="1"></wc-badge>
 * <wc-badge value="120" label="120 unread messages"></wc-badge>
 * <wc-badge dot intent="success"></wc-badge>
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
        /** The largest number shown; a larger numeric `value` shows as `max+`. Defaults to `99`. */
        this.max = 99;
        /** Shows a small dot without the value. */
        this.dot = false;
    }
    /** The text the badge shows: the value, capped at `max+` when it is a number. */
    get displayValue() {
        if (this.dot || !this.value)
            return '';
        const trimmed = this.value.trim();
        const count = Number(trimmed);
        if (trimmed !== '' &&
            Number.isFinite(count) &&
            Number.isFinite(this.max) &&
            count > this.max) {
            return `${this.max}+`;
        }
        return this.value;
    }
    render() {
        const shown = this.displayValue;
        const decorative = !shown && !this.label;
        return b `<div
      class=${e({
            badge: true,
            'has-value': !!shown,
        })}
      role=${this.label ? 'img' : A}
      aria-label=${this.label || A}
      aria-hidden=${decorative ? 'true' : A}
    >
      ${shown}
    </div>`;
    }
};
Badge.styles = [css_248z];
__decorate([
    n({ type: String })
], Badge.prototype, "value", void 0);
__decorate([
    n({ type: Number })
], Badge.prototype, "max", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Badge.prototype, "dot", void 0);
__decorate([
    n({ type: String })
], Badge.prototype, "label", void 0);
__decorate([
    n({ type: String, reflect: true })
], Badge.prototype, "intent", void 0);
Badge = __decorate([
    IndividualComponent
], Badge);

export { Badge };
//# sourceMappingURL=badge.js.map
