import {
  Component,
  ComponentInterface,
  Element,
  h,
  Host,
  Listen,
  Prop,
  State,
} from '@stencil/core';
import {
  getComponentIndex,
  isDarkMode,
  observeThemeChange,
} from '../../utils/utils';
import * as DOMPurify from 'dompurify';

const getNotificationIndex = (() => {
  let counter = 1;
  return function () {
    return `${counter++}`;
  };
})();

type Notification = {
  id: string;
  title: string;
  subtitle?: string;
  action?: string;
  width?: string;
  state: string;
  hide: boolean;
  timeout: number;
  dismissible: boolean;
};

/**
 * @label Notification Manager
 * @name notification-manager
 * @description The Notification Manager handles the organization and display of notifications within the application.
 * @category Informational
 * @tags notification
 * @img /assets/img/notification-manager.webp
 * @imgDark /assets/img/notification-manager-dark.webp
 */
@Component({
  tag: 'pc-notification-manager',
  styleUrl: 'notification-manager.scss',
  shadow: true,
})
export class NotificationManager implements ComponentInterface {
  @Element() elm!: HTMLElement;

  gid: string = getComponentIndex();

  @Prop({ reflect: true }) name: string = 'global';
  @Prop({ reflect: true }) position:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left' = 'bottom-right';

  @State() notifications: any = [];
  @State() isDarkMode: boolean = isDarkMode();

  @Listen('pc-notification', { target: 'window' })
  listenNotification(evt: CustomEvent) {
    if (
      (evt.detail.target === this.name || this.name === 'global') &&
      !evt.detail.procced
    ) {
      evt.preventDefault();
      evt.stopPropagation();
      evt.detail.procced = true;
      const notification: Notification = {
        id: `notification-${this.gid}-${getNotificationIndex()}`,
        hide: false,

        title: evt.detail.title,
        subtitle: evt.detail.subtitle,
        state: evt.detail.state,
        action: evt.detail.action,
        dismissible: evt.detail.dismissible,
        timeout: evt.detail.timeout,
        width: evt.detail.width,
      };
      this.notifications = this.notifications
        .concat([notification])
        .filter(n => !n.hide);

      if (evt.detail.callback) {
        evt.detail.callback(notification.id);
      }

      if (!notification.dismissible)
        setTimeout(() => {
          notification.hide = true;
          this.notifications = [...this.notifications];
        }, notification.timeout || 5000);
    }
  }

  @Listen('pc-notification-dismiss', { target: 'window' })
  listenNotificationDismiss(evt: CustomEvent) {
    const notifications = this.notifications.filter(n =>
      evt.detail.notifications.includes(n.id),
    );
    notifications.forEach(n => (n.hide = true));
    this.notifications = [...this.notifications];
  }

  componentWillLoad() {
    observeThemeChange(() => {
      this.isDarkMode = isDarkMode();
    });
  }

  renderNotification(notification) {
    return (
      <pc-notification
        state={notification.state}
        action={notification.action}
        managed={true}
        dismissible={notification.dismissible}
        style={{ width: notification.width }}
        onGoat-notification--dismiss={() => {
          notification.hide = true;
          this.notifications = [...this.notifications];
        }}
      >
        <div innerHTML={DOMPurify.sanitize(notification.title)} slot="title" />
        <div
          innerHTML={DOMPurify.sanitize(notification.subtitle)}
          slot="subtitle"
        />
      </pc-notification>
    );
  }

  render() {
    return (
      <Host>
        <div
          class={{
            'notification-manager': true,
            [`position-${this.position}`]: true,
          }}
        >
          {this.notifications.map(notification => (
            <div
              class={{ notification: true, hidden: notification.hide }}
              id={notification.id}
            >
              {this.renderNotification(notification)}
            </div>
          ))}
        </div>
      </Host>
    );
  }
}
