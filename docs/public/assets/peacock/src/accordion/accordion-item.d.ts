import { LitElement } from 'lit';
/**
 * @label Accordion Item
 * @tag wc-accordion-item
 * @rawTag accordion-item
 * @summary An expansion panel with a header that reveals or hides associated content.
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
 * @fires {CustomEvent<{ open: boolean }>} accordion-item-toggle - Fired when the panel is expanded or collapsed.
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
    /** True when the `heading` slot contains at least one non-empty node. */
    private _hasHeadingSlot;
    private readonly buttonElement;
    focus(): void;
    blur(): void;
    private _handleToggle;
    private static _onSlotChange;
    private _renderToggleIcon;
    render(): import("lit-html").TemplateResult<1>;
}
