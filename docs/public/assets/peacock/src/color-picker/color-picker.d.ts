import { LitElement } from 'lit';
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
export declare class ColorPicker extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The current color as a 6-digit hex string (e.g. `"#ff5733"`).
     */
    value: string;
    /**
     * Whether to show the alpha (opacity) slider and input.
     */
    alpha: boolean;
    /**
     * Whether the color picker is disabled.
     */
    disabled: boolean;
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
    connectedCallback(): void;
    updated(changed: Map<PropertyKey, unknown>): void;
    private _syncFromValue;
    private _computeHex;
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
    private _onAlphaNumberChange;
    render(): import("lit-html").TemplateResult<1>;
}
