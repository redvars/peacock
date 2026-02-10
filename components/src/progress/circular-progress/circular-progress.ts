import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import styles from './circular-progress.scss';
import { BaseProgress } from '../base-progress.js';

/**
 * @label Circular Progress / Spinner
 * @tag  p-circular-progress
 * @rawTag circular-progress
 *
 * @summary A circular progress indicator is a visual representation of progress toward a specific goal.
 *
 * @example
 * ```html
 * <p-circular-progress value="50"></p-circular-progress>
 * ```
 */
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
        title=${this.label}
        role="progressbar"
        aria-valuenow="${this.indeterminate ? undefined : percentage}"
        aria-valuemin="0"
        aria-valuemax="100"
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
            ? html`<div class="progress-label">${this.label}</div>`
            : ''}
          ${this.helperText
            ? html`<div class="progress-helper">${this.helperText}</div>`
            : ''}
        </div>
      </div>
    `;
  }
}
