import { ChartPie } from '../chart-pie/chart-pie.js';
export type { ChartPieItem, ChartSelectDetail, ChartValueFormatter, } from '../chart-pie/chart-pie.js';
/**
 * @label Doughnut Chart
 * @tag wc-chart-doughnut
 * @rawTag chart-doughnut
 * @summary A pie chart with a hole that shows the total, or the hovered slice, in its centre.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-doughnut label="Visitors by browser" center-label="Visitors"></wc-chart-doughnut>
 * <script>
 *   document.querySelector('wc-chart-doughnut').data = [
 *     { name: 'chrome', label: 'Chrome', value: 275 },
 *     { name: 'safari', label: 'Safari', value: 200 },
 *     { name: 'firefox', label: 'Firefox', value: 187 },
 *   ];
 * </script>
 * ```
 *
 * @slot center - Replaces the total and caption in the centre.
 * @slot empty - Shown when there is no data. Defaults to "No data".
 *
 * @fires chart-select - A slice was clicked or chosen with Enter. `detail` holds `index`, `series` (the slice name) and `datum`.
 *
 * @csspart container - The outer wrapper.
 * @csspart plot - The focusable plot area holding the SVG.
 * @csspart center - The centre content.
 * @csspart tooltip - The tooltip.
 * @csspart legend - The legend.
 *
 * @cssprop --color-chart-1 - Color of the first slice; slices cycle through `--color-chart-1` to `--color-chart-8`.
 * @cssprop --chart-dim-opacity - Opacity of slices that are not hovered. Defaults to `0.4`.
 */
export declare class ChartDoughnut extends ChartPie {
    /** Size of the hole as a fraction of the radius. */
    innerRadius: number;
    /** Caption under the total in the centre. */
    centerLabel: string;
    protected renderOverlay(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wc-chart-doughnut': ChartDoughnut;
    }
}
