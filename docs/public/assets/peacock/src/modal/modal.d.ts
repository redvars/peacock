import { LitElement } from 'lit';
type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'fullscreen';
/**
 * @label Modal
 * @tag wc-modal
 * @rawTag modal
 * @summary A dialog/modal for displaying content in a layer above the page, with optional header, body, and footer slots.
 * @overview
 * <p>The modal opens a native <code>&lt;dialog&gt;</code> with <code>showModal()</code>, so it renders in the
 * browser's top layer: above sticky headers, app bars, cards and any stacking context on the page,
 * whatever their z-index. Menus, selects and tooltips opened inside the modal render above it.</p>
 *
 * @cssprop --modal-container-color - Background color of the dialog container.
 * @cssprop --modal-scrim-color - Color of the scrim backdrop.
 * @cssprop --modal-shape - Corner radius of the dialog container.
 * @cssprop --modal-min-width - Minimum width of the dialog.
 * @cssprop --modal-max-width - Maximum width of the dialog.
 * @cssprop --modal-max-height - Maximum height of the dialog.
 *
 * @fires modal-close - Fired when the modal closes. `detail.reason` is `"close-button"`, `"scrim"`, `"escape"` or `"programmatic"`.
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
    private _dialog?;
    private _panel?;
    disconnectedCallback(): void;
    protected updated(changedProperties: Map<string, unknown>): void;
    /** Opens the modal. */
    show(): void;
    /** Closes the modal. */
    hide(): void;
    /** Opens the native dialog in the top layer, or closes it once the exit animation ends. */
    private _syncDialog;
    private _close;
    /** Escape: close through `open` so the property stays the source of truth. */
    private _handleCancel;
    /** The browser closed the dialog by itself (for example a forced Escape): keep `open` in step. */
    private _handleNativeClose;
    /** A click that lands outside the dialog container, not on its content, is a scrim click. */
    private _handleDialogClick;
    private _handleCloseClick;
    private _renderHeader;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
