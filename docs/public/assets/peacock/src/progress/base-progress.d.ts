import { LitElement } from 'lit';
import { I18nController } from '../__internal/i18n/i18n-controller.js';
declare const BaseProgress_base: import("../__internal/mixins/mixin.js").MixinReturn<typeof LitElement>;
/**
 * `aria-label` on the host names the progress bar without a visible label (it moves to the inner
 * `role="progressbar"` element, as on buttons).
 */
export declare class BaseProgress extends BaseProgress_base {
    /** The current value, clamped into `0`–`max`. */
    value?: number;
    /** The value at which the task is complete. Defaults to `100`. */
    max: number;
    /** Shows ongoing activity with no known completion, ignoring `value`. */
    indeterminate: boolean;
    /**
     * A visible label describing the progress, which also names the progress bar
     * (`aria-labelledby`). Without one the bar is named "Loading" (string `loading`).
     */
    label?: string;
    /** Help text shown below the progress indicator. */
    helperText?: string;
    /** Lays out the label and the indicator on one line instead of stacking them. */
    inline: boolean;
    /** Peacock's strings, for the fallback accessible name. */
    protected readonly i18n: I18nController;
    /** The bar's name without a visible `label`: the host's `aria-label`, else "Loading". */
    protected get __fallbackLabel(): string;
    /** `max`, or 100 when it is not a positive number. */
    protected get __max(): number;
    /** `value` clamped into `0`–`max`; 0 when unset. */
    protected get __clampedValue(): number;
    /** The clamped value as a percentage of `max`. */
    __getPercentageValue(): number;
}
export {};
