import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './snackbar.scss';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { CloseReason } from '@/__internal/controllers/overlay-controller.js';
import { deprecate } from '@/__internal/utils/deprecate.js';

export type SnackbarIntent = 'info' | 'success' | 'warning' | 'danger';

/** The `snackbar-close` reasons from before `close` (deprecated event). */
type LegacyCloseReason = 'timeout' | 'dismiss' | 'action' | 'programmatic';

/** The reasons `close` carries for a snackbar. */
export type SnackbarCloseReason = Extract<
  CloseReason,
  'escape' | 'action' | 'timeout' | 'api'
>;

const INTENT_ICONS: Record<SnackbarIntent, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  danger: 'error',
};

/** The string key of each intent's label, read by screen readers before the message. */
const INTENT_LABEL_KEYS: Record<
  SnackbarIntent,
  'intentInfo' | 'intentSuccess' | 'intentWarning' | 'intentError'
> = {
  info: 'intentInfo',
  success: 'intentSuccess',
  warning: 'intentWarning',
  danger: 'intentError',
};

/**
 * @label Snackbar
 * @tag wc-snackbar
 * @rawTag snackbar
 * @summary Snackbars show brief, transient messages about app processes at the bottom of the screen.
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
 * @fires {CustomEvent<{reason: string}>} snackbar-close - Deprecated, use `close`. `detail.reason` is `"timeout"`, `"action"`, `"dismiss"` (close button or Escape) or `"programmatic"`.
 * @fires {CustomEvent} snackbar-action - Deprecated, use `action`.
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
@IndividualComponent
export class Snackbar extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  private static readonly GLOBAL_OPEN_EVENT = 'wc-snackbar-will-open';

  private static readonly EXIT_ANIMATION_MS = 180;

  // ── Properties ───────────────────────────────────────────────────────────

  /** Whether the snackbar is currently visible. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** The message text to display. Can also be provided via the default slot. */
  @property({ type: String }) message = '';

  /** Label for the optional action button. When empty, no action button is rendered. */
  @property({ type: String, attribute: 'action-label' }) actionLabel = '';

  /** Meaning of the message: `info`, `success`, `warning` or `danger`, with a matching icon. Unset, no icon. */
  @property({ type: String, reflect: true }) intent?: SnackbarIntent;

  /** Shows a close button, and lets Escape close the snackbar while focus is inside it. */
  @property({ type: Boolean, reflect: true }) dismissible = false;

  /** @deprecated Use `dismissible`. */
  @property({ type: Boolean, attribute: 'show-close-icon' })
  showCloseIcon = false;

  /**
   * Auto-hide duration in milliseconds. Set to `0` to disable auto-hide. A snackbar with an
   * action never hides by itself.
   */
  @property({ type: Number }) duration = 4000;

  /** When true, the snackbar content is allowed to wrap to multiple lines. */
  @property({ type: Boolean, reflect: true }) multiline = false;

  /** When true, renders the snackbar in a static preview state (always visible, no animation). */
  @property({ type: Boolean, reflect: true }) preview = false;

  /**
   * Set by `wc-notification-manager`: the snackbar renders in place inside the manager's top-layer
   * region instead of its own popover, and neither closes other snackbars nor is closed by them.
   */
  @property({ type: Boolean, reflect: true }) managed = false;

  // ── State ────────────────────────────────────────────────────────────────

  /** True while the exit animation is running before the snackbar fully closes. */
  @state() private dismissing = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  /** The positioned layer that is shown in the top layer as a popover. */
  @query('.layer') private layer?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Timer handle for the auto-hide timeout. */
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  /** Timer handle for the exit animation duration timeout. */
  private exitTimer: ReturnType<typeof setTimeout> | null = null;

  /** Whether the pointer is over the snackbar (pauses the timer). */
  private hovered = false;

  /** Whether focus is inside the snackbar (pauses the timer). */
  private focused = false;

  /** Whether `close` already fired for the current close, so `open = false` does not fire it again. */
  private closeEventSent = false;

  /** Peacock's strings for the dismiss button and intent labels. */
  private readonly i18n = new I18nController(this);

  private readonly handleGlobalSnackbarOpen = (event: Event) => {
    if (this.managed) return;
    const { source } = (event as CustomEvent<{ source?: Snackbar }>).detail;
    if (source && source !== this && !source.managed) {
      this.hide();
    }
  };

  /**
   * Escape closes a dismissible snackbar while focus is inside it. Listening on `window` in the
   * capture phase runs before the overlay controller's document listener, so Escape closes the
   * snackbar and not a modal underneath it.
   */
  private readonly handleWindowKeydown = (event: KeyboardEvent) => {
    if (
      event.key !== 'Escape' ||
      event.defaultPrevented ||
      !this.open ||
      this.dismissing ||
      !this.isDismissible ||
      !event.composedPath().includes(this)
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.close('escape', 'dismiss');
  };

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(
      Snackbar.GLOBAL_OPEN_EVENT,
      this.handleGlobalSnackbarOpen,
    );
    window.addEventListener('keydown', this.handleWindowKeydown, true);
  }

  disconnectedCallback() {
    document.removeEventListener(
      Snackbar.GLOBAL_OPEN_EVENT,
      this.handleGlobalSnackbarOpen,
    );
    window.removeEventListener('keydown', this.handleWindowKeydown, true);
    this.clearExitTimer();
    this.clearTimer();
    this.syncLayer();
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('showCloseIcon') && this.showCloseIcon) {
      deprecate('wc-snackbar', '`show-close-icon`', '`dismissible`');
    }
  }

  protected override updated(changed: PropertyValues<this>) {
    if (
      changed.has('open') ||
      changed.has('preview') ||
      changed.has('managed')
    ) {
      this.syncLayer();
    }

    if (changed.has('open')) {
      if (this.open) {
        this.closeEventSent = false;
        if (!this.managed) {
          document.dispatchEvent(
            new CustomEvent(Snackbar.GLOBAL_OPEN_EVENT, {
              detail: { source: this },
            }),
          );
        }
        this.dispatchEvent(
          new CustomEvent('open', { bubbles: true, composed: true }),
        );
      } else if (changed.get('open') === true) {
        // Closed by `open = false` rather than through `close()`.
        this.clearExitTimer();
        this.dismissing = false;
        if (!this.closeEventSent) this.dispatchClose('api', 'programmatic');
        this.closeEventSent = false;
      }
    }

    if (
      changed.has('open') ||
      changed.has('duration') ||
      changed.has('actionLabel')
    ) {
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
    this.close('api', 'programmatic');
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private get isDismissible() {
    return this.dismissible || this.showCloseIcon;
  }

  /** Whether the timer may close the snackbar: it has a duration and no action. */
  private get autoHides() {
    return this.duration > 0 && !this.actionLabel;
  }

  private close(reason: SnackbarCloseReason, legacyReason: LegacyCloseReason) {
    if (!this.open || this.dismissing) {
      return;
    }

    this.clearTimer();
    this.dismissing = true;
    this.clearExitTimer();
    this.exitTimer = setTimeout(() => {
      this.completeDismiss();
    }, Snackbar.EXIT_ANIMATION_MS);

    this.closeEventSent = true;
    this.dispatchClose(reason, legacyReason);
  }

  private dispatchClose(
    reason: SnackbarCloseReason,
    legacyReason: LegacyCloseReason,
  ) {
    this.dispatchEvent(
      new CustomEvent('close', {
        detail: { reason },
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent('snackbar-close', {
        detail: { reason: legacyReason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private completeDismiss() {
    this.clearExitTimer();
    this.dismissing = false;
    // A hidden surface gets no mouseleave or focusout, so start the next open unpaused.
    this.hovered = false;
    this.focused = false;
    this.open = false;
  }

  private handleActionClick() {
    this.dispatchEvent(
      new CustomEvent('action', { bubbles: true, composed: true }),
    );
    this.dispatchEvent(
      new CustomEvent('snackbar-action', { bubbles: true, composed: true }),
    );
    this.close('action', 'action');
  }

  private handleCloseClick() {
    this.close('action', 'dismiss');
  }

  private handleMouseEnter() {
    this.hovered = true;
    this.clearTimer();
  }

  private handleMouseLeave() {
    this.hovered = false;
    this.scheduleAutoHide();
  }

  private handleFocusIn() {
    this.focused = true;
    this.clearTimer();
  }

  private handleFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (next && (this.contains(next) || this.shadowRoot?.contains(next))) {
      return;
    }
    this.focused = false;
    this.scheduleAutoHide();
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

  /**
   * Shows the layer in the top layer while the snackbar is open, and hides it otherwise.
   * With `raise`, an already showing layer is shown again so it moves above newer top-layer elements.
   */
  private syncLayer(raise = false) {
    const { layer } = this;
    if (
      !layer ||
      typeof layer.showPopover !== 'function' ||
      !layer.hasAttribute('popover')
    ) {
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
  private scheduleAutoHide() {
    this.clearTimer();
    if (
      !this.open ||
      this.dismissing ||
      !this.autoHides ||
      this.hovered ||
      this.focused
    ) {
      return;
    }

    this.hideTimer = setTimeout(() => {
      this.close('timeout', 'timeout');
    }, this.duration);
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderIntentIcon() {
    if (!this.intent || !(this.intent in INTENT_ICONS)) return nothing;
    return html`<wc-icon
      class="intent-icon"
      name=${INTENT_ICONS[this.intent]}
      aria-hidden="true"
    ></wc-icon>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const hasIntent = !!this.intent && this.intent in INTENT_LABEL_KEYS;
    const inPlace = this.preview || this.managed;

    return html`
      <div class="layer" popover=${inPlace ? nothing : 'manual'}>
        <div
          class=${classMap({
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
              ? html`<span class="sr-only"
                  >${this.i18n.t(INTENT_LABEL_KEYS[this.intent])}:
                </span>`
              : nothing}
            <slot>${this.message}</slot>
          </div>

          ${this.actionLabel
            ? html`<wc-button
                class="action"
                variant="text"
                size="sm"
                @click=${this.handleActionClick}
              >
                ${this.actionLabel}
              </wc-button>`
            : nothing}
          ${this.isDismissible
            ? html`<wc-icon-button
                class="close"
                variant="text"
                size="sm"
                shape="round"
                aria-label=${this.i18n.t('dismissNotification')}
                @click=${this.handleCloseClick}
              >
                <wc-icon name="close"></wc-icon>
              </wc-icon-button>`
            : nothing}
        </div>
      </div>
    `;
  }
}
