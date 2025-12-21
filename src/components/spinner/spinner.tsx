import { Component, Element, h, Host, Prop, State } from '@stencil/core';
import { getComponentIndex, remToPx } from '../../utils/utils';

enum SpinnerSize {
  SM = 0.75,
  MD = 1,
  LG = 5.5,
}

/**
 * @label Spinner
 * @name spinner
 * @description Spinners provide a visual cue that an action is processing awaiting a course of change or a result.
 * @category Informational
 * @tags feedback, loading, progress, spinner
 * @example <goat-spinner class="rainbow" size="2rem"></goat-spinner>
 */
@Component({
  tag: 'pc-spinner',
  styleUrl: 'spinner.scss',
  shadow: true,
})
export class Spinner {
  @Element() elm!: HTMLElement;

  gid: string = getComponentIndex();

  /**
   * The Icon size.
   * Possible values are: `"sm"`, `"md"`, `"lg"` and size in pixel. Defaults to `"md"`.
   */
  @Prop({ reflect: true }) size: 'sm' | 'md' | 'lg' | string = 'md';

  @Prop() hideBackground: boolean = false;

  @Prop() description: string = 'Loading...';

  @State() slotHasContent = false;

  private getSize() {
    let size;
    if (!this.size || this.size === 'md') size = SpinnerSize.MD;
    else if (this.size === 'sm') size = SpinnerSize.SM;
    else if (this.size === 'lg') size = SpinnerSize.LG;
    else if (this.size.endsWith('px'))
      size = parseInt(this.size.replace('px', '')) / 16;
    else if (this.size.endsWith('rem'))
      size = parseInt(this.size.replace('rem', ''));
    else size = this.size;
    return size;
  }

  componentWillLoad() {
    this.slotHasContent = this.elm.hasChildNodes();
  }

  render() {
    let radius: number = 57.3 * this.getSize();
    let strokeWidth = 5;
    if (this.getSize() >= 5.5) strokeWidth = 10;
    strokeWidth = strokeWidth / ((this.getSize() * remToPx(1)) / 100);

    let strokeDashoffset = 50 * this.getSize();
    if (this.getSize() <= 1) {
      strokeDashoffset = 180 * this.getSize();
    }

    return (
      <Host>
        <div
          class={{ 'spinner': true, 'has-content': this.slotHasContent }}
          title={this.description}
        >
          <div
            class="spinner__container"
            style={{
              width: this.getSize() + 'rem',
              height: this.getSize() + 'rem',
            }}
          >
            <svg
              viewBox={`0 0 ${
                2 * (radius + strokeWidth + 5 * this.getSize())
              } ${2 * (radius + strokeWidth + 5 * this.getSize())}`}
              class="spinner__svg"
            >
              <title>{this.description}</title>
              {!this.hideBackground && (
                <circle
                  cx="50%"
                  cy="50%"
                  class="spinner__background"
                  r={radius}
                  style={{
                    strokeWidth: `${strokeWidth * this.getSize()}`,
                  }}
                ></circle>
              )}

              <circle
                cx="50%"
                cy="50%"
                class="spinner__stroke"
                r={radius}
                style={{
                  strokeWidth: `${strokeWidth * this.getSize()}`,
                  strokeDasharray: `${360 * this.getSize()}`,
                  strokeDashoffset: `${strokeDashoffset}`,
                }}
              ></circle>
            </svg>
          </div>

          <div class="slot-container">
            <slot />
          </div>
        </div>
      </Host>
    );
  }
}
