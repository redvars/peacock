import { html, LitElement, nothing, svg, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { Size } from '@/__internal/utils/size.js';
import IndividualComponent from '@/IndividualComponent.js';

import styles from './status-indicator.scss';

/** What a status means; unset is neutral. The same values as `wc-badge` and `wc-tag`. */
export type StatusIndicatorIntent = 'info' | 'success' | 'warning' | 'danger';

/**
 * One shape per intent, so the status does not rest on color alone: a ring (neutral), a square
 * (info), a circle (success), a triangle (warning) and a diamond (danger).
 */
const SHAPES = {
  neutral: svg`<circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" stroke-width="2"></circle>`,
  info: svg`<rect x="1" y="1" width="10" height="10" rx="2" fill="currentColor"></rect>`,
  success: svg`<circle cx="6" cy="6" r="6" fill="currentColor"></circle>`,
  warning: svg`<path d="M6 0.5 11.8 11.5H0.2Z" fill="currentColor"></path>`,
  danger: svg`<path d="M6 0 12 6 6 12 0 6Z" fill="currentColor"></path>`,
};

/** The string key of each intent's name, for a dot-only indicator without a label. */
const INTENT_NAMES = {
  neutral: 'statusIndicatorNeutral',
  info: 'intentInfo',
  success: 'intentSuccess',
  warning: 'intentWarning',
  danger: 'intentError',
} as const;

/**
 * @label Status Indicator
 * @tag wc-status-indicator
 * @rawTag status-indicator
 *
 * @summary A small dot and label for the state of a system or an entity, such as "Operational" or "Offline".
 * @overview
 * <p>A status indicator shows the state of something: a service, a device, a sync job, a person's
 * presence. <code>intent</code> (<code>info</code>, <code>success</code>, <code>warning</code>,
 * <code>danger</code>; unset is neutral) picks the color and the shape of the dot (a square,
 * circle, triangle, diamond, or a ring for neutral), so it does not rest on color alone, and
 * forced-colors mode keeps the shapes. <code>label</code> is the text next to the dot, such as
 * "Degraded"; always give one, it is what the indicator says.</p>
 * <p><code>pulse</code> animates the dot for a live or in-progress state ("Syncing",
 * "Recording"); the animation is off when the person asks for reduced motion.
 * <code>dot-only</code> hides the label where there is no room, such as a dense table column:
 * the label is then still read by screen readers and shown as a tooltip.</p>
 * <p>By default the indicator is plain text, read where it stands. Set <code>live</code> when its
 * status changes while the person is on the page and the change should be announced: it gets
 * <code>role="status"</code>, a polite live region. Do not set it on many indicators at once,
 * such as every row of a table, or the announcements pile up.</p>
 * <p>Which one to use: <code>wc-status-indicator</code> for the state of a thing, read next to its
 * name ("API: Operational"). <code>wc-badge</code> for a count or an unread dot attached to
 * another element, such as an icon button. <code>wc-tag</code> for a label or a category in a
 * filled container ("Draft", "Design"), often several side by side.</p>
 *
 * @cssprop --status-indicator-color - Color of the dot; defaults to the intent's color.
 * @cssprop --status-indicator-label-text-color - Color of the label.
 *
 * @example
 * ```html
 * <wc-status-indicator intent="success" label="Operational"></wc-status-indicator>
 * <wc-status-indicator intent="warning" label="Degraded"></wc-status-indicator>
 * <wc-status-indicator intent="danger" label="Offline"></wc-status-indicator>
 * <wc-status-indicator intent="info" label="Syncing" pulse live></wc-status-indicator>
 * <wc-status-indicator label="Unknown"></wc-status-indicator>
 * ```
 * @example
 * ```html
 * <wc-status-indicator intent="success" label="Online" dot-only></wc-status-indicator>
 * ```
 * @tags display
 */
@IndividualComponent
export class StatusIndicator extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** What the status means: `info`, `success`, `warning` or `danger`. Unset is neutral. */
  @property({ type: String, reflect: true })
  intent?: StatusIndicatorIntent;

  /** The status text, such as "Operational". With `dot-only`, the accessible name and tooltip. */
  @property({ type: String })
  label = '';

  /** Animates the dot for a live or in-progress state; off under reduced motion. */
  @property({ type: Boolean, reflect: true })
  pulse = false;

  /** Hides the label visually; it stays the accessible name and shows as a tooltip. */
  @property({ type: Boolean, reflect: true, attribute: 'dot-only' })
  dotOnly = false;

  /** Announces changes: gives the indicator `role="status"`. For a status that changes live. */
  @property({ type: Boolean, reflect: true })
  live = false;

  /** Size of the dot and the label: `sm` (default), `md` or `lg`. */
  @property({ type: String, reflect: true })
  size: Size = 'sm';

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the fallback name of a dot-only indicator. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has('live')) {
      if (this.live) this.setAttribute('role', 'status');
      else if (this.getAttribute('role') === 'status') {
        this.removeAttribute('role');
      }
    }
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** The intent in effect; unknown values are neutral. */
  private get resolvedIntent(): keyof typeof SHAPES {
    const { intent } = this;
    return intent && intent in SHAPES ? intent : 'neutral';
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const intent = this.resolvedIntent;
    const name = this.label || this.i18n.t(INTENT_NAMES[intent]);
    return html`<span
      class="status-indicator"
      part="container"
      title=${this.dotOnly ? name : nothing}
    >
      <span class="dot" part="dot" aria-hidden="true"
        ><svg class="shape" viewBox="0 0 12 12" focusable="false">
          ${SHAPES[intent]}
        </svg></span
      >${this.dotOnly
        ? html`<span class="screen-reader-only">${name}</span>`
        : html`<span class="label" part="label">${this.label}</span>`}
    </span>`;
  }
}
