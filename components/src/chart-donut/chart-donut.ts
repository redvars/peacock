import { html, LitElement, PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import PeacockComponent from 'src/PeacockComponent.js';
import styles from './chart-donut.scss';

export type ChartDonutColor = {
  color: string;
  hoverColor: string;
};

export type ChartDonutItem = {
  name: string;
  value: number;
  label?: string;
  color?: string;
  hoverColor?: string;
};

const chartColors: ChartDonutColor[] = [];
['purple', 'blue', 'green', 'yellow', 'orange', 'red'].forEach(colorName => {
  chartColors.push({
    color: `var(--color-${colorName}-60)`,
    hoverColor: `var(--color-${colorName}-40)`,
  });
});

function convertToHex(colorName: string): string {
  if (!colorName) return '';
  const computed = getComputedStyle(document.documentElement).getPropertyValue(
    colorName,
  );
  return computed ? computed.trim() : colorName;
}

let d3LoadCalled = false;

async function loadD3JS(): Promise<void> {
  if ((window as any)['d3']) return;

  if (d3LoadCalled) {
    await new Promise<void>(resolve => {
      const check = setInterval(() => {
        if ((window as any)['d3']) {
          clearInterval(check);
          resolve();
        }
      }, 50);
    });
    return;
  }

  d3LoadCalled = true;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load D3.js'));
    document.head.appendChild(script);
  });
}

function debounce<T extends (...args: any[]) => void>(fn: T, wait: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  }) as T;
}

/**
 * @label Chart Donut
 * @tag wc-chart-donut
 * @rawTag chart-donut
 * @summary A donut chart is a circular chart with a blank center. The area in the center can be used to display information.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-donut width="400" label="Total"></wc-chart-donut>
 * <script>
 *   document.querySelector('wc-chart-donut').data = [
 *     { name: 'A', value: 30, label: 'Category A' },
 *     { name: 'B', value: 50, label: 'Category B' },
 *     { name: 'C', value: 20, label: 'Category C' },
 *   ];
 * </script>
 * ```
 */
@PeacockComponent
export class ChartDonut extends LitElement {
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

  /** Chart data array. Each item should have name, value, and optional label/color/hoverColor. */
  @property({ type: Array }) data: ChartDonutItem[] = [];

  /** Label displayed in the center of the donut. */
  @property({ type: String }) label?: string;

  private _d3Initialized = false;

  private _debouncedUpdateChart = debounce(() => {
    this._updateChart();
  }, 300);

  async firstUpdated() {
    await this._initializeChart();
  }

  updated(changedProperties: PropertyValues) {
    const watchedProps = ['width', 'margin', 'showLabels', 'data'];
    const hasChanged = watchedProps.some(prop => changedProperties.has(prop));
    if (hasChanged && this._d3Initialized) {
      this._debouncedUpdateChart();
    }
  }

  private _getRadius(): number {
    return this.width / 2 - this.margin - 100;
  }

  private _getDoughnutArc(radius: number) {
    const d3 = (window as any)['d3'];
    return d3
      .arc()
      .innerRadius(radius * 0.72)
      .outerRadius(radius);
  }

  private _getLabelsArc() {
    const d3 = (window as any)['d3'];
    const radius = this._getRadius();
    return d3
      .arc()
      .innerRadius(radius + 10)
      .outerRadius(radius + 10);
  }

  private _getTotal(): number {
    return this.data.reduce((total, d) => total + d.value, 0);
  }

  private _getPieData() {
    const d3 = (window as any)['d3'];
    const pie = d3
      .pie()
      .sort(null)
      .value((d: ChartDonutItem) => d.value);
    return pie(this.data);
  }

  private _getColorScale() {
    const d3 = (window as any)['d3'];
    return d3
      .scaleOrdinal()
      .domain(this.data.map((d: ChartDonutItem) => d.name))
      .range(chartColors);
  }

  private _setSVGDimensions() {
    const d3 = (window as any)['d3'];
    const svg = d3.select(this.svgElement);
    svg.attr('width', this.width).attr('height', this.width);
    svg
      .select('.chart-container')
      .attr('transform', `translate(${this.width / 2},${this.width / 2})`);
  }

  private _renderArcPaths(pieData: any, doughnutArc: any, colorScale: any) {
    const d3 = (window as any)['d3'];
    const $arcContainer = d3
      .select(this.svgElement)
      .select('.arc-container');

    const $arcPaths = $arcContainer
      .selectAll('.arc')
      .data(pieData)
      .join('path')
      .attr('class', 'arc')
      .on('mouseover', (e: MouseEvent, d: any) => {
        (e.currentTarget as SVGPathElement).style.fill =
          convertToHex(d.data.hoverColor) ||
          convertToHex(d.data.color) ||
          colorScale(d.data.name).hoverColor;
      })
      .on('mouseout', (e: MouseEvent, d: any) => {
        (e.currentTarget as SVGPathElement).style.fill =
          convertToHex(d.data.color) || colorScale(d.data.name).color;
      });

    $arcPaths
      .transition()
      .duration(500)
      .attr('d', doughnutArc)
      .attr('fill', (d: any) => {
        return convertToHex(d.data.color) || colorScale(d.data.name).color;
      });
  }

  private _updateChart() {
    const d3 = (window as any)['d3'];
    const radius = this._getRadius();
    const pieData = this._getPieData();
    const colorScale = this._getColorScale();

    this._setSVGDimensions();

    const total = this._getTotal();
    d3.select(this.svgElement)
      .select('.title')
      .transition()
      .tween('text', function (this: SVGTextElement) {
        const selection = d3.select(this);
        const start = d3.select(this).text();
        const end = total;
        const interpolator = d3.interpolateNumber(start, end);
        return function (t: number) {
          selection.text(Math.round(interpolator(t)));
        };
      })
      .duration(500);

    const doughnutArc = this._getDoughnutArc(radius);
    this._renderArcPaths(pieData, doughnutArc, colorScale);

    if (this.showLabels) {
      const labelsArc = this._getLabelsArc();
      const $chartContainer = d3
        .select(this.svgElement)
        .select('.chart-container');

      $chartContainer
        .selectAll('.item-polyline')
        .data(pieData)
        .join('polyline')
        .attr('class', 'item-polyline')
        .transition()
        .duration(500)
        .attr('points', function (d: any) {
          const posA = doughnutArc.centroid(d);
          const posB = labelsArc.centroid(d);
          const posC = labelsArc.centroid(d);
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          posC[0] = radius * (midAngle < Math.PI ? 1 : -1);
          return [posA, posB, posC];
        });

      $chartContainer
        .selectAll('.item-label')
        .data(pieData)
        .join('text')
        .attr('class', 'item-label')
        .transition()
        .duration(500)
        .text(function (d: any) {
          return d.data.label;
        })
        .attr('transform', (d: any) => {
          const pos = labelsArc.centroid(d);
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          pos[0] = radius * (midAngle < Math.PI ? 1 : -1);
          return `translate(${pos})`;
        })
        .style('text-anchor', (d: any) => {
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          return midAngle < Math.PI ? 'start' : 'end';
        });
    }
  }

  private async _initializeChart() {
    await loadD3JS();

    this._d3Initialized = true;

    const d3 = (window as any)['d3'];
    const radius = this._getRadius();
    const pieData = this._getPieData();
    const colorScale = this._getColorScale();

    this._setSVGDimensions();

    const doughnutArc = this._getDoughnutArc(radius);
    this._renderArcPaths(pieData, doughnutArc, colorScale);

    d3.select(this.svgElement).select('.title').text(this._getTotal());

    if (this.showLabels) {
      const labelsArc = this._getLabelsArc();
      const $chartContainer = d3
        .select(this.svgElement)
        .select('.chart-container');

      $chartContainer
        .selectAll('.item-polyline')
        .data(pieData)
        .join('polyline')
        .attr('class', 'item-polyline')
        .attr('points', (d: any) => {
          const posA = doughnutArc.centroid(d);
          const posB = labelsArc.centroid(d);
          const posC = labelsArc.centroid(d);
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          posC[0] = radius * (midAngle < Math.PI ? 1 : -1);
          return [posA, posB, posC];
        });

      $chartContainer
        .selectAll('.item-label')
        .data(pieData)
        .join('text')
        .text(function (d: any) {
          return d.data.label;
        })
        .attr('class', 'item-label')
        .attr('transform', (d: any) => {
          const pos = labelsArc.centroid(d);
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          pos[0] = radius * (midAngle < Math.PI ? 1 : -1);
          return `translate(${pos})`;
        })
        .style('text-anchor', (d: any) => {
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          return midAngle < Math.PI ? 'start' : 'end';
        });
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
