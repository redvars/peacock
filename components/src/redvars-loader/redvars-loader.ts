import { html, LitElement, nothing, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './redvars-loader.scss';

export type RedvarsLoaderVariant =
  | 'build'
  | 'trace'
  | 'fill'
  | 'pulse'
  | 'orbit';

// The r mark, redrawn from the Redvars logo on a 256 tile.
const MARK_PATH =
  'M90 84H118L125.5 108C129 98 146 83 162 82H180L178 118H158C144 120 128 130 128 146V224H90Z';
// The same mark in two pieces, overlapping at the joint, for the build variant.
const STEM_PATH = 'M90 84H118L125.5 108L128 116V224H90Z';
const ARM_PATH =
  'M125.5 108C129 98 146 83 162 82H180L178 118H158C144 120 128 130 128 146H120V108Z';
// A square track just outside the tile, starting at its top centre, for the orbit variant.
const TRACK_PATH = 'M128 -20H276V276H-20V-20Z';

/**
 * @label Redvars Loader
 * @tag wc-redvars-loader
 * @rawTag redvars-loader
 * @summary A loading indicator drawn from the Redvars r mark, for app start-up and full-page loads.
 * @overview
 * <p>Redvars Loader animates the r mark on its red tile in one of five ways (<code>variant</code>):
 * <code>build</code> (the default: the stem rises and the arm swings out), <code>trace</code> (the
 * outline draws itself and fills), <code>fill</code> (the r fills from the bottom),
 * <code>pulse</code> (the tile beats and sends out a ring) and <code>orbit</code> (a runner chases
 * round the tile).</p>
 * <p>With <code>value</code> (0 to 100) it stops looping and fills the r to that level, as a
 * determinate progress bar. It is <code>role="progressbar"</code>, named by <code>label</code>
 * ("Loading" by default). When the system asks for reduced motion the mark only breathes gently,
 * unless <code>full-motion</code> is set.</p>
 * <p>For loading inside a page, use <code>wc-circular-progress</code> or
 * <code>wc-linear-progress</code>; this one is the brand moment, such as the first load of an
 * app.</p>
 *
 * @cssprop --redvars-loader-size - Edge of the tile. Defaults to `4rem`.
 * @cssprop --redvars-loader-tile-color - Color of the tile, the track and the pulse ring. Defaults to Redvars red.
 * @cssprop --redvars-loader-mark-color - Color of the r. Defaults to white.
 * @cssprop --redvars-loader-duration - Length of one loop. Defaults to `2.4s`; `pulse` loops at three quarters of it.
 *
 * @example
 * ```html
 * <wc-redvars-loader></wc-redvars-loader>
 * <wc-redvars-loader variant="orbit" label="Starting Redvars"></wc-redvars-loader>
 * <wc-redvars-loader value="60"></wc-redvars-loader>
 * ```
 * @tags display, progress
 */
@IndividualComponent
export class RedvarsLoader extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** How the mark moves while loading. Ignored once `value` is set. */
  @property({ type: String, reflect: true }) variant: RedvarsLoaderVariant =
    'build';

  /** Progress from 0 to 100. When set, the r fills to this level instead of looping. */
  @property({ type: Number }) value?: number;

  /** The accessible name. Defaults to Peacock's `loading` string ("Loading"). */
  @property({ type: String }) label = '';

  /** Plays the full animation even when the system asks for reduced motion. */
  @property({ type: Boolean, reflect: true, attribute: 'full-motion' })
  fullMotion = false;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  // ── Private methods ──────────────────────────────────────────────────────

  private get determinate(): boolean {
    return typeof this.value === 'number' && !Number.isNaN(this.value);
  }

  private get progress(): number {
    return Math.min(100, Math.max(0, this.value ?? 0));
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderMark() {
    if (this.determinate || this.variant === 'fill') {
      return svg`<path class="ghost" d=${MARK_PATH}></path><path class="mark" d=${MARK_PATH}></path>`;
    }
    if (this.variant === 'build') {
      return svg`<path class="stem" d=${STEM_PATH}></path><path class="arm" d=${ARM_PATH}></path>`;
    }
    if (this.variant === 'trace') {
      return svg`<path class="mark" pathLength="1" d=${MARK_PATH}></path>`;
    }
    return svg`<path class="mark" d=${MARK_PATH}></path>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const { determinate } = this;
    const mode = determinate ? 'progress' : this.variant;
    const orbit = mode === 'orbit';
    return html`<div
      class="redvars-loader ${mode}"
      part="loader"
      role="progressbar"
      aria-label=${this.label || this.i18n.t('loading')}
      aria-valuemin=${determinate ? 0 : nothing}
      aria-valuemax=${determinate ? 100 : nothing}
      aria-valuenow=${determinate ? this.progress : nothing}
      style=${styleMap({
        '--_progress': determinate ? `${this.progress / 100}` : undefined,
      })}
    >
      <svg
        viewBox=${orbit ? '-40 -40 336 336' : '0 0 256 256'}
        aria-hidden="true"
      >
        ${orbit
          ? svg`<path class="track" d=${TRACK_PATH}></path><path class="runner" pathLength="1" d=${TRACK_PATH}></path>`
          : nothing}
        <rect class="tile" width="256" height="256"></rect>
        ${this.renderMark()}
      </svg>
    </div>`;
  }
}
