import { LitElement, type PropertyValues } from 'lit';
type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'fullscreen';
/**
 * @label Modal
 * @tag wc-modal
 * @rawTag modal
 * @summary A dialog for content in a layer above the page, with optional header, body and footer.
 * @overview
 * <p>The modal opens a native <code>&lt;dialog&gt;</code> with <code>showModal()</code>, so it renders in the
 * browser's top layer: above sticky headers, app bars, cards and any stacking context on the page,
 * whatever their z-index. Menus, selects and tooltips opened inside the modal render above it.</p>
 * <p>While it is open the rest of the page is inert and does not scroll; focus moves to the first
 * element with <code>autofocus</code> inside it, and returns where it was when the modal closes.
 * Escape and a click on the scrim close it (<code>no-light-dismiss</code> keeps it open on scrim clicks).</p>
 *
 * @cssprop --modal-container-color - Background color of the dialog container.
 * @cssprop --modal-scrim-color - Color of the scrim backdrop.
 * @cssprop --modal-shape - Corner radius of the dialog container.
 * @cssprop --modal-min-width - Minimum width of the dialog.
 * @cssprop --modal-max-width - Maximum width of the dialog.
 * @cssprop --modal-max-height - Maximum height of the dialog.
 *
 * @fires {CustomEvent} open - Fired when the modal opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Fired when the modal closes: Escape, a scrim click, the close button, or `hide()`.
 *
 * @example
 * ```html
 * <wc-button onclick="document.getElementById('confirm').show()">Delete project</wc-button>
 * <wc-modal id="confirm" heading="Delete project?">
 *   This deletes the project and its 12 files. You can't undo this.
 *   <wc-button slot="footer" variant="text" onclick="this.closest('wc-modal').hide()">Cancel</wc-button>
 *   <wc-button slot="footer" color="danger" autofocus>Delete</wc-button>
 * </wc-modal>
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
    /** Hides the close button in the header. */
    hideClose: boolean;
    /** Shows a loading overlay inside the modal. */
    loading: boolean;
    /** Keeps the modal open when the scrim is clicked. Escape still closes it. */
    noLightDismiss: boolean;
    private _dialog?;
    private _panel?;
    /** Peacock's strings for the close button label. */
    private readonly i18n;
    private readonly overlay;
    protected updated(changed: PropertyValues<this>): void;
    /** Opens the modal. */
    show(): void;
    /** Closes the modal. */
    hide(): void;
    private _close;
    /** The native Escape `cancel`: the overlay controller handles Escape, so keep `open` in charge. */
    private _handleCancel;
    /**
     * The browser closed the dialog by itself: keep `open` in step. A `close` from content inside
     * the dialog (a popover, menu or select closing; they bubble and are composed) is not ours.
     */
    private _handleNativeClose;
    /** A click that lands outside the dialog container, not on its content, is a scrim click. */
    private _handleDialogClick;
    private _handleCloseClick;
    private _renderHeader;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
