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
 *
 * @overview
 * <p>An area chart is a <code>wc-chart-line</code> with each area filled with a fading gradient of
 * its series color, and it takes the same data and attributes: <code>data</code> rows,
 * <code>category-key</code> for the category field, and <code>config</code> for the series (every
 * numeric field of the first row when omitted). Use a line chart when the series overlap so much that
 * fills would hide each other.</p>
 * <ul>
 * <li><code>stacked</code> places the series on top of each other, so the top line shows the
 * total.</li>
 * <li><code>curve</code> joins the points <code>monotone</code> (smooth, the default),
 * <code>linear</code> or <code>step</code>; <code>show-dots</code> draws a dot at every point.</li>
 * <li><code>hide-grid</code>, <code>hide-category-axis</code> and <code>hide-value-axis</code> remove
 * the gridlines and axis labels.</li>
 * <li><code>height</code> sets the plot height in pixels (300 by default); the width follows the
 * container.</li>
 * </ul>
 * <p>Hovering or focusing a category shows a tooltip with every visible series' value
 * (<code>hide-tooltip</code> turns it off). The legend shows for more than one series by default
 * (<code>legend</code>: <code>auto</code>, <code>show</code> or <code>hide</code>); each entry is a
 * toggle button that hides or shows its series, and hovering one highlights it.
 * <code>valueFormatter</code> formats values in tooltips and on the axis.</p>
 * <p>The plot is focusable. The arrow keys move through the categories (Left and Right follow the
 * reading direction), Home and End jump to the first and last, Escape clears the focus, and Enter or
 * Space fires <code>select</code>. Each move is announced through a polite live region, and a
 * visually hidden table holds the data for screen readers. Give the chart a <code>label</code> to
 * name it.</p>
 * <p><code>loading</code> shows a skeleton, and the <code>empty</code> slot shows when there is no
 * data. Marks animate unless <code>disable-animation</code> is set or the user prefers reduced
 * motion.</p>
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
 * @slot insight - Below the chart, a line that explains it, such as the assistant’s reading of a trend. The data comes from the platform; the insight only puts it into words.
 *
 * @fires {CustomEvent<ChartSelectDetail>} select - A category was clicked or chosen with Enter. `detail` holds `index` (the row position) and `datum`.
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
