import { LitElement } from 'lit';
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
 * <wc-snackbar preview message="Message archived" action-label="Undo"></wc-snackbar>
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
    /** When true, a dismiss icon button is shown on the trailing end. */
    showCloseIcon: boolean;
    /** Auto-hide duration in milliseconds. Set to `0` to disable auto-hide. */
    duration: number;
    /** When true, the snackbar content is allowed to wrap to multiple lines. */
    multiline: boolean;
    /** When true, renders the snackbar in a static preview state (always visible, no animation). */
    preview: boolean;
    /** True while the exit animation is running before the snackbar fully closes. */
    private dismissing;
    /** Timer handle for the auto-hide timeout. */
    private hideTimer;
    /** Timer handle for the exit animation duration timeout. */
    private exitTimer;
    private readonly handleGlobalSnackbarOpen;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected updated(changedProperties: Map<string, unknown>): void;
    show(): void;
    hide(): void;
    private close;
    private completeDismiss;
    private dispatchActionEvent;
    private handleActionClick;
    private handleCloseClick;
    private clearTimer;
    private clearExitTimer;
    private handleAnimationEnd;
    private scheduleAutoHide;
    render(): import("lit-html").TemplateResult<1>;
}
