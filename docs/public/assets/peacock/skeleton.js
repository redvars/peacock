import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';

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
 * @summary Adds a skeleton effect to an element.
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
        /** When true, the skeleton animation is shown. */
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
