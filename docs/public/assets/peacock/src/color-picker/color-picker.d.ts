import { LitElement } from 'lit';
/**
 * @label Color Picker
 * @tag wc-color-picker
 * @rawTag color-picker
 *
 * @summary A panel for picking a color from a saturation and brightness square and a hue slider, with optional opacity and a hex field.
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
export declare class ColorPicker extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The current color as a hex string: `#rrggbb` (e.g. `"#ff5733"`), or `#rrggbbaa` with `alpha`.
     */
    value: string;
    /**
     * Whether to show the alpha (opacity) slider and input. The value then carries the opacity
     * as its last two hex digits.
     */
    alpha: boolean;
    /**
     * Whether the color picker is disabled.
     */
    disabled: boolean;
    /** Shows the color but does not let it be changed by pointer or keyboard. */
    readonly: boolean;
    /** Current hue, 0–360. */
    private _hue;
    /** Current saturation, 0–1 (x-axis of the SV panel). */
    private _sat;
    /** Current brightness (value in HSV), 0–1 (y-axis, 1 = bright). */
    private _bri;
    /** Current opacity, 0–1. */
    private _opacity;
    /** Intermediate value for the hex text input (without `#`). */
    private _hexInput;
    private _svPanel?;
    private _hueTrack?;
    private _alphaTrack?;
    /** Tracks which drag handle is currently active. */
    private _dragging;
    /** The last `value` we set ourselves, used to skip redundant re-syncs in `updated`. */
    private _lastEmittedValue;
    /** Peacock's strings for the slider and input labels. */
    private readonly i18n;
    connectedCallback(): void;
    willUpdate(changed: Map<PropertyKey, unknown>): void;
    /** Whether the color can be changed: not disabled and not read-only. */
    private get _locked();
    private _syncFromValue;
    /** The color without opacity, as `#rrggbb`. */
    private _computeHex;
    /** The value to emit: `#rrggbb`, or `#rrggbbaa` with `alpha`. */
    private _computeValue;
    private _emitValue;
    private _onSvPointerDown;
    private _onSvPointerMove;
    private _onSvPointerUp;
    private _updateSv;
    private _onSvKeyDown;
    private _onHuePointerDown;
    private _onHuePointerMove;
    private _onHuePointerUp;
    private _updateHue;
    private _onHueKeyDown;
    private _onAlphaPointerDown;
    private _onAlphaPointerMove;
    private _onAlphaPointerUp;
    private _updateAlpha;
    private _onAlphaKeyDown;
    private _onHexInput;
    private _onHexChange;
    private _stopNativeInput;
    private _onAlphaNumberChange;
    render(): import("lit-html").TemplateResult<1>;
}
