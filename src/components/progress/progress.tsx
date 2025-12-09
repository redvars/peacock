import { Component, h, Host, Prop } from '@stencil/core';

/**
 * @name Progress
 * @description Progress indicators express an unspecified wait time or display the length of a process.
 * @category Informational
 * @tags feedback, loading, progress, spinner
 * @example <goat-progress value="40" label="Progress" width="100%" helper-text="Optional helper text goes here..."></goat-progress>
 */
@Component({
  tag: 'goat-progress',
  styleUrl: 'progress.scss',
  shadow: true,
})
export class Progress {
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

  @Prop() status: 'active' | 'success' | 'error' = 'active';

  getRenderIcon() {
    if (this.status === 'success') {
      return (
        <pc-icon class={'progress-icon'} name={'checkmark--filled'}></pc-icon>
      );
    } else if (this.status === 'error') {
      return <pc-icon class={'progress-icon'} name={'error--filled'}></pc-icon>;
    }
  }

  render() {
    return (
      <Host>
        <div
          class={{
            progress: true,
            [`size-${this.size}`]: true,
            [`status-${this.status}`]: true,
            indeterminate: this.value === null && this.status === 'active',
          }}
        >
          {!this.hideLabel && (
            <div class="progress-header">
              <label class="progress-label">{this.label}</label>
              {this.getRenderIcon()}
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
