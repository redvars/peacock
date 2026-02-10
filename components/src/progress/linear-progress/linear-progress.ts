import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import styles from './linear-progress.scss';
import { BaseProgress } from '../base-progress.js';

/**
 * @label Linear Progress
 * @tag  p-linear-progress
 * @rawTag linear-progress
 *
 * @summary A linear progress indicator is a visual representation of progress toward a specific goal.
 *
 * @example
 * ```html
 * <p-linear-progress value="50" style="width:10rem"></p-linear-progress>
 * ```
 */
export class LinearProgress extends BaseProgress {
  // Lit components use static styles for better performance
  static styles = [styles];

  render() {
    return html`
      <div
        class="${classMap({
          'linear-progress': true,
          indeterminate: this.indeterminate,
          inline: this.inline,
        })}"
      >
        ${this.label
          ? html`<div class="progress-header">
              <label class="progress-label">${this.label}</label>
            </div>`
          : ''}

        <div class="progress-body">
          <div
            class="linear-progress-container"
            title=${this.label}
            ?aria-valuenow="${this.__getPercentageValue()}"
            aria-valuemin="0"
            aria-valuemax="100"
            role="progressbar"
          >
            <div class="track track-start"></div>
            <div
              class="active-indicator"
              style="${styleMap({
                width: `${this.__getPercentageValue()}%`,
              })}"
            ></div>
            <div class="track track-end"></div>
          </div>

          ${this.helperText
            ? html`<div class="progress-helper">${this.helperText}</div>`
            : ''}
        </div>
      </div>
    `;
  }
}
