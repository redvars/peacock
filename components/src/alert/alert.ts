import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import styles from './alert.scss';

type AlertIntent = 'note' | 'info' | 'success' | 'warning' | 'danger';

/** The meaning values `variant` took before `intent` (deprecated). */
type LegacyAlertVariant = 'note' | 'info' | 'success' | 'warning' | 'error';

const LEGACY_VARIANT_INTENTS: Record<LegacyAlertVariant, AlertIntent> = {
  note: 'note',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'danger',
};

/** The string key of each intent's label. */
const INTENT_LABEL_KEYS: Record<
  AlertIntent,
  'intentNote' | 'intentInfo' | 'intentSuccess' | 'intentWarning' | 'intentError'
> = {
  note: 'intentNote',
  info: 'intentInfo',
  success: 'intentSuccess',
  warning: 'intentWarning',
  danger: 'intentError',
};

const INTENT_ICONS: Record<AlertIntent, string> = {
  note: 'star',
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  danger: 'error',
};

function isLegacyVariant(value: unknown): value is LegacyAlertVariant {
  return typeof value === 'string' && value in LEGACY_VARIANT_INTENTS;
}

/**
 * @label Alert
 * @tag wc-alert
 * @rawTag alert
 * @summary Alerts show short, prominent contextual messages in the page, with an optional icon, action and close button.
 *
 * @overview
 * <p>An alert is part of the page. For a transient message use <code>wc-snackbar</code>, or
 * <code>wc-notification-manager</code> for a queue of them.</p>
 * <p>An alert is not a live region by default, so an alert that is on the page when it loads is
 * read in the normal reading order and not announced. Set <code>live="polite"</code> (status) or
 * <code>live="assertive"</code> (alert) on an alert you add or change while the page is in use.</p>
 * <p>With <code>dismissible</code> a close button fires a cancelable <code>close</code> event with
 * <code>reason: 'action'</code> and then hides the alert (sets <code>hidden</code>). Call
 * <code>preventDefault()</code> on the event to keep it, for example to remove it yourself.</p>
 *
 * @slot - The description. Overrides `description`.
 * @slot label - The label before the description. Overrides the intent's label.
 * @slot icon - The leading icon. Overrides the intent's icon.
 * @slot action - Buttons at the end of the alert, for example `<wc-button variant="text" size="sm">`.
 *
 * @fires {CustomEvent<{reason: 'action'}>} close - Fired, cancelable, when the close button is pressed. The alert hides unless the event is cancelled.
 *
 * @cssprop --alert-container-color - Background color of the alert container.
 * @cssprop --alert-label-text-color - Label text color.
 * @cssprop --alert-description-text-color - Description text color.
 * @cssprop --alert-icon-color - Icon color.
 * @cssprop --alert-border-radius - Border radius of the alert surface.
 *
 * @example
 * ```html
 * <wc-alert intent="warning" dismissible description="Your trial ends in 3 days.">
 *   <wc-button slot="action" variant="text" size="sm">Upgrade</wc-button>
 * </wc-alert>
 * ```
 * @tags display, feedback
 */
@IndividualComponent
export class Alert extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * Meaning of the alert: `note` (neutral, the default), `info`, `success`, `warning` or `danger`.
   */
  @property({ type: String, reflect: true })
  intent?: AlertIntent;

  /**
   * @deprecated Use `intent`. The meaning values (`note`, `info`, `success`, `warning`, `error`)
   * still work; `error` is `intent="danger"`.
   */
  @property({ type: String })
  variant?: string;

  /**
   * Optional explicit label text. Falls back to the intent's label.
   */
  @property({ type: String })
  label?: string;

  /**
   * Optional explicit icon name. Falls back to the intent's icon.
   */
  @property({ type: String })
  icon?: string;

  /**
   * Optional description text when a default slot is not provided.
   */
  @property({ type: String })
  description = '';

  /** Shows a close button; pressing it fires `close` and hides the alert. */
  @property({ type: Boolean, reflect: true })
  dismissible = false;

  /**
   * Makes the alert a live region, for alerts added or changed while the page is in use:
   * `polite` (role `status`) or `assertive` (role `alert`). Unset, the alert is not announced.
   */
  @property({ type: String, reflect: true })
  live?: 'polite' | 'assertive';

  // ── State ────────────────────────────────────────────────────────────────

  /** Whether the `action` slot has content. */
  @state() private hasAction = false;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the intent labels and the close button. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('variant') && isLegacyVariant(this.variant)) {
      deprecate('wc-alert', '`variant` for meaning', '`intent`');
    }
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** `intent`, else the deprecated meaning `variant`, else `note`. */
  private get resolvedIntent(): AlertIntent {
    if (this.intent && this.intent in INTENT_ICONS) return this.intent;
    if (isLegacyVariant(this.variant)) {
      return LEGACY_VARIANT_INTENTS[this.variant];
    }
    return 'note';
  }

  private get resolvedLabel() {
    return this.label || this.i18n.t(INTENT_LABEL_KEYS[this.resolvedIntent]);
  }

  private get resolvedIcon() {
    return this.icon || INTENT_ICONS[this.resolvedIntent];
  }

  private get liveRole() {
    if (this.live === 'assertive') return 'alert';
    if (this.live === 'polite') return 'status';
    return nothing;
  }

  private handleActionSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasAction = slot.assignedNodes({ flatten: true }).length > 0;
  }

  private handleCloseClick() {
    const event = new CustomEvent('close', {
      detail: { reason: 'action' },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (this.dispatchEvent(event)) {
      this.hidden = true;
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const intent = this.resolvedIntent;
    return html`
      <div
        class=${classMap({
          alert: true,
          [intent]: true,
          'has-action': this.hasAction,
          dismissible: this.dismissible,
        })}
        role=${this.liveRole}
      >
        <div class="alert-icon" aria-hidden="true">
          <slot name="icon">
            <wc-icon name=${this.resolvedIcon}></wc-icon>
          </slot>
        </div>

        <div class=${classMap({ 'alert-content': true, [intent]: true })}>
          <div class="alert-label">
            <slot name="label">${this.resolvedLabel}:</slot>
          </div>

          <div class="alert-description">
            <!-- Beside the slot, not its fallback: whitespace around slotted children (an action
                 button) would replace a fallback and hide the description. -->
            ${this.description || nothing}<slot></slot>
          </div>
        </div>

        <div class="alert-actions" ?hidden=${!this.hasAction}>
          <slot name="action" @slotchange=${this.handleActionSlotChange}></slot>
        </div>

        ${this.dismissible
          ? html`<wc-icon-button
              class="alert-close"
              variant="text"
              size="sm"
              shape="round"
              aria-label=${this.i18n.t('dismissAlert')}
              @click=${this.handleCloseClick}
            >
              <wc-icon name="close"></wc-icon>
            </wc-icon-button>`
          : nothing}
      </div>
    `;
  }
}
