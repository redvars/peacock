import { LitElement } from 'lit';
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
export declare class Slider extends LitElement {
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
     * Whether the slider is disabled.
     */
    disabled: boolean;
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
    private handleInput;
    private onMouseDown;
    private onMouseMove;
    private onMouseUp;
    private handleKeyDown;
    render(): import("lit-html").TemplateResult<1>;
}
