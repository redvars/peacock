import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';

export class BaseProgress extends LitElement {
  /** The current value, clamped into `0`–`max`. */
  @property({ type: Number }) value?: number;

  /** The value at which the task is complete. Defaults to `100`. */
  @property({ type: Number }) max = 100;

  @property({ type: Boolean }) indeterminate = false;

  /**
   * A visible label describing the progress, which also names the progress bar
   * (`aria-labelledby`). Without one the bar is named "Loading" (string `loading`).
   */
  @property({ type: String }) label?: string;

  @property({ type: String, attribute: 'helper-text' }) helperText?: string;

  @property({ type: Boolean }) inline = false;

  /** Peacock's strings, for the fallback accessible name. */
  protected readonly i18n = new I18nController(this);

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
