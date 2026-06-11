import { LitElement } from 'lit';
/**
 * @label Dropdown Button
 * @tag wc-dropdown-button
 * @rawTag dropdown-button
 *
 * @summary A button that opens a dropdown menu when clicked.
 * @overview
 * <p>The dropdown button combines a single button with a dropdown menu. Clicking the button toggles a menu of actions or options. It follows M3 Material Design, keeping a compact control while exposing related actions on demand.</p>
 *
 * @cssprop --dropdown-button-container-shape: Defines the border radius of the dropdown button container shape.
 *
 * @fires {CustomEvent} toggle-menu - Dispatched when the dropdown menu is opened or closed.
 *
 * @example
 * ```html
 * <wc-dropdown-button>
 *   Actions
 *   <wc-menu-item slot="menu">Edit</wc-menu-item>
 *   <wc-menu-item slot="menu">Delete</wc-menu-item>
 * </wc-dropdown-button>
 * ```
 * @tags controls
 */
export declare class DropdownButton extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Button size.
     * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
     */
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /**
     * The visual style of the dropdown button.
     *
     * Possible variant values:
     * `"filled"` is a filled button.
     * `"outlined"` is an outlined button.
     * `"text"` is a transparent button.
     * `"tonal"` is a light color button.
     * `"elevated"` is an elevated button.
     */
    variant: 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';
    /**
     * Defines the primary color of the dropdown button.
     */
    color: 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning' | 'surface' | 'on-surface';
    /**
     * Whether the dropdown button is disabled.
     */
    disabled: boolean;
    /**
     * Menu placement relative to the button.
     * Possible values are `"bottom-start"`, `"bottom-end"`, `"top-start"`, `"top-end"`. Defaults to `"bottom-start"`.
     */
    placement: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
    private _menuOpen;
    private readonly _triggerButton;
    private readonly _menu;
    private _menuId;
    focus(): void;
    private _onButtonClick;
    private _onMenuOpened;
    private _onMenuClosed;
    private _onKeyDown;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
