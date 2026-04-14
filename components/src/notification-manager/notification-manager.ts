import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import IndividualComponent from '@/IndividualComponent.js';
import styles from './notification-manager.scss';

type NotificationVariant = 'success' | 'error' | 'info' | 'warning';

type NotificationEntry = {
  id: string;
  title: string;
  subtitle?: string;
  action?: string;
  variant: NotificationVariant;
  dismissible: boolean;
  timeout: number;
  hide: boolean;
  width?: string;
};

let notificationCounter = 0;
function nextId(): string {
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
 *   window.dispatchEvent(new CustomEvent('wc-notification', {
 *     detail: { title: 'Record saved', variant: 'success', dismissible: true }
 *   }));
 * </script>
 * ```
 * @tags display, feedback
 */
@IndividualComponent
export class NotificationManager extends LitElement {
  static styles = [styles];

  /**
   * Name of this manager instance. Only notifications whose `target` matches
   * this name (or whose `target` is absent and this manager's `name` is
   * `'global'`) will be handled.
   */
  @property({ type: String, reflect: true }) name = 'global';

  /**
   * Screen position where notifications are stacked.
   */
  @property({ type: String, reflect: true })
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' =
    'bottom-right';

  @state() private notifications: NotificationEntry[] = [];

  private readonly handleWindowNotification = (event: Event) => {
    const evt = event as CustomEvent;
    const detail = evt.detail ?? {};

    // Route by target: accept if target matches our name, or if we are global
    // and no specific target is set.
    const target: string | undefined = detail.target;
    const isForUs =
      target === this.name || (!target && this.name === 'global');

    if (!isForUs || detail.procced) {
      return;
    }

    evt.stopPropagation();
    detail.procced = true;

    const entry: NotificationEntry = {
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

  private readonly handleWindowDismiss = (event: Event) => {
    const evt = event as CustomEvent;
    const ids: string[] = evt.detail?.notifications ?? [];
    ids.forEach(id => this._hideNotification(id));
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('wc-notification', this.handleWindowNotification);
    window.addEventListener(
      'wc-notification-dismiss',
      this.handleWindowDismiss,
    );
  }

  disconnectedCallback() {
    window.removeEventListener(
      'wc-notification',
      this.handleWindowNotification,
    );
    window.removeEventListener(
      'wc-notification-dismiss',
      this.handleWindowDismiss,
    );
    super.disconnectedCallback();
  }

  private _hideNotification(id: string) {
    this.notifications = this.notifications.map(n =>
      n.id === id ? { ...n, hide: true } : n,
    );
  }

  private _handleDismiss(id: string) {
    this._hideNotification(id);
    this.dispatchEvent(
      new CustomEvent('notification-manager-dismiss', {
        detail: { id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleAction(id: string) {
    this.dispatchEvent(
      new CustomEvent('notification-manager-action', {
        detail: { id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderNotification(n: NotificationEntry) {
    return html`
      <div
        id=${n.id}
        class=${classMap({ notification: true, hidden: n.hide })}
        style=${n.width ? `width: ${n.width}` : nothing}
      >
        <wc-notification
          variant=${n.variant}
          ?dismissible=${n.dismissible}
          managed
          action=${n.action ?? nothing}
          @notification-dismiss=${() => this._handleDismiss(n.id)}
          @notification-action-click=${() => this._handleAction(n.id)}
        >
          <span slot="title">${n.title}</span>
          ${n.subtitle
            ? html`<span slot="subtitle">${n.subtitle}</span>`
            : nothing}
        </wc-notification>
      </div>
    `;
  }

  render() {
    return html`
      <div
        class=${classMap({
          'notification-manager': true,
          [`position-${this.position}`]: true,
        })}
      >
        ${this.notifications.map(n => this.renderNotification(n))}
      </div>
    `;
  }
}
