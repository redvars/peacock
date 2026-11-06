import { LitElement, html, nothing } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import styles from './color-picker.scss';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';

// ── Color utilities ───────────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean.slice(0, 6);
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const r1 = r / 255, g1 = g / 255, b1 = b / 255;
  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r1) h = ((g1 - b1) / delta) % 6;
    else if (max === g1) h = (b1 - r1) / delta + 2;
    else h = (r1 - g1) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return { h, s: max === 0 ? 0 : delta / max, v: max };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  let r1 = 0, g1 = 0, b1 = 0;

  if (h < 60) { r1 = c; g1 = x; }
  else if (h < 120) { r1 = x; g1 = c; }
  else if (h < 180) { g1 = c; b1 = x; }
  else if (h < 240) { g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; b1 = c; }
  else { r1 = c; b1 = x; }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

/** Whether `s` is a hex color without `#`: 6 digits (`rrggbb`) or 8 with alpha (`rrggbbaa`). */
function isValidHex(s: string): boolean {
  return /^(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s);
}

/** The opacity, 0–1, in an 8-digit hex color (without `#`); 1 for a 6-digit one. */
function hexAlpha(hex: string): number {
  return hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1;
}

/** An opacity, 0–1, as the two hex digits of `#rrggbbaa`. */
function alphaToHex(opacity: number): string {
  return Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16)
    .padStart(2, '0');
}

/** The fraction of `size` that `offset` is, clamped to 0–1; 0 when there is no size. */
function fraction(offset: number, size: number): number {
  return size ? Math.max(0, Math.min(1, offset / size)) : 0;
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
 * <p>With <code>alpha</code> the value carries the opacity as an 8-digit hex color
 * (<code>#rrggbbaa</code>); without it the value is <code>#rrggbb</code>. Events also give the
 * opacity, 0–1, as <code>detail.alpha</code>.</p>
 * <p>It is a building block, not a form control: it has no <code>name</code> and is not submitted
 * with a form. In a form, use <code>wc-color-field</code>.</p>
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
@IndividualComponent
export class ColorPicker extends LitElement {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * The current color as a hex string: `#rrggbb` (e.g. `"#ff5733"`), or `#rrggbbaa` with `alpha`.
   */
  @property({ type: String }) value = '#2352d5';

  /**
   * Whether to show the alpha (opacity) slider and input. The value then carries the opacity
   * as its last two hex digits.
   */
  @property({ type: Boolean }) alpha = false;

  /**
   * Whether the color picker is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Shows the color but does not let it be changed by pointer or keyboard. */
  @property({ type: Boolean, reflect: true }) readonly = false;

  // ── State ─────────────────────────────────────────────────────────────────

  /** Current hue, 0–360. */
  @state() private _hue = 0;

  /** Current saturation, 0–1 (x-axis of the SV panel). */
  @state() private _sat = 0;

  /** Current brightness (value in HSV), 0–1 (y-axis, 1 = bright). */
  @state() private _bri = 1;

  /** Current opacity, 0–1. */
  @state() private _opacity = 1;

  /** Intermediate value for the hex text input (without `#`). */
  @state() private _hexInput = '';

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.sv-panel') private _svPanel?: HTMLElement;
  @query('.hue-track') private _hueTrack?: HTMLElement;
  @query('.alpha-track') private _alphaTrack?: HTMLElement;

  // ── Private fields ────────────────────────────────────────────────────────

  /** Tracks which drag handle is currently active. */
  private _dragging: 'sv' | 'hue' | 'alpha' | null = null;

  /** The last `value` we set ourselves, used to skip redundant re-syncs in `updated`. */
  private _lastEmittedValue = '';

  /** Peacock's strings for the slider and input labels. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    this._syncFromValue();
    this._lastEmittedValue = this.value;
  }

  // willUpdate, not updated: syncing the HSV state here lands in the same render.
  willUpdate(changed: Map<PropertyKey, unknown>) {
    if (changed.has('value') && this.value !== this._lastEmittedValue) {
      this._syncFromValue();
    }
  }

  // ── Private methods ───────────────────────────────────────────────────────

  /** Whether the color can be changed: not disabled and not read-only. */
  private get _locked(): boolean {
    return this.disabled || this.readonly;
  }

  private _syncFromValue() {
    const clean = this.value.startsWith('#') ? this.value.slice(1) : this.value;
    if (!isValidHex(clean)) return;
    const { r, g, b } = hexToRgb('#' + clean);
    const { h, s, v } = rgbToHsv(r, g, b);
    this._hue = h;
    this._sat = s;
    this._bri = v;
    this._opacity = hexAlpha(clean);
    this._hexInput = clean.slice(0, 6).toUpperCase();
  }

  /** The color without opacity, as `#rrggbb`. */
  private _computeHex(): string {
    const { r, g, b } = hsvToRgb(this._hue, this._sat, this._bri);
    return rgbToHex(r, g, b);
  }

  /** The value to emit: `#rrggbb`, or `#rrggbbaa` with `alpha`. */
  private _computeValue(): string {
    const hex = this._computeHex();
    return this.alpha ? `${hex}${alphaToHex(this._opacity)}` : hex;
  }

  private _emitValue(type: 'input' | 'change') {
    const value = this._computeValue();
    this._lastEmittedValue = value;
    this.value = value;
    this._hexInput = value.slice(1, 7).toUpperCase();
    this.dispatchEvent(new CustomEvent(type, {
      detail: { value, alpha: this._opacity },
      bubbles: true,
      composed: true,
    }));
  }

  // SV panel
  private _onSvPointerDown(e: PointerEvent) {
    if (this._locked) return;
    e.preventDefault();
    this._dragging = 'sv';
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    this._updateSv(e);
    this._emitValue('input');
  }

  private _onSvPointerMove(e: PointerEvent) {
    if (this._dragging !== 'sv') return;
    this._updateSv(e);
    this._emitValue('input');
  }

  private _onSvPointerUp() {
    if (this._dragging !== 'sv') return;
    this._dragging = null;
    this._emitValue('change');
  }

  private _updateSv(e: PointerEvent) {
    const rect = this._svPanel?.getBoundingClientRect();
    if (!rect) return;
    this._sat = fraction(e.clientX - rect.left, rect.width);
    this._bri = 1 - fraction(e.clientY - rect.top, rect.height);
  }

  private _onSvKeyDown(e: KeyboardEvent) {
    if (this._locked) return;
    const step = e.shiftKey ? 0.1 : 0.01;
    let changed = false;

    if (e.key === 'ArrowRight') { this._sat = Math.min(1, this._sat + step); changed = true; }
    else if (e.key === 'ArrowLeft') { this._sat = Math.max(0, this._sat - step); changed = true; }
    else if (e.key === 'ArrowUp') { this._bri = Math.min(1, this._bri + step); changed = true; }
    else if (e.key === 'ArrowDown') { this._bri = Math.max(0, this._bri - step); changed = true; }

    if (changed) {
      e.preventDefault();
      this._emitValue('input');
      this._emitValue('change');
    }
  }

  // Hue slider
  private _onHuePointerDown(e: PointerEvent) {
    if (this._locked) return;
    e.preventDefault();
    this._dragging = 'hue';
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    this._updateHue(e);
    this._emitValue('input');
  }

  private _onHuePointerMove(e: PointerEvent) {
    if (this._dragging !== 'hue') return;
    this._updateHue(e);
    this._emitValue('input');
  }

  private _onHuePointerUp() {
    if (this._dragging !== 'hue') return;
    this._dragging = null;
    this._emitValue('change');
  }

  private _updateHue(e: PointerEvent) {
    const rect = this._hueTrack?.getBoundingClientRect();
    if (!rect) return;
    this._hue = Math.round(fraction(e.clientX - rect.left, rect.width) * 360);
  }

  private _onHueKeyDown(e: KeyboardEvent) {
    if (this._locked) return;
    const step = e.shiftKey ? 10 : 1;
    let changed = false;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { this._hue = Math.min(360, this._hue + step); changed = true; }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { this._hue = Math.max(0, this._hue - step); changed = true; }

    if (changed) {
      e.preventDefault();
      this._emitValue('input');
      this._emitValue('change');
    }
  }

  // Alpha slider
  private _onAlphaPointerDown(e: PointerEvent) {
    if (this._locked) return;
    e.preventDefault();
    this._dragging = 'alpha';
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    this._updateAlpha(e);
    this._emitValue('input');
  }

  private _onAlphaPointerMove(e: PointerEvent) {
    if (this._dragging !== 'alpha') return;
    this._updateAlpha(e);
    this._emitValue('input');
  }

  private _onAlphaPointerUp() {
    if (this._dragging !== 'alpha') return;
    this._dragging = null;
    this._emitValue('change');
  }

  private _updateAlpha(e: PointerEvent) {
    const rect = this._alphaTrack?.getBoundingClientRect();
    if (!rect) return;
    this._opacity = fraction(e.clientX - rect.left, rect.width);
  }

  private _onAlphaKeyDown(e: KeyboardEvent) {
    if (this._locked) return;
    const step = e.shiftKey ? 0.1 : 0.01;
    let changed = false;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { this._opacity = Math.min(1, this._opacity + step); changed = true; }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { this._opacity = Math.max(0, this._opacity - step); changed = true; }

    if (changed) {
      e.preventDefault();
      this._emitValue('input');
      this._emitValue('change');
    }
  }

  // Hex input
  private _onHexInput(e: InputEvent) {
    // The native `input` is composed and would escape the shadow root next to the picker's own
    // `input` CustomEvent, so stop it here.
    e.stopPropagation();
    if (this._locked) return;
    const raw = (e.target as HTMLInputElement).value.toUpperCase().replace(/[^0-9A-F]/g, '');
    this._hexInput = raw;
    if (isValidHex(raw)) {
      const { r, g, b } = hexToRgb('#' + raw);
      const { h, s, v } = rgbToHsv(r, g, b);
      this._hue = h;
      this._sat = s;
      this._bri = v;
      // Typed `rrggbbaa` sets the opacity too; typed `rrggbb` keeps it.
      if (raw.length === 8) this._opacity = hexAlpha(raw);
      this._emitValue('input');
      this._hexInput = raw;
    }
  }

  private _onHexChange() {
    if (this._locked) return;
    if (isValidHex(this._hexInput)) {
      this._emitValue('change');
    } else {
      this._hexInput = this._computeHex().slice(1).toUpperCase();
    }
  }

  private _stopNativeInput(e: Event) {
    e.stopPropagation();
  }

  private _onAlphaNumberChange(e: Event) {
    if (this._locked) return;
    const raw = parseInt((e.target as HTMLInputElement).value, 10);
    this._opacity = Math.max(0, Math.min(100, isNaN(raw) ? 100 : raw)) / 100;
    this._emitValue('change');
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const hueColor = `hsl(${this._hue}, 100%, 50%)`;
    const currentHex = this._computeHex();
    const { r, g, b } = hsvToRgb(this._hue, this._sat, this._bri);
    const previewColor = `rgba(${r}, ${g}, ${b}, ${this._opacity})`;

    return html`
      <div class="color-picker ${this.disabled ? 'disabled' : ''}">

        <!-- Saturation / Brightness 2D panel -->
        <div
          class="sv-panel"
          style=${styleMap({ '--hue-color': hueColor })}
          @pointerdown=${this._onSvPointerDown}
          @pointermove=${this._onSvPointerMove}
          @pointerup=${this._onSvPointerUp}
          @pointercancel=${this._onSvPointerUp}
        >
          <div
            class="sv-cursor"
            role="slider"
            tabindex=${this.disabled ? '-1' : '0'}
            aria-label=${this.i18n.t('saturationAndBrightness')}
            aria-readonly=${this.readonly ? 'true' : nothing}
            aria-valuetext=${this.i18n.t('saturationBrightnessValue')(String(Math.round(this._sat * 100)), String(Math.round(this._bri * 100)))}
            style=${styleMap({
              left: `${this._sat * 100}%`,
              top: `${(1 - this._bri) * 100}%`,
            })}
            @keydown=${this._onSvKeyDown}
          ></div>
        </div>

        <!-- Preview swatch + sliders -->
        <div class="controls-row">
          <div class="color-preview">
            <div class="preview-inner" style=${styleMap({ background: previewColor })}></div>
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
                aria-label=${this.i18n.t('hue')}
                aria-readonly=${this.readonly ? 'true' : nothing}
                aria-valuemin="0"
                aria-valuemax="360"
                aria-valuenow=${this._hue}
                style=${styleMap({ left: `${(this._hue / 360) * 100}%` })}
                @keydown=${this._onHueKeyDown}
              ></div>
            </div>

            ${this.alpha ? html`
              <!-- Alpha slider -->
              <div
                class="slider-track alpha-track"
                style=${styleMap({ '--current-color': currentHex })}
                @pointerdown=${this._onAlphaPointerDown}
                @pointermove=${this._onAlphaPointerMove}
                @pointerup=${this._onAlphaPointerUp}
                @pointercancel=${this._onAlphaPointerUp}
              >
                <div
                  class="slider-thumb"
                  role="slider"
                  tabindex=${this.disabled ? '-1' : '0'}
                  aria-label=${this.i18n.t('opacity')}
                  aria-readonly=${this.readonly ? 'true' : nothing}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow=${Math.round(this._opacity * 100)}
                  style=${styleMap({ left: `${this._opacity * 100}%` })}
                  @keydown=${this._onAlphaKeyDown}
                ></div>
              </div>
            ` : nothing}
          </div>
        </div>

        <!-- Hex + alpha inputs -->
        <div class="inputs-row">
          <div class="hex-input-wrapper">
            <span class="input-label">${this.i18n.t('hexLabel')}</span>
            <span class="hex-prefix">#</span>
            <input
              class="hex-input"
              type="text"
              inputmode="text"
              maxlength=${this.alpha ? 8 : 6}
              spellcheck="false"
              autocomplete="off"
              .value=${this._hexInput}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              aria-label=${this.i18n.t('hexColorValue')}
              @input=${this._onHexInput}
              @change=${this._onHexChange}
            />
          </div>

          ${this.alpha ? html`
            <div class="alpha-input-wrapper">
              <input
                class="alpha-input"
                type="number"
                min="0"
                max="100"
                step="1"
                .value=${String(Math.round(this._opacity * 100))}
                ?disabled=${this.disabled}
                ?readonly=${this.readonly}
                aria-label=${this.i18n.t('opacityPercentage')}
                @input=${this._stopNativeInput}
                @change=${this._onAlphaNumberChange}
              />
              <span class="input-label">%</span>
            </div>
          ` : nothing}
        </div>

      </div>
    `;
  }
}
