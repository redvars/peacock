import { html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import {
  type FormValue,
  getFormValue,
} from '@/__internal/mixins/form-associated.js';
import IndividualComponent from '@/IndividualComponent.js';
import BaseInput from '../input/BaseInput.js';
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
 * @summary A dropdown select component supporting single and multi-select with optional typeahead search.
 * @overview
 * Select builds on wc-field and wc-menu to provide a fully-featured dropdown picker.
 *
 * - Single and multi-select modes; a multi-select shows a checkbox on every option
 * - Client-side typeahead with `search="contains"`
 * - Server-side typeahead with `search="managed"`
 * - Multi-select chips on one row, with a "+N" chip for the ones that do not fit
 * - `clearable` adds a button that clears the value
 * - Form-associated: submits the value under `name` (one entry per value with `multiple`)
 * - The options open in the top layer, so a select works inside a wc-modal
 *
 * Keyboard: Enter, Space, Arrow Down or Arrow Up open the options and focus the selected one.
 * In the list, the arrows move, typing a letter jumps to the next option starting with it,
 * Enter or Space picks, Escape closes and returns focus to the field. With `search`, typing goes
 * to the search input; Arrow Down moves into the list and Enter picks the first match.
 *
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the selection changes.
 * @fires {CustomEvent<{value: string}>} select-search - Dispatched as the user types when `search="managed"`.
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
export class Select extends BaseInput {
  static styles = [styles];

  private readonly _menuId = `wc-select-menu-${Math.random().toString(36).slice(2, 9)}`;

  /**
   * Array of options to display in the dropdown.
   * Setting this property creates matching `<wc-option>` children automatically.
   */
  @property({ type: Array })
  options: SelectOption[] = [];

  /**
   * The selected value. For multi-select, a comma-separated list of values.
   */
  @property({ type: String, reflect: true })
  value: string = '';

  /**
   * Enable multi-select mode.
   */
  @property({ type: Boolean, reflect: true })
  multiple: boolean = false;

  /**
   * Enable typeahead search.
   * - `'contains'`: filters options client-side.
   * - `'managed'`: emits a `select-search` event for server-controlled filtering.
   */
  @property({ type: String })
  search: '' | 'contains' | 'managed' = '';

  /**
   * Shows a button that clears the value.
   */
  @property({ type: Boolean, reflect: true })
  clearable: boolean = false;

  /**
   * Placeholder text shown when no value is selected.
   */
  @property({ type: String })
  placeholder: string = '';

  /**
   * Label displayed above the field.
   */
  @property({ type: String })
  label: string = '';

  /**
   * Visual variant of the field.
   */
  @property({ type: String })
  variant: 'filled' | 'outlined' | 'default' = 'default';

  /**
   * Helper text displayed below the field.
   */
  @property({ type: String, attribute: 'helper-text' })
  helperText: string = '';

  @property({ type: Boolean })
  error: boolean = false;

  @property({ type: String, attribute: 'error-text' })
  errorText: string = '';

  @property({ type: Boolean })
  warning: boolean = false;

  @property({ type: String, attribute: 'warning-text' })
  warningText: string = '';

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

  /** The selected values; for a single select, at most one. */
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
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('value') || changed.has('multiple')) {
      this._visibleChipCount = Number.POSITIVE_INFINITY;
    }
  }

  protected override updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('options')) {
      this._syncProgrammaticOptions();
    }
    this._syncOptionStates();

    if (changedProperties.has('value') || changedProperties.has('multiple')) {
      this._observeChips();
      this._scheduleChipMeasure();
    }
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
      el.textContent = opt.label || (opt.value === '' ? 'None' : opt.value);
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
      this.search !== '' &&
      this.search !== 'managed' &&
      this._searchQuery !== '';
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
        return val === '' ? 'None' : val;
      }
    }
    // Fallback to options array (before wc-option children are created)
    const programmaticLabel = this.options.find(o => o.value === val)?.label;
    if (programmaticLabel) return programmaticLabel;
    return val === '' ? 'None' : val;
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
    menu.noAutofocus = this.search !== '';
    menu.show(focusTarget);

    if (this.search) {
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
      default:
        break;
    }
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
      if (!this.search || !this._open) return;
      const printable =
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey;
      if (!printable && event.key !== 'Backspace') return;
      if (event.key === ' ') return;
      // Stop the menu's own typeahead; the character lands in the input once it has focus.
      event.stopPropagation();
      this._searchInputEl?.focus();
    },
    capture: true,
  };

  private _handleMenuClosed() {
    this._open = false;
    this._focused = false;
    this._searchQuery = '';
  }

  private _handleMenuItemActivate(event: CustomEvent) {
    const item = event.detail?.item as { value?: string } | undefined;
    if (!item || item.value === undefined) return;
    event.stopPropagation();
    this._pick(item.value);
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
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleSearchInput(event: InputEvent) {
    this._searchQuery = (event.target as HTMLInputElement).value;
    if (this.search === 'managed') {
      this.dispatchEvent(
        new CustomEvent('select-search', {
          detail: { value: this._searchQuery },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private _handleChipDismiss(event: CustomEvent, chipValue: string) {
    event.stopPropagation();
    const values = this._selectedValues.filter(v => v !== chipValue);
    this.value = values.join(',');
    this._dispatchChange();
  }

  private _handleClear(event: MouseEvent) {
    event.stopPropagation();
    if (!this.value) return;
    this.value = '';
    this._dispatchChange();
    this._triggerEl?.focus();
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

  private _renderNoResults() {
    const hasSearchQuery = this._searchQuery.trim().length > 0;
    return html`<div class="no-results" role="presentation">
      ${hasSearchQuery ? 'No results' : 'No options'}
    </div>`;
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
            >+${hidden}</wc-chip
          >`
        : nothing}
    </div>`;
  }

  private _renderTriggerContent() {
    // Typeahead: when open, show a text input for filtering
    if (this.search && this._open) {
      return html`<input
        class="search-input"
        .value=${this._searchQuery}
        placeholder=${this._displayLabel || this.placeholder}
        aria-label=${this.label || this.placeholder || 'Search options'}
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
    const showClear =
      this.clearable && this._isPopulated && this._isInteractive;
    return html`
      ${showClear
        ? html`<wc-icon-button
            class="clear-btn"
            variant="text"
            shape="round"
            size="xs"
            color="surface"
            aria-label="Clear"
            tooltip="Clear"
            @click=${this._handleClear}
          >
            <wc-icon name="close"></wc-icon>
          </wc-icon-button>`
        : nothing}
      <wc-icon
        class=${classMap({
          'dropdown-icon': true,
          'dropdown-icon--open': this._open,
        })}
        name="arrow_drop_down"
        aria-hidden="true"
      ></wc-icon>
    `;
  }

  render() {
    return html`
      <wc-field
        label=${this.label}
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this.skeleton}
        helper-text=${this.helperText}
        ?error=${this.error}
        error-text=${this.errorText}
        ?warning=${this.warning}
        warning-text=${this.warningText}
        variant=${this.variant}
        ?populated=${this._isPopulated || this._open}
        ?focused=${this._focused}
        .host=${this}
        class="select-field"
        @click=${this._handleFieldClick}
      >
        <div
          class="select-trigger"
          tabindex=${this.disabled ? -1 : 0}
          role="combobox"
          aria-label=${this.label || this.placeholder || 'Select option'}
          aria-controls=${this._menuId}
          aria-expanded=${String(this._open)}
          aria-haspopup="listbox"
          aria-disabled=${this.disabled ? 'true' : nothing}
          aria-readonly=${this.readonly ? 'true' : nothing}
          @click=${this._handleTriggerClick}
          @keydown=${this._handleTriggerKeyDown}
        >
          ${this._renderTriggerContent()}
        </div>

        <div slot="field-end" class="field-end-wrapper">
          ${this._renderFieldEnd()}
        </div>
      </wc-field>

      <wc-menu
        id=${this._menuId}
        role="listbox"
        placement="bottom-start"
        aria-label=${this.label || 'Options'}
        aria-multiselectable=${this.multiple ? 'true' : nothing}
        @closed=${this._handleMenuClosed}
        @menu-item-activate=${this._handleMenuItemActivate}
        @keydown=${this._handleMenuKeyDownCapture}
      >
        <slot></slot>
        ${this._noOptionsVisible ? this._renderNoResults() : nothing}
      </wc-menu>
    `;
  }
}
