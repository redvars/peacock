import { LitElement } from 'lit';
import { Button, ButtonColor } from '../button/button.js';
import { IconButton } from '../icon-button/icon-button.js';
/**
 * @label Button Group
 * @tag wc-button-group
 * @rawTag button-group
 *
 * @summary Group a series of buttons together on a single line with the button group, and super-power.

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
     * Possible values are `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
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
