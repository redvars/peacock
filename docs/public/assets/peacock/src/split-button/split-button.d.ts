import { LitElement } from 'lit';
import type { OverlayPlacement } from '@/__internal/utils/placement.js';
import type { MenuFocusTarget } from '../menu/menu/menu.js';
/**
 * @label Split Button
 * @tag wc-split-button
 * @rawTag split-button
 *
 * @summary A button for a default action joined to an arrow that opens a menu of related actions.
 * @overview
 * <p>The main button runs the default action; the arrow beside it opens a menu of related actions.</p>
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
 * @fires {CustomEvent} open - Dispatched after the menu opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Dispatched after the menu closes: an item pick is `action`, Escape `escape`, a press outside or Tab `light-dismiss`, `close()` or the primary action `api`.
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
    /** Visual variant of the menu: one surface (`"standard"`) or segmented groups (`"expressive"`). */
    menuVariant: 'standard' | 'expressive';
    /**
     * Where the menu opens relative to the button: `top`, `bottom`, `start` or `end`, optionally
     * followed by `-start` or `-end` (ADR-030001). `start` and `end` follow the writing direction.
     * Defaults to `"bottom-end"`.
     */
    placement: OverlayPlacement;
    private readonly _menu?;
    /** Peacock's strings for the menu trigger label. */
    private readonly i18n;
    /** Opens and closes the menu and fires `open` / `close`. */
    private readonly _trigger;
    focus(): void;
    /** Opens the menu and focuses its first (or last) item. */
    show(focusTarget?: MenuFocusTarget): void;
    /** Closes the menu. */
    close(): void;
    private _onActionClick;
    render(): import("lit-html").TemplateResult<1>;
}
