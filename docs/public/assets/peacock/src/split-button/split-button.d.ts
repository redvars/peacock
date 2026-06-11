import { LitElement } from 'lit';
/**
 * @label Split Button
 * @tag wc-split-button
 * @rawTag split-button
 *
 * @summary A split button lets users perform a default action or choose from a set of related actions via a dropdown menu.
 * @overview
 * <p>A split button combines a primary action button with a dropdown arrow that opens a menu. Following M3 Material Design, the split button provides a default action alongside a set of secondary options, reducing clutter while keeping alternative actions accessible.</p>
 *
 * @cssprop --split-button-container-shape: Defines the border radius of the split button container shape.
 *
 * @cssprop --filled-split-button-container-color: Color of the filled split button container.
 * @cssprop --filled-split-button-label-text-color: Text color of the filled split button label.
 *
 * @cssprop --outlined-split-button-container-color: Color of the outlined split button container.
 * @cssprop --outlined-split-button-label-text-color: Text color of the outlined split button label.
 *
 * @cssprop --tonal-split-button-container-color: Color of the tonal split button container.
 * @cssprop --tonal-split-button-label-text-color: Text color of the tonal split button label.
 *
 * @fires {MouseEvent} click - Dispatched when the primary action button is clicked.
 * @fires {CustomEvent} toggle-menu - Dispatched when the dropdown menu is opened or closed.
 *
 * @example
 * ```html
 * <wc-split-button>
 *   Save
 *   <wc-menu-item slot="menu">Save as draft</wc-menu-item>
 *   <wc-menu-item slot="menu">Save and publish</wc-menu-item>
 * </wc-split-button>
 * ```
 * @tags controls
 */
export declare class SplitButton extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Button size.
     * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
     */
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /**
     * The visual style of the split button.
     *
     * Possible variant values:
     * `"filled"` is a filled button.
     * `"outlined"` is an outlined button.
     * `"tonal"` is a light color button.
     */
    variant: 'filled' | 'tonal' | 'outlined';
    /**
     * Defines the primary color of the split button.
     */
    color: 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning' | 'surface' | 'on-surface';
    /**
     * Whether the split button is disabled.
     */
    disabled: boolean;
    private _menuOpen;
    private readonly _dropdownButton;
    private readonly _menu;
    private _menuId;
    focus(): void;
    private _onActionClick;
    private _onDropdownClick;
    private _onMenuOpened;
    private _onMenuClosed;
    private _onKeyDown;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
