import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import { RovingFocusController } from '@/__internal/controllers/roving-focus-controller.js';
import { isoToDate, parseRange } from '@/__internal/utils/date.js';
import type { Menu } from '@/menu/menu/menu.js';
import type { MenuItem } from '@/menu/menu-item/menu-item.js';
import type { Popover } from '@/popover/popover.js';
import styles from './filter-bar.scss';

/** The control a filter is edited with. */
export type FilterType =
  | 'select'
  | 'multiselect'
  | 'text'
  | 'date-range'
  | 'boolean';

/** One choice of a `select` or `multiselect` filter. */
export interface FilterOption {
  label: string;
  value: string;
}

/** A filter the person can add to the bar. */
export interface FilterDefinition {
  /** The filter's key in `value`. `q` is reserved for the search text. */
  key: string;
  /** The filter's name, shown in the "Add filter" menu and on its chip. */
  label: string;
  type: FilterType;
  /** Choices of a `select` or `multiselect` filter. */
  options?: FilterOption[];
  /** Placeholder of the filter's control. */
  placeholder?: string;
}

/**
 * The value of one filter: a string (`select`, `text`, and `date-range` as `start/end` ISO dates),
 * an array of strings (`multiselect`) or a boolean (`boolean`).
 */
export type FilterValue = string | string[] | boolean;

/** The active filters, by key; the search text is under `q`. Plain JSON, ready for a URL. */
export type FilterBarValue = Record<string, FilterValue>;

/** A saved view: a named set of filters. */
export interface FilterBarView {
  id: string;
  label: string;
  value: FilterBarValue;
}

/** `detail` of the `input`, `change` and `view-save` events. */
export interface FilterBarChangeDetail {
  value: FilterBarValue;
}

/** `detail` of the `view-change` event. */
export interface FilterBarViewChangeDetail {
  /** The id of the picked view, or `''` for "All" (the new `view`). */
  value: string;
}

/** Key of the search text in `value`. */
export const FILTER_BAR_SEARCH_KEY = 'q';

/** Events of the inner controls that must not leak out of the filter bar's shadow root. */
const INNER_EVENTS = [
  'change',
  'input',
  'open',
  'close',
  'search',
  'clear',
  'create',
  'dismiss',
  'menu-item-activate',
];

function isEmptyValue(value: FilterValue | undefined): boolean {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  return value === '';
}

/** A deep copy of a filter value, so consumers never hold the bar's own arrays. */
function copyValue(value: FilterBarValue): FilterBarValue {
  const copy: FilterBarValue = {};
  for (const [key, item] of Object.entries(value ?? {})) {
    copy[key] = Array.isArray(item) ? [...item] : item;
  }
  return copy;
}

/** Whether two values hold the same filters, ignoring key order. */
function sameValue(a: FilterBarValue, b: FilterBarValue): boolean {
  const aKeys = Object.keys(a).filter(key => !isEmptyValue(a[key]));
  const bKeys = Object.keys(b).filter(key => !isEmptyValue(b[key]));
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every(key => {
    const x = a[key];
    const y = b[key];
    if (Array.isArray(x) && Array.isArray(y)) {
      return x.length === y.length && x.every((item, i) => item === y[i]);
    }
    return x === y;
  });
}

/**
 * @label Filter Bar
 * @tag wc-filter-bar
 * @rawTag filter-bar
 * @summary The faceted filter row above a table or list: search, filter chips and saved views.
 * @overview
 * <p>Describe the filters the person can use with <code>filters</code>, an array of
 * <code>{ key, label, type, options?, placeholder? }</code>. <code>type</code> picks the control
 * the filter is edited with: <code>select</code>, <code>multiselect</code>, <code>text</code>,
 * <code>date-range</code> or <code>boolean</code> (a switch).</p>
 * <p>"Add filter" opens a menu of the filters not in use yet. Each active filter is a dismissible
 * chip, "Label: value"; a click (or Enter) on it opens its control in a popover, and its dismiss
 * button (or Delete) removes it. "Clear all" removes every filter and keeps the search text.</p>
 * <p><code>value</code> holds the active filters by key: a string for <code>select</code> and
 * <code>text</code>, an array of strings for <code>multiselect</code>, <code>start/end</code> ISO
 * dates for <code>date-range</code> and a boolean for <code>boolean</code>. With
 * <code>search</code>, the search text is under the reserved key <code>q</code>. The value is plain
 * JSON, so it can go in the URL. Every committed change fires <code>change</code> with
 * <code>{ value }</code>; typing in the search box fires <code>input</code>, and
 * <code>change</code> once the text is committed (Enter, blur or clear).</p>
 * <p>Saved views: <code>views</code> lists named values, shown in a views menu with "All" (which
 * clears the value). Picking one sets <code>view</code> to its id (<code>''</code> for "All"),
 * applies its value and fires <code>view-change</code>, then <code>change</code>. With
 * <code>saveable</code> the menu has "Save view", which fires <code>view-save</code> with the
 * current value; store it and add it to <code>views</code>. The views menu shows when there are
 * views or <code>saveable</code> is set. <code>view</code> stays as it is when the person edits
 * the filters afterwards.</p>
 * <p>Accessibility: the bar is a group named by <code>label</code> (default "Filters"). The chips
 * are one tab stop: the arrow keys move between them (mirrored in right-to-left), Home and End jump
 * to the ends. Each popover is a dialog named after its filter; Escape closes it and returns focus
 * to the chip. Removing a filter is announced through a polite live region.</p>
 *
 * @fires {CustomEvent<{value: FilterBarValue}>} change - Dispatched when the active filters (or the committed search text) change.
 * @fires {CustomEvent<{value: FilterBarValue}>} input - Dispatched while the person types in the search box; `detail.value` holds the text under `q`.
 * @fires {CustomEvent<{value: string}>} view-change - Dispatched when the person picks a saved view; `value` is its id, or `''` for "All".
 * @fires {CustomEvent<{value: FilterBarValue}>} view-save - Dispatched when the person picks "Save view".
 *
 * @example
 * ```html
 * <wc-filter-bar id="bar" search></wc-filter-bar>
 * <script>
 *   bar.filters = [
 *     { key: 'status', label: 'Status', type: 'select',
 *       options: [{ label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }] },
 *     { key: 'archived', label: 'Archived', type: 'boolean' },
 *   ];
 * </script>
 * ```
 * @tags form
 */
@IndividualComponent
export class FilterBar extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** The filters the person can add. */
  @property({ type: Array }) filters: FilterDefinition[] = [];

  /** The active filters, by key; the search text is under `q`. */
  @property({ type: Object }) value: FilterBarValue = {};

  /** Shows a search box; its text is `value.q`. */
  @property({ type: Boolean, reflect: true }) search = false;

  /** Placeholder of the search box; defaults to Peacock's "Search". */
  @property({ type: String, attribute: 'search-placeholder' })
  searchPlaceholder = '';

  /** Accessible name of the bar; defaults to Peacock's "Filters". */
  @property({ type: String }) label = '';

  /** Saved views, listed in the views menu. */
  @property({ type: Array }) views: FilterBarView[] = [];

  /** Id of the current saved view; `''` is "All". */
  @property({ type: String, reflect: true }) view = '';

  /** Adds "Save view" to the views menu, which fires `view-save`. */
  @property({ type: Boolean, reflect: true }) saveable = false;

  /** Overrides Peacock's strings for this instance only. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── State

  /** Key of the filter whose popover is open. */
  @state() private _editing: string | null = null;

  /** Key of a filter added from the menu that has no value yet. */
  @state() private _pending: string | null = null;

  /** Text of the polite live region. */
  @state() private _announcement = '';

  /** The search text while the person types, before it is committed into `value`. */
  @state() private _query = '';

  @state() private _addMenuOpen = false;

  @state() private _viewsMenuOpen = false;

  // ── Queries

  @query('.add-button') private _addButton?: HTMLElement;

  @query('.add-menu') private _addMenu?: Menu;

  @query('.views-button') private _viewsButton?: HTMLElement;

  @query('.views-menu') private _viewsMenu?: Menu;

  // ── Private fields

  private readonly i18n = new I18nController(this);

  private readonly roving = new RovingFocusController(this, {
    items: () => this.__chips(),
    orientation: () => 'horizontal',
    wrap: () => true,
  });

  /** Filter picked from the "Add filter" menu, opened once the menu has closed. */
  private __queuedEdit: string | null = null;

  /** Whether the bar set its own `aria-label`, so it removes only that one. */
  private __ownsAriaLabel = false;

  // ── Lifecycle

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
  }

  protected override firstUpdated() {
    const bar = this.shadowRoot?.querySelector('.bar');
    for (const type of INNER_EVENTS) {
      bar?.addEventListener(type, this.__stopInnerEvent);
    }
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('value')) {
      const q = this.value?.[FILTER_BAR_SEARCH_KEY];
      this._query = typeof q === 'string' ? q : '';
    }
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    const name = this.label || this.i18n.t('filters');
    if (this.__ownsAriaLabel || !this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', name);
      this.__ownsAriaLabel = true;
    }
  }

  // ── Public

  /** The definitions of the filters shown as chips, in the order they were added. */
  get activeFilters(): FilterDefinition[] {
    const keys = Object.keys(this.value ?? {}).filter(
      key => !isEmptyValue(this.value[key]),
    );
    if (this._pending && !keys.includes(this._pending))
      keys.push(this._pending);
    return keys
      .map(key => this.__definition(key))
      .filter((def): def is FilterDefinition => !!def);
  }

  /** Opens the popover of an active filter. */
  editFilter(key: string) {
    if (!this.activeFilters.some(def => def.key === key)) return;
    this._editing = key;
    this.__focusEditor(key);
  }

  /** Removes every filter (not the search text) and fires `change`. */
  async clearFilters() {
    const hadFocus = this.matches(':focus-within');
    const next: FilterBarValue = {};
    const q = this.value?.[FILTER_BAR_SEARCH_KEY];
    if (!isEmptyValue(q)) next[FILTER_BAR_SEARCH_KEY] = q;
    this._pending = null;
    this._editing = null;
    this.__commit(next);
    this.__announce(this.i18n.t('filtersCleared'));
    await this.updateComplete;
    // The "Clear all" button is gone; keep focus in the bar.
    if (hadFocus && !this.shadowRoot?.activeElement) this._addButton?.focus();
  }

  // ── Private: value

  private __definition(key: string) {
    return this.filters.find(def => def.key === key);
  }

  private __commit(next: FilterBarValue) {
    if (sameValue(next, this.value ?? {})) {
      this.value = next;
      return;
    }
    this.value = next;
    this.__dispatch('change', { value: copyValue(next) });
  }

  private __dispatch<T>(type: string, detail: T) {
    this.dispatchEvent(
      new CustomEvent<T>(type, { detail, bubbles: true, composed: true }),
    );
  }

  /** Sets one filter; an empty value removes it (it stays as a pending chip while edited). */
  private __setFilter(key: string, filterValue: FilterValue) {
    const next = copyValue(this.value ?? {});
    if (isEmptyValue(filterValue)) {
      delete next[key];
      if (this._editing === key) this._pending = key;
    } else {
      next[key] = filterValue;
      if (this._pending === key) this._pending = null;
    }
    this.__commit(next);
  }

  private async __remove(key: string) {
    const def = this.__definition(key);
    const chips = this.__chips();
    const index = chips.findIndex(chip => chip.dataset.key === key);
    const hadFocus = index >= 0 && chips[index].matches(':focus-within');
    if (this._editing === key) this._editing = null;
    if (this._pending === key) this._pending = null;
    if (key in (this.value ?? {})) {
      const next = copyValue(this.value);
      delete next[key];
      this.__commit(next);
    } else {
      this.requestUpdate();
    }
    if (def) this.__announce(this.i18n.t('filterRemoved')(def.label));
    await this.updateComplete;
    if (!hadFocus && this.shadowRoot?.activeElement) return;
    const rest = this.__chips();
    const target = rest[Math.min(index, rest.length - 1)];
    if (target) this.roving.setActive(target);
    else this._addButton?.focus();
  }

  private __announce(message: string) {
    // Clear first, so the same message twice in a row is read again.
    this._announcement = '';
    requestAnimationFrame(() => {
      this._announcement = message;
    });
  }

  // ── Private: display

  private __optionLabel(def: FilterDefinition, value: string) {
    return def.options?.find(option => option.value === value)?.label ?? value;
  }

  private __formatDate(iso: string) {
    const date = isoToDate(iso);
    if (!date) return '';
    return new Intl.DateTimeFormat(this.i18n.locale, {
      dateStyle: 'medium',
    }).format(date);
  }

  /** The value as shown on the chip, and the full text for its accessible name. */
  private __displayValue(def: FilterDefinition): {
    short: string;
    full: string;
  } {
    const value = this.value?.[def.key];
    if (isEmptyValue(value)) return { short: '', full: '' };
    switch (def.type) {
      case 'multiselect': {
        const labels = (Array.isArray(value) ? value : [String(value)]).map(
          item => this.__optionLabel(def, item),
        );
        const short =
          labels.length > 1
            ? `${labels[0]} ${this.i18n.t('moreValues')(labels.length - 1)}`
            : labels[0];
        const full = new Intl.ListFormat(this.i18n.locale, {
          type: 'disjunction',
        }).format(labels);
        return { short, full };
      }
      case 'boolean': {
        const text = value ? this.i18n.t('yes') : this.i18n.t('no');
        return { short: text, full: text };
      }
      case 'date-range': {
        const [start, end] = parseRange(String(value));
        const startDate = isoToDate(start);
        const endDate = isoToDate(end);
        let text: string;
        if (startDate && endDate) {
          text = new Intl.DateTimeFormat(this.i18n.locale, {
            dateStyle: 'medium',
          }).formatRange(startDate, endDate);
        } else {
          text = this.__formatDate(start || end);
        }
        return { short: text, full: text };
      }
      case 'select': {
        const text = this.__optionLabel(def, String(value));
        return { short: text, full: text };
      }
      default:
        return { short: String(value), full: String(value) };
    }
  }

  // ── Private: focus

  private __chips(): HTMLElement[] {
    return Array.from(
      this.shadowRoot?.querySelectorAll<HTMLElement>('wc-chip.filter-chip') ??
        [],
    );
  }

  private __chipFor(key: string) {
    return this.__chips().find(chip => chip.dataset.key === key) ?? null;
  }

  /** Focuses the control in a filter's popover once it is open. */
  private async __focusEditor(key: string) {
    await this.updateComplete;
    const popover = this.shadowRoot?.querySelector<Popover>(
      `wc-popover[data-key="${CSS.escape(key)}"]`,
    );
    await popover?.updateComplete;
    const control = popover?.querySelector<
      HTMLElement & { updateComplete?: Promise<unknown> }
    >('.control');
    await control?.updateComplete;
    control?.focus();
  }

  // ── Private: event handlers

  /** Keeps the inner controls' events inside the bar. */
  private __stopInnerEvent = (event: Event) => {
    event.stopPropagation();
  };

  private __handleChipKeyDown = (event: KeyboardEvent) => {
    const chip = event
      .composedPath()
      .find(node => this.__chips().includes(node as HTMLElement)) as
      | HTMLElement
      | undefined;
    if (!chip) return;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      const { key } = chip.dataset;
      if (key) this.__remove(key);
      return;
    }
    this.roving.handleKeyDown(event);
  };

  private __handleChipClick(key: string) {
    if (this._editing === key) return;
    this._editing = key;
    this.__focusEditor(key);
  }

  private async __handlePopoverClose(key: string, event: CustomEvent) {
    // A nested overlay (the select's menu, the date picker) closes too; only the popover counts.
    if (event.target !== event.currentTarget) return;
    if (this._editing === key) this._editing = null;
    const dropped = this._pending === key && isEmptyValue(this.value?.[key]);
    if (dropped) this._pending = null;
    if (event.detail?.reason === 'light-dismiss') return;
    await this.updateComplete;
    const chip = this.__chipFor(key);
    if (chip) this.roving.setActive(chip);
    else this._addButton?.focus();
  }

  private __toggleMenu(
    target: Menu | undefined,
    anchor: HTMLElement | undefined,
  ) {
    const menu = target;
    if (!menu || !anchor) return;
    if (menu.open) {
      menu.close();
      return;
    }
    menu.anchorElement = anchor;
    menu.show('first');
  }

  private __handleAddActivate = (event: CustomEvent<{ item: MenuItem }>) => {
    const key = event.detail.item.value;
    const def = this.__definition(key);
    if (!def) return;
    if (def.type === 'boolean') {
      this.__setFilter(key, true);
    } else {
      this._pending = key;
    }
    this.__queuedEdit = key;
  };

  private __handleAddMenuClose = (event: Event) => {
    if (event.target !== event.currentTarget) return;
    this._addMenuOpen = false;
    const key = this.__queuedEdit;
    this.__queuedEdit = null;
    if (key) {
      this._editing = key;
      this.__focusEditor(key);
    }
  };

  private __handleViewActivate = (event: CustomEvent<{ item: MenuItem }>) => {
    const { item } = event.detail;
    if (item.classList.contains('save-view')) {
      this.__dispatch<FilterBarChangeDetail>('view-save', {
        value: copyValue(this.value ?? {}),
      });
      return;
    }
    const id = item.value;
    const view = this.views.find(candidate => candidate.id === id);
    this.view = id;
    this._pending = null;
    this._editing = null;
    this.__dispatch<FilterBarViewChangeDetail>('view-change', { value: id });
    this.__commit(view ? copyValue(view.value) : {});
  };

  private __handleSearchInput = (event: Event) => {
    const text = (event.currentTarget as HTMLElement & { value: string }).value;
    this._query = text;
    this.__dispatch<FilterBarChangeDetail>('input', {
      value: this.__withQuery(text),
    });
  };

  private __handleSearchChange = (event: Event) => {
    const text = (event.currentTarget as HTMLElement & { value: string }).value;
    this._query = text;
    this.__commit(this.__withQuery(text));
  };

  private __withQuery(text: string): FilterBarValue {
    const next = copyValue(this.value ?? {});
    if (text) next[FILTER_BAR_SEARCH_KEY] = text;
    else delete next[FILTER_BAR_SEARCH_KEY];
    return next;
  }

  private __handleControlChange(def: FilterDefinition, event: Event) {
    const control = event.currentTarget as HTMLElement & {
      value?: string;
      values?: string[];
      checked?: boolean;
    };
    switch (def.type) {
      case 'multiselect':
        this.__setFilter(def.key, [...(control.values ?? [])]);
        break;
      case 'boolean':
        this.__setFilter(def.key, !!control.checked);
        break;
      case 'date-range': {
        const [start, end] = parseRange(control.value ?? '');
        // Wait for both ends; a half-picked range is not a filter yet.
        if ((start && end) || !control.value) {
          this.__setFilter(def.key, control.value ?? '');
        }
        break;
      }
      case 'select':
        this.__setFilter(def.key, control.value ?? '');
        if (control.value) this._editing = null;
        break;
      default:
        this.__setFilter(def.key, control.value ?? '');
    }
  }

  private __handleTextKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') this._editing = null;
  }

  // ── Render

  private __renderControl(def: FilterDefinition) {
    const value = this.value?.[def.key];
    const onChange = (event: Event) => this.__handleControlChange(def, event);
    switch (def.type) {
      case 'select':
      case 'multiselect':
        return html`<wc-select
          class="control"
          label=${def.label}
          placeholder=${def.placeholder ?? ''}
          ?multiple=${def.type === 'multiselect'}
          .options=${def.options ?? []}
          .value=${Array.isArray(value) ? value.join(',') : String(value ?? '')}
          @change=${onChange}
        ></wc-select>`;
      case 'boolean':
        return html`<wc-switch
          class="control"
          label=${def.label}
          .checked=${value === true}
          @change=${onChange}
        ></wc-switch>`;
      case 'date-range':
        return html`<wc-date-range-field
          class="control"
          label=${def.label}
          .value=${typeof value === 'string' ? value : ''}
          @change=${onChange}
        ></wc-date-range-field>`;
      default:
        return html`<wc-input
          class="control"
          label=${def.label}
          placeholder=${def.placeholder ?? ''}
          .value=${typeof value === 'string' ? value : ''}
          @change=${onChange}
          @keydown=${(event: KeyboardEvent) => this.__handleTextKeyDown(event)}
        ></wc-input>`;
    }
  }

  private __renderChip(def: FilterDefinition) {
    const { short, full } = this.__displayValue(def);
    const open = this._editing === def.key;
    const text = short
      ? this.i18n.t('filterValue')(def.label, short)
      : def.label;
    const name = full ? this.i18n.t('filterValue')(def.label, full) : def.label;
    return html`<wc-popover
      trigger="manual"
      placement="bottom-start"
      data-key=${def.key}
      label=${def.label}
      .open=${open}
      @close=${(event: CustomEvent) =>
        this.__handlePopoverClose(def.key, event)}
    >
      <wc-chip
        class="filter-chip"
        data-key=${def.key}
        dismissible
        .configAria=${{
          'aria-label': name,
          'aria-haspopup': 'dialog',
          'aria-expanded': String(open),
          'aria-keyshortcuts': 'Delete',
        }}
        @click=${() => this.__handleChipClick(def.key)}
        @dismiss=${() => this.__remove(def.key)}
        >${text}</wc-chip
      >
      <wc-popover-content>
        <div class="editor">${open ? this.__renderControl(def) : nothing}</div>
      </wc-popover-content>
    </wc-popover>`;
  }

  private __renderViews() {
    if (!this.views.length && !this.saveable) return nothing;
    const current = this.views.find(view => view.id === this.view);
    return html`<div class="views">
      <wc-button
        class="views-button"
        variant="text"
        trailing-icon
        aria-label=${`${this.i18n.t('views')}: ${current?.label ?? this.i18n.t('allItems')}`}
        aria-haspopup="menu"
        aria-expanded=${String(this._viewsMenuOpen)}
        @click=${() => this.__toggleMenu(this._viewsMenu, this._viewsButton)}
        ><wc-icon slot="icon" name="arrow_drop_down"></wc-icon
        >${current?.label ?? this.i18n.t('allItems')}</wc-button
      >
      <wc-menu
        class="views-menu"
        @menu-item-activate=${this.__handleViewActivate}
        @open=${(event: Event) => {
          if (event.target === event.currentTarget) this._viewsMenuOpen = true;
        }}
        @close=${(event: Event) => {
          if (event.target === event.currentTarget) this._viewsMenuOpen = false;
        }}
      >
        <wc-menu-item type="radio" value="" ?selected=${!current}
          >${this.i18n.t('allItems')}</wc-menu-item
        >
        ${this.views.map(
          view =>
            html`<wc-menu-item
              type="radio"
              value=${view.id}
              ?selected=${current === view}
              >${view.label}</wc-menu-item
            >`,
        )}
        ${this.saveable
          ? html`<wc-divider></wc-divider>
              <wc-menu-item class="save-view"
                ><wc-icon slot="start" name="bookmark_add"></wc-icon
                >${this.i18n.t('saveView')}</wc-menu-item
              >`
          : nothing}
      </wc-menu>
    </div>`;
  }

  private __renderAdd(active: FilterDefinition[]) {
    if (!this.filters.length) return nothing;
    const available = this.filters.filter(
      def => !active.some(item => item.key === def.key),
    );
    return html`<wc-button
        class="add-button"
        variant="text"
        ?disabled=${available.length === 0}
        aria-haspopup="menu"
        aria-expanded=${String(this._addMenuOpen)}
        @click=${() => this.__toggleMenu(this._addMenu, this._addButton)}
        ><wc-icon slot="icon" name="add"></wc-icon>${this.i18n.t(
          'addFilter',
        )}</wc-button
      >
      <wc-menu
        class="add-menu"
        @menu-item-activate=${this.__handleAddActivate}
        @open=${(event: Event) => {
          if (event.target === event.currentTarget) this._addMenuOpen = true;
        }}
        @close=${this.__handleAddMenuClose}
      >
        ${available.map(
          def =>
            html`<wc-menu-item value=${def.key}>${def.label}</wc-menu-item>`,
        )}
      </wc-menu>`;
  }

  override render() {
    const active = this.activeFilters;
    const hasFilters = Object.keys(this.value ?? {}).some(
      key =>
        key !== FILTER_BAR_SEARCH_KEY &&
        !isEmptyValue(this.value[key]) &&
        !!this.__definition(key),
    );
    return html`<div class="bar">
        ${this.__renderViews()}
        ${this.search
          ? html`<wc-search
              class="search"
              size="sm"
              label=${this.searchPlaceholder || this.i18n.t('search')}
              placeholder=${this.searchPlaceholder}
              .value=${this._query}
              @input=${this.__handleSearchInput}
              @change=${this.__handleSearchChange}
            ></wc-search>`
          : nothing}
        <div
          class="chips"
          @keydown=${this.__handleChipKeyDown}
          @focusin=${this.roving.handleFocusIn}
        >
          ${repeat(
            active,
            def => def.key,
            def => this.__renderChip(def),
          )}
        </div>
        ${this.__renderAdd(active)}
        ${hasFilters
          ? html`<wc-button
              class="clear-button"
              variant="text"
              @click=${() => this.clearFilters()}
              >${this.i18n.t('clearFilters')}</wc-button
            >`
          : nothing}
      </div>
      <div class="sr-only" role="status" aria-live="polite">
        ${this._announcement}
      </div>`;
  }
}
