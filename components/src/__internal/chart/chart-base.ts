import {
  html,
  LitElement,
  nothing,
  PropertyValues,
  SVGTemplateResult,
  TemplateResult,
} from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { BaseType, easeCubicOut, Selection } from 'd3';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { isRtl } from '@/__internal/i18n/locale.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import type {
  ChartLegendMode,
  ChartSelectDetail,
  ChartSeries,
  ChartTooltipModel,
  ChartValueFormatter,
} from './types.js';

/** Number of `--color-chart-n` tokens series cycle through. */
export const CHART_PALETTE_SIZE = 8;

/** Default motion duration for enter and data-change animations. */
const DURATION = 450;

/** Tooltip offset from the pointer or anchor. */
const TOOLTIP_OFFSET = 12;

/** The palette color for the series or slice at `index`. */
export function chartColor(index: number): string {
  return `var(--color-chart-${(index % CHART_PALETTE_SIZE) + 1})`;
}

/**
 * Shared behaviour for every Peacock chart: container sizing, palette, value formatting,
 * tooltip, legend, keyboard navigation, the accessible data table, and loading and empty states.
 * Subclasses draw the marks with d3 into the SVG returned by `renderSvgContent()`.
 */
export abstract class ChartBase extends LitElement {
  // ── Properties

  /** Height of the plot in pixels. The width follows the container. */
  @property({ type: Number, reflect: true }) height: number = 300;

  /** Accessible name of the chart, read by screen readers. */
  @property({ type: String }) label: string = '';

  /** Shows a skeleton while data loads. */
  @property({ type: Boolean, reflect: true }) loading: boolean = false;

  /**
   * When the legend shows: `auto` shows it for more than one series (always for pie and
   * doughnut slices), `show` always, `hide` never.
   */
  @property({ type: String, reflect: true }) legend: ChartLegendMode = 'auto';

  /** Hides the tooltip. */
  @property({ type: Boolean, attribute: 'hide-tooltip' }) hideTooltip: boolean =
    false;

  /** Turns off enter and update animations. They are also off when the user prefers reduced motion. */
  @property({ type: Boolean, attribute: 'disable-animation' })
  disableAnimation: boolean = false;

  /** Formats values in tooltips, value labels and axis ticks. Defaults to the locale number format, compact on axes. */
  @property({ attribute: false }) valueFormatter?: ChartValueFormatter;

  /** Overrides Peacock's strings for this instance only. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── State

  /** Keys of series or slices switched off in the legend. */
  @state() protected hiddenKeys: Set<string> = new Set();

  /** Index of the hovered or focused category or slice, -1 for none. */
  @state() protected activeIndex: number = -1;

  /** Key of the series highlighted from the legend. */
  @state() protected activeSeries?: string;

  /** Pointer position the tooltip follows; undefined places it at the item's anchor. */
  @state() protected pointer?: { x: number; y: number };

  /** Width of the plot, measured from the container. */
  @state() protected plotWidth: number = 0;

  /** Text for the polite live region, set during keyboard navigation. */
  @state() private announcement: string = '';

  // ── Queries

  @query('svg.chart-svg') protected svgElement?: SVGSVGElement;

  @query('.plot') protected plotElement?: HTMLElement;

  // ── Private fields

  /** Watches the host width. */
  private resizeObserver?: ResizeObserver;

  /** Whether the marks have been drawn once. */
  private hasDrawn = false;

  /** Number formats for the locale they were made for, rebuilt when the locale changes. */
  private numberFormats?: {
    locale: string;
    standard: Intl.NumberFormat;
    compact: Intl.NumberFormat;
  };

  /** Peacock's strings and the locale values are formatted in. */
  protected readonly i18n = new I18nController(this);

  // ── Lifecycle

  connectedCallback() {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(entries => {
      const width = Math.floor(entries[0]?.contentRect.width ?? 0);
      if (width !== this.plotWidth) this.plotWidth = width;
    });
    this.resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  updated(changed: PropertyValues) {
    super.updated(changed);
    if (!this.svgElement || this.plotWidth <= 0) return;

    const drawKeys = this.drawProperties();
    const needsDraw = drawKeys.some(key => changed.has(key));
    if (needsDraw) {
      const resizeOnly = [...changed.keys()].every(
        key => key === 'plotWidth' || !drawKeys.includes(key as string),
      );
      // The first draw animates the marks in; later resizes snap.
      this.draw((!resizeOnly || !this.hasDrawn) && this.motionEnabled());
      this.hasDrawn = true;
      this.drawHighlight();
    } else if (changed.has('activeIndex') || changed.has('activeSeries')) {
      this.drawHighlight();
    }
  }

  // ── Protected API for subclasses

  /** True when there is something to plot. */
  protected abstract hasData(): boolean;

  /** Every series or slice, including hidden ones, in legend order. */
  protected abstract getSeries(): ChartSeries[];

  /** Number of categories or slices keyboard navigation moves through. */
  protected abstract getItemCount(): number;

  /** Draws the marks; `animate` is false for resizes and when motion is off. */
  protected abstract draw(animate: boolean): void;

  /** Applies hover and focus state (dimming, cursor, active dots) without redrawing. */
  protected abstract drawHighlight(): void;

  /** The item under a point in plot coordinates. */
  protected abstract itemAtPoint(x: number, y: number): number;

  /** Tooltip content and default anchor for an item. */
  protected abstract getTooltip(index: number): ChartTooltipModel | undefined;

  /** Detail of `select` for an item. */
  protected abstract getSelectDetail(index: number): ChartSelectDetail;

  /** The static SVG layers d3 draws into. */
  protected abstract renderSvgContent(): SVGTemplateResult;

  /** Rows of the visually hidden data table. */
  protected abstract renderTable(): TemplateResult;

  /** Property names that trigger a redraw when they change. */
  protected drawProperties(): string[] {
    return ['height', 'plotWidth', 'hiddenKeys', 'loading', 'valueFormatter'];
  }

  /** The legend mode in effect: unknown values count as `auto`. */
  protected legendMode(): ChartLegendMode {
    return this.legend === 'show' || this.legend === 'hide'
      ? this.legend
      : 'auto';
  }

  /** Whether the legend shows when `legend` is `auto`. */
  protected legendAuto(): boolean {
    return this.getSeries().length > 1;
  }

  /** Whether the legend shows. */
  protected legendVisible(): boolean {
    const mode = this.legendMode();
    if (mode === 'auto') return this.legendAuto();
    return mode === 'show';
  }

  /** Width and height of the SVG. */
  protected svgSize(): { width: number; height: number } {
    return { width: this.plotWidth, height: this.height };
  }

  /** Motion duration in ms, 0 when animation is off. */
  protected motionEnabled(): boolean {
    if (this.disableAnimation) return false;
    return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Returns a transition of `selection` when `animate` is true, else the selection itself, so
   * callers set end values once. Transitions share the attr/style API used here.
   */
  protected motion<E extends BaseType, D>(
    selection: Selection<E, D, BaseType, unknown>,
    animate: boolean,
  ): Selection<E, D, BaseType, unknown> {
    if (!animate) {
      selection.interrupt();
      return selection;
    }
    return selection
      .transition()
      .duration(DURATION)
      .ease(easeCubicOut) as unknown as Selection<E, D, BaseType, unknown>;
  }

  /** Formats a value for tooltips and value labels. */
  protected formatValue(value: number): string {
    return this.valueFormatter
      ? this.valueFormatter(value)
      : this.getNumberFormats().standard.format(value);
  }

  /** Formats an axis tick. */
  protected formatTick(value: number): string {
    return this.valueFormatter
      ? this.valueFormatter(value)
      : this.getNumberFormats().compact.format(value);
  }

  /** Whether a series or slice is switched off in the legend. */
  protected isHidden(key: string): boolean {
    return this.hiddenKeys.has(key);
  }

  /** Extra content layered over the plot, such as the doughnut centre. */
  protected renderOverlay(): TemplateResult | typeof nothing {
    return nothing;
  }

  /** Skeleton shown while `loading`. */
  protected renderSkeleton(): TemplateResult {
    const bars = [55, 80, 40, 95, 65, 75, 50];
    return html`<div
      class="skeleton skeleton-bars"
      style=${styleMap({ height: `${this.height}px` })}
      aria-hidden="true"
    >
      ${bars.map(
        h => html`<span style=${styleMap({ height: `${h}%` })}></span>`,
      )}
    </div>`;
  }

  // ── Private methods

  /** The number formats for the resolved locale, cached per instance. */
  private getNumberFormats() {
    const { locale } = this.i18n;
    if (this.numberFormats?.locale !== locale) {
      this.numberFormats = {
        locale,
        standard: new Intl.NumberFormat(locale),
        compact: new Intl.NumberFormat(locale, {
          notation: 'compact',
          maximumFractionDigits: 1,
        }),
      };
    }
    return this.numberFormats;
  }

  private pointFromEvent(event: PointerEvent | MouseEvent) {
    const rect = this.plotElement?.getBoundingClientRect();
    if (!rect) return undefined;
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private handlePointerMove = (event: PointerEvent) => {
    const point = this.pointFromEvent(event);
    if (!point) return;
    const index = this.itemAtPoint(point.x, point.y);
    this.activeIndex = index;
    this.pointer = index >= 0 ? point : undefined;
  };

  private handlePointerLeave = () => {
    this.activeIndex = -1;
    this.pointer = undefined;
  };

  private handleClick = (event: MouseEvent) => {
    const point = this.pointFromEvent(event);
    if (!point) return;
    const index = this.itemAtPoint(point.x, point.y);
    if (index >= 0) this.selectItem(index);
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    const count = this.getItemCount();
    if (!count) return;
    let next = this.activeIndex;
    // Left and Right follow the reading direction: in RTL, Left moves forward.
    let { key } = event;
    if (isRtl(this) && (key === 'ArrowLeft' || key === 'ArrowRight')) {
      key = key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
    }
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = next < 0 ? 0 : Math.min(next + 1, count - 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = next < 0 ? count - 1 : Math.max(next - 1, 0);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      case 'Escape':
        next = -1;
        break;
      case 'Enter':
      case ' ':
        if (this.activeIndex >= 0) {
          event.preventDefault();
          this.selectItem(this.activeIndex);
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    this.pointer = undefined;
    this.activeIndex = next;
    this.announce(next);
  };

  private handleBlur = () => {
    this.activeIndex = -1;
    this.pointer = undefined;
  };

  private announce(index: number) {
    const model = index >= 0 ? this.getTooltip(index) : undefined;
    this.announcement = model
      ? `${model.title}. ${model.rows.map(row => `${row.label} ${row.value}`).join(', ')}`
      : '';
  }

  /** Fires `select` for the item at `index`. */
  private selectItem(index: number) {
    this.dispatchEvent(
      new CustomEvent<ChartSelectDetail>('select', {
        bubbles: true,
        composed: true,
        detail: this.getSelectDetail(index),
      }),
    );
  }

  private toggleSeries(key: string) {
    const next = new Set(this.hiddenKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.hiddenKeys = next;
  }

  // ── Render helpers

  private renderTooltip() {
    if (this.hideTooltip || this.activeIndex < 0) return nothing;
    const model = this.getTooltip(this.activeIndex);
    if (!model || !model.rows.length) return nothing;
    const x = this.pointer?.x ?? model.x;
    const y = this.pointer?.y ?? model.y;
    const flip = x > this.plotWidth * 0.6;
    return html`<div
      class=${classMap({ tooltip: true, flip })}
      part="tooltip"
      aria-hidden="true"
      style=${styleMap({
        left: `${flip ? x - TOOLTIP_OFFSET : x + TOOLTIP_OFFSET}px`,
        top: `${y}px`,
      })}
    >
      ${model.title
        ? html`<div class="tooltip-title">${model.title}</div>`
        : nothing}
      ${model.rows.map(
        row =>
          html`<div class="tooltip-row">
            <span
              class="swatch"
              style=${styleMap({ background: row.color })}
            ></span>
            <span class="tooltip-label">${row.label}</span>
            <span class="tooltip-value">${row.value}</span>
          </div>`,
      )}
    </div>`;
  }

  private renderLegend() {
    if (!this.legendVisible()) return nothing;
    return html`<div class="legend" part="legend">
      ${this.getSeries().map(
        series =>
          html`<button
            type="button"
            class=${classMap({
              'legend-item': true,
              'is-hidden': this.isHidden(series.key),
            })}
            aria-pressed=${this.isHidden(series.key) ? 'false' : 'true'}
            @click=${() => this.toggleSeries(series.key)}
            @pointerenter=${() => {
              this.activeSeries = series.key;
            }}
            @pointerleave=${() => {
              this.activeSeries = undefined;
            }}
          >
            <span
              class="swatch"
              style=${styleMap({ background: series.color })}
            ></span>
            <span>${series.label}</span>
          </button>`,
      )}
    </div>`;
  }

  private renderPlot() {
    const { width, height } = this.svgSize();
    const name = this.label || this.i18n.t('chart');
    return html`<div
      class="plot"
      part="plot"
      style=${styleMap({ height: `${this.height}px` })}
      tabindex="0"
      role="group"
      aria-roledescription=${this.i18n.t('chartRole')}
      aria-label=${this.i18n.t('chartInstructions')(name)}
      @pointermove=${this.handlePointerMove}
      @pointerleave=${this.handlePointerLeave}
      @click=${this.handleClick}
      @keydown=${this.handleKeyDown}
      @blur=${this.handleBlur}
    >
      <svg class="chart-svg" aria-hidden="true" width=${width} height=${height}>
        ${this.renderSvgContent()}
      </svg>
      ${this.renderOverlay()} ${this.renderTooltip()}
    </div>`;
  }

  // ── Render

  render() {
    let body: TemplateResult;
    if (this.loading) {
      body = this.renderSkeleton();
    } else if (!this.hasData()) {
      body = html`<div
        class="empty"
        style=${styleMap({ height: `${this.height}px` })}
      >
        <slot name="empty">${this.i18n.t('noData')}</slot>
      </div>`;
    } else {
      body = this.renderPlot();
    }

    const hasContent = !this.loading && this.hasData();
    return html`<div
      class="chart"
      part="container"
      aria-busy=${this.loading ? 'true' : 'false'}
    >
      ${body} ${hasContent ? this.renderLegend() : nothing}
      ${hasContent
        ? html`<table class="sr-only">
            <caption>
              ${this.label || this.i18n.t('chartData')}
            </caption>
            ${this.renderTable()}
          </table>`
        : nothing}
      <div class="sr-only" aria-live="polite">${this.announcement}</div>
    </div>`;
  }
}
