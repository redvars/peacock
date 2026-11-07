import { html, LitElement, nothing, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import IndividualComponent from '@/IndividualComponent.js';

import styles from './sparkline.scss';

/** How the values are drawn. */
export type SparklineType = 'line' | 'area' | 'bar';

/** One value as drawn, in the 100 x 100 view box. */
interface SparklinePoint {
  x: number;
  y: number;
}

/** The view box is 100 x 100 and stretched to the element's box. */
const VIEW = 100;

/** Share of each bar's slot that the bar fills; the rest is the gap. */
const BAR_FILL = 0.7;

/**
 * @label Sparkline
 * @tag wc-sparkline
 * @rawTag sparkline
 *
 * @summary A tiny inline chart without axes that shows the shape of a series, for example in a KPI tile or a table cell.
 * @overview
 * <p>Sparkline draws <code>data</code> (an array of numbers) as a <code>line</code>, an
 * <code>area</code> or <code>bar</code>s. It has no axes, labels or tooltips: it shows a trend at a
 * glance, next to the number it explains. Values that are not finite numbers are skipped.</p>
 * <p>It fills its own box, which defaults to 6rem by 1.5rem; set <code>width</code> and
 * <code>height</code> in CSS to change it. The line keeps its stroke width however the box is
 * stretched. <code>highlight-last</code> marks the latest value with a dot (or, for bars, dims the
 * others). A flat series is drawn across the middle, and an empty one draws nothing.</p>
 * <p>A screen reader reads it as one image: the <code>label</code> and then a summary, for example
 * "Signups, Trend from 12 to 18, high 21, low 9". <code>format</code> formats those numbers, in the
 * nearest <code>lang</code>.</p>
 *
 * @cssprop --sparkline-color - Color of the line, area and bars. Defaults to the primary color.
 * @cssprop --sparkline-stroke-width - Width of the line.
 *
 * @example
 * ```html
 * <wc-sparkline label="Signups" data="[12, 9, 14, 21, 16, 18]"></wc-sparkline>
 * ```
 * @example
 * ```html
 * <wc-sparkline type="bar" highlight-last data="[4, 6, 3, 8, 7]"></wc-sparkline>
 * ```
 * @tags display
 */
@IndividualComponent
export class Sparkline extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** The values to draw, oldest first. In HTML, a JSON array. */
  @property({ type: Array }) data: number[] = [];

  /** Draws the values as a line, a line with a filled area under it, or bars. */
  @property({ type: String, reflect: true }) type: SparklineType = 'line';

  /** Marks the latest value: a dot on a line or area, full color on the last bar. */
  @property({ type: Boolean, reflect: true, attribute: 'highlight-last' })
  highlightLast = false;

  /** What the series is; read before the automatic summary. */
  @property({ type: String }) label = '';

  /** How to format the numbers in the summary, as `Intl.NumberFormat` options. */
  @property({ type: Object }) format?: Intl.NumberFormatOptions;

  // ── Private fields

  private readonly i18n = new I18nController(this);

  // ── Private methods

  /** The finite values of `data`. */
  private values(): number[] {
    return (Array.isArray(this.data) ? this.data : [])
      .map(Number)
      .filter(Number.isFinite);
  }

  private formatNumber(value: number): string {
    try {
      return new Intl.NumberFormat(this.i18n.locale, this.format).format(value);
    } catch {
      return new Intl.NumberFormat(this.i18n.locale).format(value);
    }
  }

  /** "Trend from 12 to 18, high 21, low 9", or a shorter text for one or no value. */
  private summary(values: number[]): string {
    if (values.length === 0) return this.i18n.t('sparklineNoData');
    const n = (value: number) => this.formatNumber(value);
    if (values.length === 1) return this.i18n.t('sparklineValue')(n(values[0]));
    return this.i18n.t('sparklineSummary')(
      n(values[0]),
      n(values[values.length - 1]),
      n(Math.max(...values)),
      n(Math.min(...values)),
    );
  }

  /** Points of a line or area: spread across the width, the range across the height. */
  private linePoints(values: number[]): SparklinePoint[] {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min;
    const y = (value: number) =>
      span === 0 ? VIEW / 2 : (1 - (value - min) / span) * VIEW;
    // One value is drawn as a flat line across the box, ending in it.
    if (values.length === 1) {
      return [
        { x: 0, y: y(values[0]) },
        { x: VIEW, y: y(values[0]) },
      ];
    }
    return values.map((value, i) => ({
      x: (i / (values.length - 1)) * VIEW,
      y: y(value),
    }));
  }

  // ── Render helpers

  private renderLine(values: number[]) {
    const points = this.linePoints(values);
    const line = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
      .join('');
    const area =
      this.type === 'area' ? `${line}L${VIEW},${VIEW}L0,${VIEW}Z` : '';
    const last = points[points.length - 1];
    return html`
      <svg
        class="chart"
        viewBox="0 0 ${VIEW} ${VIEW}"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        ${area ? svg`<path class="area" d=${area}></path>` : nothing}
        ${svg`<path class="line" d=${line}></path>`}
      </svg>
      ${this.highlightLast
        ? html`<span
            class="dot"
            aria-hidden="true"
            style=${styleMap({
              insetInlineStart: `${last.x}%`,
              insetBlockStart: `${last.y}%`,
            })}
          ></span>`
        : nothing}
    `;
  }

  private renderBars(values: number[]) {
    // Bars grow from zero, so the baseline is zero whenever it is inside the range.
    const low = Math.min(0, ...values);
    const high = Math.max(0, ...values);
    const span = high - low;
    const y = (value: number) =>
      span === 0 ? VIEW : (1 - (value - low) / span) * VIEW;
    const zero = y(0);
    const slot = VIEW / values.length;
    const width = slot * BAR_FILL;
    return html`
      <svg
        class="chart"
        viewBox="0 0 ${VIEW} ${VIEW}"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        ${values.map((value, i) => {
          const top = Math.min(y(value), zero);
          const last = i === values.length - 1;
          return svg`<rect
            class=${classMap({ bar: true, last })}
            x=${i * slot + (slot - width) / 2}
            y=${top}
            width=${width}
            height=${Math.abs(y(value) - zero)}
          ></rect>`;
        })}
      </svg>
    `;
  }

  // ── Render

  render() {
    const values = this.values();
    const name = [this.label, this.summary(values)].filter(Boolean).join(', ');
    let chart: unknown = nothing;
    if (values.length > 0) {
      chart =
        this.type === 'bar' ? this.renderBars(values) : this.renderLine(values);
    }
    return html`
      <div
        class=${classMap({
          sparkline: true,
          'highlight-last': this.highlightLast,
        })}
        role="img"
        aria-label=${name}
      >
        ${chart}
      </div>
    `;
  }
}
