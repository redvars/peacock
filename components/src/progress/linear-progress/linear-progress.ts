import { html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './linear-progress.scss';
import { BaseProgress } from '../base-progress.js';

/**
 * @label Linear Progress
 * @tag wc-linear-progress
 * @rawTag linear-progress
 * @summary A linear progress indicator is a visual representation of progress toward a specific goal.
 * @overview
 * <p><code>value</code> runs from 0 to <code>max</code> (default 100) and is clamped into that
 * range. The visible <code>label</code> names the bar through <code>aria-labelledby</code>; without
 * one the bar is named "Loading". Use <code>indeterminate</code> when the amount of work is not
 * known.</p>
 * @tags display
 *
 * @example
 * ```html
 * <wc-linear-progress value="30" label="Uploading" style="width:10rem"></wc-linear-progress>
 * <wc-linear-progress value="3" max="8" label="Step 3 of 8"></wc-linear-progress>
 * ```
 */
@IndividualComponent
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
              <span class="progress-label" id="label">${this.label}</span>
            </div>`
          : ''}

        <div class="progress-body">
          <div
            class="linear-progress-container"
            aria-labelledby=${this.label ? 'label' : nothing}
            aria-label=${this.label ? nothing : this.i18n.t('loading')}
            aria-valuenow=${this.indeterminate
              ? nothing
              : String(this.__clampedValue)}
            aria-valuemin="0"
            aria-valuemax=${String(this.__max)}
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
