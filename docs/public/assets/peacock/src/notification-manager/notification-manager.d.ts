import { LitElement } from 'lit';
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
 *   window.dispatchEvent(new CustomEvent('notification', {
 *     detail: { title: 'Record saved', variant: 'success', dismissible: true }
 *   }));
 * </script>
 * ```
 * @tags display, feedback
 */
export declare class NotificationManager extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Name of this manager instance. Only notifications whose `target` matches
     * this name (or whose `target` is absent and this manager's `name` is
     * `'global'`) will be handled.
     */
    name: string;
    /**
     * Screen position where notifications are stacked.
     */
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    private notifications;
    private readonly handleWindowNotification;
    private readonly handleWindowDismiss;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _hideNotification;
    private _handleDismiss;
    private _handleAction;
    private renderNotification;
    render(): import("lit-html").TemplateResult<1>;
}
