import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './snackbar.scss';

type SnackbarCloseReason = 'timeout' | 'dismiss' | 'action' | 'programmatic';

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
 *
 * @example
 * ```html
 * <wc-snackbar open message="Message archived" action-label="Undo"></wc-snackbar>
 * ```
 * @tags display, feedback
 */
export class Snackbar extends LitElement {
  static styles = [styles];

  @property({ type: Boolean, reflect: true }) open = false;

  @property({ type: String }) message = '';

  @property({ type: String, attribute: 'action-label' }) actionLabel = '';

  @property({ type: Boolean, attribute: 'show-close-icon' })
  showCloseIcon = false;

  @property({ type: Number }) duration = 4000;

  @property({ type: Boolean, reflect: true }) multiline = false;

  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  show() {
    this.open = true;
  }

  hide() {
    this.close('programmatic');
  }

  private close(reason: SnackbarCloseReason) {
    if (!this.open) {
      return;
    }

    this.open = false;
    this.dispatchEvent(
      new CustomEvent('snackbar-close', {
        detail: { reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private dispatchActionEvent() {
    this.dispatchEvent(
      new CustomEvent('snackbar-action', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleActionClick() {
    this.dispatchActionEvent();
    this.close('action');
  }

  private handleCloseClick() {
    this.close('dismiss');
  }

  private clearTimer() {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  private scheduleAutoHide() {
    this.clearTimer();
    if (!this.open || this.duration <= 0) {
      return;
    }

    this.hideTimer = setTimeout(() => {
      this.close('timeout');
    }, this.duration);
  }

  protected updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open')) {
      this.scheduleAutoHide();
    }
  }

  disconnectedCallback() {
    this.clearTimer();
    super.disconnectedCallback();
  }

  render() {
    const liveRole =
      this.actionLabel || this.showCloseIcon ? 'alert' : 'status';

    return html`
      <div
        class=${classMap({
          snackbar: true,
          open: this.open,
          multiline: this.multiline,
        })}
        role=${liveRole}
        aria-live="polite"
      >
        <div class="label">
          <slot>${this.message}</slot>
        </div>

        ${this.actionLabel
          ? html`<button class="action" type="button" @click=${this.handleActionClick}>
              ${this.actionLabel}
            </button>`
          : nothing}

        ${this.showCloseIcon
          ? html`<button
              class="close"
              type="button"
              aria-label="Dismiss notification"
              @click=${this.handleCloseClick}
            >
              <wc-icon name="close"></wc-icon>
            </button>`
          : nothing}
      </div>
    `;
  }
}
