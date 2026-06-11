import { LitElement, nothing } from 'lit';
type NotificationVariant = 'success' | 'error' | 'info' | 'warning';
/**
 * @label Notification
 * @tag wc-notification
 * @rawTag notification
 * @summary Notifications communicate contextual status, errors, warnings, and success messages.
 *
 * @cssprop --notification-container-color - Surface color for the notification container.
 * @cssprop --notification-text-color - Label and supporting text color.
 * @cssprop --notification-leading-icon-color - Leading state icon color.
 * @cssprop --notification-accent-color - Start border color for status emphasis.
 * @cssprop --notification-border-radius - Border radius of the notification container.
 *
 * @fires {CustomEvent} notification-dismiss - Fired when the notification is dismissed.
 * @fires {CustomEvent} notification-action-click - Fired when the action button is clicked.
 *
 * @example
 * ```html
 * <wc-notification variant="success" action="Undo" dismissible>
 *   <span slot="title">Record saved</span>
 * </wc-notification>
 * ```
 * @tags display, feedback
 */
export declare class Notification extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * If true, content and actions are laid out in a single row.
     */
    inline: boolean;
    /**
     * The visual variant of the notification.
     */
    variant: NotificationVariant;
    /**
     * Enables a high contrast appearance.
     */
    highContrast: boolean;
    /**
     * If true, renders a dismiss icon button.
     */
    dismissible: boolean;
    /**
     * Action label text. When provided, an action button is shown.
     */
    action: string;
    /**
     * If true, the host controls visibility when dismissed.
     */
    managed: boolean;
    private isHidden;
    private hasSubtitle;
    /**
     * Programmatically reveals the notification.
     */
    show(): void;
    /**
     * Programmatically dismisses the notification.
     */
    dismiss(): void;
    private get variantIcon();
    private get variantLabel();
    private emitActionClick;
    private hideAndEmitDismiss;
    private handleSubtitleSlotChange;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
}
export {};
