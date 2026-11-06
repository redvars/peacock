import { CartesianChart, ChartOrientation } from '../__internal/chart/cartesian-chart.js';
export type { ChartConfig, ChartDatum, ChartSelectDetail, ChartSeriesConfig, ChartValueFormatter, } from '../__internal/chart/types.js';
/**
 * @label Bar Chart
 * @tag wc-chart-bar
 * @rawTag chart-bar
 * @summary Compares values across categories with vertical or horizontal bars, grouped or stacked by series.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-bar index="month" label="Visitors by month"></wc-chart-bar>
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
 *
 * @fires chart-select - A bar group was clicked or chosen with Enter. `detail` holds `index` and `datum`.
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
