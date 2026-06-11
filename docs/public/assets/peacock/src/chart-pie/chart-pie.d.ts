import { LitElement, PropertyValues } from 'lit';
export type ChartPieColor = {
    color: string;
};
export type ChartPieItem = {
    name: string;
    value: number;
    label?: string;
    color?: string;
};
/**
 * @label Chart Pie
 * @tag wc-chart-pie
 * @rawTag chart-pie
 * @summary A pie chart is a circular statistical graphic that visually represents numerical proportions.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-pie width="400"></wc-chart-pie>
 * <script>
 *   document.querySelector('wc-chart-pie').data = [
 *     { name: 'A', value: 30, label: 'Category A' },
 *     { name: 'B', value: 50, label: 'Category B' },
 *     { name: 'C', value: 20, label: 'Category C' },
 *   ];
 * </script>
 * ```
 */
export declare class ChartPie extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    private svgElement?;
    /** Width (and height) of the chart in pixels. */
    width: number;
    /** Margin around the chart. */
    margin: number;
    /** Whether to show labels outside the chart. */
    showLabels: boolean;
    /** Chart data array. Each item should have name, value, and optional label and color. */
    data: ChartPieItem[];
    private _initialized;
    private _debouncedRenderChart;
    firstUpdated(): void;
    updated(changedProperties: PropertyValues): void;
    private _getRadius;
    private _getPieData;
    private _getColorScale;
    private _renderChart;
    render(): import("lit-html").TemplateResult<1>;
}
