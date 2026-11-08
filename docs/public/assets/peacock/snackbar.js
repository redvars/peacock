import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-NDIkZErE.js';
import { I as I18nController } from './i18n-controller-W5hLm7os.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';
import './strings-BFkowon5.js';
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
@keyframes snackbar-enter {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes snackbar-exit {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(0.5rem);
  }
}
:host {
  display: contents;
  --snackbar-container-color: var(--color-inverse-surface);
  --snackbar-label-text-color: var(--color-inverse-on-surface);
  --snackbar-action-text-color: var(--color-inverse-primary);
  --snackbar-close-icon-color: var(--color-inverse-on-surface);
  --snackbar-icon-color: var(--color-inverse-on-surface);
  --snackbar-border-radius: var(--shape-corner-extra-small);
}

.layer {
  background: transparent;
  border: 0;
  color: inherit;
  display: flex;
  height: auto;
  inset: auto var(--snackbar-offset-inline, 1rem) calc(var(--snackbar-offset-bottom, 1rem) + env(safe-area-inset-bottom, 0px));
  justify-content: center;
  margin: 0;
  overflow: visible;
  padding: 0;
  pointer-events: none;
  position: fixed;
  width: auto;
  z-index: var(--snackbar-z-index, 1000);
}

.snackbar {
  font-family: var(--typography-body-medium-font-family) !important;
  font-size: var(--typography-body-medium-font-size) !important;
  font-weight: var(--typography-body-medium-font-weight) !important;
  line-height: var(--typography-body-medium-line-height) !important;
  letter-spacing: var(--typography-body-medium-letter-spacing) !important;
  align-items: center;
  background-color: var(--snackbar-container-color);
  border-radius: var(--snackbar-border-radius);
  color: var(--snackbar-label-text-color);
  display: none;
  gap: var(--spacing-100);
  max-width: min(42rem, 100%);
  min-width: min(21.5rem, 100%);
  min-height: 3rem;
  padding: var(--spacing-100) var(--spacing-200);
  pointer-events: none;
}

.snackbar.open {
  animation: snackbar-enter var(--duration-medium1, 300ms) var(--easing-standard, cubic-bezier(0.2, 0, 0, 1)) both;
  display: inline-flex;
  pointer-events: auto;
}

.snackbar.open.dismissing {
  animation: snackbar-exit var(--duration-short2, 150ms) var(--easing-standard, cubic-bezier(0.2, 0, 0, 1)) forwards;
  pointer-events: none;
}

.label {
  flex: 1 1 auto;
  color: inherit;
  min-height: 32px;
  align-items: center;
  display: flex;
}

.action {
  --text-button-label-text-color: var(--snackbar-action-text-color);
}

.close {
  --text-button-label-text-color: var(--snackbar-close-icon-color);
}

.snackbar.multiline {
  align-items: flex-start;
}
.snackbar.multiline .label {
  height: 100%;
}
.snackbar.multiline .intent-icon {
  margin-block-start: var(--spacing-050);
}

.intent-icon {
  color: var(--snackbar-icon-color);
  flex: none;
  --icon-size: 1.25rem;
  --icon-color: var(--snackbar-icon-color);
}

.snackbar.intent-info {
  --snackbar-icon-color: var(--color-inverse-primary);
}

.snackbar.intent-success {
  --snackbar-icon-color: var(--color-inverse-success);
}

.snackbar.intent-warning {
  --snackbar-icon-color: var(--color-inverse-warning);
}

.snackbar.intent-danger {
  --snackbar-icon-color: var(--color-inverse-error);
}

.sr-only {
  border: 0;
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

:host([managed]) {
  display: block;
}
:host([managed]) .layer {
  inset: auto;
  position: relative;
  z-index: auto;
}
:host([managed]) .snackbar {
  flex: 1 1 auto;
  max-width: 100%;
}

:host([preview]) {
  display: flex;
}
:host([preview]) .layer {
  position: relative;
  inset: auto;
}
:host([preview]) .snackbar {
  display: inline-flex;
  pointer-events: auto;
}`;

var Snackbar_1;
const INTENT_ICONS = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    danger: 'error',
};
/** The string key of each intent's label, read by screen readers before the message. */
const INTENT_LABEL_KEYS = {
    info: 'intentInfo',
    success: 'intentSuccess',
    warning: 'intentWarning',
    danger: 'intentError',
};
/**
 * @label Snackbar
 * @tag wc-snackbar
 * @rawTag snackbar
 * @summary A brief message at the bottom of the screen about something the app did, with an optional action, that hides itself.
 *
 * @overview
 * <p>An open snackbar is shown as a manual popover, so it renders in the browser's top layer, above sticky
 * headers, app bars and open modals whatever their <code>z-index</code>. Opening it again while it is
 * visible brings it back in front of anything opened since. Opening one snackbar closes any other
 * open snackbar; use <code>wc-notification-manager</code> to show several at once.</p>
 * <p>It hides itself after <code>duration</code> milliseconds. The timer pauses while the pointer is over
 * the snackbar or focus is inside it, and starts again when both leave. A snackbar with an action
 * (<code>action-label</code>) or <code>duration="0"</code> does not hide by itself, so there is time to
 * reach the action.</p>
 * <p>It is a polite live region (<code>role="status"</code>); <code>intent="danger"</code> makes it
 * assertive (<code>role="alert"</code>). With <code>dismissible</code>, a close button is shown and
 * Escape closes it while focus is inside it.</p>
 *
 * @fires {CustomEvent} open - Fired when the snackbar opens.
 * @fires {CustomEvent<{reason: 'timeout' | 'action' | 'escape' | 'api'}>} close - Fired when the snackbar starts to close: the timer ran out (`timeout`), the action or close button was pressed (`action`), Escape (`escape`), or `hide()`, `open = false` or another snackbar opening (`api`).
 * @fires {CustomEvent} action - Fired when the action button is pressed, before `close`.
 *
 * @cssprop --snackbar-container-color - Container color for the snackbar.
 * @cssprop --snackbar-label-text-color - Label text color for the snackbar.
 * @cssprop --snackbar-action-text-color - Action text color.
 * @cssprop --snackbar-close-icon-color - Close icon color.
 * @cssprop --snackbar-icon-color - Color of the intent icon.
 * @cssprop --snackbar-border-radius - Border radius of the snackbar surface.
 * @cssprop --snackbar-offset-inline - Inline offset from viewport edges.
 * @cssprop --snackbar-offset-bottom - Bottom offset from viewport edge.
 * @cssprop --snackbar-z-index - Stacking order for the snackbar in browsers without the Popover API.
 *
 * @example
 * ```html
 * <wc-snackbar preview intent="success" message="Message archived" action-label="Undo" dismissible></wc-snackbar>
 * ```
 * @tags display, feedback
 */
let Snackbar = Snackbar_1 = class Snackbar extends i$1 {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        /** Whether the snackbar is currently visible. */
        this.open = false;
        /** The message text to display. Can also be provided via the default slot. */
        this.message = '';
        /** Label for the optional action button. When empty, no action button is rendered. */
        this.actionLabel = '';
        /** Shows a close button, and lets Escape close the snackbar while focus is inside it. */
        this.dismissible = false;
        /**
         * Auto-hide duration in milliseconds. Set to `0` to disable auto-hide. A snackbar with an
         * action never hides by itself.
         */
        this.duration = 4000;
        /** When true, the snackbar content is allowed to wrap to multiple lines. */
        this.multiline = false;
        /**
         * Renders the snackbar in a static preview state (always visible, no animation).
         * @internal For the documentation demos only.
         */
        this.preview = false;
        /**
         * Set by `wc-notification-manager`: the snackbar renders in place inside the manager's top-layer
         * region instead of its own popover, and neither closes other snackbars nor is closed by them.
         */
        this.managed = false;
        // ── State ────────────────────────────────────────────────────────────────
        /** True while the exit animation is running before the snackbar fully closes. */
        this.dismissing = false;
        // ── Private fields ───────────────────────────────────────────────────────
        /** Timer handle for the auto-hide timeout. */
        this.hideTimer = null;
        /** Timer handle for the exit animation duration timeout. */
        this.exitTimer = null;
        /** Whether the pointer is over the snackbar (pauses the timer). */
        this.hovered = false;
        /** Whether focus is inside the snackbar (pauses the timer). */
        this.focused = false;
        /** Whether `close` already fired for the current close, so `open = false` does not fire it again. */
        this.closeEventSent = false;
        /** Peacock's strings for the dismiss button and intent labels. */
        this.i18n = new I18nController(this);
        this.handleGlobalSnackbarOpen = (event) => {
            if (this.managed)
                return;
            const { source } = event.detail;
            if (source && source !== this && !source.managed) {
                this.hide();
            }
        };
        /**
         * Escape closes a dismissible snackbar while focus is inside it. Listening on `window` in the
         * capture phase runs before the overlay controller's document listener, so Escape closes the
         * snackbar and not a modal underneath it.
         */
        this.handleWindowKeydown = (event) => {
            if (event.key !== 'Escape' ||
                event.defaultPrevented ||
                !this.open ||
                this.dismissing ||
                !this.dismissible ||
                !event.composedPath().includes(this)) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            this.close('escape');
        };
    }
    // ── Lifecycle ────────────────────────────────────────────────────────────
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener(Snackbar_1.GLOBAL_OPEN_EVENT, this.handleGlobalSnackbarOpen);
        window.addEventListener('keydown', this.handleWindowKeydown, true);
    }
    disconnectedCallback() {
        document.removeEventListener(Snackbar_1.GLOBAL_OPEN_EVENT, this.handleGlobalSnackbarOpen);
        window.removeEventListener('keydown', this.handleWindowKeydown, true);
        this.clearExitTimer();
        this.clearTimer();
        this.syncLayer();
        super.disconnectedCallback();
    }
    updated(changed) {
        if (changed.has('open') ||
            changed.has('preview') ||
            changed.has('managed')) {
            this.syncLayer();
        }
        if (changed.has('open')) {
            if (this.open) {
                this.closeEventSent = false;
                if (!this.managed) {
                    document.dispatchEvent(new CustomEvent(Snackbar_1.GLOBAL_OPEN_EVENT, {
                        detail: { source: this },
                    }));
                }
                this.dispatchEvent(new CustomEvent('open', { bubbles: true, composed: true }));
            }
            else if (changed.get('open') === true) {
                // Closed by `open = false` rather than through `close()`.
                this.clearExitTimer();
                this.dismissing = false;
                if (!this.closeEventSent)
                    this.dispatchClose('api');
                this.closeEventSent = false;
            }
        }
        if (changed.has('open') ||
            changed.has('duration') ||
            changed.has('actionLabel')) {
            this.scheduleAutoHide();
        }
    }
    // ── Public methods ───────────────────────────────────────────────────────
    /** Opens the snackbar, or brings an open one back in front and restarts its timer. */
    show() {
        this.dismissing = false;
        this.clearExitTimer();
        if (!this.open) {
            this.open = true;
            return;
        }
        // Already open: move it back to the top of the top layer, above anything opened since.
        this.syncLayer(true);
        this.scheduleAutoHide();
    }
    /** Closes the snackbar (`close` reason `api`). */
    hide() {
        this.close('api');
    }
    // ── Private methods ──────────────────────────────────────────────────────
    /** Whether the timer may close the snackbar: it has a duration and no action. */
    get autoHides() {
        return this.duration > 0 && !this.actionLabel;
    }
    close(reason) {
        if (!this.open || this.dismissing) {
            return;
        }
        this.clearTimer();
        this.dismissing = true;
        this.clearExitTimer();
        this.exitTimer = setTimeout(() => {
            this.completeDismiss();
        }, Snackbar_1.EXIT_ANIMATION_MS);
        this.closeEventSent = true;
        this.dispatchClose(reason);
    }
    dispatchClose(reason) {
        this.dispatchEvent(new CustomEvent('close', {
            detail: { reason },
            bubbles: true,
            composed: true,
        }));
    }
    completeDismiss() {
        this.clearExitTimer();
        this.dismissing = false;
        // A hidden surface gets no mouseleave or focusout, so start the next open unpaused.
        this.hovered = false;
        this.focused = false;
        this.open = false;
    }
    handleActionClick() {
        this.dispatchEvent(new CustomEvent('action', { bubbles: true, composed: true }));
        this.close('action');
    }
    handleCloseClick() {
        this.close('action');
    }
    handleMouseEnter() {
        this.hovered = true;
        this.clearTimer();
    }
    handleMouseLeave() {
        this.hovered = false;
        this.scheduleAutoHide();
    }
    handleFocusIn() {
        this.focused = true;
        this.clearTimer();
    }
    handleFocusOut(event) {
        const next = event.relatedTarget;
        if (next && (this.contains(next) || this.shadowRoot?.contains(next))) {
            return;
        }
        this.focused = false;
        this.scheduleAutoHide();
    }
    clearTimer() {
        if (this.hideTimer !== null) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }
    clearExitTimer() {
        if (this.exitTimer !== null) {
            clearTimeout(this.exitTimer);
            this.exitTimer = null;
        }
    }
    handleAnimationEnd(event) {
        if (event.animationName === 'snackbar-exit' && this.dismissing) {
            this.completeDismiss();
        }
    }
    /**
     * Shows the layer in the top layer while the snackbar is open, and hides it otherwise.
     * With `raise`, an already showing layer is shown again so it moves above newer top-layer elements.
     */
    syncLayer(raise = false) {
        const { layer } = this;
        if (!layer ||
            typeof layer.showPopover !== 'function' ||
            !layer.hasAttribute('popover')) {
            return;
        }
        const shouldShow = this.open && !this.preview && this.isConnected;
        const showing = layer.matches(':popover-open');
        if (showing && (!shouldShow || raise)) {
            layer.hidePopover();
        }
        if (shouldShow && (!showing || raise)) {
            layer.showPopover();
        }
    }
    /** (Re)starts the auto-hide timer with the full duration, unless it is paused or off. */
    scheduleAutoHide() {
        this.clearTimer();
        if (!this.open ||
            this.dismissing ||
            !this.autoHides ||
            this.hovered ||
            this.focused) {
            return;
        }
        this.hideTimer = setTimeout(() => {
            this.close('timeout');
        }, this.duration);
    }
    // ── Render helpers ───────────────────────────────────────────────────────
    renderIntentIcon() {
        if (!this.intent || !(this.intent in INTENT_ICONS))
            return A;
        return b `<wc-icon
      class="intent-icon"
      name=${INTENT_ICONS[this.intent]}
      aria-hidden="true"
    ></wc-icon>`;
    }
    // ── Render ───────────────────────────────────────────────────────────────
    render() {
        const hasIntent = !!this.intent && this.intent in INTENT_LABEL_KEYS;
        const inPlace = this.preview || this.managed;
        return b `
      <div class="layer" popover=${inPlace ? A : 'manual'}>
        <div
          class=${e$1({
            snackbar: true,
            open: !this.preview && this.open,
            preview: this.preview,
            dismissing: this.dismissing,
            multiline: this.multiline,
            [`intent-${this.intent}`]: hasIntent,
        })}
          role=${this.intent === 'danger' ? 'alert' : 'status'}
          @animationend=${this.handleAnimationEnd}
          @mouseenter=${this.handleMouseEnter}
          @mouseleave=${this.handleMouseLeave}
          @focusin=${this.handleFocusIn}
          @focusout=${this.handleFocusOut}
        >
          ${this.renderIntentIcon()}

          <div class="label">
            ${hasIntent && this.intent
            ? b `<span class="sr-only"
                  >${this.i18n.t(INTENT_LABEL_KEYS[this.intent])}:
                </span>`
            : A}
            <slot>${this.message}</slot>
          </div>

          ${this.actionLabel
            ? b `<wc-button
                class="action"
                variant="text"
                size="sm"
                @click=${this.handleActionClick}
              >
                ${this.actionLabel}
              </wc-button>`
            : A}
          ${this.dismissible
            ? b `<wc-icon-button
                class="close"
                variant="text"
                size="sm"
                shape="round"
                aria-label=${this.i18n.t('dismissNotification')}
                @click=${this.handleCloseClick}
              >
                <wc-icon name="close"></wc-icon>
              </wc-icon-button>`
            : A}
        </div>
      </div>
    `;
    }
};
Snackbar.styles = [css_248z];
Snackbar.GLOBAL_OPEN_EVENT = 'wc-snackbar-will-open';
Snackbar.EXIT_ANIMATION_MS = 180;
__decorate([
    n({ type: Boolean, reflect: true })
], Snackbar.prototype, "open", void 0);
__decorate([
    n({ type: String })
], Snackbar.prototype, "message", void 0);
__decorate([
    n({ type: String, attribute: 'action-label' })
], Snackbar.prototype, "actionLabel", void 0);
__decorate([
    n({ type: String, reflect: true })
], Snackbar.prototype, "intent", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Snackbar.prototype, "dismissible", void 0);
__decorate([
    n({ type: Number })
], Snackbar.prototype, "duration", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Snackbar.prototype, "multiline", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Snackbar.prototype, "preview", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Snackbar.prototype, "managed", void 0);
__decorate([
    r()
], Snackbar.prototype, "dismissing", void 0);
__decorate([
    e('.layer')
], Snackbar.prototype, "layer", void 0);
Snackbar = Snackbar_1 = __decorate([
    IndividualComponent
], Snackbar);

export { Snackbar };
//# sourceMappingURL=snackbar.js.map
