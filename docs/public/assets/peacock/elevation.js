import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';

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
/**
 * Derived from Material Design Elevation
 * https://github.com/material-components/material-web/blob/main/elevation/internal/_elevation.scss
 */
:host,
.shadow,
.shadow::before,
.shadow::after {
  border-start-start-radius: var(--elevation-container-shape-start-start, var(--elevation-container-shape));
  border-start-end-radius: var(--elevation-container-shape-start-end, var(--elevation-container-shape));
  border-end-start-radius: var(--elevation-container-shape-end-start, var(--elevation-container-shape));
  border-end-end-radius: var(--elevation-container-shape-end-end, var(--elevation-container-shape));
  corner-shape: var(--elevation-container-shape-variant);
  inset: 0;
  position: absolute;
  transition-duration: inherit;
  transition-property: inherit;
  transition-timing-function: inherit;
}

:host {
  display: flex;
  pointer-events: none;
  transition-property: box-shadow, opacity;
  --elevation-level: 0;
  --elevation-color: var(--elevation-color-default, black);
  /* Fallback values for side-specific levels, falling back to --elevation-level */
  --_level-top: var(--elevation-level-block-start, var(--elevation-level, 0));
  --_level-bottom: var(--elevation-level-block-end, var(--elevation-level, 0));
  --_level-left: var(--elevation-level-inline-start, var(--elevation-level, 0));
  --_level-right: var(--elevation-level-inline-end, var(--elevation-level, 0));
}

:host-context([dir=rtl]) {
  --_level-left: var(--elevation-level-inline-end, var(--elevation-level, 0));
  --_level-right: var(--elevation-level-inline-start, var(--elevation-level, 0));
}

:host([dir=rtl]) {
  --_level-left: var(--elevation-level-inline-end, var(--elevation-level, 0));
  --_level-right: var(--elevation-level-inline-start, var(--elevation-level, 0));
}

.shadow {
  /* Set the default private level property */
  --_level: var(--elevation-level, 0);
}

.shadow.block-start {
  --_level: var(--_level-top);
  clip-path: polygon(50% 50%, -950% -950%, 1050% -950%);
}

.shadow.block-end {
  --_level: var(--_level-bottom);
  clip-path: polygon(50% 50%, 1050% 1050%, -950% 1050%);
}

.shadow.inline-start {
  --_level: var(--_level-left);
  clip-path: polygon(50% 50%, -950% 1050%, -950% -950%);
}

.shadow.inline-end {
  --_level: var(--_level-right);
  clip-path: polygon(50% 50%, 1050% -950%, 1050% 1050%);
}

:host-context([dir=rtl]) .shadow.inline-start,
:host([dir=rtl]) .shadow.inline-start {
  clip-path: polygon(50% 50%, 1050% -950%, 1050% 1050%);
}
:host-context([dir=rtl]) .shadow.inline-end,
:host([dir=rtl]) .shadow.inline-end {
  clip-path: polygon(50% 50%, -950% 1050%, -950% -950%);
}

.shadow::before,
.shadow::after {
  content: "";
  transition-property: box-shadow, opacity;
  --_shadow-color: var(--elevation-color);
}

.shadow::before {
  box-shadow: 0 calc(1px * (clamp(0, var(--_level), 1) + clamp(0, var(--_level) - 3, 1) + 2 * clamp(0, var(--_level) - 4, 1))) calc(1px * (2 * clamp(0, var(--_level), 1) + clamp(0, var(--_level) - 2, 1) + clamp(0, var(--_level) - 4, 1))) 0 var(--_shadow-color);
  opacity: 0.3;
}

.shadow::after {
  box-shadow: 0 calc(1px * (clamp(0, var(--_level), 1) + clamp(0, var(--_level) - 1, 1) + 2 * clamp(0, var(--_level) - 2, 3))) calc(1px * (3 * clamp(0, var(--_level), 2) + 2 * clamp(0, var(--_level) - 2, 3))) calc(1px * (clamp(0, var(--_level), 4) + 2 * clamp(0, var(--_level) - 4, 1))) var(--_shadow-color);
  opacity: 0.15;
}`;

/**
 * @label Elevation
 * @tag wc-elevation
 * @rawTag elevation
 *
 * @summary A shadow layer placed inside an element to lift it off the page, with a shadow depth set per level and per side.
 * @overview
 * <ul>
 * <li>Elevation adds a shadow effect to an element to give it depth.</li>
 * <li>It can be used to create a sense of hierarchy or to draw attention to a particular
 * element.</li>
 * <li>It fills its nearest positioned ancestor, so place it inside an element with
 * <code>position: relative</code>. It ignores pointer events.</li>
 * <li><code>--elevation-level</code> sets the level. <code>--elevation-level-block-start</code>,
 * <code>--elevation-level-block-end</code>, <code>--elevation-level-inline-start</code> and
 * <code>--elevation-level-inline-end</code> set the level of one side and override
 * <code>--elevation-level</code> for it; the inline sides follow the reading direction.</li>
 * <li>Match the shadow to the element's corners with
 * <code>--elevation-container-shape</code>.</li>
 * </ul>
 *
 * @cssprop --elevation-level - Controls the elevation level of the shadow.
 * @cssprop --elevation-color - Controls the color of the shadow.
 *
 * @example
 * ```html
 *   <div style="position: relative; padding: var(--spacing-200);">
 *     <wc-elevation style='--elevation-level: 2; --elevation-container-shape: var(--shape-corner-extra-small);'></wc-elevation>
 *     Level 2
 *   </div>
 * ```
 * @tags display
 */
let Elevation = class Elevation extends i$1 {
    render() {
        return b `
      <span class="shadow block-start"></span>
      <span class="shadow block-end"></span>
      <span class="shadow inline-start"></span>
      <span class="shadow inline-end"></span>
    `;
    }
};
Elevation.styles = [css_248z];
Elevation = __decorate([
    IndividualComponent
], Elevation);

export { Elevation };
//# sourceMappingURL=elevation.js.map
