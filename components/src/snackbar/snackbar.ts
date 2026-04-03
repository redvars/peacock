import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
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
 * @cssprop --snackbar-offset-inline - Inline offset from viewport edges.
 * @cssprop --snackbar-offset-bottom - Bottom offset from viewport edge.
 * @cssprop --snackbar-z-index - Stacking order for the snackbar.
 *
 * @example
 * ```html
 * <wc-snackbar open message="Message archived" action-label="Undo"></wc-snackbar>
 * ```
 * @tags display, feedback
 */
export class Snackbar extends LitElement {
  static styles = [styles];

  private static readonly GLOBAL_OPEN_EVENT = 'wc-snackbar-will-open';

  private static readonly EXIT_ANIMATION_MS = 180;

  @property({ type: Boolean, reflect: true }) open = false;

  @property({ type: String }) message = '';

  @property({ type: String, attribute: 'action-label' }) actionLabel = '';

  @property({ type: Boolean, attribute: 'show-close-icon' })
  showCloseIcon = false;

  @property({ type: Number }) duration = 4000;

  @property({ type: Boolean, reflect: true }) multiline = false;

  @state() private dismissing = false;

  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  private exitTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly handleGlobalSnackbarOpen = (
    event: Event,
  ) => {
    const { source } = (event as CustomEvent<{ source?: Snackbar }>).detail;
    if (source && source !== this) {
      this.hide();
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(
      Snackbar.GLOBAL_OPEN_EVENT,
      this.handleGlobalSnackbarOpen,
    );
  }

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

  private close(reason: SnackbarCloseReason) {
    if (!this.open || this.dismissing) {
      return;
    }

    this.clearTimer();
    this.dismissing = true;
    this.clearExitTimer();
    this.exitTimer = setTimeout(() => {
      this.completeDismiss();
    }, Snackbar.EXIT_ANIMATION_MS);

    this.dispatchEvent(
      new CustomEvent('snackbar-close', {
        detail: { reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private completeDismiss() {
    this.clearExitTimer();
    this.dismissing = false;
    this.open = false;
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

  private clearExitTimer() {
    if (this.exitTimer !== null) {
      clearTimeout(this.exitTimer);
      this.exitTimer = null;
    }
  }

  private handleAnimationEnd(event: AnimationEvent) {
    if (event.animationName === 'snackbar-exit' && this.dismissing) {
      this.completeDismiss();
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
      if (this.open) {
        document.dispatchEvent(
          new CustomEvent(Snackbar.GLOBAL_OPEN_EVENT, {
            detail: { source: this },
          }),
        );
      }

      this.scheduleAutoHide();
    }
  }

  disconnectedCallback() {
    document.removeEventListener(
      Snackbar.GLOBAL_OPEN_EVENT,
      this.handleGlobalSnackbarOpen,
    );
    this.clearExitTimer();
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
          ? html`<wc-button class="action" variant='text' size='small' @click=${this.handleActionClick}>
              ${this.actionLabel}
            </wc-button>`
          : nothing}

        ${this.showCloseIcon
          ? html`<wc-icon-button
              class="close"
              variant='text' 
              size='small'
              aria-label="Dismiss notification"
              @click=${this.handleCloseClick}
              name="close-icon"
            >
            </button>`
          : nothing}
      </div>
    `;
  }
}
