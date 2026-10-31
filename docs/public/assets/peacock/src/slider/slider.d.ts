import { LitElement } from 'lit';
import { type FormRestoreState, type FormValue, getFormValue } from '@/__internal/mixins/form-associated.js';
declare const Slider_base: import("../__internal/mixins/mixin.js").MixinReturn<(abstract new (...args: any[]) => import("@/__internal/mixins/element-internals.js").WithElementInternals) & typeof LitElement & import("@/__internal/mixins/form-associated.js").FormAssociatedConstructor, import("@/__internal/mixins/form-associated.js").FormAssociated>;
/**
 * @label Slider
 * @tag wc-slider
 * @rawTag slider
 *
 * @summary Sliders allow users to make selections from a range of values.
 * @overview
 * <p>The slider is form-associated: its <code>value</code> is submitted under its <code>name</code>,
 * and <code>form.reset()</code> restores the starting value.</p>
 *
 * @fires {CustomEvent} input - Dispatched when the slider value changes during interaction.
 * @fires {CustomEvent} change - Dispatched when the slider interaction ends.
 *
 * @example
 * ```html
 * <wc-slider min="0" max="100" value="50"></wc-slider>
 * ```
 * @tags input, form
 */
export declare class Slider extends Slider_base {
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
     * The current value of the slider.
     */
    value: number;
    /**
     * The step increment for the slider.
     */
    step: number;
    /**
     * Whether to show labels on the slider.
     */
    labeled: boolean;
    /**
     * Whether to show the current value beside the slider.
     */
    showValue: boolean;
    /** True while the user is actively dragging the thumb. */
    private isDragging;
    private container;
    private thumbElement;
    /** `value` when first connected; `form.reset()` returns to it. */
    private defaultValue?;
    connectedCallback(): void;
    [getFormValue](): FormValue | null;
    formResetCallback(): void;
    formStateRestoreCallback(state: FormRestoreState | null): void;
    private handleInput;
    private onMouseDown;
    private onMouseMove;
    private onMouseUp;
    private handleKeyDown;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
