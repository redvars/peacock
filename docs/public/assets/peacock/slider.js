import { i, _ as __decorate, I as IndividualComponent, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-NDIkZErE.js';
import { o } from './style-map-CHOg6N_R.js';
import { B as BaseInput } from './BaseInput-BqE3rprN.js';
import { I as I18nController } from './i18n-controller-DLJcJ5gO.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';
import './element-internals-QME0yEz4.js';
import './form-associated-BHbg72PG.js';
import './strings-MXyrGrNs.js';
import './suggestion-controller-BKMbUhgq.js';
import './ai-controller-DR_Tg0sN.js';
import './locale-DEsJZCQG.js';

var css_248z = i`:host {
  --_track-height: 0.25rem;
  --_thumb-size: 1.25rem;
  --thumb-half: calc(var(--_thumb-size) / 2);
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

:host([size=md]) {
  --_track-height: 0.5rem;
  --_thumb-size: 1.5rem;
}

:host([size=lg]) {
  --_track-height: 0.75rem;
  --_thumb-size: 1.75rem;
}

.wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-050);
  width: 100%;
}
.wrapper .label {
  font-family: var(--typography-body-small-font-family) !important;
  font-size: var(--typography-body-small-font-size) !important;
  font-weight: var(--typography-body-small-font-weight) !important;
  line-height: var(--typography-body-small-line-height) !important;
  letter-spacing: var(--typography-body-small-letter-spacing) !important;
  color: var(--color-on-surface-variant);
}
.wrapper .helper {
  font-family: var(--typography-body-small-font-family) !important;
  font-size: var(--typography-body-small-font-size) !important;
  font-weight: var(--typography-body-small-font-weight) !important;
  line-height: var(--typography-body-small-line-height) !important;
  letter-spacing: var(--typography-body-small-letter-spacing) !important;
  color: var(--color-on-surface-variant);
}
.wrapper.error .label,
.wrapper.error .helper {
  color: var(--color-error);
}
.wrapper.disabled .label, .wrapper.disabled .helper {
  opacity: 0.38;
}
.wrapper.readonly .slider-container {
  cursor: default;
}
.wrapper.readonly .thumb {
  cursor: default;
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
  box-shadow: var(--elevation-level1);
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
  box-shadow: var(--elevation-level5);
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
  border-radius: var(--shape-corner-extra-small);
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
}

.label-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-100);
}`;

let sliderCount = 0;
/**
 * @label Slider
 * @tag wc-slider
 * @rawTag slider
 *
 * @summary A track with a thumb the person drags to pick a number from a range.
 * @overview
 * <p>The slider is form-associated: its <code>value</code> is submitted under its <code>name</code>,
 * and <code>form.reset()</code> restores the starting value. Without a <code>value</code> it starts
 * at the middle of <code>min</code>–<code>max</code>, like a native range input.</p>
 * <p><code>label</code> is shown above the track, as on fields, and names the thumb; without it the
 * thumb is named "Slider". <code>value-text</code> (the <code>valueText</code> property) formats
 * the value for <code>aria-valuetext</code> and the visible value, for example
 * <code>v =&gt; `${v}%`</code>.</p>
 * <p><code>required</code> does not apply: a slider always has a value. <code>readonly</code> keeps
 * it focusable but its value cannot change.</p>
 * <p>Keyboard: the arrows move one step (ten with Shift), Page Up and Page Down move ten steps,
 * Home and End go to <code>min</code> and <code>max</code>.</p>
 *
 * @fires {CustomEvent<{value: number}>} input - Dispatched when the slider value changes during interaction.
 * @fires {CustomEvent<{value: number}>} change - Dispatched when the slider interaction ends.
 *
 * @example
 * ```html
 * <wc-slider label="Volume" min="0" max="100" value="50"></wc-slider>
 * ```
 * @tags input, form
 */
let Slider = class Slider extends BaseInput {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        // `name` and `disabled` come from mixinFormAssociated; `readonly` and `required` from BaseInput.
        /**
         * The minimum value of the slider.
         */
        this.min = 0;
        /**
         * The maximum value of the slider.
         */
        this.max = 100;
        /**
         * The step increment for the slider.
         */
        this.step = 1;
        /** Label shown above the slider; also the thumb's accessible name. */
        this.label = '';
        /** Help text shown below the slider. */
        this.helperText = '';
        /** Shows the slider in its error state with `error-text`. */
        this.error = false;
        /** Error message shown below the slider while `error` is set; replaces the help text. */
        this.errorText = '';
        /** Size of the track and thumb: `sm` (default), `md` or `lg`. */
        this.size = 'sm';
        /**
         * Where the value shows: `thumb` (on the thumb while it is used; the default), `end` (after the
         * track) or `none`.
         */
        this.valueLabel = 'thumb';
        // ── State ────────────────────────────────────────────────────────────────
        /** True while the user is actively dragging the thumb. */
        this.isDragging = false;
        this.idPrefix = `wc-slider-${(sliderCount += 1)}`;
        /** Peacock's strings for the thumb label. */
        this.i18n = new I18nController(this);
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
            this.emit('change');
            window.removeEventListener('mousemove', this.onMouseMove);
            window.removeEventListener('mouseup', this.onMouseUp);
            window.removeEventListener('touchmove', this.onMouseMove);
            window.removeEventListener('touchend', this.onMouseUp);
            window.removeEventListener('touchcancel', this.onMouseUp);
        };
    }
    /**
     * The current value of the slider. Defaults to the middle of `min`–`max`.
     */
    get value() {
        return this.explicitValue ?? this.snapToStep((this.min + this.max) / 2);
    }
    set value(value) {
        const old = this.value;
        this.explicitValue =
            value === undefined || value === null || Number.isNaN(Number(value))
                ? undefined
                : Number(value);
        this.requestUpdate('value', old);
    }
    // ── Lifecycle ────────────────────────────────────────────────────────────
    connectedCallback() {
        this.startedWithValue ??= this.explicitValue !== undefined;
        super.connectedCallback();
    }
    // ── Public methods ───────────────────────────────────────────────────────
    focus() {
        this.thumbElement?.focus();
    }
    blur() {
        this.thumbElement?.blur();
    }
    // ── Form association ─────────────────────────────────────────────────────
    formResetCallback() {
        super.formResetCallback();
        if (!this.startedWithValue)
            this.value = undefined;
    }
    parseRestoreState(restored) {
        const value = Number(restored);
        return typeof restored === 'string' && !Number.isNaN(value)
            ? value
            : this.value;
    }
    // ── Protected methods ────────────────────────────────────────────────────
    /** A slider always has a value in range, so only `setCustomValidity()` makes it invalid. */
    computeValidity() {
        return { flags: {}, message: '' };
    }
    validityAnchor() {
        return this.thumbElement;
    }
    // ── Private methods ──────────────────────────────────────────────────────
    get isInteractive() {
        return !this.disabled && !this.readonly;
    }
    /** Where the value shows, from `value-label`. */
    get valuePlacement() {
        return {
            thumb: this.valueLabel === 'thumb',
            end: this.valueLabel === 'end',
        };
    }
    formatValue(value) {
        return this.valueText ? this.valueText(value) : String(value);
    }
    emit(type) {
        this.dispatchEvent(new CustomEvent(type, {
            detail: { value: this.value },
            bubbles: true,
            composed: true,
        }));
    }
    handleInput(event) {
        if (!this.isInteractive)
            return;
        const rect = this.container.getBoundingClientRect();
        const clientX = 'touches' in event
            ? event.touches[0].clientX
            : event.clientX;
        // Calculate percentage relative to track width
        let percentage = (clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        const rawValue = this.min + percentage * (this.max - this.min);
        const steppedValue = this.snapToStep(rawValue);
        const oldValue = this.value;
        this.value = Math.max(this.min, Math.min(this.max, steppedValue));
        if (oldValue !== this.value)
            this.emit('input');
    }
    onMouseDown(e) {
        if (!this.isInteractive)
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
    /**
     * Rounds a value to the nearest step counted from `min`, like a native range input, so a slider
     * with `min="1" step="5"` lands on 1, 6, 11. Rounds away float noise from fractional steps.
     */
    snapToStep(raw) {
        if (!(this.step > 0))
            return raw;
        const stepped = this.min + Math.round((raw - this.min) / this.step) * this.step;
        const decimals = Math.max((String(this.step).split('.')[1] ?? '').length, (String(this.min).split('.')[1] ?? '').length);
        return Number(stepped.toFixed(decimals));
    }
    handleKeyDown(e) {
        if (!this.isInteractive)
            return;
        const increment = e.shiftKey ? this.step * 10 : this.step;
        const page = this.step * 10;
        const current = this.value;
        let newValue = current;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            newValue = Math.min(this.max, current + increment);
        }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            newValue = Math.max(this.min, current - increment);
        }
        else if (e.key === 'PageUp') {
            newValue = Math.min(this.max, current + page);
        }
        else if (e.key === 'PageDown') {
            newValue = Math.max(this.min, current - page);
        }
        else if (e.key === 'Home') {
            newValue = this.min;
        }
        else if (e.key === 'End') {
            newValue = this.max;
        }
        else {
            return;
        }
        e.preventDefault();
        if (newValue !== current) {
            this.value = newValue;
            this.emit('input');
            this.emit('change');
        }
    }
    /** A suggestion for a slider is a number. */
    writeSuggestionValue(value) {
        this.value = Number(value);
    }
    // ── Render ───────────────────────────────────────────────────────────────
    render() {
        const { value } = this;
        const range = this.max - this.min;
        const percentage = range > 0 ? ((value - this.min) / range) * 100 : 0;
        const placement = this.valuePlacement;
        const formatted = this.formatValue(value);
        const labelId = `${this.idPrefix}-label`;
        const descriptionId = `${this.idPrefix}-description`;
        const errorText = this.error ? this.errorText : this.validationText;
        const invalid = this.error || !!errorText;
        const description = errorText || this.suggestionReason || this.helperText;
        return b `
      <div
        class=${e$1({
            wrapper: true,
            [`size-${this.size}`]: true,
            disabled: this.disabled,
            readonly: this.readonly,
            error: invalid,
        })}
      >
        ${this.label
            ? this.labelWithSuggestion(b `<div class="label" id=${labelId}>${this.label}</div>`)
            : this.suggestionBadge()}
        <div class="slider ${placement.end ? 'with-value' : ''}">
          <div
            class="slider-container ${this.disabled ? 'disabled' : ''}"
            @mousedown=${this.onMouseDown}
            @touchstart=${this.onMouseDown}
          >
            <div class="track">
              <div
                class="track-active"
                style=${o({ width: `${percentage}%` })}
              ></div>
            </div>

            <div
              class="thumb"
              role="slider"
              aria-label=${this.label ? A : this.i18n.t('slider')}
              aria-labelledby=${this.label ? labelId : A}
              aria-describedby=${description ? descriptionId : A}
              tabindex="${this.disabled ? -1 : 0}"
              aria-valuemin=${this.min}
              aria-valuemax=${this.max}
              aria-valuenow=${value}
              aria-valuetext=${this.valueText ? formatted : A}
              aria-disabled=${this.disabled ? 'true' : A}
              aria-readonly=${this.readonly ? 'true' : A}
              aria-invalid=${invalid ? 'true' : A}
              style=${o({
            left: `calc(${percentage}% - var(--thumb-half))`,
        })}
              @keydown=${this.handleKeyDown}
            >
              ${placement.thumb
            ? b `<div class="value-label">${formatted}</div>`
            : ''}
            </div>
          </div>

          ${placement.end
            ? b `<output class="value-display" aria-hidden="true"
                >${formatted}</output
              >`
            : ''}
        </div>
        ${description
            ? b `<div class="helper" id=${descriptionId}>${description}</div>`
            : A}
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
    n({ type: Number })
], Slider.prototype, "value", null);
__decorate([
    n({ type: Number })
], Slider.prototype, "step", void 0);
__decorate([
    n({ type: String })
], Slider.prototype, "label", void 0);
__decorate([
    n({ type: String, attribute: 'helper-text' })
], Slider.prototype, "helperText", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Slider.prototype, "error", void 0);
__decorate([
    n({ type: String, attribute: 'error-text' })
], Slider.prototype, "errorText", void 0);
__decorate([
    n({ type: String, reflect: true })
], Slider.prototype, "size", void 0);
__decorate([
    n({ type: String, attribute: 'value-label' })
], Slider.prototype, "valueLabel", void 0);
__decorate([
    n({ attribute: false })
], Slider.prototype, "valueText", void 0);
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
