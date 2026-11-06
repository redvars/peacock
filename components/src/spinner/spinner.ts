import IndividualComponent from '@/IndividualComponent.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import { CircularProgress } from '@/progress/circular-progress/circular-progress.js';
import styles from './spinner.scss';

/**
 * @label Spinner
 * @tag wc-spinner
 * @rawTag spinner
 * @summary Deprecated: an indeterminate circular progress indicator. Use `wc-circular-progress indeterminate`.
 * @overview
 * <p><code>wc-spinner</code> is deprecated and will be removed in 4.0. It now renders an
 * indeterminate <code>wc-circular-progress</code> (<code>role="progressbar"</code>, named
 * "Loading" unless it has a <code>label</code>) and logs a console warning once. Use
 * <code>&lt;wc-circular-progress indeterminate&gt;</code> instead.</p>
 *
 * @cssprop --spinner-size - The size of the spinner. Defaults to `4rem`.
 * @cssprop --spinner-track-color - The color of the track.
 * @cssprop --spinner-shape-color - The color of the moving arc.
 * @tags display
 *
 * @example
 * ```html
 * <wc-circular-progress indeterminate></wc-circular-progress>
 * ```
 */
@IndividualComponent
export class Spinner extends CircularProgress {
  static styles = [...CircularProgress.styles, styles];

  constructor() {
    super();
    this.indeterminate = true;
  }

  override connectedCallback() {
    super.connectedCallback();
    deprecate(
      'wc-spinner',
      '<wc-spinner>',
      '<wc-circular-progress indeterminate>',
    );
  }
}
