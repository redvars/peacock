import { property } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import { ChartLine } from '../chart-line/chart-line.js';

export type {
  ChartConfig,
  ChartDatum,
  ChartLegendMode,
  ChartSelectDetail,
  ChartSeriesConfig,
  ChartValueFormatter,
} from '../__internal/chart/types.js';
export type { ChartCurve } from '../chart-line/chart-line.js';

/**
 * @label Area Chart
 * @tag wc-chart-area
 * @rawTag chart-area
 * @summary A line chart with the area under each line filled, optionally stacked to show parts of a total over time.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-area category-key="month" stacked label="Visitors by month"></wc-chart-area>
 * <script>
 *   const chart = document.querySelector('wc-chart-area');
 *   chart.config = {
 *     desktop: { label: 'Desktop' },
 *     mobile: { label: 'Mobile' },
 *   };
 *   chart.data = [
 *     { month: 'January', desktop: 186, mobile: 80 },
 *     { month: 'February', desktop: 305, mobile: 200 },
 *     { month: 'March', desktop: 237, mobile: 120 },
 *   ];
 * </script>
 * ```
 *
 * @slot empty - Shown when there is no data. Defaults to "No data".
 *
 * @fires select - A category was clicked or chosen with Enter. `detail` holds `index` (the row position) and `datum`.
 * @fires chart-select - Deprecated: use `select`. Fires after `select` with the same detail.
 *
 * @csspart container - The outer wrapper.
 * @csspart plot - The focusable plot area holding the SVG.
 * @csspart tooltip - The tooltip.
 * @csspart legend - The legend.
 *
 * @cssprop --color-chart-1 - Color of the first series; series cycle through `--color-chart-1` to `--color-chart-8`.
 * @cssprop --chart-line-width - Stroke width of the lines. Defaults to `2px`.
 * @cssprop --chart-grid-color - Gridline and baseline color. Defaults to `--color-outline-variant`.
 * @cssprop --chart-axis-color - Axis label color. Defaults to `--color-on-surface-variant`.
 * @cssprop --chart-dim-opacity - Opacity of series that are not highlighted. Defaults to `0.4`.
 */
@IndividualComponent
export class ChartArea extends ChartLine {
  // ── Properties

  /** Stacks the series on each other so the top line shows the total. */
  @property({ type: Boolean, reflect: true }) stacked: boolean = false;

  // ── Constructor

  constructor() {
    super();
    this.filled = true;
  }

  // ── Private methods

  protected drawProperties(): string[] {
    return [...super.drawProperties(), 'stacked'];
  }

  protected isStacked(): boolean {
    return this.stacked;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-chart-area': ChartArea;
  }
}
