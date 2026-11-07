import { html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import {
  type FormValue,
  getFormValue,
} from '@/__internal/mixins/form-associated.js';
import IndividualComponent from '@/IndividualComponent.js';
import { spread } from '@/__internal/directive/spread.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  type PeacockStrings,
  peacockString,
} from '@/__internal/i18n/strings.js';
import BaseField from '../input/BaseField.js';
import styles from './select.scss';
import type { Field } from '../field/field.js';
import type { Menu, MenuFocusTarget } from '../menu/menu/menu.js';
import { SelectOptionElement } from './option.js';

export interface SelectOption {
  label: string;
  value: string;
  icon?: string;
}

/** Space kept for the "+N" chip when the selected chips do not all fit. */
const OVERFLOW_CHIP_RESERVE_PX = 56;

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
@IndividualComponent
export class Select extends BaseField {
  static styles = [styles];

  private readonly _menuId = `wc-select-menu-${Math.random().toString(36).slice(2, 9)}`;

  /** Peacock's strings for labels and empty states. */
  private readonly _i18n = new I18nController(this);

  /**
   * Array of options to display in the dropdown.
   * Setting this property creates matching `<wc-option>` children automatically, after any
   * `<wc-option>` children of your own. Give options one way or the other.
   */
  @property({ type: Array })
  options: SelectOption[] = [];

  /**
   * The selected value. For multi-select, a comma-separated list of values.
   */
  @property({ type: String })
  value: string = '';

  /**
   * Enable multi-select mode.
   */
  @property({ type: Boolean, reflect: true })
  multiple: boolean = false;

  /**
   * Enable typeahead search.
   * - `'contains'`: filters options client-side.
   * - `'managed'`: emits a `search` event for server-controlled filtering.
   */
  @property({ type: String })
  search: '' | 'contains' | 'managed' = '';

  /**
   * Lets typed text that matches no option become the value (or one of the values with
   * `multiple`). Turns on the search input (as `search="contains"` when `search` is not set).
   * With `multiple`, custom values must not contain commas.
   */
  @property({ type: Boolean, attribute: 'allow-custom' })
  allowCustom = false;

  /** Shows a progress row in the options, for example while `search="managed"` fetches them. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /** Overrides Peacock's strings for this instance only. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  @state()
  private _open: boolean = false;

  @state()
  private _focused: boolean = false;

  @state()
  private _searchQuery: string = '';

  /** True when all options are filtered out by the current search query. */
  @state()
  private _noOptionsVisible: boolean = false;

  /** How many selected chips fit on the row; the rest collapse into a "+N" chip. */
  @state()
  private _visibleChipCount = Number.POSITIVE_INFINITY;

  @query('.select-trigger')
  private _triggerEl?: HTMLElement;

  @query('wc-field')
  private _fieldEl?: Field;

  @query('wc-menu')
  private _menu?: Menu;

  @query('.search-input')
  private _searchInputEl?: HTMLInputElement;

  @query('.chips-container')
  private _chipsContainer?: HTMLElement;

  private _chipsObserver?: ResizeObserver;

  private _chipsMeasureFrame = 0;

  /** Characters typed on the closed combobox, matched against option labels. */
  private _typeaheadBuffer = '';

  private _typeaheadTimer = 0;

  /** Whether the last render showed the "Create …" row, so the menu re-reads its items. */
  private _createShown = false;

  /**
   * The selected values, kept in sync with `value` (comma-separated). Use it with `multiple`;
   * for a single select it holds at most one value. The form gets one entry per value.
   */
  get values(): string[] {
    return this._selectedValues;
  }

  set values(next: string[]) {
    this.value = (this.multiple ? next : next.slice(0, 1)).join(',');
  }

  override focus() {
    this._triggerEl?.focus();
  }

  override blur() {
    this._triggerEl?.blur();
  }

  // ── Form association ──────────────────────────────────────────────────────

  override [getFormValue](): FormValue | null {
    if (!this.multiple) return this.value;
    // One entry per selected value, like a native <select multiple>.
    const data = new FormData();
    for (const value of this._selectedValues) data.append(this.name, value);
    return data;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  override disconnectedCallback() {
    this._chipsObserver?.disconnect();
    this._chipsObserver = undefined;
    cancelAnimationFrame(this._chipsMeasureFrame);
    window.clearTimeout(this._typeaheadTimer);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('value') || changed.has('multiple')) {
      this._visibleChipCount = Number.POSITIVE_INFINITY;
    }
  }

  protected override updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);
    if (changedProperties.has('options')) {
      this._syncProgrammaticOptions();
    }
    this._syncOptionStates();

    if (changedProperties.has('value') || changedProperties.has('multiple')) {
      this._observeChips();
      this._scheduleChipMeasure();
    }

    const createShown = this._showCreateOption;
    if (createShown !== this._createShown) {
      this._createShown = createShown;
      this.updateComplete.then(() => this._menu?.syncItems());
    }
  }

  // ── Protected ──────────────────────────────────────────────────────────────

  protected override valueMissingText(): string {
    return peacockString('valueMissingSelect');
  }

  protected override validityAnchor() {
    return this._triggerEl;
  }

  /** Clears the selection (every value of a multi-select) and fires `change`. */
  protected override clearValue() {
    if (!this.value) return;
    this.value = '';
    this._dispatchChange();
  }

  /** The field event contract, plus `values` for a multi-select. */
  protected override emitValue(type: 'input' | 'change') {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: this.multiple
          ? { value: this.value, values: this._selectedValues }
          : { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Programmatic options ───────────────────────────────────────────────────

  /**
   * Reconciles the `options` property with auto-generated `<wc-option>` light-DOM
   * children (marked `data-generated`).  Declarative children placed by the
   * consumer are left untouched.
   */
  private _syncProgrammaticOptions() {
    this.querySelectorAll('wc-option[data-generated]').forEach(el =>
      el.remove(),
    );
    for (const opt of this.options) {
      const el = new SelectOptionElement();
      el.value = opt.value;
      if (opt.icon) el.icon = opt.icon;
      el.textContent =
        opt.label || (opt.value === '' ? this._i18n.t('none') : opt.value);
      el.dataset.generated = '';
      this.appendChild(el);
    }
  }

  // ── Option state sync ──────────────────────────────────────────────────────

  private get _optionElements(): SelectOptionElement[] {
    return Array.from(this.querySelectorAll<SelectOptionElement>('wc-option'));
  }

  /**
   * Pushes `selected`, `multiple` and `filtered` state onto every `<wc-option>`
   * child element so each one can render itself correctly.
   */
  private _syncOptionStates() {
    const filtering =
      this._searchMode === 'contains' && this._searchQuery !== '';
    const searchText = this._searchQuery.toLowerCase();
    let visibleCount = 0;
    let filterChanged = false;

    for (const opt of this._optionElements) {
      opt.selected = this._isSelected(opt.value);
      opt.multiple = this.multiple;
      const filtered =
        filtering &&
        !(opt.textContent?.trim().toLowerCase() ?? '').includes(searchText);
      if (opt.filtered !== filtered) {
        opt.filtered = filtered;
        filterChanged = true;
      }
      if (!filtered) visibleCount += 1;
    }

    this._noOptionsVisible = visibleCount === 0;
    if (filterChanged) {
      // Filtered options are hidden after their own update; then re-read the menu's items.
      Promise.all(this._optionElements.map(opt => opt.updateComplete)).then(
        () => this._menu?.syncItems(),
      );
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private get _selectedValues(): string[] {
    if (!this.value) return [];
    if (!this.multiple) return [this.value];
    return this.value
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);
  }

  private _isSelected(value: string): boolean {
    if (value === '') {
      // An empty "None" option is only shown as chosen when no placeholder stands in for it.
      return !this.multiple && this.value === '' && !this.placeholder;
    }
    return this._selectedValues.includes(value);
  }

  /** Returns the display label for a given option value. */
  private _getLabelForValue(val: string): string {
    for (const opt of this._optionElements) {
      if (opt.value === val) {
        const label = opt.textContent?.trim();
        if (label) return label;
        return val === '' ? this._i18n.t('none') : val;
      }
    }
    // Fallback to options array (before wc-option children are created)
    const programmaticLabel = this.options.find(o => o.value === val)?.label;
    if (programmaticLabel) return programmaticLabel;
    return val === '' ? this._i18n.t('none') : val;
  }

  private get _displayLabel(): string {
    const firstValue = this._selectedValues[0];
    if (!firstValue) return '';
    return this._getLabelForValue(firstValue);
  }

  private get _isPopulated(): boolean {
    return !!this.value;
  }

  private get _isInteractive(): boolean {
    return !this.disabled && !this.readonly && !this.skeleton;
  }

  /** How the search input filters; `allow-custom` turns on `contains` when `search` is unset. */
  private get _searchMode(): '' | 'contains' | 'managed' {
    return this.search || (this.allowCustom ? 'contains' : '');
  }

  /** The enabled option whose label (or value) is the given text, ignoring case. */
  private _findOptionByText(text: string): SelectOptionElement | undefined {
    const wanted = text.trim().toLowerCase();
    if (!wanted) return undefined;
    return this._optionElements.find(
      opt =>
        !opt.disabled &&
        ((opt.textContent?.trim().toLowerCase() ?? '') === wanted ||
          opt.value.toLowerCase() === wanted),
    );
  }

  /** Whether to offer the "Create …" row: typed text that is no option and no chosen value. */
  private get _showCreateOption(): boolean {
    const text = this._searchQuery.trim();
    if (!this.allowCustom || !this._open || !text || this.loading) {
      return false;
    }
    if (this._findOptionByText(text)) return false;
    return !this._selectedValues.some(
      value => value.toLowerCase() === text.toLowerCase(),
    );
  }

  // ── Menu open/close ────────────────────────────────────────────────────────

  private _openMenu(focusTarget: MenuFocusTarget = 'active') {
    if (!this._isInteractive) return;
    const menu = this._menu;
    if (!menu) return;

    this._open = true;
    this._focused = true;
    this._searchQuery = '';

    // Anchor to the field's bordered box so the menu lines up with its edge
    // and is at least as wide as the field.
    const anchor = this._fieldEl?.fieldBodyElement ?? this._triggerEl ?? this;
    menu.anchorElement = anchor;
    menu.style.setProperty(
      '--menu-min-width',
      `${Math.ceil(anchor.getBoundingClientRect().width)}px`,
    );
    // With search, focus goes to the input; otherwise the menu focuses the selected option.
    menu.noAutofocus = this._searchMode !== '';
    menu.show(focusTarget);

    if (this._searchMode) {
      this.updateComplete.then(() => {
        this._searchInputEl?.focus();
      });
    }
  }

  private _closeMenu() {
    if (!this._open) return;
    this._open = false;
    this._focused = false;
    this._searchQuery = '';
    this._menu?.close();
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  private _toggleMenu() {
    if (this._open) {
      this._closeMenu();
    } else {
      this._openMenu();
    }
  }

  private _handleTriggerClick(event: MouseEvent) {
    event.stopPropagation();
    // Clicks inside the search input must not toggle the menu while the user types.
    if (event.target instanceof HTMLInputElement) {
      return;
    }
    this._toggleMenu();
  }

  private _handleFieldClick(event: MouseEvent) {
    const eventPath = event.composedPath();

    if (
      eventPath.includes(this._triggerEl as EventTarget) ||
      eventPath.some(
        target =>
          target instanceof HTMLInputElement ||
          (target instanceof HTMLElement && target.matches('wc-icon-button')),
      )
    ) {
      return;
    }

    this._toggleMenu();
  }

  private _handleTriggerKeyDown(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement) {
      this._handleSearchKeyDown(event);
      return;
    }

    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (this._open) {
          this._menu?.focus(event.key === 'ArrowUp' ? 'last' : 'active');
        } else {
          this._openMenu();
        }
        break;
      case 'Escape':
        if (this._open) {
          event.preventDefault();
          this._closeMenu();
        }
        break;
      case 'Home':
      case 'End':
        if (!this._open && !this.multiple && this._isInteractive) {
          event.preventDefault();
          const options = this._selectableOptions;
          const target =
            event.key === 'Home' ? options[0] : options[options.length - 1];
          if (target) this._selectWhileClosed(target.value);
        }
        break;
      default:
        if (!this._open && this._isPrintableKey(event) && event.key !== ' ') {
          this._handleClosedTypeahead(event);
        }
        break;
    }
  }

  /** Options the keyboard can choose while the list is closed. */
  private get _selectableOptions(): SelectOptionElement[] {
    return this._optionElements.filter(opt => !opt.disabled && !opt.filtered);
  }

  private _isPrintableKey(event: KeyboardEvent): boolean {
    return (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    );
  }

  /**
   * Typing on the closed combobox: with search, opens the list with the character in the search
   * input; a single select moves the selection to the next option starting with the typed text,
   * like a native select.
   */
  private _handleClosedTypeahead(event: KeyboardEvent) {
    if (!this._isInteractive) return;
    if (this._searchMode) {
      event.preventDefault();
      this._openMenu();
      this._setSearchQuery(event.key);
      this.updateComplete.then(() => {
        const input = this._searchInputEl;
        if (!input) return;
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      });
      return;
    }
    if (this.multiple) return;
    event.preventDefault();

    window.clearTimeout(this._typeaheadTimer);
    this._typeaheadTimer = window.setTimeout(() => {
      this._typeaheadBuffer = '';
    }, 500);

    const key = event.key.toLowerCase();
    const repeated =
      this._typeaheadBuffer.length > 0 &&
      [...this._typeaheadBuffer].every(char => char === key);
    this._typeaheadBuffer += key;
    // Typing the same letter again cycles through the options that start with it.
    const prefix = repeated ? key : this._typeaheadBuffer;

    const options = this._selectableOptions;
    const current = options.findIndex(opt => opt.value === this.value);
    const start = Math.max(current, 0);
    const firstOffset = prefix.length === 1 && current >= 0 ? 1 : 0;
    for (
      let step = firstOffset;
      step < options.length + firstOffset;
      step += 1
    ) {
      const option = options[(start + step) % options.length];
      if (option.typeaheadText.startsWith(prefix)) {
        this._selectWhileClosed(option.value);
        return;
      }
    }
  }

  /** Selects a value from the closed combobox and fires `change` when it differs. */
  private _selectWhileClosed(value: string) {
    if (value === this.value) return;
    this.value = value;
    this._dispatchChange();
  }

  /** Keys in the search input: arrows move into the list, Enter picks the first match. */
  private _handleSearchKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this._closeMenu();
        this._triggerEl?.focus();
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        this._menu?.focus(event.key === 'ArrowDown' ? 'first' : 'last');
        break;
      case 'Enter': {
        event.preventDefault();
        const text = this._searchQuery.trim();
        if (this.allowCustom && text) {
          // Free text: an option whose label is the text, else the text itself.
          const exact = this._findOptionByText(text);
          if (exact) {
            this._pick(exact.value);
          } else {
            this._create(text);
          }
          break;
        }
        const first = this._optionElements.find(
          opt => !opt.filtered && !opt.disabled,
        );
        if (first) this._pick(first.value);
        break;
      }
      case 'Tab':
        this._closeMenu();
        break;
      default:
        break;
    }
  }

  /** With search, typing while an option has focus goes back to the input. */
  private _handleMenuKeyDownCapture = {
    handleEvent: (event: KeyboardEvent) => {
      if (!this._searchMode || !this._open) return;
      if (!this._isPrintableKey(event) && event.key !== 'Backspace') return;
      if (event.key === ' ') return;
      // Stop the menu's own typeahead; the character lands in the input once it has focus.
      event.stopPropagation();
      this._searchInputEl?.focus();
    },
    capture: true,
  };

  /** The menu's `open`/`close` bubble and are composed; they are internal to the select. */
  private static _stopMenuEvent(event: Event) {
    event.stopPropagation();
  }

  /** The menu's `close` is internal too; when the list itself closes, reset the open state. */
  private _handleMenuClose(event: Event) {
    event.stopPropagation();
    // A sub-menu's `close` bubbles through the list; only the list's own counts.
    if (event.target !== event.currentTarget) return;
    this._open = false;
    this._focused = false;
    this._searchQuery = '';
  }

  private _handleMenuItemActivate(event: CustomEvent) {
    const item = event.detail?.item as
      | { value?: string; keepOpen?: boolean }
      | undefined;
    if (!item || item.value === undefined) return;
    event.stopPropagation();
    if (item instanceof Element && item.classList.contains('create-option')) {
      // A multi-select stays open after creating, as after picking.
      item.keepOpen = this.multiple;
      this._create(this._searchQuery);
      return;
    }
    this._pick(item.value);
  }

  /**
   * Keeps typed text as a value (`allow-custom`): fires a cancelable `create`, then picks the
   * text unless the consumer cancelled it.
   */
  private _create(text: string) {
    const value = text.trim();
    if (!value) return;
    const keep = this.dispatchEvent(
      new CustomEvent('create', {
        detail: { value },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (this.multiple) this._searchQuery = '';
    if (keep) {
      this._pick(value);
    } else if (!this.multiple) {
      this._closeMenu();
      this._triggerEl?.focus();
    }
  }

  /** Selects a value (toggles it for a multi-select) and fires `change`. */
  private _pick(val: string) {
    if (this.multiple) {
      if (val === '') return;
      const values = this._selectedValues;
      const idx = values.indexOf(val);
      if (idx >= 0) {
        values.splice(idx, 1);
      } else {
        values.push(val);
      }
      this.value = values.join(',');
    } else {
      this.value = val;
      this._closeMenu();
      this._triggerEl?.focus();
    }

    this._dispatchChange();
  }

  private _dispatchChange() {
    this.emitValue('change');
  }

  private _handleSearchInput(event: InputEvent) {
    // The native event escapes the shadow root; the search box is internal to the select.
    event.stopPropagation();
    this._setSearchQuery((event.target as HTMLInputElement).value);
  }

  /** Sets the search text; with `search="managed"`, tells the consumer through `search`. */
  private _setSearchQuery(text: string) {
    this._searchQuery = text;
    if (this.search !== 'managed') return;
    this.dispatchEvent(
      new CustomEvent('search', {
        detail: { value: text },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Options added or removed as children: update their state and the empty-state row. */
  private _handleSlotChange() {
    this._syncOptionStates();
    this._menu?.syncItems();
  }

  private _handleChipDismiss(event: CustomEvent, chipValue: string) {
    event.stopPropagation();
    const values = this._selectedValues.filter(v => v !== chipValue);
    this.value = values.join(',');
    this._dispatchChange();
  }

  // ── Chips overflow ─────────────────────────────────────────────────────────

  private _observeChips() {
    if (!this.multiple || typeof ResizeObserver === 'undefined') return;
    if (!this._chipsObserver) {
      this._chipsObserver = new ResizeObserver(() => {
        this._visibleChipCount = Number.POSITIVE_INFINITY;
        this._scheduleChipMeasure();
      });
    }
    this._chipsObserver.disconnect();
    if (this._triggerEl) this._chipsObserver.observe(this._triggerEl);
  }

  private _scheduleChipMeasure() {
    cancelAnimationFrame(this._chipsMeasureFrame);
    this._chipsMeasureFrame = requestAnimationFrame(() => {
      this.updateComplete.then(() => this._measureChips());
    });
  }

  /** Counts how many chips fit on one row, keeping room for the "+N" chip when some do not. */
  private _measureChips() {
    const container = this._chipsContainer;
    if (!container || !this.multiple) return;
    const chips = Array.from(
      container.querySelectorAll<HTMLElement>('wc-chip.value-chip'),
    );
    if (!chips.length) return;

    const available = container.clientWidth;
    const containerLeft = container.getBoundingClientRect().left;
    const rightEdge = (chip: HTMLElement) =>
      chip.getBoundingClientRect().right - containerLeft;

    if (rightEdge(chips[chips.length - 1]) <= available) {
      return;
    }

    let count = 0;
    for (const chip of chips) {
      if (rightEdge(chip) > available - OVERFLOW_CHIP_RESERVE_PX) break;
      count += 1;
    }
    this._visibleChipCount = Math.max(count, 1);
  }

  // ── Render helpers ─────────────────────────────────────────────────────────

  /** The row under the options: progress while `loading`, else the empty state. */
  private _renderStatusRow() {
    if (this.loading) {
      return html`<div class="loading-row" role="status">
        <wc-circular-progress
          class="loading-indicator"
          indeterminate
          aria-hidden="true"
        ></wc-circular-progress>
        <span>${this._i18n.t('loading')}</span>
      </div>`;
    }
    if (!this._noOptionsVisible) return nothing;
    const hasSearchQuery = this._searchQuery.trim().length > 0;
    return html`<div class="no-results" role="presentation">
      ${this._i18n.t(hasSearchQuery ? 'noResults' : 'noOptions')}
    </div>`;
  }

  /** The "Create …" row of `allow-custom`. */
  private _renderCreateOption() {
    if (!this._showCreateOption) return nothing;
    const text = this._searchQuery.trim();
    return html`<wc-option class="create-option" icon="add" .value=${text}
      >${this._i18n.t('createOption')(text)}</wc-option
    >`;
  }

  private _renderChips() {
    const values = this._selectedValues;
    const visible = values.slice(0, this._visibleChipCount);
    const hidden = values.length - visible.length;

    return html`<div class="chips-container">
      ${visible.map(
        val => html`
          <wc-chip
            class="value-chip"
            dismissible
            value=${val}
            ?disabled=${!this._isInteractive}
            @dismiss=${(e: CustomEvent) => this._handleChipDismiss(e, val)}
            >${this._getLabelForValue(val)}</wc-chip
          >
        `,
      )}
      ${hidden > 0
        ? html`<wc-chip
            class="overflow-chip"
            title=${values
              .slice(visible.length)
              .map(val => this._getLabelForValue(val))
              .join(', ')}
            >${new Intl.NumberFormat(this._i18n.locale, {
              signDisplay: 'always',
            }).format(hidden)}</wc-chip
          >`
        : nothing}
    </div>`;
  }

  private _renderTriggerContent() {
    // Typeahead: when open, show a text input for filtering
    if (this._searchMode && this._open) {
      return html`<input
        class="search-input"
        .value=${this._searchQuery}
        placeholder=${this._displayLabel || this.placeholder}
        aria-label=${this.label ||
        this.placeholder ||
        this._i18n.t('searchOptions')}
        aria-controls=${this._menuId}
        aria-autocomplete="list"
        @input=${this._handleSearchInput}
      />`;
    }

    // Multi-select: show chips for selected items
    if (this.multiple && this._selectedValues.length > 0) {
      return this._renderChips();
    }

    // Single select: show selected label or placeholder
    const label = this._displayLabel;
    if (!label) {
      return html`<span class="placeholder">${this.placeholder}</span>`;
    }
    return html`<span class="display-value">${label}</span>`;
  }

  private _renderFieldEnd() {
    return html`<div slot="field-end" class="field-end-wrapper">
      <wc-icon
        class=${classMap({
          'dropdown-icon': true,
          'dropdown-icon--open': this._open,
        })}
        name="arrow_drop_down"
        aria-hidden="true"
      ></wc-icon>
    </div>`;
  }

  private _renderTrigger() {
    const { 'aria-label': name, tabindex, ...aria } = this.fieldAria();
    return html`<div
      class="select-trigger"
      role="combobox"
      tabindex=${this.disabled ? '-1' : (tabindex ?? '0')}
      aria-label=${name || this.placeholder || this._i18n.t('selectOption')}
      aria-controls=${this._menuId}
      aria-expanded=${String(this._open)}
      aria-haspopup="listbox"
      aria-required=${this.required ? 'true' : nothing}
      aria-disabled=${this.disabled ? 'true' : nothing}
      aria-readonly=${this.readonly ? 'true' : nothing}
      @click=${this._handleTriggerClick}
      @keydown=${this._handleTriggerKeyDown}
      ${spread(aria)}
    >
      ${this._renderTriggerContent()}
    </div>`;
  }

  render() {
    // The wrapper takes clicks anywhere on the field, so they open the options; keys are handled
    // on the combobox.
    /* eslint-disable lit-a11y/click-events-have-key-events */
    return html`
      <div class="select-field" @click=${this._handleFieldClick}>
        ${this.renderField(this._renderTrigger(), {
          populated: this._isPopulated,
          focused: this._focused,
          end: this._renderFieldEnd(),
        })}
      </div>

      <wc-menu
        id=${this._menuId}
        role="listbox"
        placement="bottom-start"
        aria-label=${this.label || this._i18n.t('options')}
        aria-multiselectable=${this.multiple ? 'true' : nothing}
        aria-busy=${this.loading ? 'true' : nothing}
        @open=${Select._stopMenuEvent}
        @close=${this._handleMenuClose}
        @menu-item-activate=${this._handleMenuItemActivate}
        @keydown=${this._handleMenuKeyDownCapture}
      >
        <slot @slotchange=${this._handleSlotChange}></slot>
        ${this._renderCreateOption()} ${this._renderStatusRow()}
      </wc-menu>
    `;
    /* eslint-enable lit-a11y/click-events-have-key-events */
  }
}
