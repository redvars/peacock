import type { FormRestoreState } from '../__internal/mixins/form-associated.js';
import type { Size } from '../__internal/utils/size.js';
import BaseInput, { type ControlValidity } from '../input/BaseInput.js';
/** Where the slider shows its value: on the thumb while it is used, after the track, or not. */
export type SliderValueLabel = 'thumb' | 'end' | 'none';
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
export declare class Slider extends BaseInput {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The minimum value of the slider.
     */
    min: number;
    /**
     * The maximum value of the slider.
     */
    max: number;
    /**
     * The current value of the slider. Defaults to the middle of `min`–`max`.
     */
    get value(): number;
    set value(value: number | undefined | null);
    /**
     * The step increment for the slider.
     */
    step: number;
    /** Label shown above the slider; also the thumb's accessible name. */
    label: string;
    /** Help text shown below the slider. */
    helperText: string;
    /** Shows the slider in its error state with `error-text`. */
    error: boolean;
    /** Error message shown below the slider while `error` is set; replaces the help text. */
    errorText: string;
    /** Size of the track and thumb: `sm` (default), `md` or `lg`. */
    size: Size;
    /**
     * Where the value shows: `thumb` (on the thumb while it is used; the default), `end` (after the
     * track) or `none`.
     */
    valueLabel: SliderValueLabel;
    /** Formats the value for `aria-valuetext` and the visible value. */
    valueText?: (value: number) => string;
    /** True while the user is actively dragging the thumb. */
    private isDragging;
    private container;
    private thumbElement;
    /** The value set by the consumer or the person; `undefined` means the midpoint. */
    private explicitValue?;
    /** Whether a value was given when first connected; reset returns to the midpoint otherwise. */
    private startedWithValue?;
    private readonly idPrefix;
    /** Peacock's strings for the thumb label. */
    private readonly i18n;
    connectedCallback(): void;
    focus(): void;
    blur(): void;
    formResetCallback(): void;
    protected parseRestoreState(restored: FormRestoreState): unknown;
    /** A slider always has a value in range, so only `setCustomValidity()` makes it invalid. */
    protected computeValidity(): ControlValidity;
    protected validityAnchor(): HTMLElement;
    private get isInteractive();
    /** Where the value shows, from `value-label`. */
    private get valuePlacement();
    private formatValue;
    private emit;
    private handleInput;
    private onMouseDown;
    private onMouseMove;
    private onMouseUp;
    /**
     * Rounds a value to the nearest step counted from `min`, like a native range input, so a slider
     * with `min="1" step="5"` lands on 1, 6, 11. Rounds away float noise from fractional steps.
     */
    private snapToStep;
    private handleKeyDown;
    /** A suggestion for a slider is a number. */
    protected writeSuggestionValue(value: unknown): void;
    render(): import("lit-html").TemplateResult<1>;
}
