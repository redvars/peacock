import { LitElement, type PropertyValues } from 'lit';
import type { CloseReason } from '../__internal/controllers/overlay-controller.js';
export type SnackbarIntent = 'info' | 'success' | 'warning' | 'danger';
/** The reasons `close` carries for a snackbar. */
export type SnackbarCloseReason = Extract<CloseReason, 'escape' | 'action' | 'timeout' | 'api'>;
/**
 * @label Snackbar
 * @tag wc-snackbar
 * @rawTag snackbar
 * @summary A brief message at the bottom of the screen about something the app did, with an optional action, that hides itself.
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
export declare class Snackbar extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    private static readonly GLOBAL_OPEN_EVENT;
    private static readonly EXIT_ANIMATION_MS;
    /** Whether the snackbar is currently visible. */
    open: boolean;
    /** The message text to display. Can also be provided via the default slot. */
    message: string;
    /** Label for the optional action button. When empty, no action button is rendered. */
    actionLabel: string;
    /** Meaning of the message: `info`, `success`, `warning` or `danger`, with a matching icon. Unset, no icon. */
    intent?: SnackbarIntent;
    /** Shows a close button, and lets Escape close the snackbar while focus is inside it. */
    dismissible: boolean;
    /**
     * Auto-hide duration in milliseconds. Set to `0` to disable auto-hide. A snackbar with an
     * action never hides by itself.
     */
    duration: number;
    /** When true, the snackbar content is allowed to wrap to multiple lines. */
    multiline: boolean;
    /**
     * Renders the snackbar in a static preview state (always visible, no animation).
     * @internal For the documentation demos only.
     */
    preview: boolean;
    /**
     * Set by `wc-notification-manager`: the snackbar renders in place inside the manager's top-layer
     * region instead of its own popover, and neither closes other snackbars nor is closed by them.
     */
    managed: boolean;
    /** True while the exit animation is running before the snackbar fully closes. */
    private dismissing;
    /** The positioned layer that is shown in the top layer as a popover. */
    private layer?;
    /** Timer handle for the auto-hide timeout. */
    private hideTimer;
    /** Timer handle for the exit animation duration timeout. */
    private exitTimer;
    /** Whether the pointer is over the snackbar (pauses the timer). */
    private hovered;
    /** Whether focus is inside the snackbar (pauses the timer). */
    private focused;
    /** Whether `close` already fired for the current close, so `open = false` does not fire it again. */
    private closeEventSent;
    /** Peacock's strings for the dismiss button and intent labels. */
    private readonly i18n;
    private readonly handleGlobalSnackbarOpen;
    /**
     * Escape closes a dismissible snackbar while focus is inside it. Listening on `window` in the
     * capture phase runs before the overlay controller's document listener, so Escape closes the
     * snackbar and not a modal underneath it.
     */
    private readonly handleWindowKeydown;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected updated(changed: PropertyValues<this>): void;
    /** Opens the snackbar, or brings an open one back in front and restarts its timer. */
    show(): void;
    /** Closes the snackbar (`close` reason `api`). */
    hide(): void;
    /** Whether the timer may close the snackbar: it has a duration and no action. */
    private get autoHides();
    private close;
    private dispatchClose;
    private completeDismiss;
    private handleActionClick;
    private handleCloseClick;
    private handleMouseEnter;
    private handleMouseLeave;
    private handleFocusIn;
    private handleFocusOut;
    private clearTimer;
    private clearExitTimer;
    private handleAnimationEnd;
    /**
     * Shows the layer in the top layer while the snackbar is open, and hides it otherwise.
     * With `raise`, an already showing layer is shown again so it moves above newer top-layer elements.
     */
    private syncLayer;
    /** (Re)starts the auto-hide timer with the full duration, unless it is paused or off. */
    private scheduleAutoHide;
    private renderIntentIcon;
    render(): import("lit-html").TemplateResult<1>;
}
