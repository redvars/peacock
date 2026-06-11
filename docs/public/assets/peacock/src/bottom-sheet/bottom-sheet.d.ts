import { LitElement } from 'lit';
/**
 * @label Bottom Sheet
 * @tag wc-bottom-sheet
 * @rawTag bottom-sheet
 * @summary Bottom sheets slide up from the bottom of the screen to reveal additional content. Supports standard and modal variants.
 *
 * @cssprop --bottom-sheet-container-color - Background color of the sheet container.
 * @cssprop --bottom-sheet-scrim-color - Color of the modal scrim overlay.
 * @cssprop --bottom-sheet-shape - Corner radius of the top edge.
 * @cssprop --bottom-sheet-max-height - Maximum height of the sheet.
 *
 * @example
 * ```html
 * Bottom Sheet
 * ```
 * @tags navigation, overlay
 */
export declare class BottomSheet extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Whether the sheet is visible. */
    open: boolean;
    /**
     * Sheet variant.
     * - `"standard"`: Coexists with page content; no scrim.
     * - `"modal"`: Overlays page content with a scrim backdrop.
     */
    variant: 'standard' | 'modal';
    /** Whether to show the drag handle. */
    showHandle: boolean;
    private _dragging;
    private _dragStartY;
    private _dragOffsetY;
    show(): void;
    hide(): void;
    private _close;
    private _handleScrimClick;
    private _handleDragStart;
    private _handleDragMove;
    private _handleDragEnd;
    render(): import("lit-html").TemplateResult<1>;
}
