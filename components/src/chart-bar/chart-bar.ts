import { html, LitElement, PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { select, max, scaleBand, scaleLinear, scaleOrdinal, axisLeft, axisBottom, ScaleOrdinal } from 'd3';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './chart-bar.scss';

export type ChartBarItem = {
  name: string;
  value: number;
  label?: string;
  color?: string;
};

const chartColors: string[] = [];
['purple', 'blue', 'red', 'green', 'yellow', 'orange'].forEach(colorName => {
  chartColors.push(`var(--color-${colorName})`);
});

const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 320;
const BAR_RADIUS = 10;
const DURATION = 450;

function debounce<T extends (...args: any[]) => void>(fn: T, wait: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  }) as T;
}

/**
 * @label Chart Bar
 * @tag wc-chart-bar
 * @rawTag chart-bar
 * @summary A vertical bar chart that follows Material Design 3 color and spacing tokens.
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
@IndividualComponent
export class ChartBar extends LitElement {
  static styles = [styles];

  @query('svg')
  private svgElement?: SVGElement;

  /** Width of the chart in pixels. */
  @property({ type: Number, reflect: true }) width: number = 0;

  /** Height of the chart in pixels. */
  @property({ type: Number, reflect: true }) height: number = DEFAULT_HEIGHT;

  /** Margin around the chart drawing area. */
  @property({ type: Number }) margin: number = 24;

  /** Chart data array. Each item should have name, value, and optional label and color. */
  @property({ type: Array }) data: ChartBarItem[] = [];

  /** Whether to render value labels above bars. */
  @property({ type: Boolean, attribute: 'show-values' }) showValues: boolean = true;

  private _initialized = false;

  private _debouncedRenderChart = debounce(() => {
    this._renderChart(true);
  }, 200);

  firstUpdated() {
    this._renderChart(false);
  }

  updated(changedProperties: PropertyValues) {
    if (!this._initialized) {
      this._initialized = true;
      return;
    }
    const watchedProps = ['width', 'height', 'margin', 'data', 'showValues'];
    const hasChanged = watchedProps.some(prop => changedProperties.has(prop));
    if (hasChanged) {
      this._debouncedRenderChart();
    }
  }

  private _getPaletteScale() {
    return scaleOrdinal<string, string>()
      .domain(this.data.map(d => d.name))
      .range(chartColors);
  }

  private _resolveColor(
    name: string,
    override: string | undefined,
    scale: ScaleOrdinal<string, string>,
  ) {
    return override || scale(name);
  }

  private _renderChart(animate: boolean) {
    if (!this.svgElement) return;

    const width = this.width > 0 ? this.width : DEFAULT_WIDTH;
    const height = this.height > 0 ? this.height : DEFAULT_HEIGHT;
    const margin = Math.max(this.margin, 12);
    const data = this.data ?? [];

    const svg = select(this.svgElement);
    svg.attr('width', width).attr('height', height);

    const innerWidth = Math.max(width - margin * 2, 0);
    const innerHeight = Math.max(height - margin * 2, 0);
    const colorScale = this._getPaletteScale();

    const container = svg.select<SVGGElement>('.chart-container');
    container.attr('transform', `translate(${margin},${margin})`);

    if (!data.length || innerWidth === 0 || innerHeight === 0) {
      container.select('.bars').selectAll('*').remove();
      container.select('.x-axis').selectAll('*').remove();
      container.select('.y-grid').selectAll('*').remove();
      container.select('.value-labels').selectAll('*').remove();
      return;
    }

    const xScale = scaleBand<string>()
      .domain(data.map(d => d.name))
      .range([0, innerWidth])
      .padding(0.28);

    const maxValue = max(data, d => d.value) ?? 0;
    const yScale = scaleLinear()
      .domain([0, maxValue || 1])
      .nice()
      .range([innerHeight, 0]);

    const yGrid = container.select<SVGGElement>('.y-grid');
    yGrid
      .call(
        axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => ''),
      )
      .selectAll('.tick text')
      .remove();
    yGrid.select('.domain').remove();
    yGrid.selectAll('.tick line').attr('class', 'gridline');

    const xAxis = container.select<SVGGElement>('.x-axis');
    xAxis
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        axisBottom(xScale)
          .tickSizeOuter(0)
          .tickFormat(name => {
            const entry = data.find(d => d.name === name);
            return entry?.label ?? name;
          }),
      );
    xAxis.select('.domain').attr('stroke', 'var(--color-outline-variant)');
    xAxis.selectAll('.tick line').remove();
    xAxis
      .selectAll('.tick text')
      .attr('class', 'axis-label')
      .attr('dy', '1.1em');

    const bars = container
      .select('.bars')
      .selectAll<SVGRectElement, ChartBarItem>('rect')
      .data(data, d => d.name)
      .join(
        enter =>
          enter
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.name) ?? 0)
            .attr('width', xScale.bandwidth())
            .attr('y', innerHeight)
            .attr('height', 0)
            .attr('rx', BAR_RADIUS)
            .attr('ry', BAR_RADIUS)
            .style('fill', d =>
              this._resolveColor(d.name, d.color, colorScale),
            ),
        update => update,
        exit =>
          exit
            .transition()
            .duration(DURATION)
            .attr('height', 0)
            .attr('y', innerHeight)
            .remove(),
      );

    bars
      .attr('x', d => xScale(d.name) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('rx', BAR_RADIUS)
      .attr('ry', BAR_RADIUS)
      .style('fill', d => this._resolveColor(d.name, d.color, colorScale));

    if (animate) {
      bars
        .transition()
        .duration(DURATION)
        .attr('y', d => yScale(d.value))
        .attr('height', d => innerHeight - yScale(d.value));
    } else {
      bars
        .attr('y', d => yScale(d.value))
        .attr('height', d => innerHeight - yScale(d.value));
    }

    const valueLabels = container
      .select('.value-labels')
      .selectAll<SVGTextElement, ChartBarItem>('text')
      .data(this.showValues ? data : [], d => d.name)
      .join(
        enter =>
          enter
            .append('text')
            .attr('class', 'value-label')
            .attr('text-anchor', 'middle')
            .attr('x', d => (xScale(d.name) ?? 0) + xScale.bandwidth() / 2)
            .attr('y', innerHeight - 6)
            .text(d => d.value.toLocaleString()),
        update => update,
        exit => exit.remove(),
      );

    const resolveLabelY = (value: number) => {
      const offset = yScale(value) - 8;
      return Math.min(offset, innerHeight - 8);
    };

    if (animate) {
      valueLabels
        .transition()
        .duration(DURATION)
        .attr('x', d => (xScale(d.name) ?? 0) + xScale.bandwidth() / 2)
        .attr('y', d => resolveLabelY(d.value))
        .text(d => d.value.toLocaleString());
    } else {
      valueLabels
        .attr('x', d => (xScale(d.name) ?? 0) + xScale.bandwidth() / 2)
        .attr('y', d => resolveLabelY(d.value))
        .text(d => d.value.toLocaleString());
    }
  }

  render() {
    const paletteScale = this._getPaletteScale();
    const legendItems = this.data.map(item => ({
      name: item.label ?? item.name,
      color: this._resolveColor(item.name, item.color, paletteScale),
    }));

    return html`
      <div class="chart-frame">
        <svg role="img" aria-label="Bar chart">
          <g class="chart-container">
            <g class="y-grid"></g>
            <g class="bars"></g>
            <g class="x-axis"></g>
            <g class="value-labels"></g>
          </g>
        </svg>
        ${legendItems.length
          ? html`<div class="legend" role="list">
              ${legendItems.map(
                item => html`<span class="legend-item" role="listitem">
                  <span
                    class="swatch"
                    style=${styleMap({ background: item.color })}
                  ></span>
                  <span>${item.name}</span>
                </span>`,
              )}
            </div>`
          : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-chart-bar': ChartBar;
  }
}
