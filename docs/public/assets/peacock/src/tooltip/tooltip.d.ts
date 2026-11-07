import { LitElement, type PropertyValues } from 'lit';
import { type OverlayPlacement } from '../__internal/utils/placement.js';
export type TooltipTrigger = 'hover' | 'focus' | 'click';
/**
 * @label Tooltip
 * @tag wc-tooltip
 * @rawTag tooltip
 * @summary A short text label shown next to an element on hover or keyboard focus.
 * @overview
 * <p>A short text label shown next to its target on hover or focus. It opens in the browser's top layer,
 * so it shows above modals and menus, and describes the target through <code>aria-describedby</code>.
 * Escape hides a visible tooltip without closing the dialog or menu around it.</p>
 * <p>The target is the element whose id is in <code>for</code>, looked up in the tooltip's own document or
 * shadow root, or else the parent element. When the target is in another shadow root, the link uses
 * <code>ariaDescribedByElements</code> where the browser supports it; elsewhere the target is not
 * described.</p>
 * <p>Use <code>wc-popover</code> for rich content with actions.</p>
 * @tags display
 *
 * @example
 * ```html
 * <wc-tooltip preview>Tooltip</wc-tooltip>
 * ```
 */
export declare class Tooltip extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The ID of the element the tooltip should attach to.
     * If not provided, it defaults to the parent element.
     */
    for: string;
    /** What shows the tooltip: any of `hover`, `focus` and `click`, separated by spaces. */
    trigger: string;
    /** Whether the tooltip is visible. */
    open: boolean;
    /**
     * Preferred placement relative to the target: `top`, `bottom`, `start` or `end`, optionally with
     * `-start` or `-end` alignment. `start` and `end` follow the writing direction.
     */
    placement: OverlayPlacement;
    /**
     * Renders the tooltip statically in the page flow, always visible.
     * @internal For the documentation demos only.
     */
    preview: boolean;
    private _target;
    private _floating;
    /** How the target was linked to the tooltip, so detaching undoes exactly that. */
    private _link;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected updated(changed: PropertyValues<this>): void;
    private _resolveTrigger;
    private _physicalPlacement;
    /** The tooltip is a manual popover in the top layer, except in preview. */
    private _syncPopoverAttribute;
    /** Resolves the target and listens to it. */
    private _attach;
    private _detach;
    /** Points the target's `aria-describedby` at the tooltip. */
    private _linkTarget;
    private _unlinkTarget;
    private _syncOpen;
    /** Shows or hides the tooltip in the top layer to match `open`. */
    private _syncLayer;
    /**
     * Escape hides a visible tooltip (WCAG 1.4.13). The listener is on `window` in the capture
     * phase, so it runs before the overlay controller's and the enclosing modal or menu stays open.
     */
    private _handleKeydown;
    render(): import("lit-html").TemplateResult<1>;
}
