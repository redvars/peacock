import { html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './circular-progress.scss';
import { BaseProgress } from '../base-progress.js';

/**
 * @label Circular Progress
 * @tag wc-circular-progress
 * @rawTag circular-progress
 * @summary A ring that fills to show how much of a task is done, or spins when the length of the wait is unknown.
 * @overview
 * <p><code>value</code> runs from 0 to <code>max</code> (default 100) and is clamped into that
 * range. The visible <code>label</code> names the indicator through
 * <code>aria-labelledby</code>; without one, an <code>aria-label</code> on the element names it,
 * else it is named "Loading". With
 * <code>indeterminate</code> it spins, for a wait of unknown length.</p>
 * @tags display
 *
 * @example
 * ```html
 * <wc-circular-progress value="30"></wc-circular-progress>
 * ```
 */
@IndividualComponent
export class CircularProgress extends BaseProgress {
  // Lit components use static styles for better performance
  static styles = [styles];

  render() {
    const percentage = this.__getPercentageValue();
    // Radius of 18 with stroke 4 fits nicely in a 40x40 viewBox
    const radius = 6;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return html`
      <div
        class="${classMap({
          'circular-progress': true,
          indeterminate: this.indeterminate,
          inline: this.inline,
        })}"
        role="progressbar"
        aria-labelledby=${this.label ? 'label' : nothing}
        aria-label=${this.label ? nothing : this.__fallbackLabel}
        aria-valuenow=${this.indeterminate
          ? nothing
          : String(this.__clampedValue)}
        aria-valuemin="0"
        aria-valuemax=${String(this.__max)}
      >
        <div class="circular-progress-container">
          <svg viewBox="0 0 16 16">
            <circle class="track" cx="8" cy="8" r="6"></circle>
            <circle
              class="active-indicator"
              cx="8"
              cy="8"
              r="6"
              style="${styleMap({
                strokeDasharray: `${circumference}`,
                strokeDashoffset: this.indeterminate ? undefined : `${offset}`,
              })}"
            ></circle>
          </svg>
        </div>

        <div class="progress-footer">
          ${this.label
            ? html`<div class="progress-label" id="label">${this.label}</div>`
            : ''}
          ${this.helperText
            ? html`<div class="progress-helper">${this.helperText}</div>`
            : ''}
        </div>
      </div>
    `;
  }
}
