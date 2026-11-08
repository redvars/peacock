import { type PropertyValues } from 'lit';
import { type FormValue, getFormValue } from '../__internal/mixins/form-associated.js';
import { type PeacockStrings } from '../__internal/i18n/strings.js';
import BaseField from '../input/BaseField.js';
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
 * @summary A field that opens a list of options to pick one or several from, with optional search as you type.
 * @overview
 * <p>Select builds on <code>wc-field</code> and <code>wc-menu</code> to provide a fully-featured
 * dropdown picker.</p>
 * <ul>
 * <li>Single and multi-select modes; a multi-select shows a checkbox on every option.</li>
 * <li>Client-side typeahead with <code>search="contains"</code>.</li>
 * <li>Server-side typeahead with <code>search="managed"</code>: listen to <code>search</code>,
 * replace the options and set <code>loading</code> while they load; "No results" shows when the
 * search leaves no option.</li>
 * <li><code>allow-custom</code> keeps typed text that matches no option as the value, through a
 * "Create …" row (or Enter in the search input) that fires <code>create</code>.</li>
 * <li>Multi-select chips on one row, with a "+N" chip for the ones that do not fit.</li>
 * <li><code>clearable</code> adds a button that clears the value.</li>
 * <li>Form-associated: submits the value under <code>name</code> (one entry per value with
 * <code>multiple</code>).</li>
 * <li>Validates like a native select: <code>required</code> with nothing selected blocks form
 * submission, and the message shows under the field once a value is committed or the form is
 * submitted.</li>
 * <li>The options open in the top layer, so a select works inside a <code>wc-modal</code>.</li>
 * </ul>
 * <p>Options come from <code>&lt;wc-option&gt;</code> children or from the <code>options</code>
 * property; use one or the other. When both are given, both are shown: the options built from
 * <code>options</code> follow the children, and for a value present in both, the child (first in
 * order) gives the label.</p>
 * <p><strong>Keyboard:</strong> Enter, Space, Arrow Down or Arrow Up open the options and focus the
 * selected one. While closed, typing a letter selects the next option starting with it and Home or
 * End select the first or last option (single select, like a native select). In the list, the
 * arrows move, typing a letter jumps to the next option starting with it, Enter or Space picks,
 * Escape closes and returns focus to the field. With <code>search</code>, typing goes to the search
 * input; Arrow Down moves into the list and Enter picks the first match (with
 * <code>allow-custom</code>, the typed text unless an option's label matches it exactly).</p>
 *
 * @slot start - Leading content, such as an icon.
 * @slot end - Trailing content, before the dropdown arrow.
 *
 * @fires {CustomEvent<{value: string, values: string[]}>} change - Dispatched when the selection changes. `values` is set with `multiple`.
 * @fires {CustomEvent<{value: string}>} search - Dispatched as the user types when `search="managed"`.
 * @fires {CustomEvent<{value: string}>} create - Dispatched when the person keeps typed text that matches no option (`allow-custom`). Cancel it to keep the value unchanged, for example to add the option yourself.
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
export declare class Select extends BaseField {
    static styles: import("lit").CSSResultGroup[];
    private readonly _menuId;
    /** Peacock's strings for labels and empty states. */
    private readonly _i18n;
    /**
     * Array of options to display in the dropdown.
     * Setting this property creates matching `<wc-option>` children automatically, after any
     * `<wc-option>` children of your own. Give options one way or the other.
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
     * - `'managed'`: emits a `search` event for server-controlled filtering.
     */
    search: '' | 'contains' | 'managed';
    /**
     * Lets typed text that matches no option become the value (or one of the values with
     * `multiple`). Turns on the search input (as `search="contains"` when `search` is not set).
     * With `multiple`, custom values must not contain commas.
     */
    allowCustom: boolean;
    /** Shows a progress row in the options, for example while `search="managed"` fetches them. */
    loading: boolean;
    /** Overrides Peacock's strings for this instance only. */
    strings?: Partial<PeacockStrings>;
    private _open;
    private _focused;
    private _searchQuery;
    /** True when all options are filtered out by the current search query. */
    private _noOptionsVisible;
    /** How many selected chips fit on the row; the rest collapse into a "+N" chip. */
    private _visibleChipCount;
    private _triggerEl?;
    private _fieldEl?;
    private _menu?;
    private _searchInputEl?;
    private _chipsContainer?;
    private _chipsObserver?;
    private _chipsMeasureFrame;
    /** Characters typed on the closed combobox, matched against option labels. */
    private _typeaheadBuffer;
    private _typeaheadTimer;
    /** Whether the last render showed the "Create …" row, so the menu re-reads its items. */
    private _createShown;
    /**
     * The selected values, kept in sync with `value` (comma-separated). Use it with `multiple`;
     * for a single select it holds at most one value. The form gets one entry per value.
     */
    get values(): string[];
    set values(next: string[]);
    focus(): void;
    blur(): void;
    [getFormValue](): FormValue | null;
    disconnectedCallback(): void;
    protected willUpdate(changed: PropertyValues<this>): void;
    protected updated(changedProperties: PropertyValues<this>): void;
    protected valueMissingText(): string;
    protected validityAnchor(): HTMLElement | undefined;
    /** Clears the selection (every value of a multi-select) and fires `change`. */
    protected clearValue(): void;
    /** A multi-select also takes a suggestion as an array of values. */
    protected writeSuggestionValue(value: unknown): void;
    /** The field event contract, plus `values` for a multi-select. */
    protected emitValue(type: 'input' | 'change'): void;
    /**
     * Reconciles the `options` property with auto-generated `<wc-option>` light-DOM
     * children (marked `data-generated`).  Declarative children placed by the
     * consumer are left untouched.
     */
    private _syncProgrammaticOptions;
    private get _optionElements();
    /**
     * Pushes `selected`, `multiple` and `filtered` state onto every `<wc-option>`
     * child element so each one can render itself correctly.
     */
    private _syncOptionStates;
    /** The values the assistant suggested, while the suggestion shows; marked in the list. */
    private get _suggestedValues();
    private get _selectedValues();
    private _isSelected;
    /** Returns the display label for a given option value. */
    private _getLabelForValue;
    private get _displayLabel();
    private get _isPopulated();
    private get _isInteractive();
    /** How the search input filters; `allow-custom` turns on `contains` when `search` is unset. */
    private get _searchMode();
    /** The enabled option whose label (or value) is the given text, ignoring case. */
    private _findOptionByText;
    /** Whether to offer the "Create …" row: typed text that is no option and no chosen value. */
    private get _showCreateOption();
    private _openMenu;
    private _closeMenu;
    private _toggleMenu;
    private _handleTriggerClick;
    private _handleFieldClick;
    private _handleTriggerKeyDown;
    /** Options the keyboard can choose while the list is closed. */
    private get _selectableOptions();
    private _isPrintableKey;
    /**
     * Typing on the closed combobox: with search, opens the list with the character in the search
     * input; a single select moves the selection to the next option starting with the typed text,
     * like a native select.
     */
    private _handleClosedTypeahead;
    /** Selects a value from the closed combobox and fires `change` when it differs. */
    private _selectWhileClosed;
    /** Keys in the search input: arrows move into the list, Enter picks the first match. */
    private _handleSearchKeyDown;
    /** With search, typing while an option has focus goes back to the input. */
    private _handleMenuKeyDownCapture;
    /** The menu's `open`/`close` bubble and are composed; they are internal to the select. */
    private static _stopMenuEvent;
    /** The menu's `close` is internal too; when the list itself closes, reset the open state. */
    private _handleMenuClose;
    private _handleMenuItemActivate;
    /**
     * Keeps typed text as a value (`allow-custom`): fires a cancelable `create`, then picks the
     * text unless the consumer cancelled it.
     */
    private _create;
    /** Selects a value (toggles it for a multi-select) and fires `change`. */
    private _pick;
    private _dispatchChange;
    private _handleSearchInput;
    /** Sets the search text; with `search="managed"`, tells the consumer through `search`. */
    private _setSearchQuery;
    /** Options added or removed as children: update their state and the empty-state row. */
    private _handleSlotChange;
    private _handleChipDismiss;
    private _observeChips;
    private _scheduleChipMeasure;
    /** Counts how many chips fit on one row, keeping room for the "+N" chip when some do not. */
    private _measureChips;
    /** The row under the options: progress while `loading`, else the empty state. */
    private _renderStatusRow;
    /** The "Create …" row of `allow-custom`. */
    private _renderCreateOption;
    private _renderChips;
    private _renderTriggerContent;
    private _renderFieldEnd;
    private _renderTrigger;
    render(): import("lit-html").TemplateResult<1>;
}
