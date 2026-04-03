import { html, LitElement, PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import * as d3 from 'd3';
import styles from './chart-donut.scss';

export type ChartDoughnutColor = {
  color: string;
};

export type ChartDoughnutItem = {
  name: string;
  value: number;
  label?: string;
  color?: string;
};

const chartColors: ChartDoughnutColor[] = [];
['purple', 'blue', 'red', 'green', 'yellow', 'orange'].forEach(colorName => {
  chartColors.push({
    color: `var(--color-${colorName})`,
  });
});

/** SVGPathElement augmented with the last rendered arc datum for smooth tween interpolation. */
interface ArcPathElement extends SVGPathElement {
  _prevDatum?: d3.PieArcDatum<ChartDoughnutItem>;
}

function debounce<T extends (...args: any[]) => void>(fn: T, wait: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  }) as T;
}

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
@IndividualComponent
export class ChartDoughnut extends LitElement {
  static styles = [styles];

  @query('svg')
  private svgElement?: SVGElement;

  /** Width (and height) of the chart in pixels. */
  @property({ type: Number, reflect: true }) width: number = 0;

  /** Margin around the chart. */
  @property({ type: Number, reflect: true }) margin: number = 10;

  /** Whether to show labels outside the chart. */
  @property({ type: Boolean, reflect: true, attribute: 'show-labels' })
  showLabels: boolean = true;

  /** Chart data array. Each item should have name, value, and optional label and color. */
  @property({ type: Array }) data: ChartDoughnutItem[] = [];

  /** Label displayed in the center of the doughnut. */
  @property({ type: String }) label?: string;

  private _initialized = false;

  private _debouncedRenderChart = debounce(() => {
    this._renderChart(true);
  }, 300);

  firstUpdated() {
    this._renderChart(false);
  }

  updated(changedProperties: PropertyValues) {
    if (!this._initialized) {
      this._initialized = true;
      return;
    }
    const watchedProps = ['width', 'margin', 'showLabels', 'data'];
    const hasChanged = watchedProps.some(prop => changedProperties.has(prop));
    if (hasChanged) {
      this._debouncedRenderChart();
    }
  }

  private _getRadius(): number {
    return this.width / 2 - this.margin - 100;
  }

  private _getTotal(): number {
    return this.data.reduce((total, d) => total + d.value, 0);
  }

  private _getPieData() {
    const pie = d3
      .pie<ChartDoughnutItem>()
      .sort(null)
      .value(d => d.value);
    return pie(this.data);
  }

  private _getColorScale() {
    return d3
      .scaleOrdinal<string, ChartDoughnutColor>()
      .domain(this.data.map(d => d.name))
      .range(chartColors);
  }

  private _renderChart(animate: boolean) {
    if (!this.svgElement) return;

    const DURATION = 500;
    const radius = this._getRadius();
    const pieData = this._getPieData();
    const colorScale = this._getColorScale();
    const total = this._getTotal();

    const svg = d3.select(this.svgElement);

    const doughnutArc = d3
      .arc<d3.PieArcDatum<ChartDoughnutItem>>()
      .innerRadius(radius * 0.72)
      .outerRadius(radius);

    const labelsArc = d3
      .arc<d3.PieArcDatum<ChartDoughnutItem>>()
      .innerRadius(radius + 10)
      .outerRadius(radius + 10);

    // Update SVG dimensions and center transform
    svg.attr('width', this.width).attr('height', this.width);
    svg
      .select('.chart-container')
      .attr('transform', `translate(${this.width / 2},${this.width / 2})`);

    // Arc paths — keyed by name so D3 matches elements across updates
    const $paths = svg
      .select('.arc-container')
      .selectAll<SVGPathElement, d3.PieArcDatum<ChartDoughnutItem>>('.arc')
      .data(pieData, d => d.data.name)
      .join('path')
      .attr('class', 'arc')
      .style('fill', d => d.data.color || colorScale(d.data.name).color);

    if (animate) {
      $paths
        .transition()
        .duration(DURATION)
        .ease(d3.easeCubicInOut)
        .attrTween('d', function (this: SVGPathElement, d) {
          const self = this as ArcPathElement;
          // Interpolate from the last rendered angles to the new ones.
          // New (entering) arcs start collapsed at their startAngle.
          const prev: { startAngle: number; endAngle: number } =
            self._prevDatum ?? {
              startAngle: d.startAngle,
              endAngle: d.startAngle,
            };
          self._prevDatum = d;
          const iStart = d3.interpolateNumber(prev.startAngle, d.startAngle);
          const iEnd = d3.interpolateNumber(prev.endAngle, d.endAngle);
          return (t: number) =>
            doughnutArc({ ...d, startAngle: iStart(t), endAngle: iEnd(t) }) ??
            '';
        });
    } else {
      // Initial render: draw immediately and seed previous-datum for later tweens
      $paths
        .each(function (this: SVGPathElement, d) {
          (this as ArcPathElement)._prevDatum = d;
        })
        .attr('d', d => doughnutArc(d) ?? '');
    }

    // Animate the central total counter
    const $title = svg.select('.title');
    if (animate) {
      $title
        .transition()
        .duration(DURATION)
        .ease(d3.easeCubicInOut)
        .tween('text', function (this: d3.BaseType) {
          const sel = d3.select(this as SVGTextElement);
          const start = parseFloat(sel.text()) || 0;
          const interp = d3.interpolateNumber(start, total);
          return function (t: number) {
            sel.text(Math.round(interp(t)));
          };
        });
    } else {
      $title.text(total);
    }

    // Label polylines and text
    const $chartContainer = svg.select('.chart-container');

    if (this.showLabels) {
      const pointsFn = (d: d3.PieArcDatum<ChartDoughnutItem>) => {
        const posA = doughnutArc.centroid(d);
        const posB = labelsArc.centroid(d);
        const posC = posB.slice() as [number, number];
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        posC[0] = radius * (midAngle < Math.PI ? 1 : -1);
        return [posA, posB, posC].map(p => p.join(',')).join(' ');
      };

      const transformFn = (d: d3.PieArcDatum<ChartDoughnutItem>) => {
        const pos = labelsArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * (midAngle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      };

      const anchorFn = (d: d3.PieArcDatum<ChartDoughnutItem>) => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midAngle < Math.PI ? 'start' : 'end';
      };

      const $polylines = $chartContainer
        .selectAll<SVGPolylineElement, d3.PieArcDatum<ChartDoughnutItem>>(
          '.item-polyline',
        )
        .data(pieData, d => d.data.name)
        .join('polyline')
        .attr('class', 'item-polyline');

      const $labels = $chartContainer
        .selectAll<SVGTextElement, d3.PieArcDatum<ChartDoughnutItem>>('.item-label')
        .data(pieData, d => d.data.name)
        .join('text')
        .attr('class', 'item-label')
        .text(d => d.data.label ?? '');

      if (animate) {
        $polylines
          .transition()
          .duration(DURATION)
          .ease(d3.easeCubicInOut)
          .attr('points', pointsFn);
        $labels
          .transition()
          .duration(DURATION)
          .ease(d3.easeCubicInOut)
          .attr('transform', transformFn)
          .style('text-anchor', anchorFn);
      } else {
        $polylines.attr('points', pointsFn);
        $labels.attr('transform', transformFn).style('text-anchor', anchorFn);
      }
    } else {
      $chartContainer.selectAll('.item-polyline').remove();
      $chartContainer.selectAll('.item-label').remove();
    }
  }

  render() {
    return html`
      <div class="chart">
        <svg>
          <g class="chart-container">
            <g class="arc-container"></g>
            <text class="title" text-anchor="middle"></text>
            <text class="label" text-anchor="middle" y="16">
              ${this.label}
            </text>
          </g>
        </svg>
      </div>
    `;
  }
}
