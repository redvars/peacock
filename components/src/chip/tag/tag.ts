import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import styles from './tag.scss';
import colorStyles from './tag-colors.scss';
import sizeStyles from './tag-sizes.scss';

/** What a tag means; it picks the matching color role. */
export type TagIntent = 'info' | 'success' | 'warning' | 'danger';

/** Decorative hues for tags that carry no meaning, such as categories. */
export type TagAccent =
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow'
  | 'orange'
  | 'purple';

/** The deprecated `color` values and the `intent` (or `accent`) each one maps to. */
const COLOR_TO_INTENT: Record<string, TagIntent | undefined> = {
  red: 'danger',
  green: 'success',
  yellow: 'warning',
  orange: 'warning',
  blue: 'info',
};

/**
 * @label Tag
 * @tag wc-tag
 * @rawTag tag
 * @summary A read-only label for a status or a value.
 * @overview
 * <p>A tag shows a status or a value; it has no action of its own. Use <code>intent</code>
 * (<code>info</code>, <code>success</code>, <code>warning</code>, <code>danger</code>) when the
 * tag means something, and <code>accent</code> for a decorative hue (categories, labels). For a
 * removable or selectable item use <code>wc-chip</code>.</p>
 * <p>Deprecated, and removed in 4.0: <code>color</code> (use <code>intent</code>: red is
 * <code>danger</code>, green <code>success</code>, yellow and orange <code>warning</code>, blue
 * <code>info</code>; or <code>accent</code> for purple), and <code>dismissible</code> (use
 * <code>wc-chip dismissible</code>). Both still work and log a console warning.</p>
 *
 * @fires {CustomEvent} dismiss - Dispatched when the dismiss button of a deprecated `dismissible` tag is clicked.
 * @fires {CustomEvent} tag--dismiss - Deprecated alias of `dismiss`, fired alongside it.
 *
 * @example
 * ```html
 * <wc-tag intent="danger">Failed</wc-tag>
 * <wc-tag accent="purple">Design</wc-tag>
 * ```
 */
@IndividualComponent
export class Tag extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles, colorStyles, sizeStyles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * If true, the tag will have a close icon.
   * @deprecated A tag is read-only; use `wc-chip dismissible`.
   */
  @property({ type: Boolean }) dismissible = false;

  /** Visual style. */
  @property({ reflect: true }) variant:
    | 'elevated'
    | 'filled'
    | 'tonal'
    | 'outlined' = 'tonal';

  /** What the tag means: `info`, `success`, `warning` or `danger`. Takes precedence over `accent`. */
  @property({ type: String, reflect: true }) intent?: TagIntent;

  /** A decorative hue for tags without meaning: `blue`, `green`, `red`, `yellow`, `orange`, `purple`. */
  @property({ type: String, reflect: true }) accent?: TagAccent;

  /**
   * Tag color.
   * @deprecated Use `intent` (red is `danger`, green `success`, yellow and orange `warning`, blue
   * `info`) or `accent` for a decorative hue.
   */
  @property({ type: String, reflect: true }) color?:
    | 'default'
    | 'blue'
    | 'green'
    | 'red'
    | 'yellow'
    | 'orange'
    | 'purple';

  /** Tag size. Possible values are `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`. */
  @property({ reflect: true }) size?: 'sm' | 'md' | 'lg' = 'md';

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the dismiss button label. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('color') && this.color) {
      deprecate('wc-tag', '`color`', '`intent` or `accent`');
    }
    if (changed.has('dismissible') && this.dismissible) {
      deprecate('wc-tag', '`dismissible`', 'wc-chip dismissible');
    }
  }

  // ── Public ───────────────────────────────────────────────────────────────

  /** The intent in effect: `intent`, or the one the deprecated `color` maps to. */
  get effectiveIntent(): TagIntent | undefined {
    return (
      this.intent ?? (this.color ? COLOR_TO_INTENT[this.color] : undefined)
    );
  }

  /** The accent in effect: `accent`, or purple from the deprecated `color`. */
  get effectiveAccent(): TagAccent | undefined {
    return this.accent ?? (this.color === 'purple' ? 'purple' : undefined);
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private _dismissClickHandler(e: MouseEvent) {
    e.stopPropagation();

    this.dispatchEvent(
      new CustomEvent('dismiss', { bubbles: true, composed: true }),
    );
    // Deprecated: kept for listeners written before `dismiss`.
    this.dispatchEvent(
      new CustomEvent('tag--dismiss', { bubbles: true, composed: true }),
    );
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private __renderDismissButton() {
    if (!this.dismissible) return null;

    return html`
      <button
        class="dismiss-button"
        @click=${this._dismissClickHandler}
        aria-label=${this.i18n.t('dismiss')}
      >
        <wc-ripple class="ripple"></wc-ripple>
        <wc-icon class="dismiss-button-icon" name="close"></wc-icon>
      </button>
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const intent = this.effectiveIntent;
    const accent = intent ? undefined : this.effectiveAccent;
    const classes = {
      tag: true,
      dismissible: this.dismissible,
      [`intent-${intent}`]: !!intent,
      [`accent-${accent}`]: !!accent,
      [`variant-${this.variant}`]: true,
      [`size-${this.size}`]: true,
    };

    return html`
      <div class="${classMap(classes)}">
        <wc-elevation class="elevation"></wc-elevation>
        <div class="background"></div>
        <div class="outline"></div>

        <div class="tag-content">
          <slot name="icon"></slot>

          <div class="slot-content">
            <slot></slot>
          </div>
          ${this.__renderDismissButton()}
        </div>
      </div>
    `;
  }
}
