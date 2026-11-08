import { LitElement } from 'lit';
import type { OverlayPlacement } from '../__internal/utils/placement.js';
import type { MenuFocusTarget } from '../menu/menu/menu.js';
/**
 * @label Dropdown Button
 * @tag wc-dropdown-button
 * @rawTag dropdown-button
 *
 * @summary A button that opens a menu of actions or options.
 * @overview
 * <p>Clicking the button opens its menu, and clicking it again closes it.</p>
 *
 * @cssprop --dropdown-button-container-shape: Defines the border radius of the dropdown button container shape.
 *
 * @fires {CustomEvent} open - Dispatched after the menu opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Dispatched after the menu closes: an item pick is `action`, Escape `escape`, a press outside or Tab `light-dismiss`, `close()` `api`.
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
     * Where the menu opens relative to the button: `top`, `bottom`, `start` or `end`, optionally
     * followed by `-start` or `-end` (ADR-030001). `start` and `end` follow the writing direction.
     * Defaults to `"bottom-start"`.
     */
    placement: OverlayPlacement;
    /** Visual variant of the menu: one surface (`"standard"`) or segmented groups (`"expressive"`). */
    menuVariant: 'standard' | 'expressive';
    private readonly _triggerButton?;
    private readonly _menu?;
    /** Opens and closes the menu and fires `open` / `close`. */
    private readonly _trigger;
    focus(): void;
    /** Opens the menu and focuses its first (or last) item. */
    show(focusTarget?: MenuFocusTarget): void;
    /** Closes the menu. */
    close(): void;
    render(): import("lit-html").TemplateResult<1>;
}
