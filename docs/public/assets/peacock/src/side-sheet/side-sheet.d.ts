import { LitElement } from 'lit';
/**
 * @label Side Sheet
 * @tag wc-side-sheet
 * @rawTag side-sheet
 * @summary Side sheets slide in from the edge of the screen to reveal supplemental content. Supports standard and modal variants.
 *
 * @cssprop --side-sheet-container-color - Background color of the sheet container.
 * @cssprop --side-sheet-scrim-color - Color of the modal scrim overlay.
 * @cssprop --side-sheet-shape - Corner radius of the leading edge.
 * @cssprop --side-sheet-width - Width of the side sheet.
 *
 * @example
 * ```html
 * Side Sheet

 * ```
 * @tags navigation, overlay
 */
export declare class SideSheet extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Whether the sheet is visible. */
    open: boolean;
    /**
     * Sheet variant.
     * - `"standard"`: Coexists with page content; no scrim.
     * - `"modal"`: Overlays page content with a scrim backdrop.
     */
    variant: 'standard' | 'modal';
    /**
     * Side from which the sheet slides in.
     * - `"left"`: Sheet opens from the left edge.
     * - `"right"`: Sheet opens from the right edge.
     */
    position: 'left' | 'right';
    show(): void;
    hide(): void;
    private _close;
    private _handleScrimClick;
    render(): import("lit-html").TemplateResult<1>;
}
