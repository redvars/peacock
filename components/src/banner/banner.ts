import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import styles from './banner.scss';

/** Meaning of a banner. Unset, the banner is neutral. */
export type BannerIntent = 'info' | 'success' | 'warning' | 'danger';

/** Detail of the banner's `close` event. */
export interface BannerCloseDetail {
  reason: 'action';
}

const INTENT_ICONS: Record<BannerIntent, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  danger: 'error',
};

/** The localStorage key a `dismiss-key` is stored under. */
export function bannerStorageKey(dismissKey: string): string {
  return `wc-banner:${dismissKey}`;
}

/** Whether the banner with this `dismiss-key` was dismissed before. False when storage is blocked. */
function wasDismissed(dismissKey: string): boolean {
  try {
    return window.localStorage.getItem(bannerStorageKey(dismissKey)) !== null;
  } catch {
    return false;
  }
}

function rememberDismissal(dismissKey: string) {
  try {
    window.localStorage.setItem(
      bannerStorageKey(dismissKey),
      new Date().toISOString(),
    );
  } catch {
    // Storage is blocked (private mode, a sandboxed frame): the banner just comes back next time.
  }
}

/**
 * @label Banner
 * @tag wc-banner
 * @rawTag banner
 * @summary A full-width message at the top of the app or a page, such as a maintenance window, an ending trial or a lost connection.
 *
 * @overview
 * <p>Pick the message component by where the message belongs and how long it matters:</p>
 * <ul>
 * <li><strong>Banner</strong>: about the whole app or page and true until something changes
 * (maintenance tonight, trial ends in 3 days, you are offline). It spans the full width above the
 * content and stays until the condition ends or the person dismisses it. Show one at a time.</li>
 * <li><strong><code>wc-alert</code></strong>: about one part of the content, shown in place beside
 * it (a form section that failed to save, a setting with a caveat).</li>
 * <li><strong><code>wc-snackbar</code></strong>: brief feedback on something the person just did
 * (message sent, item deleted, with Undo); it floats and goes away by itself.</li>
 * </ul>
 * <p>The banner takes the alert's vocabulary: <code>intent</code> (<code>info</code>,
 * <code>success</code>, <code>warning</code>, <code>danger</code>; neutral when unset) sets the
 * color and icon, <code>headline</code> is the bold lead-in, the message is the default slot or
 * <code>description</code>, and the <code>action</code> slot takes one or two buttons. With
 * <code>sticky</code> it stays at the top of its scroll container while the page scrolls.</p>
 * <p>With <code>dismissible</code> a close button fires a cancelable <code>close</code> event with
 * <code>reason: 'action'</code> and then hides the banner (sets <code>hidden</code>). Add
 * <code>dismiss-key</code> to remember the dismissal in <code>localStorage</code> (under
 * <code>wc-banner:&lt;key&gt;</code>): a banner with a key that was dismissed before starts hidden.
 * Change the key (for example <code>maintenance-2026-11-20</code>) to show a new message again. When
 * storage is blocked the banner simply shows again on the next visit.</p>
 * <p>A banner is not a live region by default, so one that is there when the page loads is read in
 * reading order, not announced. Set <code>live="polite"</code> (status) or
 * <code>live="assertive"</code> (alert, for urgent news such as a lost connection) on a banner you
 * add or change while the page is in use.</p>
 *
 * @slot - The message. Shown after `description`.
 * @slot icon - The leading icon. Overrides the intent's icon.
 * @slot action - One or two buttons, for example `<wc-button variant="text" size="sm">`.
 *
 * @fires {CustomEvent<{reason: 'action'}>} close - Fired, cancelable, when the close button is pressed. The banner hides (and remembers it under `dismiss-key`) unless the event is cancelled.
 *
 * @cssprop --banner-container-color - Background color.
 * @cssprop --banner-text-color - Text color.
 * @cssprop --banner-icon-color - Icon color.
 * @cssprop --banner-max-content-width - Width the content is centered in. Defaults to `none` (full width).
 * @cssprop --banner-z-index - Stacking order while `sticky`. Defaults to `var(--z-index-banner, 10)`.
 *
 * @example
 * ```html
 * <wc-banner intent="warning" headline="Scheduled maintenance" dismissible dismiss-key="maint-2026-11-20">
 *   The service is unavailable on Friday from 22:00 to 23:00 UTC.
 *   <wc-button slot="action" variant="text" size="sm" href="/status">Status page</wc-button>
 * </wc-banner>
 * ```
 * @example
 * ```html
 * <wc-banner intent="danger" live="assertive" sticky headline="Connection lost">
 *   Changes are saved on this device until you are back online.
 * </wc-banner>
 * ```
 * @tags display, feedback
 */
@IndividualComponent
export class Banner extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Meaning of the banner: `info`, `success`, `warning` or `danger`. Unset, it is neutral. */
  @property({ type: String, reflect: true })
  intent?: BannerIntent;

  /** The bold lead-in before the message, for example "Scheduled maintenance". */
  @property({ type: String })
  headline = '';

  /** The message text, when the default slot is not used. */
  @property({ type: String })
  description = '';

  /** Icon name. Falls back to the intent's icon; a neutral banner has none unless set. */
  @property({ type: String })
  icon?: string;

  /** Stays at the top of its scroll container while the page scrolls. */
  @property({ type: Boolean, reflect: true })
  sticky = false;

  /** Shows a close button; pressing it fires `close` and hides the banner. */
  @property({ type: Boolean, reflect: true })
  dismissible = false;

  /**
   * Remembers a dismissal in `localStorage` under this key, so the banner stays hidden on later
   * visits. Change the key to show a new message.
   */
  @property({ type: String, attribute: 'dismiss-key' })
  dismissKey?: string;

  /**
   * Makes the banner a live region, for banners added or changed while the page is in use:
   * `polite` (role `status`) or `assertive` (role `alert`). Unset, it is not announced.
   */
  @property({ type: String, reflect: true })
  live?: 'polite' | 'assertive';

  // ── State ────────────────────────────────────────────────────────────────

  /** Whether the `action` slot has content. */
  @state() private hasAction = false;

  /** Whether the `icon` slot has content. */
  @state() private hasIcon = false;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's string for the close button. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('dismissKey') && this.dismissKey) {
      if (wasDismissed(this.dismissKey)) this.hidden = true;
    }
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private get resolvedIcon(): string {
    if (this.icon) return this.icon;
    return this.intent && this.intent in INTENT_ICONS
      ? INTENT_ICONS[this.intent]
      : '';
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

  private handleIconSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasIcon = slot.assignedElements({ flatten: true }).length > 0;
  }

  private handleCloseClick() {
    const event = new CustomEvent<BannerCloseDetail>('close', {
      detail: { reason: 'action' },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (!this.dispatchEvent(event)) return;
    if (this.dismissKey) rememberDismissal(this.dismissKey);
    this.hidden = true;
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderIcon() {
    const icon = this.resolvedIcon;
    return html`<div
      class="icon"
      aria-hidden="true"
      ?hidden=${!icon && !this.hasIcon}
    >
      <slot name="icon" @slotchange=${this.handleIconSlotChange}>
        ${icon ? html`<wc-icon name=${icon}></wc-icon>` : nothing}
      </slot>
    </div>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`
      <div
        class=${classMap({
          banner: true,
          [this.intent ?? 'neutral']: true,
          'has-action': this.hasAction,
        })}
        role=${this.liveRole}
      >
        <div class="inner">
          ${this.renderIcon()}
          <div class="message">
            ${this.headline
              ? html`<strong class="headline">${this.headline}</strong>`
              : nothing}
            ${this.description || nothing}<slot></slot>
          </div>
          <div class="actions" ?hidden=${!this.hasAction}>
            <slot
              name="action"
              @slotchange=${this.handleActionSlotChange}
            ></slot>
          </div>
          ${this.dismissible
            ? html`<wc-icon-button
                class="close"
                variant="text"
                size="sm"
                shape="round"
                aria-label=${this.i18n.t('dismissBanner')}
                @click=${this.handleCloseClick}
              >
                <wc-icon name="close"></wc-icon>
              </wc-icon-button>`
            : nothing}
        </div>
      </div>
    `;
  }
}
