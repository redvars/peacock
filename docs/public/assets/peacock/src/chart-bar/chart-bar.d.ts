import { CartesianChart, ChartOrientation } from '../__internal/chart/cartesian-chart.js';
export type { ChartConfig, ChartDatum, ChartLegendMode, ChartSelectDetail, ChartSeriesConfig, ChartValueFormatter, } from '../__internal/chart/types.js';
/**
 * @label Bar Chart
 * @tag wc-chart-bar
 * @rawTag chart-bar
 * @summary Compares values across categories with vertical or horizontal bars, grouped or stacked by series.
 *
 * @overview
 * <p>Set <code>data</code> to an array of rows and <code>category-key</code> to the field that holds
 * each row's category label. <code>config</code> names the series fields, with an optional
 * <code>label</code> and <code>color</code> for each; without it every numeric field of the first row
 * becomes a series. Several series sit side by side in each category. Use
 * <code>wc-chart-line</code> for a trend over ordered categories such as time, and
 * <code>wc-chart-pie</code> for the parts of a single whole.</p>
 * <ul>
 * <li><code>orientation</code>: <code>vertical</code> (the default) draws columns;
 * <code>horizontal</code> draws bars from the left, which suits long category labels.</li>
 * <li><code>stacked</code> stacks the series in each category instead of placing them side by
 * side. Negative values stack below zero.</li>
 * <li><code>show-values</code> prints each bar's value at its end, or each stack's total when
 * stacked.</li>
 * <li><code>hide-grid</code>, <code>hide-category-axis</code> and <code>hide-value-axis</code> remove
 * the gridlines and axis labels. Category labels are thinned out when they would overlap.</li>
 * <li><code>height</code> sets the plot height in pixels (300 by default); the width follows the
 * container.</li>
 * </ul>
 * <p>Hovering or focusing a category highlights its bars and shows a tooltip with every visible
 * series' value (<code>hide-tooltip</code> turns it off). The legend shows for more than one series
 * by default (<code>legend</code>: <code>auto</code>, <code>show</code> or <code>hide</code>); each
 * entry is a toggle button that hides or shows its series, and hovering one highlights it.
 * <code>valueFormatter</code> formats values in tooltips, value labels and on the axis; by default
 * they use the locale's number format, compact on the axis.</p>
 * <p>The plot is focusable. The arrow keys move through the categories (Left and Right follow the
 * reading direction), Home and End jump to the first and last, Escape clears the focus, and Enter or
 * Space fires <code>select</code>, whose detail includes <code>series</code> when only one series is
 * visible. Each move is announced through a polite live region, and a visually hidden table holds
 * the data for screen readers. Give the chart a <code>label</code> to name it.</p>
 * <p><code>loading</code> shows a skeleton, and the <code>empty</code> slot shows when there is no
 * data. Bars grow in and animate on data changes unless <code>disable-animation</code> is set or the
 * user prefers reduced motion.</p>
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-bar category-key="month" label="Visitors by month"></wc-chart-bar>
 * <script>
 *   const chart = document.querySelector('wc-chart-bar');
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
 * @fires {CustomEvent<ChartSelectDetail>} select - A bar group was clicked or chosen with Enter. `detail` holds `index` (the row position), `datum`, and `series` when one series is visible.
 *
 * @csspart container - The outer wrapper.
 * @csspart plot - The focusable plot area holding the SVG.
 * @csspart tooltip - The tooltip.
 * @csspart legend - The legend.
 *
 * @cssprop --color-chart-1 - Color of the first series; series cycle through `--color-chart-1` to `--color-chart-8`.
 * @cssprop --chart-grid-color - Gridline and baseline color. Defaults to `--color-outline-variant`.
 * @cssprop --chart-axis-color - Axis label color. Defaults to `--color-on-surface-variant`.
 * @cssprop --chart-dim-opacity - Opacity of marks that are not hovered. Defaults to `0.4`.
 */
export declare class ChartBar extends CartesianChart {
    static styles: import("lit").CSSResultGroup[];
    /** Stacks the series in each category instead of placing them side by side. */
    stacked: boolean;
    /** `vertical` draws columns; `horizontal` draws bars from the left. */
    orientation: ChartOrientation;
    /** Prints each bar's value (each stack's total when stacked) at its end. */
    showValues: boolean;
    /** Bars from the last draw, for highlighting. */
    private bars;
    protected drawProperties(): string[];
    /** Corner radius of the rounded end, from `--shape-corner-extra-small`. */
    private cornerRadius;
    /** Bars and value labels in data space; positions are filled once scales exist. */
    private buildModels;
    protected draw(animate: boolean): void;
    protected drawHighlight(): void;
    protected getSelectDetail(index: number): import("../__internal/chart/types.js").ChartSelectDetail;
}
declare global {
    interface HTMLElementTagNameMap {
        'wc-chart-bar': ChartBar;
    }
}
