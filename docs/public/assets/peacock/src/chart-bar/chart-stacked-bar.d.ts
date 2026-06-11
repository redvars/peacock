import { LitElement, PropertyValues } from 'lit';
export type ChartStackedSegment = {
    name: string;
    value: number;
    label?: string;
    color?: string;
};
export type ChartStackedBarItem = {
    name: string;
    label?: string;
    segments: ChartStackedSegment[];
};
/**
 * @label Chart Stacked Bar
 * @tag wc-chart-stacked-bar
 * @rawTag chart-stacked-bar
 * @summary A stacked bar chart that groups series by category using tokens.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-stacked-bar width="560" height="360"></wc-chart-stacked-bar>
 * <script>
 *   document.querySelector('wc-chart-stacked-bar').data = [
 *     {
 *       name: 'q1',
 *       label: 'Q1',
 *       segments: [
 *         { name: 'mobile', label: 'Mobile', value: 40 },
 *         { name: 'web', label: 'Web', value: 25 },
 *         { name: 'store', label: 'Store', value: 15 },
 *       ],
 *     },
 *     {
 *       name: 'q2',
 *       label: 'Q2',
 *       segments: [
 *         { name: 'mobile', label: 'Mobile', value: 32 },
 *         { name: 'web', label: 'Web', value: 30 },
 *         { name: 'store', label: 'Store', value: 18 },
 *       ],
 *     },
 *   ];
 * </script>
 * ```
 */
export declare class ChartStackedBar extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    private svgElement?;
    /** Width of the chart in pixels. */
    width: number;
    /** Height of the chart in pixels. */
    height: number;
    /** Margin around the chart drawing area. */
    margin: number;
    /** Chart data array. Each item holds the stacked segments for a category. */
    data: ChartStackedBarItem[];
    /** Whether to render total value labels above each stack. */
    showValues: boolean;
    /** Whether to render the legend. */
    showLegend: boolean;
    private _initialized;
    private _debouncedRenderChart;
    firstUpdated(): void;
    updated(changedProperties: PropertyValues): void;
    private _getSegmentKeys;
    private _getColorScale;
    private _getColorMap;
    private _getSegmentLabel;
    private _getTotals;
    private _renderChart;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wc-chart-stacked-bar': ChartStackedBar;
    }
}
