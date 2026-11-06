import { ChartBase } from '../__internal/chart/chart-base.js';
import type { ChartSeries, ChartTooltipModel } from '../__internal/chart/types.js';
export type { ChartSelectDetail, ChartValueFormatter, } from '../__internal/chart/types.js';
/** One slice. */
export type ChartPieItem = {
    /** Unique key of the slice. */
    name: string;
    value: number;
    /** Display name in the legend and tooltip. Defaults to `name`. */
    label?: string;
    /** Any CSS color. Defaults to the next `--color-chart-n` token. */
    color?: string;
};
/**
 * @label Pie Chart
 * @tag wc-chart-pie
 * @rawTag chart-pie
 * @summary Shows how parts make up a whole. Best with a handful of slices.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-pie label="Visitors by browser"></wc-chart-pie>
 * <script>
 *   document.querySelector('wc-chart-pie').data = [
 *     { name: 'chrome', label: 'Chrome', value: 275 },
 *     { name: 'safari', label: 'Safari', value: 200 },
 *     { name: 'firefox', label: 'Firefox', value: 187 },
 *   ];
 * </script>
 * ```
 *
 * @slot empty - Shown when there is no data. Defaults to "No data".
 *
 * @fires chart-select - A slice was clicked or chosen with Enter. `detail` holds `index`, `series` (the slice name) and `datum`.
 *
 * @csspart container - The outer wrapper.
 * @csspart plot - The focusable plot area holding the SVG.
 * @csspart tooltip - The tooltip.
 * @csspart legend - The legend.
 *
 * @cssprop --color-chart-1 - Color of the first slice; slices cycle through `--color-chart-1` to `--color-chart-8`.
 * @cssprop --chart-dim-opacity - Opacity of slices that are not hovered. Defaults to `0.4`.
 */
export declare class ChartPie extends ChartBase {
    static styles: import("lit").CSSResultGroup[];
    /** Slices to draw. */
    data: ChartPieItem[];
    /** Size of the hole as a fraction of the radius, from 0 (pie) to 0.9. */
    innerRadius: number;
    /** Prints each slice's percentage inside it when it fits. */
    showLabels: boolean;
    /** Arcs from the last draw. */
    private arcs;
    /** Outer radius from the last draw. */
    protected radius: number;
    /** Pie centre from the last draw, in plot coordinates. */
    private center;
    protected drawProperties(): string[];
    protected hasData(): boolean;
    protected getSeries(): ChartSeries[];
    protected legendVisible(): boolean;
    protected getItemCount(): number;
    /** Sum of the visible slices. */
    protected visibleTotal(): number;
    protected percent(value: number): string;
    private innerFraction;
    protected draw(animate: boolean): void;
    protected drawHighlight(): void;
    protected itemAtPoint(x: number, y: number): number;
    protected getTooltip(index: number): ChartTooltipModel | undefined;
    protected getSelectDetail(index: number): {
        index: number;
        series: string;
        datum: ChartPieItem;
    };
    protected renderSkeleton(): import("lit-html").TemplateResult<1>;
    protected renderSvgContent(): import("lit-html").TemplateResult<2>;
    protected renderTable(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wc-chart-pie': ChartPie;
    }
}
