import { ChartBase } from '../__internal/chart/chart-base.js';
import type { ChartSeries, ChartTooltipModel } from '../__internal/chart/types.js';
export type { ChartLegendMode, ChartSelectDetail, ChartValueFormatter, } from '../__internal/chart/types.js';
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
 *
 * @overview
 * <p>Set <code>data</code> to an array of slices, each with a unique <code>name</code>, a
 * <code>value</code>, and an optional <code>label</code> and <code>color</code>. Slices keep the
 * order they are given in. Use <code>wc-chart-doughnut</code> to show the total in the centre, and
 * <code>wc-chart-bar</code> when there are many parts or they need to be compared precisely.</p>
 * <ul>
 * <li><code>show-labels</code> prints each slice's percentage inside it when the slice is big
 * enough.</li>
 * <li><code>height</code> sets the plot height in pixels (300 by default); the width follows the
 * container.</li>
 * </ul>
 * <p>Hovering or focusing a slice pulls it out, dims the others and shows a tooltip with its value
 * and share of the visible total (<code>hide-tooltip</code> turns it off). Slices are told apart by
 * the legend, so it shows by default (<code>legend</code>: <code>auto</code>, <code>show</code> or
 * <code>hide</code>); each entry is a toggle button that hides or shows its slice, and percentages
 * are worked out from the visible slices. <code>valueFormatter</code> formats the values.</p>
 * <p>The plot is focusable. The arrow keys move through the slices (Left and Right follow the
 * reading direction), Home and End jump to the first and last, Escape clears the focus, and Enter or
 * Space fires <code>select</code>. Each move is announced through a polite live region, and a
 * visually hidden table lists each slice's name, value and share for screen readers. Give the chart
 * a <code>label</code> to name it.</p>
 * <p><code>loading</code> shows a skeleton, and the <code>empty</code> slot shows when no slice has a
 * value above zero. Slices sweep in and animate on data changes unless
 * <code>disable-animation</code> is set or the user prefers reduced motion.</p>
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
 * @slot insight - Below the chart, a line that explains it, such as the assistant’s reading of a trend. The data comes from the platform; the insight only puts it into words.
 *
 * @fires {CustomEvent<ChartSelectDetail>} select - A slice was clicked or chosen with Enter. `detail` holds `index`, `series` (the slice name) and `datum`.
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
    /** Slices are only told apart by the legend, so `auto` always shows it. */
    protected legendAuto(): boolean;
    protected getItemCount(): number;
    /** Sum of the visible slices. */
    protected visibleTotal(): number;
    protected percent(value: number): string;
    /** The hole as a fraction of the radius: none for a pie. `wc-chart-doughnut` overrides it. */
    protected innerFraction(): number;
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
