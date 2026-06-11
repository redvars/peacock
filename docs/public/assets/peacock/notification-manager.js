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

@keyframes reveal-top {
  0% {
    opacity: 0;
    transform: translateY(-1rem);
    max-height: 0;
  }
  100% {
    max-height: 500px;
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes reveal-bottom {
  0% {
    opacity: 0;
    transform: translateY(1rem);
    max-height: 0;
  }
  100% {
    max-height: 500px;
    opacity: 1;
    transform: translateY(0);
  }
}
:host {
  display: block;
  position: var(--notification-manager-position, absolute);
  width: 20rem;
  z-index: var(--z-index-notification-manager, 9000);
  pointer-events: none;
}

.notification-manager {
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100);
  margin: var(--spacing-150);
}

.notification {
  pointer-events: auto;
  max-height: 500px;
  transition: max-height 0.5s ease-out, opacity 0.5s ease-out;
  overflow: hidden;
}

.notification.hidden {
  max-height: 0;
  opacity: 0;
}

/* Position variants */
:host([position=bottom-right]) {
  bottom: 0;
  right: 0;
}
:host([position=bottom-right]) .notification-manager {
  align-items: flex-end;
}
:host([position=bottom-right]) .notification {
  animation: reveal-bottom 0.5s ease-in;
}

:host([position=bottom-left]) {
  bottom: 0;
  left: 0;
}
:host([position=bottom-left]) .notification-manager {
  align-items: flex-start;
}
:host([position=bottom-left]) .notification {
  animation: reveal-bottom 0.5s ease-in;
}

:host([position=top-right]) {
  top: 0;
  right: 0;
}
:host([position=top-right]) .notification-manager {
  align-items: flex-end;
}
:host([position=top-right]) .notification {
  animation: reveal-top 0.5s ease-in;
}

:host([position=top-left]) {
  top: 0;
  left: 0;
}
:host([position=top-left]) .notification-manager {
  align-items: flex-start;
}
:host([position=top-left]) .notification {
  animation: reveal-top 0.5s ease-in;
}`;

let notificationCounter = 0;
function nextId() {
    return `wc-notification-${++notificationCounter}`;
}
/**
 * @label Notification Manager
 * @tag wc-notification-manager
 * @rawTag notification-manager
 * @summary The Notification Manager handles the organization and display of notifications within the application.
 *
 * @fires {CustomEvent} notification-manager-action - Fired when the action button of a managed notification is clicked. Detail: `{ id: string }`.
 * @fires {CustomEvent} notification-manager-dismiss - Fired when a managed notification is dismissed. Detail: `{ id: string }`.
 *
 * @example
 * ```html
 * <wc-notification-manager position="bottom-right"></wc-notification-manager>
 * <script>
 *   window.dispatchEvent(new CustomEvent('notification', {
 *     detail: { title: 'Record saved', variant: 'success', dismissible: true }
 *   }));
 * </script>
 * ```
 * @tags display, feedback
 */
let NotificationManager = class NotificationManager extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Name of this manager instance. Only notifications whose `target` matches
         * this name (or whose `target` is absent and this manager's `name` is
         * `'global'`) will be handled.
         */
        this.name = 'global';
        /**
         * Screen position where notifications are stacked.
         */
        this.position = 'bottom-right';
        this.notifications = [];
        this.handleWindowNotification = (event) => {
            const evt = event;
            const detail = evt.detail ?? {};
            // Route by target: accept if target matches our name, or if we are global
            // and no specific target is set.
            const target = detail.target;
            const isForUs = target === this.name || (!target && this.name === 'global');
            if (!isForUs || detail.processed) {
                return;
            }
            evt.stopPropagation();
            detail.processed = true;
            const entry = {
                id: nextId(),
                title: detail.title ?? '',
                subtitle: detail.subtitle,
                action: detail.action,
                variant: detail.variant ?? 'info',
                dismissible: detail.dismissible ?? false,
                timeout: detail.timeout ?? 5000,
                hide: false,
                width: detail.width,
            };
            this.notifications = [...this.notifications, entry];
            if (typeof detail.callback === 'function') {
                detail.callback(entry.id);
            }
            if (!entry.dismissible) {
                setTimeout(() => {
                    this._hideNotification(entry.id);
                }, entry.timeout);
            }
        };
        this.handleWindowDismiss = (event) => {
            const evt = event;
            const ids = evt.detail?.notifications ?? [];
            ids.forEach(id => this._hideNotification(id));
        };
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('notification', this.handleWindowNotification);
        window.addEventListener('notification-dismiss', this.handleWindowDismiss);
    }
    disconnectedCallback() {
        window.removeEventListener('notification', this.handleWindowNotification);
        window.removeEventListener('notification-dismiss', this.handleWindowDismiss);
        super.disconnectedCallback();
    }
    _hideNotification(id) {
        this.notifications = this.notifications.map(n => n.id === id ? { ...n, hide: true } : n);
    }
    _handleDismiss(id) {
        this._hideNotification(id);
        this.dispatchEvent(new CustomEvent('notification-manager-dismiss', {
            detail: { id },
            bubbles: true,
            composed: true,
        }));
    }
    _handleAction(id) {
        this.dispatchEvent(new CustomEvent('notification-manager-action', {
            detail: { id },
            bubbles: true,
            composed: true,
        }));
    }
    renderNotification(n) {
        return b `
      <div
        id=${n.id}
        class=${e({ notification: true, hidden: n.hide })}
        style=${n.width ? `width: ${n.width}` : A}
      >
        <wc-notification
          variant=${n.variant}
          ?dismissible=${n.dismissible}
          managed
          action=${n.action ?? A}
          @notification-dismiss=${() => this._handleDismiss(n.id)}
          @notification-action-click=${() => this._handleAction(n.id)}
        >
          <span slot="title">${n.title}</span>
          ${n.subtitle
            ? b `<span slot="subtitle">${n.subtitle}</span>`
            : A}
        </wc-notification>
      </div>
    `;
    }
    render() {
        return b `
      <div
        class=${e({
            'notification-manager': true,
            [`position-${this.position}`]: true,
        })}
      >
        ${this.notifications.map(n => this.renderNotification(n))}
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
], NotificationManager.prototype, "position", void 0);
__decorate([
    r()
], NotificationManager.prototype, "notifications", void 0);
NotificationManager = __decorate([
    IndividualComponent
], NotificationManager);

export { NotificationManager };
//# sourceMappingURL=notification-manager.js.map
