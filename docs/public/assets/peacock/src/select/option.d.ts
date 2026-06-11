import { LitElement } from 'lit';
import type { MenuItem } from '../menu/menu-item/menu-item.js';
/**
 * @label Select Option
 * @tag wc-option
 * @rawTag option
 *
 * @summary A declarative option element for use inside wc-select.
 *
 * @example
 * ```html
 * <wc-select label="Fruit">
 *   <wc-option value="apple">Apple</wc-option>
 *   <wc-option value="banana">Banana</wc-option>
 * </wc-select>
 * ```
 */
export declare class SelectOptionElement extends LitElement {
    static styles: import("lit").CSSResult[];
    /**
     * The option's submitted value.
     */
    value: string;
    /**
     * Optional Material Symbol icon name shown before the label.
     */
    icon: string;
    /**
     * Disables the option so it cannot be selected.
     */
    disabled: boolean;
    /** Reflects whether this option is currently selected. Set by wc-select. */
    selected: boolean;
    /**
     * When true the menu stays open after selection (used for multi-select).
     * Set by wc-select.
     */
    keepOpen: boolean;
    /**
     * When true the option is hidden and excluded from keyboard navigation
     * because it does not match the current typeahead search query.
     * Set by wc-select.
     */
    filtered: boolean;
    private readonly _menuItemEl?;
    /**
     * Returns the inner `wc-menu-item` element.
     * `wc-menu` discovers this via its `items` getter which checks `el.item`
     * as a `MenuItem` proxy, so keyboard navigation and activation work
     * without `wc-option` extending `MenuItem` directly.
     */
    get item(): MenuItem | null;
    render(): import("lit-html").TemplateResult<1>;
}
