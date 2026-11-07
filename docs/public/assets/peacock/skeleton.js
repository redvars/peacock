import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';

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
  position: relative;
  inset: 0;
  --skeleton-container-color: var(--color-surface-container);
  --skeleton-element: var(--color-on-surface);
  display: flex;
  pointer-events: none;
}

.skeleton,
.skeleton::before {
  inset: 0;
  position: absolute;
  border-start-start-radius: var(--skeleton-container-shape-start-start, var(--skeleton-container-shape));
  border-start-end-radius: var(--skeleton-container-shape-start-end, var(--skeleton-container-shape));
  border-end-start-radius: var(--skeleton-container-shape-end-start, var(--skeleton-container-shape));
  border-end-end-radius: var(--skeleton-container-shape-end-end, var(--skeleton-container-shape));
  corner-shape: var(--skeleton-container-shape-variant);
}

.skeleton {
  background: var(--skeleton-container-color);
  overflow: hidden;
}
.skeleton::before {
  animation: 3s ease-in-out skeleton infinite;
  background: var(--skeleton-element);
  block-size: 100%;
  content: "";
  inline-size: 100%;
  will-change: transform-origin, transform, opacity;
}

@keyframes skeleton {
  0% {
    opacity: 0.3;
    transform: scaleX(0);
    transform-origin: left;
  }
  20% {
    opacity: 1;
    transform: scaleX(1);
    transform-origin: left;
  }
  28% {
    transform: scaleX(1);
    transform-origin: right;
  }
  51% {
    transform: scaleX(0);
    transform-origin: right;
  }
  58% {
    transform: scaleX(0);
    transform-origin: right;
  }
  82% {
    transform: scaleX(1);
    transform-origin: right;
  }
  83% {
    transform: scaleX(1);
    transform-origin: left;
  }
  96% {
    transform: scaleX(0);
    transform-origin: left;
  }
  100% {
    opacity: 0.3;
    transform: scaleX(0);
    transform-origin: left;
  }
}`;

/**
 * @label Skeleton
 * @tag wc-skeleton
 * @rawTag skeleton
 * @summary A placeholder shape that stands in for content that has not arrived yet.
 *
 * @overview
 * <p>A skeleton fills the size you give it and, while <code>visible</code> is set, shows a
 * sweeping animation. Size it to match the content it replaces, and match its corners with the
 * <code>--skeleton-container-shape</code> properties, for example round for an avatar. It ignores
 * pointer events.</p>
 * <p>A skeleton is a look, not a busy state: a component working on something uses
 * <code>loading</code>. Chips, list items and buttons have their own <code>skeleton</code>
 * attribute for this placeholder look.</p>
 * @tags display
 *
 * @example
 * ```html
 * <wc-skeleton visible></wc-skeleton>
 * ```
 */
let Skeleton = class Skeleton extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * When true, the skeleton animation is shown. A skeleton is the placeholder look of content
         * that has not arrived yet, not a busy state: components that are working on something use
         * `loading` (ADR-030001), and `skeleton` on a component (chip, list item, button) asks for
         * this placeholder look.
         */
        this.visible = false;
    }
    render() {
        return b ` <div class="skeleton"></div>`;
    }
};
Skeleton.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], Skeleton.prototype, "visible", void 0);
Skeleton = __decorate([
    IndividualComponent
], Skeleton);

export { Skeleton };
//# sourceMappingURL=skeleton.js.map
