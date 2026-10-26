import { i, _ as __decorate, I as IndividualComponent, a as i$1, w, A, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { o } from './style-map-BQD5Et1D.js';
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
  vertical-align: middle;
  --brand-loader-size: 4rem;
  --brand-loader-tile-color: #ff0000;
  --brand-loader-mark-color: #ffffff;
  --brand-loader-duration: 2.4s;
}

.brand-loader {
  position: relative;
  isolation: isolate;
  width: var(--brand-loader-size);
  height: var(--brand-loader-size);
  line-height: 0;
}

svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.tile {
  fill: var(--brand-loader-tile-color);
}

.mark,
.stem,
.arm,
.ghost {
  fill: var(--brand-loader-mark-color);
}

.trace .mark {
  fill-opacity: 0;
  stroke: var(--brand-loader-mark-color);
  stroke-width: 5;
  stroke-linejoin: round;
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
  animation: brand-loader-trace var(--brand-loader-duration) infinite;
}

@keyframes brand-loader-trace {
  0% {
    stroke-dashoffset: 1;
    fill-opacity: 0;
    animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  }
  42% {
    stroke-dashoffset: 0;
    fill-opacity: 0;
    animation-timing-function: ease-out;
  }
  56%, 78% {
    stroke-dashoffset: 0;
    fill-opacity: 1;
    animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  }
  100% {
    stroke-dashoffset: -1;
    fill-opacity: 0;
  }
}
.build .stem {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: brand-loader-stem var(--brand-loader-duration) infinite;
}

.build .arm {
  transform-box: fill-box;
  transform-origin: 9% 40%;
  animation: brand-loader-arm var(--brand-loader-duration) infinite;
}

@keyframes brand-loader-stem {
  0% {
    transform: scaleY(0);
    animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  24%, 70% {
    transform: scaleY(1);
    animation-timing-function: cubic-bezier(0.7, 0, 0.84, 0);
  }
  88%, 100% {
    transform: scaleY(0);
  }
}
@keyframes brand-loader-arm {
  0%, 16% {
    transform: rotate(60deg) scale(0);
    animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  44%, 60% {
    transform: rotate(0deg) scale(1);
    animation-timing-function: cubic-bezier(0.7, 0, 0.84, 0);
  }
  74%, 100% {
    transform: rotate(60deg) scale(0);
  }
}
.ghost {
  opacity: 0.3;
}

.fill .mark {
  animation: brand-loader-fill var(--brand-loader-duration) cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

.progress .mark {
  clip-path: inset(calc((1 - var(--brand-loader-progress, 0)) * 100%) 0 0 0);
  transition: clip-path 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes brand-loader-fill {
  0% {
    clip-path: inset(100% 0 0 0);
  }
  60%, 72% {
    clip-path: inset(0 0 0 0);
  }
  100% {
    clip-path: inset(0 0 100% 0);
  }
}
.pulse svg {
  animation: brand-loader-beat calc(var(--brand-loader-duration) * 0.75) infinite;
}

.pulse::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border: calc(var(--brand-loader-size) / 24) solid var(--brand-loader-tile-color);
  opacity: 0;
  animation: brand-loader-ring calc(var(--brand-loader-duration) * 0.75) cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
}

@keyframes brand-loader-beat {
  0%, 40%, 100% {
    transform: scale(1);
  }
  8% {
    transform: scale(0.9);
  }
  16% {
    transform: scale(1.05);
  }
  24% {
    transform: scale(0.95);
  }
  32% {
    transform: scale(1.02);
  }
}
@keyframes brand-loader-ring {
  0%, 14% {
    transform: scale(1);
    opacity: 0;
  }
  16% {
    transform: scale(1);
    opacity: 0.5;
  }
  72%, 100% {
    transform: scale(1.7);
    opacity: 0;
  }
}
.track,
.runner {
  fill: none;
  stroke: var(--brand-loader-tile-color);
  stroke-width: 10;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.track {
  stroke-opacity: 0.16;
}

.runner {
  stroke-dasharray: 0.04 0.96;
  animation: brand-loader-orbit var(--brand-loader-duration) cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes brand-loader-orbit {
  0% {
    stroke-dasharray: 0.04 0.96;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 0.4 0.6;
    stroke-dashoffset: -0.3;
  }
  100% {
    stroke-dasharray: 0.04 0.96;
    stroke-dashoffset: -1;
  }
}
@media (prefers-reduced-motion: reduce) {
  :host(:not([full-motion])) .brand-loader *,
  :host(:not([full-motion])) .brand-loader::before {
    animation: none;
  }
  :host(:not([full-motion])) .trace .mark {
    fill-opacity: 1;
    stroke-dashoffset: 0;
  }
  :host(:not([full-motion])) .fill .mark {
    clip-path: none;
  }
  :host(:not([full-motion])) .runner {
    display: none;
  }
  :host(:not([full-motion])) .brand-loader:not(.progress) svg {
    animation: brand-loader-breathe 2s ease-in-out infinite;
  }
}
@keyframes brand-loader-breathe {
  50% {
    opacity: 0.55;
  }
}`;

// The r mark, redrawn from the Redvars logo on a 256 tile
const MARK_PATH = 'M90 84H118L125.5 108C129 98 146 83 162 82H180L178 118H158C144 120 128 130 128 146V224H90Z';
// The same mark in two pieces, overlapping at the joint, for the build variant
const STEM_PATH = 'M90 84H118L125.5 108L128 116V224H90Z';
const ARM_PATH = 'M125.5 108C129 98 146 83 162 82H180L178 118H158C144 120 128 130 128 146H120V108Z';
// A square track just outside the tile, starting at its top centre, for the orbit variant
const TRACK_PATH = 'M128 -20H276V276H-20V-20Z';
/**
 * @label Brand Loader
 * @tag wc-brand-loader
 * @rawTag brand-loader
 * @summary A loading indicator built from the Redvars r mark.
 * @cssprop --brand-loader-size - The edge of the loader.
 * @cssprop --brand-loader-tile-color - The color of the tile.
 * @cssprop --brand-loader-mark-color - The color of the r.
 * @cssprop --brand-loader-duration - The length of one loop.
 * @tags display
 *
 * @example
 * ```html
 * <wc-brand-loader></wc-brand-loader>
 * ```
 */
let BrandLoader = class BrandLoader extends i$1 {
    constructor() {
        super(...arguments);
        /** How the mark moves while loading. Ignored once `value` is set. */
        this.variant = 'build';
        /** The accessible name of the loader. */
        this.label = 'Loading';
        /** Plays the full animation even when the system asks for reduced motion. */
        this.fullMotion = false;
    }
    get determinate() {
        return typeof this.value === 'number' && !Number.isNaN(this.value);
    }
    get progress() {
        return Math.min(100, Math.max(0, this.value ?? 0));
    }
    renderMark() {
        if (this.determinate || this.variant === 'fill') {
            return w `
        <path class="ghost" d=${MARK_PATH}></path>
        <path class="mark" d=${MARK_PATH}></path>
      `;
        }
        if (this.variant === 'build') {
            return w `
        <path class="stem" d=${STEM_PATH}></path>
        <path class="arm" d=${ARM_PATH}></path>
      `;
        }
        if (this.variant === 'trace') {
            return w `<path class="mark" pathLength="1" d=${MARK_PATH}></path>`;
        }
        return w `<path class="mark" d=${MARK_PATH}></path>`;
    }
    render() {
        const mode = this.determinate ? 'progress' : this.variant;
        const orbit = mode === 'orbit';
        return b `
      <div
        class="brand-loader ${mode}"
        role="progressbar"
        aria-label=${this.label}
        aria-valuemin=${this.determinate ? 0 : A}
        aria-valuemax=${this.determinate ? 100 : A}
        aria-valuenow=${this.determinate ? this.progress : A}
        style=${o({
            '--brand-loader-progress': this.determinate
                ? `${this.progress / 100}`
                : undefined,
        })}
      >
        <svg
          viewBox=${orbit ? '-40 -40 336 336' : '0 0 256 256'}
          aria-hidden="true"
        >
          ${orbit
            ? w `
              <path class="track" d=${TRACK_PATH}></path>
              <path class="runner" pathLength="1" d=${TRACK_PATH}></path>
            `
            : A}
          <rect class="tile" width="256" height="256"></rect>
          ${this.renderMark()}
        </svg>
      </div>
    `;
    }
};
BrandLoader.styles = [css_248z];
__decorate([
    n({ type: String, reflect: true })
], BrandLoader.prototype, "variant", void 0);
__decorate([
    n({ type: Number })
], BrandLoader.prototype, "value", void 0);
__decorate([
    n({ type: String })
], BrandLoader.prototype, "label", void 0);
__decorate([
    n({ type: Boolean, reflect: true, attribute: 'full-motion' })
], BrandLoader.prototype, "fullMotion", void 0);
BrandLoader = __decorate([
    IndividualComponent
], BrandLoader);

export { BrandLoader };
//# sourceMappingURL=brand-loader.js.map
