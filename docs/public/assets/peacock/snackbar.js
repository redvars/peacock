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
  display: flex;
  inset-block-end: calc(var(--snackbar-offset-bottom, 1rem) + env(safe-area-inset-bottom, 0px));
  inset-inline: var(--snackbar-offset-inline, 1rem);
  justify-content: center;
  pointer-events: none;
  position: fixed;
  z-index: var(--snackbar-z-index, 1000);
  --snackbar-container-color: var(--color-inverse-surface);
  --snackbar-label-text-color: var(--color-inverse-on-surface);
  --snackbar-action-text-color: var(--color-inverse-primary);
  --snackbar-close-icon-color: var(--color-inverse-on-surface);
  --snackbar-border-radius: var(--shape-corner-extra-small);
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

:host([preview]) {
  position: relative;
  inset-inline: unset;
  inset-block-end: unset;
}
:host([preview]) .snackbar {
  display: inline-flex;
  pointer-events: auto;
}`;

var Snackbar_1;
/**
 * @label Snackbar
 * @tag wc-snackbar
 * @rawTag snackbar
 * @summary Snackbars provide brief messages about app processes at the bottom of the screen.
 *
 * @cssprop --snackbar-container-color - Container color for the snackbar.
 * @cssprop --snackbar-label-text-color - Label text color for the snackbar.
 * @cssprop --snackbar-action-text-color - Action text color.
 * @cssprop --snackbar-close-icon-color - Close icon color.
 * @cssprop --snackbar-border-radius - Border radius of the snackbar surface.
 * @cssprop --snackbar-offset-inline - Inline offset from viewport edges.
 * @cssprop --snackbar-offset-bottom - Bottom offset from viewport edge.
 * @cssprop --snackbar-z-index - Stacking order for the snackbar.
 *
 * @example
 * ```html
 * <wc-snackbar preview message="Message archived" action-label="Undo"></wc-snackbar>
 * ```
 * @tags display, feedback
 */
let Snackbar = Snackbar_1 = class Snackbar extends i$1 {
    constructor() {
        super(...arguments);
        /** Whether the snackbar is currently visible. */
        this.open = false;
        /** The message text to display. Can also be provided via the default slot. */
        this.message = '';
        /** Label for the optional action button. When empty, no action button is rendered. */
        this.actionLabel = '';
        /** When true, a dismiss icon button is shown on the trailing end. */
        this.showCloseIcon = false;
        /** Auto-hide duration in milliseconds. Set to `0` to disable auto-hide. */
        this.duration = 4000;
        /** When true, the snackbar content is allowed to wrap to multiple lines. */
        this.multiline = false;
        /** When true, renders the snackbar in a static preview state (always visible, no animation). */
        this.preview = false;
        /** True while the exit animation is running before the snackbar fully closes. */
        this.dismissing = false;
        // ── Private fields ────────────────────────────────────────────────────────
        /** Timer handle for the auto-hide timeout. */
        this.hideTimer = null;
        /** Timer handle for the exit animation duration timeout. */
        this.exitTimer = null;
        this.handleGlobalSnackbarOpen = (event) => {
            const { source } = event.detail;
            if (source && source !== this) {
                this.hide();
            }
        };
    }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener(Snackbar_1.GLOBAL_OPEN_EVENT, this.handleGlobalSnackbarOpen);
    }
    disconnectedCallback() {
        document.removeEventListener(Snackbar_1.GLOBAL_OPEN_EVENT, this.handleGlobalSnackbarOpen);
        this.clearExitTimer();
        this.clearTimer();
        super.disconnectedCallback();
    }
    updated(changedProperties) {
        if (changedProperties.has('open')) {
            if (this.open) {
                document.dispatchEvent(new CustomEvent(Snackbar_1.GLOBAL_OPEN_EVENT, {
                    detail: { source: this },
                }));
            }
            this.scheduleAutoHide();
        }
    }
    // ── Public methods ────────────────────────────────────────────────────────
    show() {
        this.dismissing = false;
        this.clearExitTimer();
        if (!this.open) {
            this.open = true;
            return;
        }
        this.scheduleAutoHide();
    }
    hide() {
        this.close('programmatic');
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
        this.dispatchEvent(new CustomEvent('snackbar-close', {
            detail: { reason },
            bubbles: true,
            composed: true,
        }));
    }
    completeDismiss() {
        this.clearExitTimer();
        this.dismissing = false;
        this.open = false;
    }
    dispatchActionEvent() {
        this.dispatchEvent(new CustomEvent('snackbar-action', {
            bubbles: true,
            composed: true,
        }));
    }
    handleActionClick() {
        this.dispatchActionEvent();
        this.close('action');
    }
    handleCloseClick() {
        this.close('dismiss');
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
    scheduleAutoHide() {
        this.clearTimer();
        if (!this.open || this.duration <= 0) {
            return;
        }
        this.hideTimer = setTimeout(() => {
            this.close('timeout');
        }, this.duration);
    }
    render() {
        const liveRole = this.actionLabel || this.showCloseIcon ? 'alert' : 'status';
        return b `
      <div
        class=${e({
            snackbar: true,
            open: !this.preview && this.open,
            preview: this.preview,
            dismissing: this.dismissing,
            multiline: this.multiline,
        })}
        role=${liveRole}
        aria-live="polite"
        @animationend=${this.handleAnimationEnd}
      >
        <div class="label">
          <slot>${this.message}</slot>
        </div>

        ${this.actionLabel
            ? b `<wc-button class="action" variant='text' size='small' @click=${this.handleActionClick}>
              ${this.actionLabel}
            </wc-button>`
            : A}

        ${this.showCloseIcon
            ? b `<wc-icon-button
              class="close"
              variant='text' 
              size='small'
              aria-label="Dismiss notification"
              @click=${this.handleCloseClick}
            >
              <wc-icon name="close"></wc-icon>
            </wc-icon-button>`
            : A}
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
    n({ type: Boolean, attribute: 'show-close-icon' })
], Snackbar.prototype, "showCloseIcon", void 0);
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
    r()
], Snackbar.prototype, "dismissing", void 0);
Snackbar = Snackbar_1 = __decorate([
    IndividualComponent
], Snackbar);

export { Snackbar };
//# sourceMappingURL=snackbar.js.map
