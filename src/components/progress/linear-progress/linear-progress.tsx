import { Component, h, Host, Prop } from '@stencil/core';

/**
 * @label Linear Progress Indicator
 * @name  linear-progress
 * @description A linear progress indicator is a visual representation of progress toward a specific goal or completion of a task.
 * @category Informational
 * @tags feedback, loading, progress, spinner
 * @example <goat-progress value="40" label="Progress" width="100%" helper-text="Optional helper text goes here..."></goat-progress>
 */
@Component({
  tag: 'pc-linear-progress',
  styleUrl: 'linear-progress.scss',
  shadow: true,
})
export class LinearProgress {
  /*
   * The current value.
   */
  @Prop() value: number = null;

  /**
   * A label describing the progress bar.
   */
  @Prop() label: string;

  @Prop() helperText: string;

  /**
   *
   * Possible values are: `"sm"` and `"md"` in pixel. Defaults to `"md"`.
   */
  @Prop() size: 'sm' | 'md' = 'md';

  @Prop() hideLabel: boolean = false;

  render() {
    return (
      <Host>
        <div
          class={{
            progress: true,
            [`size-${this.size}`]: true,
            indeterminate: this.value === null,
          }}
        >
          {!this.hideLabel && (
            <div class="progress-header">
              <label class="progress-label">{this.label}</label>
            </div>
          )}
          <div class="progress-track">
            <div
              class="progress-bar"
              role="progressbar"
              style={{ width: `${this.value}%` }}
              aria-valuenow={this.value}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <div class="progress-helper">{this.helperText}</div>
        </div>
      </Host>
    );
  }
}
