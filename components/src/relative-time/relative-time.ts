import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  formatAbsoluteTime,
  formatTime,
  parseDatetime,
  parseDuration,
  watchRelativeTime,
  type RelativeTimeNumeric,
  type RelativeTimeStyle,
} from '@/__internal/utils/relative-time.js';
import IndividualComponent from '@/IndividualComponent.js';

import styles from './relative-time.scss';

/** The `format-style` values `Intl.RelativeTimeFormat` accepts. */
const STYLES: readonly RelativeTimeStyle[] = ['long', 'short', 'narrow'];

/**
 * @label Relative Time
 * @tag wc-relative-time
 * @rawTag relative-time
 * @summary A date and time shown relative to now, such as "5 minutes ago" or "in 3 days", that keeps itself current.
 *
 * @overview
 * <p><code>wc-relative-time</code> shows <code>datetime</code> (ISO 8601, such as
 * <code>2026-11-07T08:00:00Z</code>) relative to now with <code>Intl.RelativeTimeFormat</code> in
 * the resolved locale (<code>locale</code>, else the nearest <code>lang</code>, else the
 * browser's): "now", "5 minutes ago", "yesterday", "in 3 days". It renders a
 * <code>&lt;time datetime&gt;</code> whose tooltip (<code>title</code>) is the absolute date and
 * time, such as "Nov 7, 2026, 8:00 AM".</p>
 * <p><code>numeric="always"</code> says "1 day ago" instead of "yesterday".
 * <code>format-style</code> is <code>long</code> (the default, "5 minutes ago"),
 * <code>short</code> ("5 min. ago") or <code>narrow</code> ("5m ago"). (It is not
 * <code>style</code>, which is the HTML attribute for inline CSS.)</p>
 * <p><code>absolute-after</code> is an ISO 8601 duration such as <code>P7D</code> (7 days) or
 * <code>PT12H</code>: times farther from now than that show as a date instead, such as "Nov 2"
 * (with the year when it is not this year). Without it the time is always relative.</p>
 * <p>The text stays current: every <code>wc-relative-time</code> on the page shares one timer,
 * which refreshes each one as often as its text can change (every 10 seconds under a minute,
 * every minute under an hour, less often after that) and pauses while the page is hidden.</p>
 * <p>Content inside the element is the fallback, shown while <code>datetime</code> is missing or
 * not a date, and before the component loads.</p>
 *
 * @cssprop --relative-time-text-color - Color of the text; defaults to the surrounding text color.
 *
 * @example
 * ```html
 * <wc-relative-time datetime="2026-11-07T08:00:00Z">Nov 7, 2026</wc-relative-time>
 * <wc-relative-time datetime="2026-11-06T08:00:00Z" numeric="always"></wc-relative-time>
 * <wc-relative-time datetime="2026-11-07T08:00:00Z" format-style="short"></wc-relative-time>
 * <wc-relative-time datetime="2026-10-02T08:00:00Z" absolute-after="P7D"></wc-relative-time>
 * ```
 * @tags display
 */
@IndividualComponent
export class RelativeTime extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The date and time to show, as ISO 8601 (or anything `Date` reads). */
  @property({ type: String, reflect: true })
  datetime = '';

  /** "yesterday" (`auto`, the default) or "1 day ago" (`always`). */
  @property({ type: String, reflect: true })
  numeric: RelativeTimeNumeric = 'auto';

  /** `long` ("5 minutes ago", the default), `short` ("5 min. ago") or `narrow` ("5m ago"). */
  @property({ type: String, reflect: true, attribute: 'format-style' })
  formatStyle: RelativeTimeStyle = 'long';

  /**
   * An ISO 8601 duration, such as `P7D`: farther from now than that, the time shows as a date
   * ("Nov 2"). Unset, it is always relative.
   */
  @property({ type: String, attribute: 'absolute-after' })
  absoluteAfter?: string;

  /** The locale to format in; defaults to the nearest `lang`, else the browser's. */
  @property({ type: String })
  locale?: string;

  // ── Private fields ───────────────────────────────────────────────────────

  /** The resolved locale. */
  private readonly i18n = new I18nController(this);

  /** Leaves the shared ticker. */
  private stopWatching?: () => void;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.watch();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.stopWatching?.();
    this.stopWatching = undefined;
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    // A new date may need a sooner refresh than the old one.
    if (changed.has('datetime') && changed.get('datetime') !== undefined) {
      this.watch();
    }
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** The parsed `datetime`, or `null` when it is not a date. */
  private get date(): Date | null {
    return parseDatetime(this.datetime);
  }

  private watch() {
    this.stopWatching?.();
    this.stopWatching = watchRelativeTime(
      () => this.date,
      () => this.requestUpdate(),
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const { date } = this;
    if (!date) return html`<slot></slot>`;
    const { locale } = this.i18n;
    const absoluteAfter = parseDuration(this.absoluteAfter) ?? undefined;
    return html`<time
      part="time"
      datetime=${date.toISOString()}
      title=${formatAbsoluteTime(date, locale)}
      >${formatTime(date, locale, {
        numeric: this.numeric === 'always' ? 'always' : 'auto',
        style: STYLES.includes(this.formatStyle) ? this.formatStyle : 'long',
        absoluteAfter,
      })}</time
    >`;
  }
}
