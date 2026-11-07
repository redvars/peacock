import { LitElement, type PropertyValues } from 'lit';
/** What changed an accordion item's `open` state. */
export type AccordionItemReason = 'action' | 'api';
/**
 * @label Accordion Item
 * @tag wc-accordion-item
 * @rawTag accordion-item
 * @summary An expansion panel with a header that reveals or hides associated content.
 *
 * @overview
 * <p>Use it on its own, or several inside a <code>wc-accordion</code>, which moves focus between
 * their headers and can keep a single panel open.</p>
 * <p>The header is a button with <code>aria-expanded</code> that controls the content, a region
 * labelled by the header. Clicking it, or pressing Enter or Space on it, toggles
 * <code>open</code>. The <code>heading</code> slot holds the title and <code>description</code> an
 * optional subtitle. Buttons in the <code>header-actions</code> slot sit next to the header
 * button, not inside it, so they stay reachable by keyboard.</p>
 * <p><code>open</code> fires after the panel expands and <code>close</code> after it collapses, with
 * <code>reason: 'action'</code> when the person used the header and <code>'api'</code> when
 * <code>open</code> was set, including by <code>show()</code>, <code>hide()</code> and
 * <code>toggle()</code>. Neither fires for a panel that starts open. <code>disabled</code> stops
 * the header responding, and <code>hide-toggle</code> hides the arrow icon.</p>
 *
 * @slot - The body content revealed when the panel is expanded.
 * @slot heading - The panel title. Renders as `body-large` text.
 * @slot description - Optional subtitle rendered below the title. Renders as `body-small` text.
 * @slot header-actions - Actions (e.g. icon buttons) placed at the trailing end of the header, before the toggle icon.
 *
 * @part header - The header `<button>` element.
 * @part title - The title text container.
 * @part description - The description text container.
 * @part content - The expandable content region wrapper.
 *
 * @fires {CustomEvent<{ reason: 'action' | 'api' }>} open - Fired after the panel expands: `reason` is `'action'` when the person used the header, `'api'` when `open` was set (including by a single-panel `wc-accordion` closing the others).
 * @fires {CustomEvent<{ reason: 'action' | 'api' }>} close - Fired after the panel collapses, with the same `reason`.
 *
 * @example
 * ```html
 * <wc-accordion-item>
 *   <span slot="heading">Personal information</span>
 *   <span slot="description">Fill in your details</span>
 *   <p>Content goes here.</p>
 * </wc-accordion-item>
 * ```
 * @tags display
 */
export declare class AccordionItem extends LitElement {
    #private;
    static styles: import("lit").CSSResultGroup[];
    /**
     * Whether the user cannot interact with the panel.
     */
    disabled: boolean;
    /**
     * Whether the panel is expanded.
     */
    open: boolean;
    /**
     * Whether to hide the expand/collapse toggle indicator icon.
     */
    hideToggle: boolean;
    /** True when the `description` slot contains at least one non-empty node. */
    private _hasDescriptionSlot;
    /** The header button; `wc-accordion` moves focus between these. */
    readonly headerButton: HTMLButtonElement | null;
    protected updated(changed: PropertyValues<this>): void;
    focus(options?: Parameters<HTMLElement['focus']>[0]): void;
    blur(): void;
    /** Expands the panel. */
    show(): void;
    /** Collapses the panel. */
    hide(): void;
    /** Expands the panel when collapsed, and collapses it when expanded. */
    toggle(): void;
    private _handleToggle;
    private static _onSlotChange;
    private _renderToggleIcon;
    render(): import("lit-html").TemplateResult<1>;
}
