import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-NDIkZErE.js';
import './base-Cl6v8-BZ.js';
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
  /* Reset the UA popover styles; floating-ui positions the panel in the top layer. */
  margin: 0;
  padding: 0;
  border: 0;
  inset: auto;
  overflow: visible;
  color: inherit;
  background: transparent;
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-index-popover, 1000);
  --_popover-duration: var(--duration-short2, 0.1s);
  --_popover-easing: var(--easing-standard, ease-in-out);
  /* Keep the panel in the top layer while it fades out. */
  transition: display var(--_popover-duration) allow-discrete, overlay var(--_popover-duration) allow-discrete;
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

:host(:not(:popover-open)) {
  pointer-events: none;
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
  transition: transform var(--_popover-duration) var(--_popover-easing), opacity var(--_popover-duration) var(--_popover-easing);
}

:host(:popover-open) .popover-content,
:host([open]:not([popover])) .popover-content {
  transform: none;
  opacity: 1;
}
@starting-style {
  :host(:popover-open) .popover-content,
  :host([open]:not([popover])) .popover-content {
    transform: scale(0.9);
    opacity: 0;
  }
}

.elevation {
  --elevation-level: 2;
  --elevation-container-shape: var(--popover-content-border-radius, var(--shape-corner-small));
}

.arrow {
  display: none;
  position: absolute;
  z-index: -1;
  width: 0.75rem;
  height: 0.75rem;
  background: var(--popover-content-background);
  transform: rotate(45deg);
}

:host([arrow]) .arrow {
  display: block;
}`;

/**
 * @label Popover Content
 * @tag wc-popover-content
 * @rawTag popover-content
 * @summary The floating panel of a popover, with an optional heading and an arrow pointing at the trigger.
 * @overview
 * <p>The panel of a <code>wc-popover</code>. The popover shows it in the browser's top layer, gives it
 * <code>role="dialog"</code> and names it from the popover's <code>label</code> or from the element in the
 * <code>heading</code> slot.</p>
 * @tags display
 *
 * @slot - The popover body.
 * @slot heading - A heading for the panel; it names the dialog when the popover has no `label`.
 *
 * @csspart container - The panel surface.
 * @csspart arrow - The arrow pointing at the trigger; shown when the popover has `arrow`.
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
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        /** Whether the popover content is visible. Set by the enclosing `wc-popover`. */
        this.open = false;
        /** Shows the arrow that points at the trigger. Set by the enclosing `wc-popover`. */
        this.arrow = false;
    }
    // ── Render ───────────────────────────────────────────────────────────────
    render() {
        return b `
      <div
        class=${e$1({
            'popover-content': true,
            open: this.open,
        })}
        part="container"
      >
        <slot name="heading"></slot>
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
__decorate([
    n({ type: Boolean, reflect: true })
], PopoverContent.prototype, "arrow", void 0);
__decorate([
    e('.arrow')
], PopoverContent.prototype, "arrowElement", void 0);
PopoverContent = __decorate([
    IndividualComponent
], PopoverContent);

export { PopoverContent };
//# sourceMappingURL=popover-content.js.map
