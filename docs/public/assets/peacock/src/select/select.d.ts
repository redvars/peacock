import BaseInput from '../input/BaseInput.js';
export interface SelectOption {
    label: string;
    value: string;
    icon?: string;
}
/**
 * @label Select
 * @tag wc-select
 * @rawTag select
 *
 * @summary A dropdown select component supporting single and multi-select with optional typeahead search.
 * @overview
 * Select builds on wc-field and wc-menu to provide a fully-featured dropdown picker.
 *
 * - Single and multi-select modes
 * - Client-side typeahead with `search="contains"`
 * - Server-side typeahead with `search="managed"`
 * - Multi-select chips display
 *
 * @example
 * ```html
 * <wc-select label="Fruit" placeholder="Pick a fruit...">
 *   <wc-option value="apple">Apple</wc-option>
 *   <wc-option value="banana">Banana</wc-option>
 * </wc-select>
 * ```
 * @tags form
 */
export declare class Select extends BaseInput {
    static styles: import("lit").CSSResultGroup[];
    private readonly _menuId;
    /**
     * Array of options to display in the dropdown.
     * Setting this property creates matching `<wc-option>` children automatically.
     */
    options: SelectOption[];
    /**
     * The selected value. For multi-select, a comma-separated list of values.
     */
    value: string;
    /**
     * Enable multi-select mode.
     */
    multiple: boolean;
    /**
     * Enable typeahead search.
     * - `'contains'`: filters options client-side.
     * - `'managed'`: emits a `select-search` event for server-controlled filtering.
     */
    search: '' | 'contains' | 'managed';
    /**
     * Placeholder text shown when no value is selected.
     */
    placeholder: string;
    /**
     * Label displayed above the field.
     */
    label: string;
    /**
     * Visual variant of the field.
     */
    variant: 'filled' | 'outlined' | 'default';
    /**
     * Helper text displayed below the field.
     */
    helperText: string;
    error: boolean;
    errorText: string;
    warning: boolean;
    warningText: string;
    private _open;
    private _focused;
    private _searchQuery;
    /** True when all options are filtered out by the current search query. */
    private _noOptionsVisible;
    private _triggerEl?;
    private get _menu();
    private _searchInputEl?;
    focus(): void;
    blur(): void;
    protected updated(changedProperties: Map<string, unknown>): void;
    /**
     * Reconciles the `options` property with auto-generated `<wc-option>` light-DOM
     * children (marked `data-generated`).  Declarative children placed by the
     * consumer are left untouched.
     */
    private _syncProgrammaticOptions;
    /**
     * Pushes `selected`, `keepOpen`, and `filtered` state onto every `<wc-option>`
     * child element so each one can render itself correctly.
     */
    private _syncOptionStates;
    private get _selectedValues();
    private _isSelected;
    /** Returns the display label for a given option value. */
    private _getLabelForValue;
    private get _displayLabel();
    private get _isPopulated();
    private _openMenu;
    private _closeMenu;
    private _handleTriggerClick;
    private _handleFieldClick;
    private _handleTriggerKeyDown;
    private _handleMenuClosed;
    private _handleMenuItemActivate;
    private _dispatchChange;
    private _handleSearchInput;
    private _handleChipDismiss;
    private _renderEmptyState;
    private _renderTriggerContent;
    private _renderFieldEnd;
    render(): import("lit-html").TemplateResult<1>;
}
