import { nothing, type PropertyValues, type TemplateResult } from 'lit';
import { MenuItem } from '../menu/menu-item/menu-item.js';
/**
 * @label Select Option
 * @tag wc-option
 * @rawTag option
 *
 * @summary One option in a select dropdown, with an optional icon before its label.
 * @overview
 * <p>Options are menu items with the <code>option</code> role. The selected option of a single select
 * shows a check mark at the end; in a multi-select every option shows a checkbox at the start.</p>
 *
 * @example
 * ```html
 * <wc-select label="Fruit">
 *   <wc-option value="apple">Apple</wc-option>
 *   <wc-option value="banana">Banana</wc-option>
 * </wc-select>
 * ```
 */
export declare class SelectOptionElement extends MenuItem {
    /**
     * Optional Material Symbol icon name shown before the label.
     */
    icon: string;
    /** Whether the option belongs to a multi-select, which shows a checkbox. Set by wc-select. */
    multiple: boolean;
    /**
     * When true the option is hidden and skipped by keyboard navigation because it does not
     * match the current typeahead search query. Set by wc-select.
     */
    filtered: boolean;
    /**
     * Marks the option the assistant suggested with a Suggested badge, while the select holds the
     * suggestion. Set by wc-select.
     */
    suggested: boolean;
    protected willUpdate(changed: PropertyValues<this>): void;
    protected get itemRole(): string;
    protected get itemAriaSelected(): string;
    protected renderStart(): TemplateResult | typeof nothing;
    protected renderEnd(): TemplateResult | typeof nothing;
}
