import { LitElement } from 'lit';
import type { SnackbarIntent } from '../snackbar/snackbar.js';
/** Where the toasts stack, in logical directions. */
export type ToastPlacement = 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';
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
    /** Shows a close button. */
    dismissible?: boolean;
    /** Milliseconds before the toast hides itself; `0` keeps it. Default 5000. */
    duration?: number;
    /** CSS width of the toast, for example `24rem`. */
    width?: string;
    /** Name of the manager that shows it; unset, the manager named `global`. Window events only. */
    target?: string;
    /** Called with the toast's id once it is queued. Window events only. */
    callback?: (id: string) => void;
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
 *
 * @fires {CustomEvent<{id: string, reason: 'timeout' | 'action' | 'escape' | 'api'}>} close - Fired when a toast starts to close.
 * @fires {CustomEvent<{id: string}>} action - Fired when the action button of a toast is pressed.
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
export declare class NotificationManager extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Name of this manager instance. Only toasts whose `target` matches
     * this name (or whose `target` is absent and this manager's `name` is
     * `'global'`) will be handled.
     */
    name: string;
    /**
     * Where the toasts stack: `top-start`, `top-center`, `top-end`, `bottom-start`,
     * `bottom-center` or `bottom-end` (the default).
     */
    placement?: ToastPlacement;
    /** The queued toasts, oldest first. */
    private toasts;
    /** The region shown in the top layer as a popover. */
    private region?;
    /** Removes a toast once its snackbar has closed (its `open` attribute is gone). */
    private readonly closedObserver;
    private readonly handleWindowToast;
    private readonly handleWindowDismiss;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected updated(changed: Map<PropertyKey, unknown>): void;
    /** Queues a toast and returns its id. */
    show(options?: ToastOptions): string;
    /** Closes a toast (`close` reason `api`); it is removed once its exit animation ends. */
    hide(id: string): void;
    /** `placement`, else `bottom-end`. */
    private get resolvedPlacement();
    private snackbarFor;
    /**
     * Shows the region in the top layer while there are toasts. With `raise`, a showing region is
     * shown again so it moves above newer top-layer elements.
     */
    private syncRegion;
    private handleToastClose;
    private handleToastAction;
    private renderToast;
    render(): import("lit-html").TemplateResult<1>;
}
