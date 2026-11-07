import { LitElement } from 'lit';
import { Button, ButtonColor } from '../button/button.js';
import { IconButton } from '../icon-button/icon-button.js';
/**
 * @label Button Group
 * @tag wc-button-group
 * @rawTag button-group
 *
 * @summary A row of related buttons or icon buttons that share one size, color and style.
 *
 * @overview
 * <p>Put <code>wc-button</code> or <code>wc-icon-button</code> elements inside. The group passes
 * its <code>size</code> (<code>sm</code> by default), and its <code>color</code> and
 * <code>variant</code> when set, to every button, overriding what the buttons set themselves.</p>
 * <p>By default the buttons sit with a small gap between them. With <code>connected</code> they sit
 * 2px apart with rounded outer corners, for a set such as bold, italic and underline toggles.</p>
 * <p>The group is layout only: it adds no group role, keyboard handling or selection, so each
 * button keeps its own focus stop and toggle state. For choosing one or several options from a
 * set use <code>wc-segmented-button-group</code>.</p>
 *
 * @example
 * ```html
 * <wc-button-group connected>
 *  <wc-icon-button toggle="true" shape="wide" selected>
 *    <wc-icon name="format_bold"></wc-icon>
 *  </wc-icon-button>
 *  <wc-icon-button toggle="true" shape="wide">
 *    <wc-icon name="format_italic"></wc-icon>
 *  </wc-icon-button>
 *  <wc-icon-button toggle="true" shape="wide">
 *    <wc-icon name="format_underlined"></wc-icon>
 *  </wc-icon-button>
 * </wc-button-group>
 * ```
 *
 * @tags controls
 */
declare class ButtonGroup extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    static Button: typeof Button;
    static IconButton: typeof IconButton;
    /**
     * Button size.
     * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
     */
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /**
     * Layout variant of the button group.
     * `"standard"` shows buttons with a small gap between them.
     * `"connected"` places buttons with a 2px gap;
     * rounded outer corners and middle buttons keep standard rounded corners.
     * Defaults to `"standard"`.
     */
    connected: boolean;
    /**
     * Color applied to all buttons in the group.
     * Possible values are `"primary"`, `"success"`, `"danger"`, `"warning"`, `"surface"`, `"on-surface"`.
     */
    color?: ButtonColor;
    /**
     * Visual style applied to all buttons in the group.
     * Possible values are `"filled"`, `"tonal"`, `"outlined"`.
     */
    variant?: 'filled' | 'tonal' | 'outlined';
    updated(): void;
    private _getSlottedElements;
    private _syncButtonProperties;
    render(): import("lit-html").TemplateResult<1>;
}
export default ButtonGroup;
