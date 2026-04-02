import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import BaseInput from '../input/BaseInput.js';
import styles from './select.scss';
import type { Menu } from '../menu/menu/menu.js';
import { SelectOptionElement } from './option.js';

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
export class Select extends BaseInput {
  static styles = [styles];

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
    * Show a clear button in single-select mode when a value is selected.
   */
  @property({ type: Boolean })
  clearable: boolean = false;

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

  @query('.select-trigger')
  private _triggerEl?: HTMLElement;

  private get _menu(): Menu | null {
    return (this.renderRoot?.querySelector('wc-menu') as unknown as Menu) ?? null;
  }

  @query('.search-input')
  private _searchInputEl?: HTMLInputElement;

  override focus() {
    this._triggerEl?.focus();
  }

  override blur() {
    this._triggerEl?.blur();
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  protected override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('options')) {
      this._syncProgrammaticOptions();
    }
    this._syncOptionStates();
  }

  // ── Programmatic options ───────────────────────────────────────────────────

  /**
   * Reconciles the `options` property with auto-generated `<wc-option>` light-DOM
   * children (marked `data-generated`).  Declarative children placed by the
   * consumer are left untouched.
   */
  private _syncProgrammaticOptions() {
    this.querySelectorAll('wc-option[data-generated]').forEach(el => el.remove());
    for (const opt of this.options) {
      const el = new SelectOptionElement();
      el.value = opt.value;
      if (opt.icon) el.icon = opt.icon;
      el.textContent = opt.label;
      el.dataset.generated = '';
      this.appendChild(el);
    }
  }

  // ── Option state sync ──────────────────────────────────────────────────────

  /**
   * Pushes `selected`, `keepOpen`, and `filtered` state onto every `<wc-option>`
   * child element so each one can render itself correctly.
   */
  private _syncOptionStates() {
    const optEls = Array.from(
      this.querySelectorAll<SelectOptionElement>('wc-option'),
    );
    let visibleCount = 0;
    for (const opt of optEls) {
      opt.selected = this._isSelected(opt.value);
      opt.keepOpen = this.multiple;
      if (this.search && this.search !== 'managed' && this._searchQuery) {
        const q = this._searchQuery.toLowerCase();
        const label = opt.textContent?.trim() ?? '';
        opt.filtered = !label.toLowerCase().includes(q);
        if (!opt.filtered) visibleCount++;
      } else {
        opt.filtered = false;
        visibleCount++;
      }
    }
    this._noOptionsVisible = optEls.length > 0 && visibleCount === 0;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private get _selectedValues(): string[] {
    if (!this.value) return [];
    return this.value
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);
  }

  private _isSelected(value: string): boolean {
    return this._selectedValues.includes(value);
  }

  /** Returns the display label for a given option value. */
  private _getLabelForValue(val: string): string {
    for (const opt of this.querySelectorAll<SelectOptionElement>('wc-option')) {
      if (opt.value === val) return opt.textContent?.trim() ?? val;
    }
    // Fallback to options array (before wc-option children are created)
    return this.options.find(o => o.value === val)?.label ?? val;
  }

  private get _displayLabel(): string {
    if (!this.value) return '';
    const firstValue = this._selectedValues[0];
    if (!firstValue) return '';
    return this._getLabelForValue(firstValue);
  }

  private get _isPopulated(): boolean {
    return !!this.value;
  }

  // ── Menu open/close ────────────────────────────────────────────────────────

  private _openMenu() {
    if (this.disabled || this.readonly) return;
    this._open = true;
    this._focused = true;
    const menu = this._menu;
    if (menu && this._triggerEl) {
      menu.anchorElement = this._triggerEl;
      menu.show();
    }
    if (this.search) {
      this._searchQuery = '';
      // Use rAF so that the search input receives focus *after* wc-menu has
      // finished showing and potentially focused a menu item.
      this.updateComplete.then(() => {
        requestAnimationFrame(() => {
          this._searchInputEl?.focus();
        });
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

  private _handleTriggerClick(event: MouseEvent) {
    // Ignore clicks that originated inside the search input — those should not
    // toggle the menu (the input needs to stay open so the user can type).
    if (event.target instanceof HTMLInputElement) {
      return;
    }
    if (this._open) {
      this._closeMenu();
    } else {
      this._openMenu();
    }
  }

  private _handleTriggerKeyDown(event: KeyboardEvent) {
    // When the typeahead search input is active, let the input handle its own
    // keys (Space, Enter, etc.). Only intercept Escape to close the menu.
    if (event.target instanceof HTMLInputElement) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this._closeMenu();
      }
      return;
    }
    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        event.preventDefault();
        if (!this._open) this._openMenu();
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

  private _handleMenuClosed() {
    this._open = false;
    this._focused = false;
    this._searchQuery = '';
  }

  private _handleMenuItemActivate(event: CustomEvent) {
    const item = event.detail?.item as { value: string } | undefined;
    if (!item) return;

    const val = item.value;
    if (!val) return;

    if (this.multiple) {
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

  private _handleClear(event: MouseEvent) {
    event.stopPropagation();
    this.value = '';
    this._dispatchChange();
  }

  private _handleChipDismiss(event: CustomEvent, chipValue: string) {
    event.stopPropagation();
    const values = this._selectedValues.filter(v => v !== chipValue);
    this.value = values.join(',');
    this._dispatchChange();
  }

  // ── Render helpers ─────────────────────────────────────────────────────────

  private _renderTriggerContent() {
    // Typeahead: when open, show a text input for filtering
    if (this.search && this._open) {
      return html`<input
        class="search-input"
        .value=${this._searchQuery}
        placeholder=${this._displayLabel || this.placeholder}
        @input=${this._handleSearchInput}
      />`;
    }

    // Multi-select: show chips for selected items
    if (this.multiple && this._selectedValues.length > 0) {
      return html`<div class="chips-container">
        ${this._selectedValues.map(
          val => html`
            <wc-chip
              dismissible
              value=${val}
              @tag--dismiss=${(e: CustomEvent) =>
                this._handleChipDismiss(e, val)}
            >${this._getLabelForValue(val)}</wc-chip
            >
          `,
        )}
      </div>`;
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
      this.clearable &&
      !this.multiple &&
      !!this.value &&
      !this.disabled &&
      !this.readonly;
    return html`
      ${showClear
        ? html`<wc-icon-button
            class="clear-btn"
            variant="text"
            size="sm"
            name="close"
            @click=${this._handleClear}
          ></wc-icon-button>`
        : nothing}
      <wc-icon
        class=${classMap({
          'dropdown-icon': true,
          'dropdown-icon--open': this._open,
        })}
        name="arrow_drop_down"
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
      >
        <div
          class="select-trigger"
          tabindex=${this.disabled ? -1 : 0}
          role="combobox"
          aria-expanded=${String(this._open)}
          aria-haspopup="listbox"
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
        placement="bottom-start"
        aria-label=${this.label || 'Options'}
        @closed=${this._handleMenuClosed}
        @menu-item-activate=${(e: CustomEvent) =>
          this._handleMenuItemActivate(e)}
      >
        <slot></slot>
        ${this._noOptionsVisible
          ? html`<wc-menu-item disabled>No options</wc-menu-item>`
          : nothing}
      </wc-menu>
    `;
  }
}

