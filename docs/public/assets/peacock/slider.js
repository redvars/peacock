import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './query-CHb9Ft_d.js';
import { o } from './style-map-BQD5Et1D.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`:host {
  --_track-height: 4px;
  --_thumb-size: 20px;
  --thumb-half: 10px;
  --_active-track-color: var(--color-primary);
  --_inactive-track-color: var(--color-secondary-container);
  --_thumb-color: var(--color-primary);
  --_label-color: var(--color-primary);
  --_label-text-color: var(--color-on-primary);
  display: inline-block;
  width: 100%;
  min-width: 200px;
  vertical-align: middle;
  touch-action: none;
}

.slider {
  display: flex;
  align-items: center;
  gap: var(--spacing-100, 0.5rem);
  width: 100%;
}

.slider.with-value .slider-container {
  flex: 1;
}

.slider-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  cursor: pointer;
}
.slider-container.disabled {
  pointer-events: none;
  opacity: 0.38;
}

.value-display {
  min-width: 2.25rem;
  text-align: end;
  color: var(--color-on-surface-variant);
  font-size: 0.875rem;
  font-weight: 500;
}

.track {
  position: absolute;
  width: 100%;
  height: var(--_track-height);
  background-color: var(--_inactive-track-color);
  border-radius: var(--_track-height);
  overflow: hidden;
  pointer-events: none;
}
.track .track-active {
  position: absolute;
  height: 100%;
  background-color: var(--_active-track-color);
  will-change: width;
}

.thumb {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: var(--_thumb-size);
  height: var(--_thumb-size);
  background-color: var(--_thumb-color);
  border-radius: 50%;
  box-shadow: var(--md-sys-elevation-1);
  outline: none;
  cursor: grab;
  transition: left 0.05s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.2s ease;
  will-change: left;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background-color: var(--_thumb-color);
  opacity: 0;
  transition: opacity 0.2s;
}
.thumb:hover::before {
  opacity: 0.08;
}
.thumb:focus-visible::before {
  opacity: 0.12;
}
.thumb:active {
  cursor: grabbing;
  box-shadow: var(--md-sys-elevation-5);
}
.thumb.dragging {
  transition: none;
}

.value-label {
  position: absolute;
  bottom: 100%;
  margin-bottom: 8px;
  padding: 4px 8px;
  background-color: var(--_label-color);
  color: var(--_label-text-color);
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.1s, transform 0.1s;
  pointer-events: none;
}
.value-label::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--_label-color);
}

.slider-container.dragging .value-label,
.slider-container:active .value-label,
.thumb:focus-visible .value-label {
  opacity: 1;
  transform: translateY(0);
}`;

/**
 * @label Slider
 * @tag wc-slider
 * @rawTag slider
 *
 * @summary Sliders allow users to make selections from a range of values.
 *
 * @fires {CustomEvent} input - Dispatched when the slider value changes during interaction.
 * @fires {CustomEvent} change - Dispatched when the slider interaction ends.
 *
 * @example
 * ```html
 * <wc-slider min="0" max="100" value="50"></wc-slider>
 * ```
 */
let Slider = class Slider extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * The minimum value of the slider.
         */
        this.min = 0;
        /**
         * The maximum value of the slider.
         */
        this.max = 100;
        /**
         * The current value of the slider.
         */
        this.value = 50;
        /**
         * The step increment for the slider.
         */
        this.step = 1;
        /**
         * Whether the slider is disabled.
         */
        this.disabled = false;
        /**
         * Whether to show labels on the slider.
         */
        this.labeled = true;
        /**
         * Whether to show the current value beside the slider.
         */
        this.showValue = false;
        /** True while the user is actively dragging the thumb. */
        this.isDragging = false;
        this.onMouseMove = (e) => {
            if (this.isDragging) {
                e.preventDefault();
                this.handleInput(e);
            }
        };
        this.onMouseUp = () => {
            if (!this.isDragging)
                return;
            this.isDragging = false;
            this.container.classList.remove('dragging');
            this.thumbElement.classList.remove('dragging');
            this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value }, bubbles: true, composed: true }));
            window.removeEventListener('mousemove', this.onMouseMove);
            window.removeEventListener('mouseup', this.onMouseUp);
            window.removeEventListener('touchmove', this.onMouseMove);
            window.removeEventListener('touchend', this.onMouseUp);
            window.removeEventListener('touchcancel', this.onMouseUp);
        };
    }
    handleInput(event) {
        if (this.disabled)
            return;
        const rect = this.container.getBoundingClientRect();
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        // Calculate percentage relative to track width
        let percentage = (clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        const rawValue = this.min + percentage * (this.max - this.min);
        const steppedValue = Math.round(rawValue / this.step) * this.step;
        const oldValue = this.value;
        this.value = Math.max(this.min, Math.min(this.max, steppedValue));
        if (oldValue !== this.value) {
            this.dispatchEvent(new CustomEvent('input', { detail: { value: this.value }, bubbles: true, composed: true }));
        }
    }
    onMouseDown(e) {
        if (this.disabled)
            return;
        e.preventDefault();
        this.isDragging = true;
        // Add dragging class for CSS state
        this.container.classList.add('dragging');
        this.thumbElement.classList.add('dragging');
        this.handleInput(e);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('touchmove', this.onMouseMove, { passive: false });
        window.addEventListener('touchend', this.onMouseUp);
        window.addEventListener('touchcancel', this.onMouseUp);
    }
    handleKeyDown(e) {
        if (this.disabled)
            return;
        const increment = e.shiftKey ? this.step * 10 : this.step;
        let newValue = this.value;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            newValue = Math.min(this.max, this.value + increment);
            e.preventDefault();
        }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            newValue = Math.max(this.min, this.value - increment);
            e.preventDefault();
        }
        else if (e.key === 'Home') {
            newValue = this.min;
            e.preventDefault();
        }
        else if (e.key === 'End') {
            newValue = this.max;
            e.preventDefault();
        }
        if (newValue !== this.value) {
            this.value = newValue;
            this.dispatchEvent(new CustomEvent('input', { detail: { value: this.value }, bubbles: true, composed: true }));
            this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value }, bubbles: true, composed: true }));
        }
    }
    render() {
        const percentage = ((this.value - this.min) / (this.max - this.min)) * 100;
        return b `
      <div class="slider ${this.showValue ? 'with-value' : ''}">
        <div 
          class="slider-container ${this.disabled ? 'disabled' : ''}"
          @mousedown=${this.onMouseDown}
          @touchstart=${this.onMouseDown}
        >
          <div class="track">
            <div class="track-active" style=${o({ width: `${percentage}%` })}></div>
          </div>

          <div 
            class="thumb" 
            role="slider"
            aria-label="Slider"
            tabindex="${this.disabled ? -1 : 0}"
            aria-valuemin=${this.min}
            aria-valuemax=${this.max}
            aria-valuenow=${this.value}
            aria-disabled=${this.disabled}
            style=${o({ left: `calc(${percentage}% - var(--thumb-half))` })}
            @keydown=${this.handleKeyDown}
          >
            ${this.labeled ? b `<div class="value-label">${this.value}</div>` : ''}
          </div>
        </div>

        ${this.showValue ? b `<output class="value-display" aria-live="polite">${this.value}</output>` : ''}
      </div>
    `;
    }
};
Slider.styles = [css_248z];
__decorate([
    n({ type: Number })
], Slider.prototype, "min", void 0);
__decorate([
    n({ type: Number })
], Slider.prototype, "max", void 0);
__decorate([
    n({ type: Number, reflect: true })
], Slider.prototype, "value", void 0);
__decorate([
    n({ type: Number })
], Slider.prototype, "step", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Slider.prototype, "disabled", void 0);
__decorate([
    n({ type: Boolean })
], Slider.prototype, "labeled", void 0);
__decorate([
    n({ type: Boolean, attribute: 'show-value' })
], Slider.prototype, "showValue", void 0);
__decorate([
    r()
], Slider.prototype, "isDragging", void 0);
__decorate([
    e('.slider-container')
], Slider.prototype, "container", void 0);
__decorate([
    e('.thumb')
], Slider.prototype, "thumbElement", void 0);
Slider = __decorate([
    IndividualComponent
], Slider);

export { Slider };
//# sourceMappingURL=slider.js.map
