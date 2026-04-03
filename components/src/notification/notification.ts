import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import IndividualComponent from '@/IndividualComponent.js';
import styles from './notification.scss';

type NotificationVariant = 'success' | 'error' | 'info' | 'warning';

const VARIANT_LABELS: Record<NotificationVariant, string> = {
  success: 'Success',
  error: 'Error',
  info: 'Information',
  warning: 'Warning',
};

const VARIANT_ICONS: Record<NotificationVariant, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
  warning: 'warning',
};

/**
 * @label Notification
 * @tag wc-notification
 * @rawTag notification
 * @summary Notifications communicate contextual status, errors, warnings, and success messages.
 *
 * @cssprop --notification-container-color - Surface color for the notification container.
 * @cssprop --notification-text-color - Label and supporting text color.
 * @cssprop --notification-leading-icon-color - Leading state icon color.
 * @cssprop --notification-accent-color - Start border color for status emphasis.
 * @cssprop --notification-border-radius - Border radius of the notification container.
 *
 * @fires {CustomEvent} notification-dismiss - Fired when the notification is dismissed.
 * @fires {CustomEvent} notification-action-click - Fired when the action button is clicked.
 *
 * @example
 * ```html
 * <wc-notification variant="success" action="Undo" dismissible>
 *   <span slot="title">Record saved</span>
 * </wc-notification>
 * ```
 * @tags display, feedback
 */
@IndividualComponent
export class Notification extends LitElement {
  static styles = [styles];

  /**
   * If true, content and actions are laid out in a single row.
   */
  @property({ type: Boolean, reflect: true }) inline = false;

  /**
   * The visual variant of the notification.
   */
  @property({ type: String, reflect: true })
  variant: NotificationVariant = 'info';

  /**
   * Enables a high contrast appearance.
   */
  @property({ type: Boolean, reflect: true, attribute: 'high-contrast' })
  highContrast = false;

  /**
   * If true, renders a dismiss icon button.
   */
  @property({ type: Boolean, reflect: true }) dismissible = false;

  /**
   * Action label text. When provided, an action button is shown.
   */
  @property({ type: String }) action = '';

  /**
   * If true, the host controls visibility when dismissed.
   */
  @property({ type: Boolean, reflect: true }) managed = false;

  @state() private isHidden = false;
  
  @state() private hasSubtitle = false;

  /**
   * Programmatically reveals the notification.
   */
  show() {
    this.isHidden = false;
  }

  /**
   * Programmatically dismisses the notification.
   */
  dismiss() {
    this.hideAndEmitDismiss('programmatic');
  }

  private get variantIcon() {
    return VARIANT_ICONS[this.variant];
  }

  private get variantLabel() {
    return VARIANT_LABELS[this.variant];
  }

  private emitActionClick() {
    this.dispatchEvent(
      new CustomEvent('notification-action-click', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private hideAndEmitDismiss(reason: 'dismiss' | 'programmatic') {
    if (!this.managed) {
      this.isHidden = true;
    }

    this.dispatchEvent(
      new CustomEvent('notification-dismiss', {
        detail: { reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleSubtitleSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasSubtitle = slot
      .assignedNodes({ flatten: true })
      .some(node => node.textContent?.trim());
  }

  render() {
    if (this.isHidden) {
      return nothing;
    }

    return html`
      <div
        class=${classMap({
          notification: true,
          inline: this.inline,
          'high-contrast': this.highContrast,
          'has-subtitle': this.hasSubtitle,
          [`variant-${this.variant}`]: true,
        })}
        role="alert"
        aria-live="polite"
        aria-label=${this.variantLabel}
      >
        <div class="state-icon" aria-hidden="true">
          <slot name="icon">
            <wc-icon name=${this.variantIcon}></wc-icon>
          </slot>
        </div>

        <div class="content">
          <div class="content-text">
            <div class="title">
              <slot name="title"></slot>
              <slot></slot>
            </div>

            <div class="subtitle">
              <slot name="subtitle" @slotchange=${this.handleSubtitleSlotChange}></slot>
            </div>
          </div>

          ${this.action
            ? html`<div class="actions">
                <wc-button
                  class="action"
                  size="sm"
                  variant=${this.inline ? 'text' : 'outlined'}
                  @click=${this.emitActionClick}
                >
                  ${this.action}
                </wc-button>
              </div>`
            : nothing}
        </div>

        ${this.dismissible
          ? html`<div class="close-button-container">
              <wc-icon-button
                class="close-button"
                variant="text"
                size="sm"
                aria-label="Close notification"
                name="close"
                @click=${() => {
                  this.hideAndEmitDismiss('dismiss');
                }}
              ></wc-icon-button>
            </div>`
          : nothing}
      </div>
    `;
  }
}
