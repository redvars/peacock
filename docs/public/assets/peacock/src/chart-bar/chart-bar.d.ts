import { LitElement, PropertyValues } from 'lit';
export type ChartBarItem = {
    name: string;
    value: number;
    label?: string;
    color?: string;
};
/**
 * @label Chart Bar
 * @tag wc-chart-bar
 * @rawTag chart-bar
 * @summary A vertical bar chart that follows color and spacing tokens.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-bar width="520" height="320"></wc-chart-bar>
 * <script>
 *   document.querySelector('wc-chart-bar').data = [
 *     { name: 'apples', label: 'Apples', value: 20 },
 *     { name: 'bananas', label: 'Bananas', value: 35 },
 *     { name: 'cherries', label: 'Cherries', value: 15 },
 *   ];
 * </script>
 * ```
 */
export declare class ChartBar extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    private svgElement?;
    /** Width of the chart in pixels. */
    width: number;
    /** Height of the chart in pixels. */
    height: number;
    /** Margin around the chart drawing area. */
    margin: number;
    /** Chart data array. Each item should have name, value, and optional label and color. */
    data: ChartBarItem[];
    /** Whether to render value labels above bars. */
    showValues: boolean;
    private _initialized;
    private _debouncedRenderChart;
    firstUpdated(): void;
    updated(changedProperties: PropertyValues): void;
    private _getPaletteScale;
    private _resolveColor;
    private _renderChart;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wc-chart-bar': ChartBar;
    }
}
