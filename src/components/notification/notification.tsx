import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  State,
} from '@stencil/core';
import { isDarkMode, observeThemeChange } from '../../utils/utils';

/**
 * @name Notification
 * @description Notifications are messages that communicate information to the user.
 * @category Informational
 * @tags notification
 * @example <goat-notification state="success">
 *               <div slot='title'>Successful saved the record</div>
 *             </goat-notification>
 */
@Component({
  tag: 'goat-notification',
  styleUrl: 'notification.scss',
  shadow: true,
})
export class Notification implements ComponentInterface {
  @Element() elm!: HTMLElement;

  /**
   * Whether the notification should be displayed inline
   */
  @Prop({ reflect: true }) inline: boolean = false;

  /**
   * The state of the notification.
   * Possible values are: 'success', 'error', 'info', 'warning'
   */
  @Prop({ reflect: true }) state: 'success' | 'error' | 'info' | 'warning' =
    'info';

  /**
   * Whether to use high contrast mode
   */
  @Prop() highContrast: boolean = false;

  /**
   * Whether the notification is dismissible
   */
  @Prop() dismissible: boolean = false;

  /**
   * Action to be displayed on the notification
   */
  @Prop() action: string;

  /**
   * Whether the notification is managed by the notification manager
   */
  @Prop() managed: boolean = false;

  /**
   * Emitted when the notification is dismissed
   */
  @Event({ eventName: 'goat-notification--dismiss' }) goatDismiss: EventEmitter;

  @Event({ eventName: 'goat-notification--action-click' })
  goatActionClick: EventEmitter;

  @State() hidden: boolean = false;
  @State() isDarkMode: boolean = isDarkMode();

  componentWillLoad() {
    observeThemeChange(() => {
      this.isDarkMode = isDarkMode();
    });
  }

  render() {
    return (
      <Host hidden={this.hidden}>
        <div
          class={{
            'notification': true,
            'inline': this.inline,
            'high-contrast': this.highContrast,
            [`state-${this.state}`]: true,
          }}
          role="alert"
        >
          <div class="state-icon">{this.renderStateIcon()}</div>
          <div class="content">
            <div class="content-text">
              <div class="title">
                <slot name="title" />
                <slot />
              </div>
              <div class="subtitle">
                <slot name="subtitle" />
              </div>
            </div>
            {this.#renderActions()}
          </div>

          {this.#renderCloseButtons()}
        </div>
      </Host>
    );
  }

  #renderActions() {
    if (this.action) {
      return (
        <div class="actions">
          <goat-button
            size="sm"
            class="action"
            variant={this.inline ? 'text' : 'outlined'}
            color={!this.highContrast || this.isDarkMode ? 'primary' : 'white'}
            onGoat-button--click={() => {
              this.goatActionClick.emit();
            }}
          >
            {this.action}
          </goat-button>
        </div>
      );
    }
  }

  #renderCloseButtons() {
    if (this.dismissible) {
      return (
        <div class="close-button-container">
          <goat-button
            class="close-button"
            aria-label="Close alert"
            variant="text"
            color="black"
            onGoat-button--click={evt => {
              evt.preventDefault();
              evt.stopPropagation();
              if (!this.managed) {
                this.hidden = true;
              }
              this.goatDismiss.emit(evt);
            }}
          >
            <goat-icon class="icon" size="1.25rem" name="close" />
          </goat-button>
        </div>
      );
    }
  }

  renderStateIcon() {
    if (this.state === 'success') {
      return (
        <goat-icon class="inherit" size={'1.25rem'} name="checkmark--filled" />
      );
    } else if (this.state === 'error') {
      return (
        <goat-icon class="inherit" size={'1.25rem'} name="error--filled" />
      );
    } else if (this.state === 'info') {
      return (
        <goat-icon
          class="inherit"
          size={'1.25rem'}
          name="information--filled"
        />
      );
    } else if (this.state === 'warning') {
      return (
        <goat-icon class="inherit" size={'1.25rem'} name="warning--filled" />
      );
    }
  }
}
