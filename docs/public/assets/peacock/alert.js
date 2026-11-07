import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './class-map-NDIkZErE.js';
import { I as I18nController } from './i18n-controller-Dxqz0Aof.js';
import './directive-ZPhl09Yt.js';
import './strings-WY90FZfd.js';
import './locale-DEsJZCQG.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
:host {
  display: block;
}

:host([hidden]) {
  display: none;
}

.alert {
  align-items: flex-start;
  background: var(--alert-container-color);
  border-radius: var(--alert-border-radius);
  display: grid;
  gap: var(--spacing-100);
  grid-auto-columns: auto;
  grid-auto-flow: column;
  grid-template-columns: auto 1fr;
  padding: var(--spacing-200);
}

.alert-icon {
  align-items: center;
  color: var(--alert-icon-color);
  --icon-color: var(--alert-icon-color);
  display: inline-flex;
  justify-content: center;
  --icon-size: 1.5rem;
}

.alert-content .alert-label {
  display: inline;
  font-family: var(--typography-label-large-font-family) !important;
  font-size: var(--typography-label-large-font-size) !important;
  font-weight: var(--typography-label-large-font-weight) !important;
  line-height: var(--typography-label-large-line-height) !important;
  letter-spacing: var(--typography-label-large-letter-spacing) !important;
  color: var(--alert-label-text-color);
  margin-inline-end: var(--spacing-050);
}
.alert-content .alert-description {
  display: inline;
  font-family: var(--typography-body-medium-font-family) !important;
  font-size: var(--typography-body-medium-font-size) !important;
  font-weight: var(--typography-body-medium-font-weight) !important;
  line-height: var(--typography-body-medium-line-height) !important;
  letter-spacing: var(--typography-body-medium-letter-spacing) !important;
  color: var(--alert-description-text-color);
}

.alert-actions {
  align-items: center;
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--spacing-100);
  margin-block: calc(-1 * var(--spacing-050));
}

.alert-actions[hidden] {
  display: none;
}

.alert-close {
  margin-block: calc(-1 * var(--spacing-050));
  --text-button-label-text-color: var(--alert-icon-color);
}

:host {
  --alert-container-color: var(--color-tertiary-container);
  --alert-label-text-color: var(--color-on-tertiary-container);
  --alert-description-text-color: var(--color-on-tertiary-container);
  --alert-icon-color: var(--color-on-tertiary-container);
  --alert-border-radius: var(--shape-corner-small);
}

.alert.info,
.alert-content.info {
  --alert-container-color: var(--color-primary-container);
  --alert-label-text-color: var(--color-on-primary-container);
  --alert-description-text-color: var(--color-on-primary-container);
  --alert-icon-color: var(--color-on-primary-container);
}

.alert.success,
.alert-content.success {
  --alert-container-color: var(--color-success-container);
  --alert-label-text-color: var(--color-on-success-container);
  --alert-description-text-color: var(--color-on-success-container);
  --alert-icon-color: var(--color-on-success-container);
}

.alert.warning,
.alert-content.warning {
  --alert-container-color: var(--color-warning-container);
  --alert-label-text-color: var(--color-on-warning-container);
  --alert-description-text-color: var(--color-on-warning-container);
  --alert-icon-color: var(--color-on-warning-container);
}

.alert.danger,
.alert-content.danger {
  --alert-container-color: var(--color-error-container);
  --alert-label-text-color: var(--color-on-error-container);
  --alert-description-text-color: var(--color-on-error-container);
  --alert-icon-color: var(--color-on-error-container);
}`;

/** The string key of each intent's label. */
const INTENT_LABEL_KEYS = {
    note: 'intentNote',
    info: 'intentInfo',
    success: 'intentSuccess',
    warning: 'intentWarning',
    danger: 'intentError',
};
const INTENT_ICONS = {
    note: 'star',
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    danger: 'error',
};
/**
 * @label Alert
 * @tag wc-alert
 * @rawTag alert
 * @summary A short, prominent message in the page, with an optional icon, action and close button.
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
let Alert = class Alert extends i$1 {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        /**
         * Optional description text when a default slot is not provided.
         */
        this.description = '';
        /** Shows a close button; pressing it fires `close` and hides the alert. */
        this.dismissible = false;
        // ── State ────────────────────────────────────────────────────────────────
        /** Whether the `action` slot has content. */
        this.hasAction = false;
        // ── Private fields ───────────────────────────────────────────────────────
        /** Peacock's strings for the intent labels and the close button. */
        this.i18n = new I18nController(this);
    }
    // ── Private methods ──────────────────────────────────────────────────────
    /** `intent`, else `note`. */
    get resolvedIntent() {
        if (this.intent && this.intent in INTENT_ICONS)
            return this.intent;
        return 'note';
    }
    get resolvedLabel() {
        return this.label || this.i18n.t(INTENT_LABEL_KEYS[this.resolvedIntent]);
    }
    get resolvedIcon() {
        return this.icon || INTENT_ICONS[this.resolvedIntent];
    }
    get liveRole() {
        if (this.live === 'assertive')
            return 'alert';
        if (this.live === 'polite')
            return 'status';
        return A;
    }
    handleActionSlotChange(event) {
        const slot = event.target;
        this.hasAction = slot.assignedNodes({ flatten: true }).length > 0;
    }
    handleCloseClick() {
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
        return b `
      <div
        class=${e({
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

        <div class=${e({ 'alert-content': true, [intent]: true })}>
          <div class="alert-label">
            <slot name="label">${this.resolvedLabel}:</slot>
          </div>

          <div class="alert-description">
            <!-- Beside the slot, not its fallback: whitespace around slotted children (an action
                 button) would replace a fallback and hide the description. -->
            ${this.description || A}<slot></slot>
          </div>
        </div>

        <div class="alert-actions" ?hidden=${!this.hasAction}>
          <slot name="action" @slotchange=${this.handleActionSlotChange}></slot>
        </div>

        ${this.dismissible
            ? b `<wc-icon-button
              class="alert-close"
              variant="text"
              size="sm"
              shape="round"
              aria-label=${this.i18n.t('dismissAlert')}
              @click=${this.handleCloseClick}
            >
              <wc-icon name="close"></wc-icon>
            </wc-icon-button>`
            : A}
      </div>
    `;
    }
};
Alert.styles = [css_248z];
__decorate([
    n({ type: String, reflect: true })
], Alert.prototype, "intent", void 0);
__decorate([
    n({ type: String })
], Alert.prototype, "label", void 0);
__decorate([
    n({ type: String })
], Alert.prototype, "icon", void 0);
__decorate([
    n({ type: String })
], Alert.prototype, "description", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Alert.prototype, "dismissible", void 0);
__decorate([
    n({ type: String, reflect: true })
], Alert.prototype, "live", void 0);
__decorate([
    r()
], Alert.prototype, "hasAction", void 0);
Alert = __decorate([
    IndividualComponent
], Alert);

export { Alert };
//# sourceMappingURL=alert.js.map
