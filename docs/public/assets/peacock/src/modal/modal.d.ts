import { LitElement, nothing } from 'lit';
type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'fullscreen';
/**
 * @label Modal
 * @tag wc-modal
 * @rawTag modal
 * @summary A dialog/modal for displaying content in a layer above the page, with optional header, body, and footer slots.
 *
 * @cssprop --modal-container-color - Background color of the dialog container.
 * @cssprop --modal-scrim-color - Color of the scrim backdrop.
 * @cssprop --modal-shape - Corner radius of the dialog container.
 * @cssprop --modal-min-width - Minimum width of the dialog.
 * @cssprop --modal-max-width - Maximum width of the dialog.
 * @cssprop --modal-max-height - Maximum height of the dialog.
 *
 * @example
 * ```html
 * MODAL
 * ```
 * @tags overlay, dialog, feedback
 */
export declare class Modal extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Whether the modal is open. */
    open: boolean;
    /** Heading text shown in the modal header. */
    heading: string;
    /** Optional subheading / label text shown above the heading. */
    subheading: string;
    /**
     * Size of the modal dialog.
     * - `"xs"`: Extra-small.
     * - `"sm"`: Small.
     * - `"md"`: Medium (default).
     * - `"lg"`: Large.
     * - `"fullscreen"`: Full-screen dialog.
     */
    size: ModalSize;
    /** When true, hides the close button in the header. */
    hideClose: boolean;
    /** When true, renders a loading overlay inside the modal. */
    showLoader: boolean;
    /** When true, clicking the scrim will not close the modal. */
    noScrimClose: boolean;
    private _visible;
    show(): void;
    hide(): void;
    private _close;
    private _handleScrimClick;
    private _handleCloseClick;
    private readonly _handleKeydown;
    protected updated(changedProperties: Map<string, unknown>): void;
    disconnectedCallback(): void;
    private _handleAnimationEnd;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
}
export {};
