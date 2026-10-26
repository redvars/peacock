import { html, LitElement, nothing, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import styles from './brand-loader.scss';
import IndividualComponent from '@/IndividualComponent.js';

export type BrandLoaderVariant = 'build' | 'trace' | 'fill' | 'pulse' | 'orbit';

// The r mark, redrawn from the Redvars logo on a 256 tile
const MARK_PATH =
  'M90 84H118L125.5 108C129 98 146 83 162 82H180L178 118H158C144 120 128 130 128 146V224H90Z';
// The same mark in two pieces, overlapping at the joint, for the build variant
const STEM_PATH = 'M90 84H118L125.5 108L128 116V224H90Z';
const ARM_PATH =
  'M125.5 108C129 98 146 83 162 82H180L178 118H158C144 120 128 130 128 146H120V108Z';
// A square track just outside the tile, starting at its top centre, for the orbit variant
const TRACK_PATH = 'M128 -20H276V276H-20V-20Z';

/**
 * @label Brand Loader
 * @tag wc-brand-loader
 * @rawTag brand-loader
 * @summary A loading indicator built from the Redvars r mark.
 * @cssprop --brand-loader-size - The edge of the loader.
 * @cssprop --brand-loader-tile-color - The color of the tile.
 * @cssprop --brand-loader-mark-color - The color of the r.
 * @cssprop --brand-loader-duration - The length of one loop.
 * @tags display
 *
 * @example
 * ```html
 * <wc-brand-loader></wc-brand-loader>
 * ```
 */
@IndividualComponent
export class BrandLoader extends LitElement {
  static styles = [styles];

  /** How the mark moves while loading. Ignored once `value` is set. */
  @property({ type: String, reflect: true })
  variant: BrandLoaderVariant = 'build';

  /** Progress from 0 to 100. When set, the r fills to this level instead of looping. */
  @property({ type: Number }) value?: number;

  /** The accessible name of the loader. */
  @property({ type: String }) label = 'Loading';

  /** Plays the full animation even when the system asks for reduced motion. */
  @property({ type: Boolean, reflect: true, attribute: 'full-motion' })
  fullMotion = false;

  private get determinate(): boolean {
    return typeof this.value === 'number' && !Number.isNaN(this.value);
  }

  private get progress(): number {
    return Math.min(100, Math.max(0, this.value ?? 0));
  }

  private renderMark() {
    if (this.determinate || this.variant === 'fill') {
      return svg`
        <path class="ghost" d=${MARK_PATH}></path>
        <path class="mark" d=${MARK_PATH}></path>
      `;
    }
    if (this.variant === 'build') {
      return svg`
        <path class="stem" d=${STEM_PATH}></path>
        <path class="arm" d=${ARM_PATH}></path>
      `;
    }
    if (this.variant === 'trace') {
      return svg`<path class="mark" pathLength="1" d=${MARK_PATH}></path>`;
    }
    return svg`<path class="mark" d=${MARK_PATH}></path>`;
  }

  render() {
    const mode = this.determinate ? 'progress' : this.variant;
    const orbit = mode === 'orbit';

    return html`
      <div
        class="brand-loader ${mode}"
        role="progressbar"
        aria-label=${this.label}
        aria-valuemin=${this.determinate ? 0 : nothing}
        aria-valuemax=${this.determinate ? 100 : nothing}
        aria-valuenow=${this.determinate ? this.progress : nothing}
        style=${styleMap({
          '--brand-loader-progress': this.determinate
            ? `${this.progress / 100}`
            : undefined,
        })}
      >
        <svg
          viewBox=${orbit ? '-40 -40 336 336' : '0 0 256 256'}
          aria-hidden="true"
        >
          ${orbit
            ? svg`
              <path class="track" d=${TRACK_PATH}></path>
              <path class="runner" pathLength="1" d=${TRACK_PATH}></path>
            `
            : nothing}
          <rect class="tile" width="256" height="256"></rect>
          ${this.renderMark()}
        </svg>
      </div>
    `;
  }
}
