import { LitElement } from 'lit';
import type { Placement } from '@floating-ui/dom';
/**
 * @label Popover
 * @tag wc-popover
 * @rawTag popover
 * @summary Displays additional information in a floating panel anchored to a trigger element.
 * @overview
 * <p>The Popover component wraps a trigger element and a <code>wc-popover-content</code> child. It uses
 * floating-ui to compute position, keeping the panel visible inside the viewport even on scroll.</p>
 * @tags display
 *
 * @fires {CustomEvent} wc-popover--open - Fired when the popover opens.
 * @fires {CustomEvent} wc-popover--close - Fired when the popover closes.
 *
 * @example
 * ```html
 * <wc-popover trigger="click">
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
     * Preferred placement of the popover relative to the trigger element.
     * Accepts any floating-ui `Placement` string such as `"bottom"`, `"top-start"`, `"right"`, etc.
     */
    placement: Placement;
    /**
     * Whether the popover is open.
     */
    open: boolean;
    /**
     * Distance in pixels between the trigger element and the popover panel.
     */
    offset: number;
    private _floating;
    private _contentEl;
    private _triggerEl;
    private _setupFloating;
    connectedCallback(): void;
    firstUpdated(): void;
    updated(changedProps: Map<string, unknown>): void;
    /**
     * Programmatically opens the popover.
     */
    show(): void;
    /**
     * Programmatically closes the popover.
     */
    hide(): void;
    render(): import("lit-html").TemplateResult<1>;
}
