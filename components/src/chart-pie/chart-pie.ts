import { html, PropertyValues, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { arc, easeCubicOut, interpolate, pie, PieArcDatum, select } from 'd3';
import IndividualComponent from '@/IndividualComponent.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import { ChartBase, chartColor } from '../__internal/chart/chart-base.js';
import type {
  ChartSeries,
  ChartTooltipModel,
} from '../__internal/chart/types.js';
import baseStyles from '../__internal/chart/chart-base.scss';
import styles from './chart-pie.scss';

export type {
  ChartLegendMode,
  ChartSelectDetail,
  ChartValueFormatter,
} from '../__internal/chart/types.js';

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

type SliceArc = PieArcDatum<ChartPieItem>;

/** A slice path that remembers its last angles, so updates tween from where it was. */
interface SlicePath extends SVGPathElement {
  __current?: { startAngle: number; endAngle: number };
}

const DURATION = 450;
/** Distance a hovered slice moves out from the centre. */
const PULL_OUT = 6;
/** Room around the pie for the hovered slice. */
const PADDING = PULL_OUT + 2;
/** Gap between slices, in pixels at the outer edge. */
const SLICE_GAP = 2;
/** Smallest slice angle that gets a percentage label. */
const MIN_LABEL_ANGLE = 0.35;

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
 * @fires select - A slice was clicked or chosen with Enter. `detail` holds `index`, `series` (the slice name) and `datum`.
 * @fires chart-select - Deprecated: use `select`. Fires after `select` with the same detail.
 *
 * @csspart container - The outer wrapper.
 * @csspart plot - The focusable plot area holding the SVG.
 * @csspart tooltip - The tooltip.
 * @csspart legend - The legend.
 *
 * @cssprop --color-chart-1 - Color of the first slice; slices cycle through `--color-chart-1` to `--color-chart-8`.
 * @cssprop --chart-dim-opacity - Opacity of slices that are not hovered. Defaults to `0.4`.
 */
@IndividualComponent
export class ChartPie extends ChartBase {
  // ── Static

  static styles = [baseStyles, styles];

  // ── Properties

  /** Slices to draw. */
  @property({ type: Array }) data: ChartPieItem[] = [];

  /**
   * Size of the hole as a fraction of the radius, from 0 (pie) to 0.9.
   * @deprecated A pie has no hole: use `wc-chart-doughnut`, which owns `inner-radius` and the centre label.
   */
  @property({ type: Number, attribute: 'inner-radius' }) innerRadius: number =
    0;

  /** Prints each slice's percentage inside it when it fits. */
  @property({ type: Boolean, attribute: 'show-labels' }) showLabels: boolean =
    false;

  // ── Private fields

  /** Arcs from the last draw. */
  private arcs: SliceArc[] = [];

  /** Outer radius from the last draw. */
  protected radius: number = 0;

  /** Pie centre from the last draw, in plot coordinates. */
  private center = { x: 0, y: 0 };

  // ── Lifecycle

  willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    if (changed.has('innerRadius') && this.innerRadius && !this.ownsHole()) {
      deprecate(this.localName, '`inner-radius`', '`wc-chart-doughnut`');
    }
  }

  // ── Private methods

  /** Whether `inner-radius` is part of this chart's API. Doughnut returns true. */
  protected ownsHole(): boolean {
    return false;
  }

  protected drawProperties(): string[] {
    return [...super.drawProperties(), 'data', 'innerRadius', 'showLabels'];
  }

  protected hasData(): boolean {
    return this.data.some(item => item.value > 0);
  }

  protected getSeries(): ChartSeries[] {
    return this.data.map((item, i) => ({
      key: item.name,
      label: item.label ?? item.name,
      color: item.color ?? chartColor(i),
    }));
  }

  /** Slices are only told apart by the legend, so `auto` always shows it. */
  protected legendAuto(): boolean {
    return true;
  }

  protected getItemCount(): number {
    return this.data.length;
  }

  /** Sum of the visible slices. */
  protected visibleTotal(): number {
    return this.data
      .filter(item => !this.isHidden(item.name))
      .reduce((sum, item) => sum + Math.max(item.value, 0), 0);
  }

  protected percent(value: number): string {
    const total = this.visibleTotal();
    return total
      ? new Intl.NumberFormat(this.i18n.locale, {
          style: 'percent',
          maximumFractionDigits: 1,
        }).format(value / total)
      : '';
  }

  /** The hole as a clamped fraction of the radius. */
  protected innerFraction(): number {
    return Math.min(Math.max(this.innerRadius || 0, 0), 0.9);
  }

  protected draw(animate: boolean): void {
    if (!this.svgElement) return;
    const { width, height } = this.svgSize();
    const radius = Math.max(Math.min(width, height) / 2 - PADDING, 0);
    this.radius = radius;
    this.center = { x: width / 2, y: height / 2 };
    const inner = radius * this.innerFraction();
    const colors = new Map(this.getSeries().map(s => [s.key, s.color]));

    const arcs = pie<ChartPieItem>()
      .sort(null)
      .value(item => (this.isHidden(item.name) ? 0 : Math.max(item.value, 0)))
      .padAngle(radius ? SLICE_GAP / radius : 0)(this.data);
    this.arcs = arcs;

    const sliceArc = arc<{
      startAngle: number;
      endAngle: number;
      padAngle?: number;
    }>()
      .innerRadius(inner)
      .outerRadius(radius)
      .cornerRadius(Math.min(4, (radius - inner) / 4));

    const root = select(this.svgElement)
      .select('.pie')
      .attr('transform', `translate(${this.center.x},${this.center.y})`);

    const slices = root
      .select('.slices')
      .selectAll<SVGPathElement, SliceArc>('path.slice')
      .data(arcs, d => d.data.name)
      .join('path')
      .attr('class', 'slice mark')
      .attr('data-key', d => d.data.name)
      .style('fill', d => colors.get(d.data.name) ?? '');

    if (animate) {
      slices
        .transition()
        .duration(DURATION)
        .ease(easeCubicOut)
        .attrTween('d', function (d) {
          const el = this as SlicePath;
          // New slices sweep open from their start angle.
          const from = el.__current ?? {
            startAngle: d.startAngle,
            endAngle: d.startAngle,
          };
          const tween = interpolate(from, {
            startAngle: d.startAngle,
            endAngle: d.endAngle,
          });
          el.__current = { startAngle: d.startAngle, endAngle: d.endAngle };
          return t => sliceArc({ ...tween(t), padAngle: d.padAngle }) ?? '';
        });
    } else {
      slices.interrupt().each(function (d) {
        (this as SlicePath).__current = {
          startAngle: d.startAngle,
          endAngle: d.endAngle,
        };
      });
      slices.attr('d', d => sliceArc(d) ?? '');
    }

    // Percentages inside slices big enough to hold them.
    const labelArc = arc<SliceArc>()
      .innerRadius(inner + (radius - inner) / 2)
      .outerRadius(inner + (radius - inner) / 2);
    const labelled = this.showLabels
      ? arcs.filter(d => d.endAngle - d.startAngle >= MIN_LABEL_ANGLE)
      : [];
    root
      .select('.slice-labels')
      .selectAll<SVGTextElement, SliceArc>('text')
      .data(labelled, d => d.data.name)
      .join('text')
      .attr('class', 'slice-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .text(d => this.percent(d.data.value));
  }

  protected drawHighlight(): void {
    if (!this.svgElement) return;
    const { activeIndex, activeSeries } = this;
    const activeName =
      activeIndex >= 0 ? this.data[activeIndex]?.name : activeSeries;
    select(this.svgElement)
      .select('.slices')
      .selectAll<SVGPathElement, SliceArc>('path.slice')
      .classed(
        'is-dimmed',
        d => activeName !== undefined && d.data.name !== activeName,
      )
      .style('transform', d => {
        if (d.data.name !== activeName) return 'translate(0px, 0px)';
        const mid = (d.startAngle + d.endAngle) / 2;
        return `translate(${Math.sin(mid) * PULL_OUT}px, ${-Math.cos(mid) * PULL_OUT}px)`;
      });
  }

  protected itemAtPoint(x: number, y: number): number {
    const dx = x - this.center.x;
    const dy = y - this.center.y;
    const distance = Math.hypot(dx, dy);
    if (
      distance > this.radius + PULL_OUT ||
      distance < this.radius * this.innerFraction()
    ) {
      return -1;
    }
    let angle = Math.atan2(dx, -dy);
    if (angle < 0) angle += Math.PI * 2;
    const hit = this.arcs.find(
      d =>
        d.endAngle > d.startAngle &&
        angle >= d.startAngle &&
        angle < d.endAngle,
    );
    return hit ? hit.index : -1;
  }

  protected getTooltip(index: number): ChartTooltipModel | undefined {
    const item = this.data[index];
    const slice = this.arcs.find(d => d.index === index);
    if (!item || !slice || this.isHidden(item.name)) return undefined;
    const mid = (slice.startAngle + slice.endAngle) / 2;
    const reach = this.radius * 0.75;
    return {
      title: '',
      rows: [
        {
          key: item.name,
          label: item.label ?? item.name,
          color: item.color ?? chartColor(index),
          value: `${this.formatValue(item.value)} · ${this.percent(item.value)}`,
        },
      ],
      x: this.center.x + Math.sin(mid) * reach,
      y: this.center.y - Math.cos(mid) * reach,
    };
  }

  protected getSelectDetail(index: number) {
    return { index, series: this.data[index]?.name, datum: this.data[index] };
  }

  // ── Render helpers

  protected renderSkeleton() {
    return html`<div
      class="skeleton skeleton-circle"
      style=${styleMap({ height: `${this.height}px` })}
      aria-hidden="true"
    >
      <span></span>
    </div>`;
  }

  protected renderSvgContent() {
    return svg`<g class="pie"><g class="slices"></g><g class="slice-labels"></g></g>`;
  }

  protected renderTable() {
    return html`<thead>
        <tr>
          <th scope="col">${this.i18n.t('name')}</th>
          <th scope="col">${this.i18n.t('value')}</th>
          <th scope="col">${this.i18n.t('share')}</th>
        </tr>
      </thead>
      <tbody>
        ${this.data.map(
          item =>
            html`<tr>
              <th scope="row">${item.label ?? item.name}</th>
              <td>${this.formatValue(item.value)}</td>
              <td>${this.percent(item.value)}</td>
            </tr>`,
        )}
      </tbody>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-chart-pie': ChartPie;
  }
}
