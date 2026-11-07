import { LitElement, type PropertyValues } from 'lit';
type SideSheetPlacement = 'start' | 'end';
/**
 * @label Side Sheet
 * @tag wc-side-sheet
 * @rawTag side-sheet
 * @summary A panel that slides in from the start or end edge of the screen with extra content, either modal over the page or beside it.
 * @overview
 * <p>The sheet renders a native <code>&lt;dialog&gt;</code>. The <code>modal</code> variant (the default)
 * opens it with <code>showModal()</code>: it renders in the browser's top layer above the page, with a
 * scrim; the rest of the page is inert and does not scroll; focus moves to the first element with
 * <code>autofocus</code> inside it and returns where it was when the sheet closes. Escape and a click
 * on the scrim close it (<code>no-light-dismiss</code> keeps it open on scrim clicks).</p>
 * <p>The <code>standard</code> variant opens the dialog with <code>show()</code>: it is not modal, stays
 * in the page flow beside the content (place it in a flex row), and does not trap focus, lock
 * scrolling or close on Escape.</p>
 * <p><code>placement</code> is logical: <code>end</code> is the right edge in left-to-right pages and
 * the left edge in right-to-left pages.</p>
 *
 * @cssprop --side-sheet-container-color - Background color of the sheet container.
 * @cssprop --side-sheet-scrim-color - Color of the modal scrim overlay.
 * @cssprop --side-sheet-shape - Corner radius of the leading edge.
 * @cssprop --side-sheet-width - Width of the side sheet.
 *
 * @fires {CustomEvent} open - Fired when the sheet opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Fired when the sheet closes: Escape, a scrim click, the close button, or `hide()`.
 *
 * @example
 * ```html
 * <wc-button onclick="document.getElementById('filters').show()">Filters</wc-button>
 * <wc-side-sheet id="filters" heading="Filters">
 *   <wc-checkbox autofocus>In stock only</wc-checkbox>
 *   <wc-checkbox>Free shipping</wc-checkbox>
 *   <wc-button onclick="this.closest('wc-side-sheet').hide()">Apply</wc-button>
 * </wc-side-sheet>
 * ```
 * @tags navigation, overlay
 */
export declare class SideSheet extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Whether the sheet is visible. */
    open: boolean;
    /**
     * Sheet variant. Set it before opening the sheet.
     * - `"standard"`: Non-modal; sits beside the page content in the layout, no scrim.
     * - `"modal"`: Overlays the page in the top layer with a scrim; the page is inert.
     */
    variant: 'standard' | 'modal';
    /**
     * Edge the sheet slides in from, logical: `"start"` or `"end"` (default). In right-to-left
     * pages `"end"` is the left edge.
     */
    placement: SideSheetPlacement;
    /** Heading shown in the sheet header; it also names the sheet. */
    heading: string;
    /** Accessible name of the sheet when it has no `heading`. */
    label: string;
    /** Hides the close button in the header (shown when there is a `heading`). */
    hideClose: boolean;
    /** Keeps a modal sheet open when the scrim is clicked. Escape still closes it. */
    noLightDismiss: boolean;
    private _dialog?;
    private _sheet?;
    /** Peacock's strings for the default label and the close button. */
    private readonly i18n;
    private readonly overlay;
    protected updated(changed: PropertyValues<this>): void;
    /** Opens the sheet. */
    show(): void;
    /** Closes the sheet. */
    hide(): void;
    /** Opens the sheet when closed, closes it when open. */
    toggle(): void;
    private get _isModal();
    private _close;
    /** The native Escape `cancel`: the overlay controller handles Escape, so keep `open` in charge. */
    private _handleCancel;
    /**
     * The browser closed the dialog by itself: keep `open` in step. A `close` from content inside
     * the dialog (a popover, menu or select closing; they bubble and are composed) is not ours.
     */
    private _handleNativeClose;
    /** A click on the scrim, not on the sheet, is a light dismiss. */
    private _handleDialogClick;
    private _handleCloseClick;
    private _renderHeader;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
