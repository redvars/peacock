import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';

import IndividualComponent from '@/IndividualComponent.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import type { CloseReason } from '@/__internal/controllers/overlay-controller.js';
import type { SnackbarIntent } from '@/snackbar/snackbar.js';
import styles from './notification-manager.scss';

/** Where the toasts stack, in logical directions. */
export type ToastPlacement =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

/** The physical `position` values from before `placement` (deprecated). */
type LegacyPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

/** The meaning values `variant` took before `intent` (deprecated). */
type LegacyVariant = 'success' | 'error' | 'info' | 'warning';

const PLACEMENTS: ToastPlacement[] = [
  'top-start',
  'top-center',
  'top-end',
  'bottom-start',
  'bottom-center',
  'bottom-end',
];

const LEGACY_POSITIONS: Record<LegacyPosition, ToastPlacement> = {
  'top-right': 'top-end',
  'top-left': 'top-start',
  'bottom-right': 'bottom-end',
  'bottom-left': 'bottom-start',
};

const LEGACY_VARIANTS: Record<LegacyVariant, SnackbarIntent> = {
  success: 'success',
  error: 'danger',
  info: 'info',
  warning: 'warning',
};

const INTENTS: SnackbarIntent[] = ['info', 'success', 'warning', 'danger'];

/** The window event that shows a toast, and the one that hides toasts. */
const TOAST_EVENT = 'peacock-toast';
const TOAST_DISMISS_EVENT = 'peacock-toast-dismiss';

/** The names they had before (deprecated); `notification-dismiss` collided with wc-notification's own event. */
const LEGACY_TOAST_EVENT = 'notification';
const LEGACY_TOAST_DISMISS_EVENT = 'notification-dismiss';

/** What a toast shows; the `detail` of a `peacock-toast` window event, or the argument of `show()`. */
export interface ToastOptions {
  /** The message, shown in bold when there is a `subtitle`. */
  title?: string;
  /** Supporting text under the title. */
  subtitle?: string;
  /** Label of the action button. A toast with an action does not hide by itself. */
  action?: string;
  /** `info` (default), `success`, `warning` or `danger`. */
  intent?: SnackbarIntent;
  /** @deprecated Use `intent`; `error` is `danger`. */
  variant?: LegacyVariant;
  /** Shows a close button. */
  dismissible?: boolean;
  /** Milliseconds before the toast hides itself; `0` keeps it. Default 5000. */
  duration?: number;
  /** @deprecated Use `duration`. */
  timeout?: number;
  /** CSS width of the toast, for example `24rem`. */
  width?: string;
  /** Name of the manager that shows it; unset, the manager named `global`. Window events only. */
  target?: string;
  /** Called with the toast's id once it is queued. Window events only. */
  callback?: (id: string) => void;
}

type ToastEntry = {
  id: string;
  title: string;
  subtitle?: string;
  action?: string;
  intent: SnackbarIntent;
  dismissible: boolean;
  duration: number;
  width?: string;
};

type ToastEventDetail = ToastOptions & { processed?: boolean };

type ToastDismissDetail = { notifications?: string[]; target?: string };

let toastCounter = 0;
function nextId(): string {
  toastCounter += 1;
  return `wc-toast-${toastCounter}`;
}

function resolveIntent(options: ToastOptions): SnackbarIntent {
  if (options.intent && INTENTS.includes(options.intent)) return options.intent;
  if (options.variant && options.variant in LEGACY_VARIANTS) {
    return LEGACY_VARIANTS[options.variant];
  }
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
 * <p>Deprecated: the window events <code>notification</code> and <code>notification-dismiss</code> (the
 * second collided with <code>wc-notification</code>'s own event), <code>position</code>, and the toast
 * options <code>variant</code> and <code>timeout</code>.</p>
 *
 * @fires {CustomEvent<{id: string, reason: 'timeout' | 'action' | 'escape' | 'api'}>} close - Fired when a toast starts to close.
 * @fires {CustomEvent<{id: string}>} action - Fired when the action button of a toast is pressed.
 * @fires {CustomEvent<{id: string}>} notification-manager-action - Deprecated, use `action`.
 * @fires {CustomEvent<{id: string}>} notification-manager-dismiss - Deprecated, use `close`. Fired when a toast's close button is pressed or Escape closes it.
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
@IndividualComponent
export class NotificationManager extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * Name of this manager instance. Only toasts whose `target` matches
   * this name (or whose `target` is absent and this manager's `name` is
   * `'global'`) will be handled.
   */
  @property({ type: String, reflect: true }) name = 'global';

  /**
   * Where the toasts stack: `top-start`, `top-center`, `top-end`, `bottom-start`,
   * `bottom-center` or `bottom-end` (the default).
   */
  @property({ type: String, reflect: true }) placement?: ToastPlacement;

  /**
   * @deprecated Use `placement`: `top-right` is `top-end`, `top-left` `top-start`,
   * `bottom-right` `bottom-end`, `bottom-left` `bottom-start`.
   */
  @property({ type: String }) position?: LegacyPosition;

  // ── State ────────────────────────────────────────────────────────────────

  /** The queued toasts, oldest first. */
  @state() private toasts: ToastEntry[] = [];

  // ── Queries ──────────────────────────────────────────────────────────────

  /** The region shown in the top layer as a popover. */
  @query('.region') private region?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Removes a toast once its snackbar has closed (its `open` attribute is gone). */
  private readonly closedObserver = new MutationObserver(records => {
    const closed = new Set<string>();
    records.forEach(record => {
      const target = record.target as HTMLElement;
      const id = target.dataset.toastId;
      if (id && !target.hasAttribute('open')) closed.add(id);
    });
    if (closed.size > 0) {
      this.toasts = this.toasts.filter(toast => !closed.has(toast.id));
    }
  });

  private readonly handleWindowToast = (event: Event) => {
    const evt = event as CustomEvent<ToastEventDetail | null>;
    const detail = evt.detail ?? {};

    // Route by target: accept if target matches our name, or if we are global
    // and no specific target is set.
    const { target } = detail;
    const isForUs = target === this.name || (!target && this.name === 'global');

    if (!isForUs || detail.processed) {
      return;
    }

    if (event.type === LEGACY_TOAST_EVENT) {
      deprecate(
        'wc-notification-manager',
        'the `notification` window event',
        '`peacock-toast`',
      );
    }

    evt.stopPropagation();
    detail.processed = true;

    const id = this.show(detail);
    if (typeof detail.callback === 'function') {
      detail.callback(id);
    }
  };

  private readonly handleWindowDismiss = (event: Event) => {
    const { detail } = event as CustomEvent<ToastDismissDetail | null>;
    const ids = detail?.notifications;
    // wc-notification's own `notification-dismiss` also reaches the window, without ids.
    if (!Array.isArray(ids)) return;
    if (event.type === LEGACY_TOAST_DISMISS_EVENT) {
      deprecate(
        'wc-notification-manager',
        'the `notification-dismiss` window event',
        '`peacock-toast-dismiss`',
      );
    }
    ids.forEach(id => this.hide(id));
  };

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener(TOAST_EVENT, this.handleWindowToast);
    window.addEventListener(LEGACY_TOAST_EVENT, this.handleWindowToast);
    window.addEventListener(TOAST_DISMISS_EVENT, this.handleWindowDismiss);
    window.addEventListener(LEGACY_TOAST_DISMISS_EVENT, this.handleWindowDismiss);
    this.closedObserver.observe(this.renderRoot, {
      attributes: true,
      attributeFilter: ['open'],
      subtree: true,
    });
  }

  disconnectedCallback() {
    window.removeEventListener(TOAST_EVENT, this.handleWindowToast);
    window.removeEventListener(LEGACY_TOAST_EVENT, this.handleWindowToast);
    window.removeEventListener(TOAST_DISMISS_EVENT, this.handleWindowDismiss);
    window.removeEventListener(
      LEGACY_TOAST_DISMISS_EVENT,
      this.handleWindowDismiss,
    );
    this.closedObserver.disconnect();
    this.syncRegion();
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('position') && this.position) {
      deprecate('wc-notification-manager', '`position`', '`placement`');
    }
  }

  protected override updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has('toasts')) {
      const before = (changed.get('toasts') as ToastEntry[] | undefined) ?? [];
      // A new toast brings the region back above top-layer elements opened since.
      const added = this.toasts.some(
        toast => !before.some(old => old.id === toast.id),
      );
      this.syncRegion(added);
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Queues a toast and returns its id. */
  show(options: ToastOptions = {}): string {
    if (options.variant !== undefined) {
      deprecate('wc-notification-manager', 'the toast option `variant`', '`intent`');
    }
    if (options.timeout !== undefined) {
      deprecate('wc-notification-manager', 'the toast option `timeout`', '`duration`');
    }
    const toast: ToastEntry = {
      id: nextId(),
      title: options.title ?? '',
      subtitle: options.subtitle,
      action: options.action,
      intent: resolveIntent(options),
      dismissible: options.dismissible ?? false,
      duration: options.duration ?? options.timeout ?? 5000,
      width: options.width,
    };
    this.toasts = [...this.toasts, toast];
    return toast.id;
  }

  /** Closes a toast (`close` reason `api`); it is removed once its exit animation ends. */
  hide(id: string) {
    if (!this.toasts.some(toast => toast.id === id)) return;
    this.updateComplete.then(() => {
      this.snackbarFor(id)?.hide();
    });
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** `placement`, else the deprecated `position`, else `bottom-end`. */
  private get resolvedPlacement(): ToastPlacement {
    if (this.placement && PLACEMENTS.includes(this.placement)) {
      return this.placement;
    }
    if (this.position && this.position in LEGACY_POSITIONS) {
      return LEGACY_POSITIONS[this.position];
    }
    return 'bottom-end';
  }

  private snackbarFor(id: string) {
    return this.renderRoot.querySelector<HTMLElement & { hide(): void }>(
      `wc-snackbar[data-toast-id="${id}"]`,
    );
  }

  /**
   * Shows the region in the top layer while there are toasts. With `raise`, a showing region is
   * shown again so it moves above newer top-layer elements.
   */
  private syncRegion(raise = false) {
    const { region } = this;
    if (!region || typeof region.showPopover !== 'function') return;
    const shouldShow = this.toasts.length > 0 && this.isConnected;
    const showing = region.matches(':popover-open');
    if (showing && (!shouldShow || raise)) region.hidePopover();
    if (shouldShow && (!showing || raise)) region.showPopover();
  }

  private handleToastClose(id: string, event: Event) {
    event.stopPropagation();
    const { reason } = (event as CustomEvent<{ reason: CloseReason }>).detail;
    this.dispatchEvent(
      new CustomEvent('close', {
        detail: { id, reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleLegacyToastClose(id: string, event: Event) {
    event.stopPropagation();
    const { reason } = (event as CustomEvent<{ reason: string }>).detail;
    if (reason !== 'dismiss') return;
    this.dispatchEvent(
      new CustomEvent('notification-manager-dismiss', {
        detail: { id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleToastAction(id: string, event: Event, legacy: boolean) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent(legacy ? 'notification-manager-action' : 'action', {
        detail: { id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderToast(toast: ToastEntry) {
    return html`
      <wc-snackbar
        managed
        open
        data-toast-id=${toast.id}
        id=${toast.id}
        intent=${toast.intent}
        action-label=${toast.action ?? nothing}
        .duration=${toast.duration}
        ?dismissible=${toast.dismissible}
        ?multiline=${!!toast.subtitle}
        style=${toast.width ? `width: ${toast.width}` : nothing}
        @open=${(event: Event) => event.stopPropagation()}
        @close=${(event: Event) => this.handleToastClose(toast.id, event)}
        @snackbar-close=${(event: Event) =>
          this.handleLegacyToastClose(toast.id, event)}
        @action=${(event: Event) =>
          this.handleToastAction(toast.id, event, false)}
        @snackbar-action=${(event: Event) =>
          this.handleToastAction(toast.id, event, true)}
      >
        <span class="toast-text">
          <span class=${classMap({ 'toast-title': !!toast.subtitle })}
            >${toast.title}</span
          >
          ${toast.subtitle
            ? html`<span class="toast-subtitle">${toast.subtitle}</span>`
            : nothing}
        </span>
      </wc-snackbar>
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`
      <div
        class=${classMap({
          region: true,
          [`placement-${this.resolvedPlacement}`]: true,
        })}
        popover="manual"
      >
        ${repeat(
          this.toasts,
          toast => toast.id,
          toast => this.renderToast(toast),
        )}
      </div>
    `;
  }
}
