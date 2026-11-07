import { LitElement, type PropertyValues } from 'lit';
/**
 * @label Bottom Sheet
 * @tag wc-bottom-sheet
 * @rawTag bottom-sheet
 * @summary A panel that slides up from the bottom of the screen with extra content, either modal over the page or alongside it.
 * @overview
 * <p>The sheet renders a native <code>&lt;dialog&gt;</code>. The <code>modal</code> variant (the default)
 * opens it with <code>showModal()</code>: it renders in the browser's top layer above the page, with a
 * scrim; the rest of the page is inert and does not scroll; focus moves to the first element with
 * <code>autofocus</code> inside it and returns where it was when the sheet closes. Escape and a click
 * on the scrim close it (<code>no-light-dismiss</code> keeps it open on scrim clicks).</p>
 * <p>The drag handle closes the sheet when dragged down, clicked, or pressed with Enter or Space.</p>
 * <p>The <code>standard</code> variant opens the dialog with <code>show()</code>: it is not modal and
 * stays in the page flow at the end of its container.</p>
 *
 * @cssprop --bottom-sheet-container-color - Background color of the sheet container.
 * @cssprop --bottom-sheet-scrim-color - Color of the modal scrim overlay.
 * @cssprop --bottom-sheet-shape - Corner radius of the top edge.
 * @cssprop --bottom-sheet-max-height - Maximum height of the sheet.
 *
 * @fires {CustomEvent} open - Fired when the sheet opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Fired when the sheet closes: Escape, a scrim click, the drag handle (`action`), or `hide()`.
 *
 * @example
 * ```html
 * <wc-button onclick="document.getElementById('share').show()">Share</wc-button>
 * <wc-bottom-sheet id="share" label="Share">
 *   <wc-list>
 *     <wc-list-item autofocus>Copy link</wc-list-item>
 *     <wc-list-item>Email</wc-list-item>
 *   </wc-list>
 * </wc-bottom-sheet>
 * ```
 * @tags navigation, overlay
 */
export declare class BottomSheet extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Whether the sheet is visible. */
    open: boolean;
    /**
     * Sheet variant. Set it before opening the sheet.
     * - `"standard"`: Non-modal; stays in the page flow, no scrim.
     * - `"modal"`: Overlays the page in the top layer with a scrim; the page is inert.
     */
    variant: 'standard' | 'modal';
    /** Accessible name of the sheet. */
    label: string;
    /** Hides the drag handle. */
    hideHandle: boolean;
    /** Keeps a modal sheet open when the scrim is clicked. Escape still closes it. */
    noLightDismiss: boolean;
    private _dragging;
    private _dragOffsetY;
    private _dialog?;
    private _sheet?;
    /** Peacock's strings for the default label and the drag handle. */
    private readonly i18n;
    private readonly overlay;
    private _dragStartY;
    /** The last press on the handle moved, so the click that follows it is not a click. */
    private _suppressHandleClick;
    protected willUpdate(changed: PropertyValues<this>): void;
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
    private _handleDragStart;
    private _handleDragMove;
    private _handleDragEnd;
    /** A click, or Enter / Space on the focused handle (a native button), closes the sheet. */
    private _handleHandleClick;
    private _renderHandle;
    render(): import("lit-html").TemplateResult<1>;
}
