import { LitElement, html, css } from 'lit';

import styles from './spinner.scss';

/**
 * @label Spinner
 * @tag base-spinner
 * @rawTag spinner
 * @summary A spinner component that animates a circular shape.
 * @cssprop --spinner-track-color - The color of the track.
 * @cssprop --spinner-shape-color - The color of the shape.
 * @tags display
 *
 * @example
 * ```html
 * <base-spinner></base-spinner>
 * ```
 */
export class Spinner extends LitElement {
  static styles = [styles];

  render() {
    return html`
      <div class="spinner track">
        <div class="shape"></div>
      </div>
    `;
  }
}
