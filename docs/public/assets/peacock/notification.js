import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  --notification-container-color: var(--color-primary-container);
  --notification-text-color: var(--color-on-primary-container);
  --notification-leading-icon-color: var(--color-on-primary-container);
  --notification-accent-color: var(--color-primary);
  --notification-border-radius: var(--shape-corner-medium);
  display: block;
}

:host(:not([inline])) {
  width: min(100%, 28rem);
}

.notification {
  align-items: flex-start;
  background: var(--notification-container-color);
  border-inline-start: 4px solid var(--notification-accent-color);
  border-radius: var(--notification-border-radius);
  color: var(--notification-text-color);
  display: grid;
  gap: var(--spacing-100);
  grid-template-columns: auto 1fr auto;
  padding: var(--spacing-150) var(--spacing-100) var(--spacing-150) var(--spacing-150);
}

.state-icon {
  align-items: center;
  color: var(--notification-leading-icon-color);
  display: inline-flex;
  justify-content: center;
  min-height: 2rem;
  --icon-size: 1.25rem;
  --icon-color: var(--notification-leading-icon-color);
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100);
  min-width: 0;
}

.content-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-025);
  min-width: 0;
}

.title {
  font-family: var(--typography-label-large-font-family) !important;
  font-size: var(--typography-label-large-font-size) !important;
  font-weight: var(--typography-label-large-font-weight) !important;
  line-height: var(--typography-label-large-line-height) !important;
  letter-spacing: var(--typography-label-large-letter-spacing) !important;
  color: var(--notification-text-color);
  overflow-wrap: anywhere;
}

.subtitle {
  font-family: var(--typography-body-medium-font-family) !important;
  font-size: var(--typography-body-medium-font-size) !important;
  font-weight: var(--typography-body-medium-font-weight) !important;
  line-height: var(--typography-body-medium-line-height) !important;
  letter-spacing: var(--typography-body-medium-letter-spacing) !important;
  color: var(--notification-text-color);
  opacity: 0.88;
  overflow-wrap: anywhere;
}

.title ::slotted(*),
.subtitle ::slotted(*) {
  margin: 0;
}

.actions {
  display: inline-flex;
  gap: var(--spacing-100);
}

.action {
  --outlined-button-label-text-color: var(--notification-text-color);
  --outlined-button-outline-color: color-mix(in srgb, var(--notification-text-color) 40%, transparent);
  --text-button-label-text-color: var(--notification-text-color);
}

.close-button-container {
  display: inline-flex;
}

.close-button {
  --text-button-label-text-color: var(--notification-text-color);
}

.notification.inline {
  align-items: center;
}

.notification.inline .content {
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: var(--spacing-150);
}

.notification.inline .content-text {
  display: inline;
  flex: 1;
}

.notification.inline .title,
.notification.inline .subtitle,
.notification.inline .title ::slotted(*),
.notification.inline .subtitle ::slotted(*) {
  display: inline;
}

.notification:not(.has-subtitle) {
  align-items: center;
}

.notification:not(.has-subtitle) .content {
  gap: 0;
}

.notification.variant-info {
  --notification-container-color: var(--color-primary-container);
  --notification-text-color: var(--color-on-primary-container);
  --notification-leading-icon-color: var(--color-on-primary-container);
  --notification-accent-color: var(--color-primary);
}

.notification.variant-success {
  --notification-container-color: var(--color-success-container);
  --notification-text-color: var(--color-on-success-container);
  --notification-leading-icon-color: var(--color-on-success-container);
  --notification-accent-color: var(--color-success);
}

.notification.variant-warning {
  --notification-container-color: var(--color-warning-container);
  --notification-text-color: var(--color-on-warning-container);
  --notification-leading-icon-color: var(--color-on-warning-container);
  --notification-accent-color: var(--color-warning);
}

.notification.variant-error {
  --notification-container-color: var(--color-error-container);
  --notification-text-color: var(--color-on-error-container);
  --notification-leading-icon-color: var(--color-on-error-container);
  --notification-accent-color: var(--color-error);
}

.notification.high-contrast {
  --notification-container-color: var(--color-inverse-surface);
  --notification-text-color: var(--color-inverse-on-surface);
  --notification-leading-icon-color: var(--color-inverse-on-surface);
}

.notification.high-contrast.variant-info {
  --notification-accent-color: var(--color-primary);
}

.notification.high-contrast.variant-success {
  --notification-accent-color: var(--color-success);
}

.notification.high-contrast.variant-warning {
  --notification-accent-color: var(--color-warning);
}

.notification.high-contrast.variant-error {
  --notification-accent-color: var(--color-error);
}

@media (max-width: 640px) {
  :host(:not([inline])) {
    width: 100%;
  }
  .notification.inline {
    align-items: flex-start;
  }
  .notification.inline .content {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--spacing-100);
  }
  .notification.inline .content-text {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-025);
  }
  .notification.inline .title,
  .notification.inline .subtitle,
  .notification.inline .title ::slotted(*),
  .notification.inline .subtitle ::slotted(*) {
    display: initial;
  }
}`;

const VARIANT_LABELS = {
    success: 'Success',
    error: 'Error',
    info: 'Information',
    warning: 'Warning',
};
const VARIANT_ICONS = {
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
let Notification = class Notification extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * If true, content and actions are laid out in a single row.
         */
        this.inline = false;
        /**
         * The visual variant of the notification.
         */
        this.variant = 'info';
        /**
         * Enables a high contrast appearance.
         */
        this.highContrast = false;
        /**
         * If true, renders a dismiss icon button.
         */
        this.dismissible = false;
        /**
         * Action label text. When provided, an action button is shown.
         */
        this.action = '';
        /**
         * If true, the host controls visibility when dismissed.
         */
        this.managed = false;
        this.isHidden = false;
        this.hasSubtitle = false;
    }
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
    get variantIcon() {
        return VARIANT_ICONS[this.variant];
    }
    get variantLabel() {
        return VARIANT_LABELS[this.variant];
    }
    emitActionClick() {
        this.dispatchEvent(new CustomEvent('notification-action-click', {
            bubbles: true,
            composed: true,
        }));
    }
    hideAndEmitDismiss(reason) {
        if (!this.managed) {
            this.isHidden = true;
        }
        this.dispatchEvent(new CustomEvent('notification-dismiss', {
            detail: { reason },
            bubbles: true,
            composed: true,
        }));
    }
    handleSubtitleSlotChange(event) {
        const slot = event.target;
        this.hasSubtitle = slot
            .assignedNodes({ flatten: true })
            .some(node => node.textContent?.trim());
    }
    render() {
        if (this.isHidden) {
            return A;
        }
        return b `
      <div
        class=${e({
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
            ? b `<div class="actions">
                <wc-button
                  class="action"
                  size="sm"
                  variant=${this.inline ? 'text' : 'outlined'}
                  @click=${this.emitActionClick}
                >
                  ${this.action}
                </wc-button>
              </div>`
            : A}
        </div>

        ${this.dismissible
            ? b `<div class="close-button-container">
              <wc-icon-button
                class="close-button"
                variant="text"
                size="sm"
                aria-label="Close notification"
                @click=${() => {
                this.hideAndEmitDismiss('dismiss');
            }}
              >
                <wc-icon name="close"></wc-icon>
              </wc-icon-button>
            </div>`
            : A}
      </div>
    `;
    }
};
Notification.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], Notification.prototype, "inline", void 0);
__decorate([
    n({ type: String, reflect: true })
], Notification.prototype, "variant", void 0);
__decorate([
    n({ type: Boolean, reflect: true, attribute: 'high-contrast' })
], Notification.prototype, "highContrast", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Notification.prototype, "dismissible", void 0);
__decorate([
    n({ type: String })
], Notification.prototype, "action", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Notification.prototype, "managed", void 0);
__decorate([
    r()
], Notification.prototype, "isHidden", void 0);
__decorate([
    r()
], Notification.prototype, "hasSubtitle", void 0);
Notification = __decorate([
    IndividualComponent
], Notification);

export { Notification };
//# sourceMappingURL=notification.js.map
