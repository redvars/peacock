import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import BaseInput from '../input/BaseInput.js';
import styles from './select.scss';
import type { Menu } from '../menu/menu/menu.js';

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
 * <p>Select builds on wc-field and wc-menu to provide a fully-featured dropdown picker.</p>
 * <ul>
 *   <li>Single and multi-select modes</li>
 *   <li>Client-side typeahead with <code>search="contains"</code></li>
 *   <li>Server-side typeahead with <code>search="managed"</code></li>
 *   <li>Multi-select chips display</li>
 * </ul>
 *
 * @example
 * ```html
 * <wc-select label="Fruit" placeholder="Pick a fruit..."></wc-select>
 * <script>
 *   document.querySelector('wc-select').items = [
 *     { label: 'Apple', value: 'apple' },
 *     { label: 'Banana', value: 'banana' },
 *   ];
 * </script>
 * ```
 * @tags form
 */
export class Select extends BaseInput {
  static styles = [styles];

  /**
   * Array of options to display in the dropdown.
   */
  @property({ type: Array })
  items: SelectOption[] = [];

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
   * Show a clear button when a value is selected.
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

  private get _displayLabel(): string {
    if (!this.value) return '';
    const values = this._selectedValues;
    const item = this.items.find(i => i.value === values[0]);
    return item?.label ?? values[0] ?? '';
  }

  private get _filteredItems(): SelectOption[] {
    if (!this.search || this.search === 'managed' || !this._searchQuery) {
      return this.items;
    }
    const q = this._searchQuery.toLowerCase();
    return this.items.filter(item =>
      item.label.toLowerCase().includes(q),
    );
  }

  private get _isPopulated(): boolean {
    return !!this.value;
  }

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
            >${this.items.find(i => i.value === val)?.label ?? val}</wc-chip
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
      this.clearable && !!this.value && !this.disabled && !this.readonly;
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
        ${this._filteredItems.length === 0
          ? html`<wc-menu-item disabled>No options</wc-menu-item>`
          : this._filteredItems.map(
              item => html`
                <wc-menu-item
                  value=${item.value}
                  ?selected=${this._isSelected(item.value)}
                  ?keep-open=${this.multiple}
                >
                  ${item.icon
                    ? html`<wc-icon
                        name=${item.icon}
                        slot="leading-icon"
                      ></wc-icon>`
                    : nothing}
                  ${item.label}
                  ${this.multiple && this._isSelected(item.value)
                    ? html`<wc-icon
                        name="check"
                        slot="trailing-supporting-text"
                      ></wc-icon>`
                    : nothing}
                </wc-menu-item>
              `,
            )}
      </wc-menu>
    `;
  }
}
