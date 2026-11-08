import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { mixinDelegatesAria } from '@/__internal/aria/delegate.js';
import type { ARIAMixinStrict } from '@/__internal/aria/aria.js';

/**
 * `aria-label` on the host names the progress bar without a visible label (it moves to the inner
 * `role="progressbar"` element, as on buttons).
 */
export class BaseProgress extends mixinDelegatesAria(LitElement) {
  /** The current value, clamped into `0`–`max`. */
  @property({ type: Number }) value?: number;

  /** The value at which the task is complete. Defaults to `100`. */
  @property({ type: Number }) max = 100;

  /** Shows ongoing activity with no known completion, ignoring `value`. */
  @property({ type: Boolean }) indeterminate = false;

  /**
   * A visible label describing the progress, which also names the progress bar
   * (`aria-labelledby`). Without one the bar is named "Loading" (string `loading`).
   */
  @property({ type: String }) label?: string;

  /** Help text shown below the progress indicator. */
  @property({ type: String, attribute: 'helper-text' }) helperText?: string;

  /** Lays out the label and the indicator on one line instead of stacking them. */
  @property({ type: Boolean }) inline = false;

  /** Peacock's strings, for the fallback accessible name. */
  protected readonly i18n = new I18nController(this);

  /** The bar's name without a visible `label`: the host's `aria-label`, else "Loading". */
  protected get __fallbackLabel(): string {
    return (this as ARIAMixinStrict).ariaLabel || this.i18n.t('loading');
  }

  /** `max`, or 100 when it is not a positive number. */
  protected get __max(): number {
    return Number.isFinite(this.max) && this.max > 0 ? this.max : 100;
  }

  /** `value` clamped into `0`–`max`; 0 when unset. */
  protected get __clampedValue(): number {
    const value = Number(this.value);
    if (!Number.isFinite(value)) return 0;
    return Math.min(this.__max, Math.max(0, value));
  }

  /** The clamped value as a percentage of `max`. */
  __getPercentageValue(): number {
    return (this.__clampedValue / this.__max) * 100;
  }
}
