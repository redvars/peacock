import { LitElement } from 'lit';
type AlertIntent = 'note' | 'info' | 'success' | 'warning' | 'danger';
/**
 * @label Alert
 * @tag wc-alert
 * @rawTag alert
 * @summary A short, prominent message in the page, with an optional icon, action and close button.
 *
 * @overview
 * <p>An alert is part of the page. For a transient message use <code>wc-snackbar</code>, or
 * <code>wc-notification-manager</code> for a queue of them.</p>
 * <p>An alert is not a live region by default, so an alert that is on the page when it loads is
 * read in the normal reading order and not announced. Set <code>live="polite"</code> (status) or
 * <code>live="assertive"</code> (alert) on an alert you add or change while the page is in use.</p>
 * <p>With <code>dismissible</code> a close button fires a cancelable <code>close</code> event with
 * <code>reason: 'action'</code> and then hides the alert (sets <code>hidden</code>). Call
 * <code>preventDefault()</code> on the event to keep it, for example to remove it yourself.</p>
 *
 * @slot - The description. Overrides `description`.
 * @slot label - The label before the description. Overrides the intent's label.
 * @slot icon - The leading icon. Overrides the intent's icon.
 * @slot action - Buttons at the end of the alert, for example `<wc-button variant="text" size="sm">`.
 *
 * @fires {CustomEvent<{reason: 'action'}>} close - Fired, cancelable, when the close button is pressed. The alert hides unless the event is cancelled.
 *
 * @cssprop --alert-container-color - Background color of the alert container.
 * @cssprop --alert-label-text-color - Label text color.
 * @cssprop --alert-description-text-color - Description text color.
 * @cssprop --alert-icon-color - Icon color.
 * @cssprop --alert-border-radius - Border radius of the alert surface.
 *
 * @example
 * ```html
 * <wc-alert intent="warning" dismissible description="Your trial ends in 3 days.">
 *   <wc-button slot="action" variant="text" size="sm">Upgrade</wc-button>
 * </wc-alert>
 * ```
 * @tags display, feedback
 */
export declare class Alert extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Meaning of the alert: `note` (neutral, the default), `info`, `success`, `warning` or `danger`.
     */
    intent?: AlertIntent;
    /**
     * Optional explicit label text. Falls back to the intent's label.
     */
    label?: string;
    /**
     * Optional explicit icon name. Falls back to the intent's icon.
     */
    icon?: string;
    /**
     * Optional description text when a default slot is not provided.
     */
    description: string;
    /** Shows a close button; pressing it fires `close` and hides the alert. */
    dismissible: boolean;
    /**
     * Makes the alert a live region, for alerts added or changed while the page is in use:
     * `polite` (role `status`) or `assertive` (role `alert`). Unset, the alert is not announced.
     */
    live?: 'polite' | 'assertive';
    /** Whether the `action` slot has content. */
    private hasAction;
    /** Peacock's strings for the intent labels and the close button. */
    private readonly i18n;
    /** `intent`, else `note`. */
    private get resolvedIntent();
    private get resolvedLabel();
    private get resolvedIcon();
    private get liveRole();
    private handleActionSlotChange;
    private handleCloseClick;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
