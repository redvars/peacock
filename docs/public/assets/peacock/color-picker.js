import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './query-CHb9Ft_d.js';
import { o } from './style-map-BQD5Et1D.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`:host {
  --_sv-height: var(--color-picker-sv-height, 160px);
  --_thumb-size: 16px;
  --_track-height: 12px;
  --_preview-size: 40px;
  --_radius: 6px;
  display: inline-block;
  width: var(--color-picker-width, 240px);
  touch-action: none;
}

.color-picker {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100, 0.5rem);
}
.color-picker.disabled {
  opacity: 0.38;
  pointer-events: none;
}

.sv-panel {
  position: relative;
  width: 100%;
  height: var(--_sv-height);
  border-radius: var(--_radius);
  background: linear-gradient(to bottom, transparent 0%, #000 100%), linear-gradient(to right, #fff 0%, var(--hue-color) 100%);
  cursor: crosshair;
  user-select: none;
  overflow: hidden;
}

.sv-cursor {
  position: absolute;
  width: var(--_thumb-size);
  height: var(--_thumb-size);
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
  outline: none;
  cursor: crosshair;
}
.sv-cursor:focus-visible {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--color-primary);
}

.controls-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-200, 1rem);
}

.color-preview {
  width: var(--_preview-size);
  height: var(--_preview-size);
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  background: repeating-conic-gradient(#bbb 0% 25%, #fff 0% 50%) 0 0/8px 8px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
}

.preview-inner {
  width: 100%;
  height: 100%;
}

.sliders {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100, 0.5rem);
}

.slider-track {
  position: relative;
  width: 100%;
  height: var(--_track-height);
  border-radius: calc(var(--_track-height) / 2);
  cursor: pointer;
  user-select: none;
}

.hue-track {
  background: linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(0, 100%, 50%));
}

.alpha-track {
  background: linear-gradient(to right, transparent, var(--current-color, currentColor)), repeating-conic-gradient(#bbb 0% 25%, #fff 0% 50%) 0 0/8px 8px;
}

.slider-thumb {
  position: absolute;
  top: 50%;
  width: var(--_thumb-size);
  height: var(--_thumb-size);
  border-radius: 50%;
  background: #fff;
  border: 2px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
  cursor: grab;
  outline: none;
  transition: box-shadow 0.15s ease;
}
.slider-thumb:focus-visible {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--color-primary);
}
.slider-thumb:active {
  cursor: grabbing;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.inputs-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-100, 0.5rem);
}

.hex-input-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  gap: var(--spacing-050, 0.25rem);
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--color-outline-variant, #ccc);
  border-radius: var(--_radius);
  background: var(--color-surface-container-high, #ece6f0);
}

.hex-prefix {
  color: var(--color-on-surface-variant, #666);
  font-size: 13px;
  flex-shrink: 0;
}

.input-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-on-surface-variant, #666);
  flex-shrink: 0;
}

.hex-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  font-family: var(--typography-mono-font-family, monospace);
  color: var(--color-on-surface, #333);
}

.alpha-input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-050, 0.25rem);
  height: 32px;
  padding: 0 8px;
  width: 64px;
  flex-shrink: 0;
  border: 1px solid var(--color-outline-variant, #ccc);
  border-radius: var(--_radius);
  background: var(--color-surface-container-high, #ece6f0);
}

.alpha-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: var(--color-on-surface, #333);
}
.alpha-input::-webkit-inner-spin-button, .alpha-input::-webkit-outer-spin-button {
  appearance: none;
}
.alpha-input {
  appearance: textfield;
}`;

// ── Color utilities ───────────────────────────────────────────────────────────
function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const full = clean.length === 3
        ? clean.split('').map(c => c + c).join('')
        : clean.slice(0, 6);
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}
function rgbToHsv(r, g, b) {
    const r1 = r / 255, g1 = g / 255, b1 = b / 255;
    const max = Math.max(r1, g1, b1);
    const min = Math.min(r1, g1, b1);
    const delta = max - min;
    let h = 0;
    if (delta !== 0) {
        if (max === r1)
            h = ((g1 - b1) / delta) % 6;
        else if (max === g1)
            h = (b1 - r1) / delta + 2;
        else
            h = (r1 - g1) / delta + 4;
        h = Math.round(h * 60);
        if (h < 0)
            h += 360;
    }
    return { h, s: max === 0 ? 0 : delta / max, v: max };
}
function hsvToRgb(h, s, v) {
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    let r1 = 0, g1 = 0, b1 = 0;
    if (h < 60) {
        r1 = c;
        g1 = x;
    }
    else if (h < 120) {
        r1 = x;
        g1 = c;
    }
    else if (h < 180) {
        g1 = c;
        b1 = x;
    }
    else if (h < 240) {
        g1 = x;
        b1 = c;
    }
    else if (h < 300) {
        r1 = x;
        b1 = c;
    }
    else {
        r1 = c;
        b1 = x;
    }
    return {
        r: Math.round((r1 + m) * 255),
        g: Math.round((g1 + m) * 255),
        b: Math.round((b1 + m) * 255),
    };
}
function isValidHex(s) {
    return /^[0-9a-fA-F]{6}$/.test(s);
}
// ── Component ─────────────────────────────────────────────────────────────────
/**
 * @label Color Picker
 * @tag wc-color-picker
 * @rawTag color-picker
 *
 * @summary A color picker component for selecting colors via a hue/saturation/value interface.
 *
 * @overview
 * <p>The color picker presents a 2D saturation–brightness panel with a hue slider below it.
 * An optional alpha slider allows controlling opacity. The current hex value is displayed in
 * an editable text field.</p>
 *
 * @cssprop --color-picker-width - Overall width of the component. Defaults to 240px.
 * @cssprop --color-picker-sv-height - Height of the saturation/brightness panel. Defaults to 160px.
 *
 * @fires {CustomEvent<{value: string, alpha: number}>} input - Dispatched continuously while the color is being changed.
 * @fires {CustomEvent<{value: string, alpha: number}>} change - Dispatched when a color change is committed (pointer up, key, or input blur).
 *
 * @example
 * ```html
 * <wc-color-picker value="#2352d5"></wc-color-picker>
 * ```
 *
 * @example
 * ```html
 * <wc-color-picker value="#ff573380" alpha></wc-color-picker>
 * ```
 */
let ColorPicker = class ColorPicker extends i$1 {
    constructor() {
        // ── Static ────────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        /**
         * The current color as a 6-digit hex string (e.g. `"#ff5733"`).
         */
        this.value = '#2352d5';
        /**
         * Whether to show the alpha (opacity) slider and input.
         */
        this.alpha = false;
        /**
         * Whether the color picker is disabled.
         */
        this.disabled = false;
        // ── State ─────────────────────────────────────────────────────────────────
        /** Current hue, 0–360. */
        this._hue = 0;
        /** Current saturation, 0–1 (x-axis of the SV panel). */
        this._sat = 0;
        /** Current brightness (value in HSV), 0–1 (y-axis, 1 = bright). */
        this._bri = 1;
        /** Current opacity, 0–1. */
        this._opacity = 1;
        /** Intermediate value for the hex text input (without `#`). */
        this._hexInput = '';
        // ── Private fields ────────────────────────────────────────────────────────
        /** Tracks which drag handle is currently active. */
        this._dragging = null;
        /** The last `value` we set ourselves, used to skip redundant re-syncs in `updated`. */
        this._lastEmittedValue = '';
    }
    // ── Lifecycle ─────────────────────────────────────────────────────────────
    connectedCallback() {
        super.connectedCallback();
        this._syncFromValue();
        this._lastEmittedValue = this.value;
    }
    updated(changed) {
        if (changed.has('value') && this.value !== this._lastEmittedValue) {
            this._syncFromValue();
        }
    }
    // ── Private methods ───────────────────────────────────────────────────────
    _syncFromValue() {
        const clean = this.value.startsWith('#') ? this.value.slice(1) : this.value;
        if (!isValidHex(clean))
            return;
        const { r, g, b } = hexToRgb('#' + clean);
        const { h, s, v } = rgbToHsv(r, g, b);
        this._hue = h;
        this._sat = s;
        this._bri = v;
        this._hexInput = clean.toUpperCase();
    }
    _computeHex() {
        const { r, g, b } = hsvToRgb(this._hue, this._sat, this._bri);
        return rgbToHex(r, g, b);
    }
    _emitValue(type) {
        const hex = this._computeHex();
        this._lastEmittedValue = hex;
        this.value = hex;
        this._hexInput = hex.slice(1).toUpperCase();
        this.dispatchEvent(new CustomEvent(type, {
            detail: { value: hex, alpha: this._opacity },
            bubbles: true,
            composed: true,
        }));
    }
    // SV panel
    _onSvPointerDown(e) {
        if (this.disabled)
            return;
        e.preventDefault();
        this._dragging = 'sv';
        e.currentTarget.setPointerCapture(e.pointerId);
        this._updateSv(e);
        this._emitValue('input');
    }
    _onSvPointerMove(e) {
        if (this._dragging !== 'sv')
            return;
        this._updateSv(e);
        this._emitValue('input');
    }
    _onSvPointerUp() {
        if (this._dragging !== 'sv')
            return;
        this._dragging = null;
        this._emitValue('change');
    }
    _updateSv(e) {
        const rect = this._svPanel.getBoundingClientRect();
        this._sat = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this._bri = 1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    }
    _onSvKeyDown(e) {
        if (this.disabled)
            return;
        const step = e.shiftKey ? 0.1 : 0.01;
        let changed = false;
        if (e.key === 'ArrowRight') {
            this._sat = Math.min(1, this._sat + step);
            changed = true;
        }
        else if (e.key === 'ArrowLeft') {
            this._sat = Math.max(0, this._sat - step);
            changed = true;
        }
        else if (e.key === 'ArrowUp') {
            this._bri = Math.min(1, this._bri + step);
            changed = true;
        }
        else if (e.key === 'ArrowDown') {
            this._bri = Math.max(0, this._bri - step);
            changed = true;
        }
        if (changed) {
            e.preventDefault();
            this._emitValue('input');
            this._emitValue('change');
        }
    }
    // Hue slider
    _onHuePointerDown(e) {
        if (this.disabled)
            return;
        e.preventDefault();
        this._dragging = 'hue';
        e.currentTarget.setPointerCapture(e.pointerId);
        this._updateHue(e);
        this._emitValue('input');
    }
    _onHuePointerMove(e) {
        if (this._dragging !== 'hue')
            return;
        this._updateHue(e);
        this._emitValue('input');
    }
    _onHuePointerUp() {
        if (this._dragging !== 'hue')
            return;
        this._dragging = null;
        this._emitValue('change');
    }
    _updateHue(e) {
        const rect = this._hueTrack.getBoundingClientRect();
        this._hue = Math.round(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 360);
    }
    _onHueKeyDown(e) {
        if (this.disabled)
            return;
        const step = e.shiftKey ? 10 : 1;
        let changed = false;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            this._hue = Math.min(360, this._hue + step);
            changed = true;
        }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            this._hue = Math.max(0, this._hue - step);
            changed = true;
        }
        if (changed) {
            e.preventDefault();
            this._emitValue('input');
            this._emitValue('change');
        }
    }
    // Alpha slider
    _onAlphaPointerDown(e) {
        if (this.disabled)
            return;
        e.preventDefault();
        this._dragging = 'alpha';
        e.currentTarget.setPointerCapture(e.pointerId);
        this._updateAlpha(e);
        this._emitValue('input');
    }
    _onAlphaPointerMove(e) {
        if (this._dragging !== 'alpha')
            return;
        this._updateAlpha(e);
        this._emitValue('input');
    }
    _onAlphaPointerUp() {
        if (this._dragging !== 'alpha')
            return;
        this._dragging = null;
        this._emitValue('change');
    }
    _updateAlpha(e) {
        const rect = this._alphaTrack.getBoundingClientRect();
        this._opacity = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    }
    _onAlphaKeyDown(e) {
        if (this.disabled)
            return;
        const step = e.shiftKey ? 0.1 : 0.01;
        let changed = false;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            this._opacity = Math.min(1, this._opacity + step);
            changed = true;
        }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            this._opacity = Math.max(0, this._opacity - step);
            changed = true;
        }
        if (changed) {
            e.preventDefault();
            this._emitValue('input');
            this._emitValue('change');
        }
    }
    // Hex input
    _onHexInput(e) {
        const raw = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '');
        this._hexInput = raw;
        if (isValidHex(raw)) {
            const { r, g, b } = hexToRgb('#' + raw);
            const { h, s, v } = rgbToHsv(r, g, b);
            this._hue = h;
            this._sat = s;
            this._bri = v;
            this._emitValue('input');
        }
    }
    _onHexChange() {
        if (isValidHex(this._hexInput)) {
            this._emitValue('change');
        }
        else {
            this._hexInput = this.value.slice(1).toUpperCase();
        }
    }
    _onAlphaNumberChange(e) {
        const raw = parseInt(e.target.value, 10);
        this._opacity = Math.max(0, Math.min(100, isNaN(raw) ? 100 : raw)) / 100;
        this._emitValue('change');
    }
    // ── Render ────────────────────────────────────────────────────────────────
    render() {
        const hueColor = `hsl(${this._hue}, 100%, 50%)`;
        const currentHex = this._computeHex();
        const { r, g, b: b$1 } = hsvToRgb(this._hue, this._sat, this._bri);
        const previewColor = `rgba(${r}, ${g}, ${b$1}, ${this._opacity})`;
        return b `
      <div class="color-picker ${this.disabled ? 'disabled' : ''}">

        <!-- Saturation / Brightness 2D panel -->
        <div
          class="sv-panel"
          style=${o({ '--hue-color': hueColor })}
          @pointerdown=${this._onSvPointerDown}
          @pointermove=${this._onSvPointerMove}
          @pointerup=${this._onSvPointerUp}
          @pointercancel=${this._onSvPointerUp}
        >
          <div
            class="sv-cursor"
            role="slider"
            tabindex=${this.disabled ? '-1' : '0'}
            aria-label="Saturation and brightness"
            aria-valuetext="Saturation ${Math.round(this._sat * 100)}%, Brightness ${Math.round(this._bri * 100)}%"
            style=${o({
            left: `${this._sat * 100}%`,
            top: `${(1 - this._bri) * 100}%`,
        })}
            @keydown=${this._onSvKeyDown}
          ></div>
        </div>

        <!-- Preview swatch + sliders -->
        <div class="controls-row">
          <div class="color-preview">
            <div class="preview-inner" style=${o({ background: previewColor })}></div>
          </div>

          <div class="sliders">
            <!-- Hue slider -->
            <div
              class="slider-track hue-track"
              @pointerdown=${this._onHuePointerDown}
              @pointermove=${this._onHuePointerMove}
              @pointerup=${this._onHuePointerUp}
              @pointercancel=${this._onHuePointerUp}
            >
              <div
                class="slider-thumb"
                role="slider"
                tabindex=${this.disabled ? '-1' : '0'}
                aria-label="Hue"
                aria-valuemin="0"
                aria-valuemax="360"
                aria-valuenow=${this._hue}
                style=${o({ left: `${(this._hue / 360) * 100}%` })}
                @keydown=${this._onHueKeyDown}
              ></div>
            </div>

            ${this.alpha ? b `
              <!-- Alpha slider -->
              <div
                class="slider-track alpha-track"
                style=${o({ '--current-color': currentHex })}
                @pointerdown=${this._onAlphaPointerDown}
                @pointermove=${this._onAlphaPointerMove}
                @pointerup=${this._onAlphaPointerUp}
                @pointercancel=${this._onAlphaPointerUp}
              >
                <div
                  class="slider-thumb"
                  role="slider"
                  tabindex=${this.disabled ? '-1' : '0'}
                  aria-label="Opacity"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow=${Math.round(this._opacity * 100)}
                  style=${o({ left: `${this._opacity * 100}%` })}
                  @keydown=${this._onAlphaKeyDown}
                ></div>
              </div>
            ` : A}
          </div>
        </div>

        <!-- Hex + alpha inputs -->
        <div class="inputs-row">
          <div class="hex-input-wrapper">
            <span class="input-label">HEX</span>
            <span class="hex-prefix">#</span>
            <input
              class="hex-input"
              type="text"
              inputmode="text"
              maxlength="6"
              spellcheck="false"
              autocomplete="off"
              .value=${this._hexInput}
              ?disabled=${this.disabled}
              aria-label="Hex color value"
              @input=${this._onHexInput}
              @change=${this._onHexChange}
            />
          </div>

          ${this.alpha ? b `
            <div class="alpha-input-wrapper">
              <input
                class="alpha-input"
                type="number"
                min="0"
                max="100"
                step="1"
                .value=${String(Math.round(this._opacity * 100))}
                ?disabled=${this.disabled}
                aria-label="Opacity percentage"
                @change=${this._onAlphaNumberChange}
              />
              <span class="input-label">%</span>
            </div>
          ` : A}
        </div>

      </div>
    `;
    }
};
ColorPicker.styles = [css_248z];
__decorate([
    n({ type: String, reflect: true })
], ColorPicker.prototype, "value", void 0);
__decorate([
    n({ type: Boolean })
], ColorPicker.prototype, "alpha", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], ColorPicker.prototype, "disabled", void 0);
__decorate([
    r()
], ColorPicker.prototype, "_hue", void 0);
__decorate([
    r()
], ColorPicker.prototype, "_sat", void 0);
__decorate([
    r()
], ColorPicker.prototype, "_bri", void 0);
__decorate([
    r()
], ColorPicker.prototype, "_opacity", void 0);
__decorate([
    r()
], ColorPicker.prototype, "_hexInput", void 0);
__decorate([
    e('.sv-panel')
], ColorPicker.prototype, "_svPanel", void 0);
__decorate([
    e('.hue-track')
], ColorPicker.prototype, "_hueTrack", void 0);
__decorate([
    e('.alpha-track')
], ColorPicker.prototype, "_alphaTrack", void 0);
ColorPicker = __decorate([
    IndividualComponent
], ColorPicker);

export { ColorPicker };
//# sourceMappingURL=color-picker.js.map
