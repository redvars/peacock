import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export class BaseProgress extends LitElement {
  /** The current value. */
  @property({ type: Number }) value?: number;

  @property({ type: Boolean }) indeterminate = false;

  /** A label describing the progress bar. */
  @property({ type: String }) label?: string;

  @property({ type: String, attribute: 'helper-text' }) helperText?: string;

  @property({ type: Boolean }) inline = false;

  __getPercentageValue(): number {
    if (!this.value) return 0;
    return this.value;
  }
}
