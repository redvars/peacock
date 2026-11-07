import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-NDIkZErE.js';
import { c } from './repeat-D_ERDRYT.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';
import './directive-helpers-Bx3mu42O.js';

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
  display: contents;
  --_offset: var(--notification-manager-offset, var(--spacing-200, 1rem));
}

.region {
  align-items: flex-end;
  background: transparent;
  border: 0;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100);
  height: auto;
  inset: auto;
  margin: 0;
  max-block-size: calc(100% - 2 * var(--_offset));
  max-inline-size: calc(100% - 2 * var(--_offset));
  overflow: visible;
  padding: 0;
  pointer-events: none;
  position: fixed;
  width: fit-content;
  z-index: var(--z-index-notification-manager, 9000);
}

.region:not(:popover-open) {
  display: none;
}

.region > wc-snackbar {
  inline-size: 100%;
}

.toast-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-025);
  min-inline-size: 0;
}

.toast-title {
  font-family: var(--typography-label-large-font-family) !important;
  font-size: var(--typography-label-large-font-size) !important;
  font-weight: var(--typography-label-large-font-weight) !important;
  line-height: var(--typography-label-large-line-height) !important;
  letter-spacing: var(--typography-label-large-letter-spacing) !important;
}

.toast-subtitle {
  font-family: var(--typography-body-medium-font-family) !important;
  font-size: var(--typography-body-medium-font-size) !important;
  font-weight: var(--typography-body-medium-font-weight) !important;
  line-height: var(--typography-body-medium-line-height) !important;
  letter-spacing: var(--typography-body-medium-letter-spacing) !important;
}

.placement-top-start,
.placement-top-center,
.placement-top-end {
  inset-block-start: calc(var(--_offset) + env(safe-area-inset-top, 0px));
}

.placement-bottom-start,
.placement-bottom-center,
.placement-bottom-end {
  inset-block-end: calc(var(--_offset) + env(safe-area-inset-bottom, 0px));
}

.placement-top-start,
.placement-bottom-start {
  align-items: flex-start;
  inset-inline-start: var(--_offset);
}

.placement-top-end,
.placement-bottom-end {
  align-items: flex-end;
  inset-inline-end: var(--_offset);
}

.placement-top-center,
.placement-bottom-center {
  align-items: center;
  inset-inline: 0;
  margin-inline: auto;
}`;

const PLACEMENTS = [
    'top-start',
    'top-center',
    'top-end',
    'bottom-start',
    'bottom-center',
    'bottom-end',
];
const INTENTS = ['info', 'success', 'warning', 'danger'];
/** The window event that shows a toast, and the one that hides toasts. */
const TOAST_EVENT = 'peacock-toast';
const TOAST_DISMISS_EVENT = 'peacock-toast-dismiss';
let toastCounter = 0;
function nextId() {
    toastCounter += 1;
    return `wc-toast-${toastCounter}`;
}
function resolveIntent(options) {
    if (options.intent && INTENTS.includes(options.intent))
        return options.intent;
    return 'info';
}
/**
 * @label Notification Manager
 * @tag wc-notification-manager
 * @rawTag notification-manager
 * @summary A toast queue: shows transient messages as a stack of snackbars in the browser's top layer.
 *
 * @overview
 * <p>The manager shows each toast as a <code>wc-snackbar</code> in a region in the browser's top
 * layer, fixed to the viewport at <code>placement</code>, above sticky headers and open modals. A toast
 * is removed from the page once its exit animation ends.</p>
 * <p>Every toast hides itself after its <code>duration</code> (5000 ms by default; the timer pauses
 * while the pointer or focus is on it) unless it has an <code>action</code> or <code>duration: 0</code>,
 * whether it is dismissible or not.</p>
 * <p>Show a toast with <code>manager.show({ title, intent })</code>, which returns its id, or from
 * anywhere with a <code>peacock-toast</code> window event whose <code>detail</code> holds the same
 * options plus <code>target</code> (the manager's <code>name</code>; unset goes to the manager named
 * <code>global</code>) and <code>callback(id)</code>. Hide toasts with <code>manager.hide(id)</code> or a
 * <code>peacock-toast-dismiss</code> window event with <code>detail.notifications</code>, an array of ids.</p>
 *
 * @fires {CustomEvent<{id: string, reason: 'timeout' | 'action' | 'escape' | 'api'}>} close - Fired when a toast starts to close.
 * @fires {CustomEvent<{id: string}>} action - Fired when the action button of a toast is pressed.
 *
 * @cssprop --notification-manager-offset - Distance of the toast stack from the viewport edges.
 * @cssprop --z-index-notification-manager - Stacking order in browsers without the Popover API.
 *
 * @example
 * ```html
 * <wc-notification-manager placement="bottom-end"></wc-notification-manager>
 * <script>
 *   window.dispatchEvent(new CustomEvent('peacock-toast', {
 *     detail: { title: 'Record saved', intent: 'success', dismissible: true }
 *   }));
 * </script>
 * ```
 * @tags display, feedback
 */
let NotificationManager = class NotificationManager extends i$1 {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        /**
         * Name of this manager instance. Only toasts whose `target` matches
         * this name (or whose `target` is absent and this manager's `name` is
         * `'global'`) will be handled.
         */
        this.name = 'global';
        // ── State ────────────────────────────────────────────────────────────────
        /** The queued toasts, oldest first. */
        this.toasts = [];
        // ── Private fields ───────────────────────────────────────────────────────
        /** Removes a toast once its snackbar has closed (its `open` attribute is gone). */
        this.closedObserver = new MutationObserver(records => {
            const closed = new Set();
            records.forEach(record => {
                const target = record.target;
                const id = target.dataset.toastId;
                if (id && !target.hasAttribute('open'))
                    closed.add(id);
            });
            if (closed.size > 0) {
                this.toasts = this.toasts.filter(toast => !closed.has(toast.id));
            }
        });
        this.handleWindowToast = (event) => {
            const evt = event;
            const detail = evt.detail ?? {};
            // Route by target: accept if target matches our name, or if we are global
            // and no specific target is set.
            const { target } = detail;
            const isForUs = target === this.name || (!target && this.name === 'global');
            if (!isForUs || detail.processed) {
                return;
            }
            evt.stopPropagation();
            detail.processed = true;
            const id = this.show(detail);
            if (typeof detail.callback === 'function') {
                detail.callback(id);
            }
        };
        this.handleWindowDismiss = (event) => {
            const { detail } = event;
            const ids = detail?.notifications;
            if (!Array.isArray(ids))
                return;
            ids.forEach(id => this.hide(id));
        };
    }
    // ── Lifecycle ────────────────────────────────────────────────────────────
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener(TOAST_EVENT, this.handleWindowToast);
        window.addEventListener(TOAST_DISMISS_EVENT, this.handleWindowDismiss);
        this.closedObserver.observe(this.renderRoot, {
            attributes: true,
            attributeFilter: ['open'],
            subtree: true,
        });
    }
    disconnectedCallback() {
        window.removeEventListener(TOAST_EVENT, this.handleWindowToast);
        window.removeEventListener(TOAST_DISMISS_EVENT, this.handleWindowDismiss);
        this.closedObserver.disconnect();
        this.syncRegion();
        super.disconnectedCallback();
    }
    updated(changed) {
        if (changed.has('toasts')) {
            const before = changed.get('toasts') ?? [];
            // A new toast brings the region back above top-layer elements opened since.
            const added = this.toasts.some(toast => !before.some(old => old.id === toast.id));
            this.syncRegion(added);
        }
    }
    // ── Public methods ───────────────────────────────────────────────────────
    /** Queues a toast and returns its id. */
    show(options = {}) {
        const toast = {
            id: nextId(),
            title: options.title ?? '',
            subtitle: options.subtitle,
            action: options.action,
            intent: resolveIntent(options),
            dismissible: options.dismissible ?? false,
            duration: options.duration ?? 5000,
            width: options.width,
        };
        this.toasts = [...this.toasts, toast];
        return toast.id;
    }
    /** Closes a toast (`close` reason `api`); it is removed once its exit animation ends. */
    hide(id) {
        if (!this.toasts.some(toast => toast.id === id))
            return;
        this.updateComplete.then(() => {
            this.snackbarFor(id)?.hide();
        });
    }
    // ── Private methods ──────────────────────────────────────────────────────
    /** `placement`, else `bottom-end`. */
    get resolvedPlacement() {
        if (this.placement && PLACEMENTS.includes(this.placement)) {
            return this.placement;
        }
        return 'bottom-end';
    }
    snackbarFor(id) {
        return this.renderRoot.querySelector(`wc-snackbar[data-toast-id="${id}"]`);
    }
    /**
     * Shows the region in the top layer while there are toasts. With `raise`, a showing region is
     * shown again so it moves above newer top-layer elements.
     */
    syncRegion(raise = false) {
        const { region } = this;
        if (!region || typeof region.showPopover !== 'function')
            return;
        const shouldShow = this.toasts.length > 0 && this.isConnected;
        const showing = region.matches(':popover-open');
        if (showing && (!shouldShow || raise))
            region.hidePopover();
        if (shouldShow && (!showing || raise))
            region.showPopover();
    }
    handleToastClose(id, event) {
        event.stopPropagation();
        const { reason } = event.detail;
        this.dispatchEvent(new CustomEvent('close', {
            detail: { id, reason },
            bubbles: true,
            composed: true,
        }));
    }
    handleToastAction(id, event) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('action', {
            detail: { id },
            bubbles: true,
            composed: true,
        }));
    }
    // ── Render helpers ───────────────────────────────────────────────────────
    renderToast(toast) {
        return b `
      <wc-snackbar
        managed
        open
        data-toast-id=${toast.id}
        id=${toast.id}
        intent=${toast.intent}
        action-label=${toast.action ?? A}
        .duration=${toast.duration}
        ?dismissible=${toast.dismissible}
        ?multiline=${!!toast.subtitle}
        style=${toast.width ? `width: ${toast.width}` : A}
        @open=${(event) => event.stopPropagation()}
        @close=${(event) => this.handleToastClose(toast.id, event)}
        @action=${(event) => this.handleToastAction(toast.id, event)}
      >
        <span class="toast-text">
          <span class=${e$1({ 'toast-title': !!toast.subtitle })}
            >${toast.title}</span
          >
          ${toast.subtitle
            ? b `<span class="toast-subtitle">${toast.subtitle}</span>`
            : A}
        </span>
      </wc-snackbar>
    `;
    }
    // ── Render ───────────────────────────────────────────────────────────────
    render() {
        return b `
      <div
        class=${e$1({
            region: true,
            [`placement-${this.resolvedPlacement}`]: true,
        })}
        popover="manual"
      >
        ${c(this.toasts, toast => toast.id, toast => this.renderToast(toast))}
      </div>
    `;
    }
};
NotificationManager.styles = [css_248z];
__decorate([
    n({ type: String, reflect: true })
], NotificationManager.prototype, "name", void 0);
__decorate([
    n({ type: String, reflect: true })
], NotificationManager.prototype, "placement", void 0);
__decorate([
    r()
], NotificationManager.prototype, "toasts", void 0);
__decorate([
    e('.region')
], NotificationManager.prototype, "region", void 0);
NotificationManager = __decorate([
    IndividualComponent
], NotificationManager);

export { NotificationManager };
//# sourceMappingURL=notification-manager.js.map
