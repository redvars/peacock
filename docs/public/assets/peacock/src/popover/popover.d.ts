import { LitElement, type PropertyValues } from 'lit';
import { type OverlayPlacement } from '../__internal/utils/placement.js';
/**
 * @label Popover
 * @tag wc-popover
 * @rawTag popover
 * @summary Displays rich content, such as text with actions, in a floating panel anchored to a trigger element.
 * @overview
 * <p>The Popover component wraps a trigger element and a <code>wc-popover-content</code> child. The panel
 * opens in the browser's top layer, so it shows above modals, sheets, menus and any parent with
 * <code>overflow: hidden</code>; floating-ui keeps it next to the trigger and inside the viewport.</p>
 * <p>The panel is a non-modal dialog: Escape closes it, and so does a press outside the trigger and the
 * panel (<code>no-light-dismiss</code> turns that off). Name it with <code>label</code> or with an element in
 * the content's <code>heading</code> slot. With <code>trigger="click"</code> or <code>"hover"</code> the trigger gets
 * <code>aria-haspopup="dialog"</code>, <code>aria-controls</code> and <code>aria-expanded</code>; with
 * <code>"manual"</code> the component that opens the popover owns the trigger's ARIA.</p>
 * <p>Use a popover, not a <code>wc-tooltip</code>, for rich content with actions.</p>
 * @tags display, overlay
 *
 * @slot - The trigger element followed by a `wc-popover-content`.
 *
 * @fires {CustomEvent} open - Fired when the popover opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Fired when the popover closes: Escape, a press outside, the trigger (a second click, or the pointer leaving a hover trigger is `light-dismiss`), or `hide()` / `open = false`.
 *
 * @example
 * ```html
 * <wc-popover trigger="click" label="Details">
 *   <wc-button>Open popover</wc-button>
 *   <wc-popover-content>
 *     <p>Popover body text goes here.</p>
 *   </wc-popover-content>
 * </wc-popover>
 * ```
 */
export declare class Popover extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Determines how the popover is triggered.
     * Possible values are `"click"`, `"hover"`, `"manual"`.
     */
    trigger: 'click' | 'hover' | 'manual';
    /**
     * Preferred placement of the panel relative to the trigger: `top`, `bottom`, `start` or `end`,
     * optionally with `-start` or `-end` alignment. `start` and `end` follow the writing direction.
     */
    placement: OverlayPlacement;
    /**
     * Whether the popover is open.
     */
    open: boolean;
    /**
     * Distance in pixels between the trigger element and the popover panel.
     */
    offset: number;
    /**
     * Accessible name of the panel. Without it, the element in the content's `heading` slot names it.
     */
    label: string;
    /** Shows an arrow on the panel that points at the trigger. */
    arrow: boolean;
    /** Keeps the popover open when the user presses outside it. Escape still closes it. */
    noLightDismiss: boolean;
    /** Positions the panel and listens to the trigger for `click` and `hover`. */
    private _floating;
    private _contentEl;
    private _triggerEl;
    /** Trigger attributes the popover set, so it removes only those. */
    private readonly _ownedTriggerAria;
    /** Content naming attributes the popover set, so it never removes the consumer's own. */
    private readonly _ownedContentAria;
    /** Reason for the close in progress, sent with the `close` event. */
    private _closeReason;
    /** Top layer, Escape and light dismiss. */
    private readonly _overlay;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected updated(changed: PropertyValues<this>): void;
    /**
     * Programmatically opens the popover.
     */
    show(): void;
    /**
     * Programmatically closes the popover.
     */
    hide(): void;
    /** Opens the popover when it is closed and closes it when it is open. */
    toggle(): void;
    /** Finds the trigger and the content and connects positioning, ARIA and the top layer. */
    private _setup;
    private _setFloatingElements;
    /** The floating controller saw the trigger open or close the popover. */
    private _handleTriggerChange;
    private _close;
    private _syncOpen;
    private _dispatch;
    /** Gives the panel `role="dialog"` and a name: `label`, else the `heading` slot. */
    private _syncContentAria;
    /** Sets or removes a naming attribute on the content, leaving the consumer's own alone. */
    private _setContentAttribute;
    /** `aria-haspopup`, `aria-controls` and `aria-expanded` on a click or hover trigger. */
    private _syncTriggerAria;
    private _clearTriggerAria;
    render(): import("lit-html").TemplateResult<1>;
}
