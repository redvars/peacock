import { LitElement } from 'lit';
type AlertVariant = 'note' | 'info' | 'success' | 'warning' | 'error';
/**
 * @label Alert
 * @tag wc-alert
 * @rawTag alert
 * @summary Alerts show short, prominent contextual messages with optional icon and description.
 *
 * @cssprop --alert-container-color - Background color of the alert container.
 * @cssprop --alert-label-text-color - Label text color.
 * @cssprop --alert-description-text-color - Description text color.
 * @cssprop --alert-icon-color - Icon color.
 * @cssprop --alert-border-radius - Border radius of the alert surface.
 *
 * @example
 * ```html
 * <wc-alert variant="note" description="Use semantic roles that preserve a 3:1 contrast ratio."></wc-alert>
 * ```
 * @tags display, feedback
 */
export declare class Alert extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Visual intent of the alert.
     */
    variant: AlertVariant;
    /**
     * Optional explicit label text. Falls back to a variant-based label.
     */
    label?: string;
    /**
     * Optional explicit icon name. Falls back to a variant-based icon.
     */
    icon?: string;
    /**
     * Optional description text when a default slot is not provided.
     */
    description: string;
    private get resolvedLabel();
    private get resolvedIcon();
    render(): import("lit-html").TemplateResult<1>;
}
export {};
