import { LitElement, PropertyValues } from 'lit';
export type ChartDoughnutColor = {
    color: string;
};
export type ChartDoughnutItem = {
    name: string;
    value: number;
    label?: string;
    color?: string;
};
/**
 * @label Chart Doughnut
 * @tag wc-chart-doughnut
 * @rawTag chart-doughnut
 * @summary A doughnut chart is a circular chart with a blank center. The area in the center can be used to display information.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-doughnut width="400" label="Total"></wc-chart-doughnut>
 * <script>
 *   document.querySelector('wc-chart-doughnut').data = [
 *     { name: 'A', value: 30, label: 'Category A' },
 *     { name: 'B', value: 50, label: 'Category B' },
 *     { name: 'C', value: 20, label: 'Category C' },
 *   ];
 * </script>
 * ```
 */
export declare class ChartDoughnut extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    private svgElement?;
    /** Width (and height) of the chart in pixels. */
    width: number;
    /** Margin around the chart. */
    margin: number;
    /** Whether to show labels outside the chart. */
    showLabels: boolean;
    /** Chart data array. Each item should have name, value, and optional label and color. */
    data: ChartDoughnutItem[];
    /** Label displayed in the center of the doughnut. */
    label?: string;
    private _initialized;
    private _debouncedRenderChart;
    firstUpdated(): void;
    updated(changedProperties: PropertyValues): void;
    private _getRadius;
    private _getTotal;
    private _getPieData;
    private _getColorScale;
    private _renderChart;
    render(): import("lit-html").TemplateResult<1>;
}
