import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import IndividualComponent from '@/IndividualComponent.js';

import styles from './stat.scss';

/** How the change is shown: as a share of the previous value, or as an amount. */
export type StatDeltaFormat = 'percent' | 'absolute';

/** Which direction of change is good news: `none` for metrics where neither is. */
export type StatPositive = 'up' | 'down' | 'none';

/** Which way the value moved. */
export type StatDirection = 'up' | 'down' | 'flat';

/** Visual style: a tile with an outline or a fill, or no chrome for use inside a card. */
export type StatVariant = 'outlined' | 'filled' | 'plain';

/**
 * @label Stat
 * @tag wc-stat
 * @rawTag stat
 *
 * @summary A KPI tile: a labelled number with its change since the last period.
 * @overview
 * <p>Stat shows one metric: a <code>label</code> ("Monthly revenue") and a <code>value</code>,
 * formatted with <code>Intl.NumberFormat</code> in the nearest <code>lang</code> using
 * <code>format</code> (for example <code>{"style": "currency", "currency": "USD"}</code>).</p>
 * <p>The tile fills the width it is given, like a card, and its value gets smaller in a narrow
 * tile rather than wrapping. Place stats in a <code>wc-grid</code> or give them a width; in a
 * flex row, give each <code>flex: 1</code>.</p>
 * <p>The change comes from <code>previous</code>, the value of the last period, or is given as
 * <code>delta</code>. <code>delta-format="percent"</code> (the default) shows it as a share of
 * the previous value; with <code>delta</code> it is then a fraction, so <code>0.08</code> is 8%.
 * <code>delta-format="absolute"</code> shows the amount, formatted like the value. An arrow shows
 * the direction, and the color whether it is good: green when the value moves the
 * <code>positive</code> way (up by default), red when it moves the other way. Set
 * <code>positive="down"</code> for metrics such as churn, or <code>none</code> for neutral ones.
 * <code>comparison</code> names the period ("vs last month").</p>
 * <p>A screen reader reads the tile as one sentence, for example "Monthly revenue, $12,400, up 8%
 * from last period". <code>help</code> adds an info button with a tooltip,
 * <code>loading</code> shows a placeholder, and the <code>trend</code> slot holds a
 * <code>wc-sparkline</code>. <code>variant="plain"</code> drops the tile's own outline and padding,
 * for a stat inside a <code>wc-card</code>.</p>
 *
 * @slot trend - A small chart of the metric's history, usually a `wc-sparkline`.
 *
 * @cssprop --stat-padding - Padding inside the tile.
 * @cssprop --stat-container-color - Background of the filled tile.
 * @cssprop --stat-container-shape - Corner radius of the tile.
 *
 * @example
 * ```html
 * <wc-stat
 *   label="Monthly revenue"
 *   value="12400"
 *   previous="11480"
 *   format='{"style": "currency", "currency": "USD", "maximumFractionDigits": 0}'
 *   comparison="vs last month"
 * >
 *   <wc-sparkline slot="trend" data="[9800, 10400, 11480, 12400]"></wc-sparkline>
 * </wc-stat>
 * ```
 * @example
 * ```html
 * <wc-stat label="Churn" value="0.031" delta="-0.004" delta-format="absolute" positive="down"
 *   format='{"style": "percent", "maximumFractionDigits": 1}'></wc-stat>
 * ```
 * @tags display
 */
@IndividualComponent
export class Stat extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** What the number is, for example "Monthly revenue". */
  @property({ type: String }) label = '';

  /** The current value. Without one the tile shows a dash. */
  @property({ type: Number }) value?: number;

  /** How to format the value (and an absolute change), as `Intl.NumberFormat` options. */
  @property({ type: Object }) format?: Intl.NumberFormatOptions;

  /** The value of the last period; the change is worked out from it unless `delta` is set. */
  @property({ type: Number }) previous?: number;

  /** The change, when it is not worked out from `previous`: a fraction for `percent`, an amount for `absolute`. */
  @property({ type: Number }) delta?: number;

  /** Shows the change as a percentage of the previous value, or as an amount. */
  @property({ type: String, attribute: 'delta-format' })
  deltaFormat: StatDeltaFormat = 'percent';

  /** Which direction of change is good: green when the value moves this way, red when it moves the other. */
  @property({ type: String, reflect: true }) positive: StatPositive = 'up';

  /** Names what the change is measured against, for example "vs last month". */
  @property({ type: String }) comparison = '';

  /** Explains the metric in a tooltip on an info button next to the label. */
  @property({ type: String }) help = '';

  /** Shows a placeholder while the value is on its way. */
  @property({ type: Boolean, reflect: true }) loading = false;

  /** A tile with an outline or a fill, or `plain` with no chrome (inside a card). */
  @property({ type: String, reflect: true }) variant: StatVariant = 'outlined';

  // ── Private fields

  private readonly i18n = new I18nController(this);

  // ── Public methods

  /** The change shown, as a fraction (`percent`) or an amount (`absolute`), or `undefined` when there is none. */
  get change(): number | undefined {
    if (Number.isFinite(this.delta)) return this.delta;
    const { value, previous } = this;
    if (!Number.isFinite(value) || !Number.isFinite(previous)) {
      return undefined;
    }
    const current = value as number;
    const last = previous as number;
    if (this.deltaFormat === 'absolute') return current - last;
    // A change from zero has no percentage, unless there is no change at all.
    if (last === 0) return current === 0 ? 0 : undefined;
    return (current - last) / Math.abs(last);
  }

  /** Which way the value moved, or `undefined` when there is no change to show. */
  get direction(): StatDirection | undefined {
    const { change } = this;
    if (change === undefined) return undefined;
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'flat';
  }

  /** `success` when the value moved the `positive` way, `danger` the other way, else `undefined`. */
  get intent(): 'success' | 'danger' | undefined {
    const { direction } = this;
    if (!direction || direction === 'flat' || this.positive === 'none') {
      return undefined;
    }
    return direction === this.positive ? 'success' : 'danger';
  }

  // ── Private methods

  private numberFormat(options?: Intl.NumberFormatOptions) {
    try {
      return new Intl.NumberFormat(this.i18n.locale, options);
    } catch {
      return new Intl.NumberFormat(this.i18n.locale);
    }
  }

  private formattedValue(): string {
    if (!Number.isFinite(this.value)) return '';
    return this.numberFormat(this.format).format(this.value as number);
  }

  /** The size of the change, without a sign: the arrow and the sentence say which way. */
  private formattedChange(): string {
    const { change } = this;
    if (change === undefined) return '';
    const size = Math.abs(change);
    if (this.deltaFormat === 'percent') {
      return this.numberFormat({
        style: 'percent',
        maximumFractionDigits: 1,
      }).format(size);
    }
    return this.numberFormat(this.format).format(size);
  }

  /** "Monthly revenue, $12,400, up 8% from last period". */
  private announcement(): string {
    if (this.loading) {
      return [this.label, this.i18n.t('loading')].filter(Boolean).join(', ');
    }
    const parts = [this.label, this.formattedValue() || this.i18n.t('notSet')];
    const { direction } = this;
    if (direction) {
      const change = this.formattedChange();
      const against = this.comparison || this.i18n.t('statComparison');
      if (direction === 'up')
        parts.push(this.i18n.t('statUp')(change, against));
      if (direction === 'down') {
        parts.push(this.i18n.t('statDown')(change, against));
      }
      if (direction === 'flat') {
        parts.push(this.i18n.t('statUnchanged')(against));
      }
    }
    return parts.filter(Boolean).join(', ');
  }

  // ── Render helpers

  private renderHelp() {
    if (!this.help) return nothing;
    return html`<wc-icon-button
      class="help"
      variant="text"
      size="xs"
      shape="round"
      aria-label=${this.i18n.t('statHelp')}
      tooltip=${this.help}
    >
      <wc-icon name="info"></wc-icon>
    </wc-icon-button>`;
  }

  private renderChange() {
    const { direction } = this;
    if (!direction) return nothing;
    const intent = this.intent ?? 'neutral';
    return html`
      <span class="change ${intent} ${direction}" aria-hidden="true">
        ${direction === 'flat'
          ? nothing
          : html`<wc-icon
              class="arrow"
              name=${direction === 'up' ? 'arrow_upward' : 'arrow_downward'}
            ></wc-icon>`}
        <span class="change-text">${this.formattedChange()}</span>
        ${this.comparison
          ? html`<span class="comparison">${this.comparison}</span>`
          : nothing}
      </span>
    `;
  }

  private renderBody() {
    if (this.loading) {
      return html`
        <span class="skeleton skeleton-value" aria-hidden="true"></span>
        <span class="skeleton skeleton-change" aria-hidden="true"></span>
      `;
    }
    const value = this.formattedValue();
    return html`
      <div class="main">
        <span
          class=${classMap({ value: true, empty: !value })}
          aria-hidden="true"
          >${value || '—'}</span
        >
        <span class="trend"><slot name="trend"></slot></span>
      </div>
      ${this.renderChange()}
    `;
  }

  // ── Render

  render() {
    return html`
      <div
        class="stat ${this.variant}"
        aria-busy=${this.loading ? 'true' : nothing}
      >
        <span class="screen-reader-only">${this.announcement()}</span>
        <div class="header">
          <span class="label" aria-hidden="true">${this.label}</span>
          ${this.renderHelp()}
        </div>
        ${this.renderBody()}
      </div>
    `;
  }
}
