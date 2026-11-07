import { html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { live } from 'lit/directives/live.js';
import { repeat } from 'lit/directives/repeat.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  type FormRestoreState,
  type FormValue,
  getFormValue,
} from '@/__internal/mixins/form-associated.js';
import IndividualComponent from '@/IndividualComponent.js';
import type { Listbox } from '@/listbox/listbox.js';
import type { ListboxOption } from '@/listbox/listbox-option.js';

import BaseInput from '../input/BaseInput.js';
import styles from './transfer-list.scss';

/**
 * One item of a transfer list. `value` and `label` as in `wc-select`'s `options`, plus an optional
 * `description` shown under the label and `disabled`, which keeps the item on its side.
 */
export interface TransferListOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/** `detail` of `change`: the selected values, comma-separated (`value`) and as an array. */
export interface TransferListChangeDetail {
  value: string;
  values: string[];
}

/** The two lists: the source ("Available") and the value ("Selected"). */
type Side = 'available' | 'selected';

function isListboxOption(node: EventTarget): node is ListboxOption {
  return node instanceof Element && node.localName === 'wc-listbox-option';
}

let transferListCount = 0;

/**
 * @label Transfer List
 * @tag wc-transfer-list
 * @rawTag transfer-list
 *
 * @summary Two lists side by side; the person moves items from "Available" to "Selected" to choose them.
 * @overview
 * <p>A transfer list chooses several items from a long list, such as roles for a user, columns
 * for a report or members of a group, where seeing what is chosen next to what is left matters.
 * The items come from <code>options</code>; the ones in the "Selected" list are the value. For a
 * short list use <code>wc-listbox multiple</code> or <code>wc-checkbox-group</code>; inside a
 * compact form use <code>wc-select multiple</code>.</p>
 * <p>Each list is a <code>wc-listbox multiple</code>, so its keyboard and ARIA work as there: Up
 * and Down move, Space (or a click) checks an item, Ctrl+A (Cmd+A) checks all. The buttons
 * between the lists move the checked items, or all items, to the other list. Enter or a double
 * click moves one item straight away. Disabled options stay where they are, so a disabled
 * selected option is locked in. <code>searchable</code> adds a search box above each list; the
 * buttons then act on the matching items only. Each move is announced, such as "2 items moved to
 * Selected".</p>
 * <p>Without <code>ordered</code> the value keeps the order of <code>options</code>. With
 * <code>ordered</code> the selected list keeps the person's order: moved items join at the end,
 * the Move up and Move down buttons move the checked items, and Alt+Up and Alt+Down move the
 * focused one.</p>
 * <p>The value follows <code>wc-listbox multiple</code>: <code>value</code> is a comma-separated
 * list (so option values must not contain commas) and <code>values</code> the same as an array.
 * Inside a <code>&lt;form&gt;</code> each value is submitted under <code>name</code>;
 * <code>required</code> blocks submission while nothing is selected, and
 * <code>form.reset()</code> restores the first value. <code>readonly</code> shows the lists
 * without letting the person move items. On a narrow container the lists stack, with the arrows
 * turned to point down and up.</p>
 *
 * @fires {CustomEvent<{value: string, values: string[]}>} change - Dispatched when the person moves or reorders items. A move is a commit, so there is no separate `input`.
 *
 * @cssprop --transfer-list-list-block-size - Height of each list. Defaults to `16rem`.
 * @cssprop --transfer-list-container-color - Background of each list.
 * @cssprop --transfer-list-outline-color - Border of each list.
 *
 * @example
 * ```html
 * <wc-transfer-list
 *   label="Roles"
 *   name="roles"
 *   value="viewer"
 *   options='[{"value":"admin","label":"Administrator","description":"Full access"},{"value":"editor","label":"Editor"},{"value":"viewer","label":"Viewer"}]'
 * ></wc-transfer-list>
 * ```
 * @example
 * ```html
 * <wc-transfer-list label="Columns" searchable ordered></wc-transfer-list>
 * ```
 * @tags form
 */
@IndividualComponent
export class TransferList extends BaseInput {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────
  // `name` and `disabled` come from mixinFormAssociated; `readonly` and `required` from BaseInput.

  /** The items, in the order the lists show them. */
  @property({ type: Array })
  options: TransferListOption[] = [];

  /**
   * The selected values, comma-separated (use `values` for an array), so option values must not
   * contain commas. Without `ordered`, in the order of `options`.
   */
  @property({ type: String })
  value = '';

  /** Label shown above the lists; also the accessible name of the group. */
  @property({ type: String })
  label = '';

  /** Help text shown below the lists. */
  @property({ type: String, attribute: 'helper-text' })
  helperText = '';

  /** Shows the component in its error state with `error-text`. */
  @property({ type: Boolean, reflect: true })
  error = false;

  @property({ type: String, attribute: 'error-text' })
  errorText = '';

  /** Headline of the source list. Defaults to Peacock's "Available". */
  @property({ type: String, attribute: 'available-headline' })
  availableHeadline = '';

  /** Headline of the list that holds the value. Defaults to Peacock's "Selected". */
  @property({ type: String, attribute: 'selected-headline' })
  selectedHeadline = '';

  /** Adds a search box above each list that filters its items. */
  @property({ type: Boolean, reflect: true })
  searchable = false;

  /** Lets the person order the selected list; the value keeps that order. */
  @property({ type: Boolean, reflect: true })
  ordered = false;

  /** Locale for the counts; defaults to the nearest `lang`. */
  @property({ type: String })
  locale?: string;

  // ── State ────────────────────────────────────────────────────────────────

  /** The checked items of the available list. */
  @state() private availableChecked: string[] = [];

  /** The checked items of the selected list. */
  @state() private selectedChecked: string[] = [];

  /** Search text of the available list. */
  @state() private availableQuery = '';

  /** Search text of the selected list. */
  @state() private selectedQuery = '';

  /** Text of the polite live region. */
  @state() private announcement = '';

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.list-available') private availableList?: Listbox;

  @query('.list-selected') private selectedList?: Listbox;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly idPrefix = `wc-transfer-list-${(transferListCount += 1)}`;

  /** Peacock's strings for the headlines, buttons and announcements. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('options') && !Array.isArray(this.options)) {
      this.options = [];
    }
    if (changed.has('value') || changed.has('options')) {
      // Drop checks of items that are no longer on that side.
      const { values } = this;
      const available = this.availableChecked.filter(v => !values.includes(v));
      const selected = this.selectedChecked.filter(v => values.includes(v));
      if (available.length !== this.availableChecked.length) {
        this.availableChecked = available;
      }
      if (selected.length !== this.selectedChecked.length) {
        this.selectedChecked = selected;
      }
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /**
   * The selected values, kept in sync with `value`. The form gets one entry per value.
   */
  get values(): string[] {
    return this.value ? this.value.split(',') : [];
  }

  set values(next: string[]) {
    this.value = next.join(',');
  }

  override focus(options?: Parameters<HTMLElement['focus']>[0]) {
    this.availableList?.focus(options);
  }

  override blur() {
    (this.shadowRoot?.activeElement as HTMLElement | null)?.blur();
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected override valueMissingText(): string {
    return this.i18n.t('valueMissingSelect');
  }

  protected override validityAnchor() {
    return this.availableList ?? undefined;
  }

  override [getFormValue](): FormValue | null {
    // `value` is unset while the base classes construct.
    if (!this.name || !this.value) return null;
    const data = new FormData();
    for (const value of this.values) data.append(this.name, value);
    return data;
  }

  override formResetCallback() {
    super.formResetCallback();
    this.clearTransientState();
  }

  protected override parseRestoreState(restored: FormRestoreState): unknown {
    if (typeof restored === 'string') return restored;
    if (Array.isArray(restored)) {
      return restored
        .map(([, entry]) => entry)
        .filter((entry): entry is string => typeof entry === 'string')
        .join(',');
    }
    return '';
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private get isInteractive(): boolean {
    return !this.disabled && !this.readonly;
  }

  private clearTransientState() {
    this.availableChecked = [];
    this.selectedChecked = [];
    this.availableQuery = '';
    this.selectedQuery = '';
  }

  private headline(side: Side): string {
    if (side === 'available') {
      return this.availableHeadline || this.i18n.t('transferListAvailable');
    }
    return this.selectedHeadline || this.i18n.t('transferListSelected');
  }

  private formatCount(count: number): string {
    return new Intl.NumberFormat(this.i18n.locale).format(count);
  }

  /** The options of a side, in the order it shows them. */
  private sideOptions(side: Side): TransferListOption[] {
    const { values } = this;
    if (side === 'available') {
      return this.options.filter(option => !values.includes(option.value));
    }
    if (!this.ordered) {
      return this.options.filter(option => values.includes(option.value));
    }
    const byValue = new Map(this.options.map(option => [option.value, option]));
    return values
      .map(value => byValue.get(value))
      .filter((option): option is TransferListOption => !!option);
  }

  private matchesSearch(option: TransferListOption, side: Side): boolean {
    const text = (
      side === 'available' ? this.availableQuery : this.selectedQuery
    )
      .trim()
      .toLocaleLowerCase(this.i18n.locale);
    if (!this.searchable || !text) return true;
    return [option.label, option.description ?? '']
      .join(' ')
      .toLocaleLowerCase(this.i18n.locale)
      .includes(text);
  }

  /** Items of a side that a button may move: shown (matching the search) and enabled. */
  private movable(side: Side): TransferListOption[] {
    return this.sideOptions(side).filter(
      option => !option.disabled && this.matchesSearch(option, side),
    );
  }

  private checked(side: Side): string[] {
    return side === 'available' ? this.availableChecked : this.selectedChecked;
  }

  private setChecked(side: Side, values: string[]) {
    if (side === 'available') this.availableChecked = values;
    else this.selectedChecked = values;
  }

  /** The checked items of a side that a button moves. */
  private movableChecked(side: Side): string[] {
    const checked = this.checked(side);
    return this.movable(side)
      .map(option => option.value)
      .filter(value => checked.includes(value));
  }

  /** Moves `moved` (values on side `from`) to the other side. Returns whether anything moved. */
  private move(moved: string[], from: Side): boolean {
    if (!this.isInteractive) return false;
    const allowed = new Set(this.movable(from).map(option => option.value));
    const items = moved.filter(value => allowed.has(value));
    if (!items.length) return false;

    const { values } = this;
    let next: string[];
    if (from === 'available') {
      const order = this.options.map(option => option.value);
      const added = [...items].sort(
        (a, b) => order.indexOf(a) - order.indexOf(b),
      );
      // Without `ordered`, the option order; values the options do not know stay at the end.
      next = this.ordered
        ? [...values, ...added]
        : [
            ...order.filter(v => values.includes(v) || added.includes(v)),
            ...values.filter(v => !order.includes(v)),
          ];
    } else {
      next = values.filter(value => !items.includes(value));
    }

    this.setChecked(
      from,
      this.checked(from).filter(value => !items.includes(value)),
    );
    const target: Side = from === 'available' ? 'selected' : 'available';
    this.commit(
      next,
      this.i18n.t('transferListMoved')(
        items.length,
        this.formatCount(items.length),
        this.headline(target),
      ),
    );
    return true;
  }

  /** Moves the checked selected items one place up (`-1`) or down (`1`). */
  private reorder(values: string[], direction: -1 | 1): boolean {
    if (!this.isInteractive || !this.ordered) return false;
    const next = [...this.values];
    const moving = new Set(values);
    const indexes = next.map((_, index) => index);
    if (direction === 1) indexes.reverse();
    let changed = false;
    for (const index of indexes) {
      const other = index + direction;
      if (
        moving.has(next[index]) &&
        other >= 0 &&
        other < next.length &&
        !moving.has(next[other])
      ) {
        [next[index], next[other]] = [next[other], next[index]];
        changed = true;
      }
    }
    if (!changed) return false;
    let message = '';
    if (values.length === 1) {
      const option = this.options.find(o => o.value === values[0]);
      message = this.i18n.t('transferListPosition')(
        option?.label ?? values[0],
        this.formatCount(next.indexOf(values[0]) + 1),
        this.formatCount(next.length),
      );
    }
    this.commit(next, message);
    return true;
  }

  /** Whether `reorder(checked, direction)` would move anything. */
  private canReorder(direction: -1 | 1): boolean {
    const checked = this.selectedChecked.filter(value =>
      this.movable('selected').some(option => option.value === value),
    );
    if (!checked.length) return false;
    const { values } = this;
    return checked.some(value => {
      const other = values[values.indexOf(value) + direction];
      return other !== undefined && !checked.includes(other);
    });
  }

  private commit(next: string[], message: string) {
    this.value = next.join(',');
    if (message) this.announce(message);
    this.dispatchEvent(
      new CustomEvent<TransferListChangeDetail>('change', {
        bubbles: true,
        composed: true,
        detail: { value: this.value, values: [...next] },
      }),
    );
  }

  private announce(message: string) {
    // Clear first, so the same message twice in a row is read again.
    this.announcement = '';
    setTimeout(() => {
      this.announcement = message;
    });
  }

  private list(side: Side): Listbox | undefined {
    return side === 'available' ? this.availableList : this.selectedList;
  }

  /** After a keyboard move, puts focus on the option at `index` of `side`, or on the other list. */
  private async refocus(side: Side, index: number) {
    await this.updateComplete;
    const list = this.list(side);
    await list?.updateComplete;
    const options = (list?.options ?? []).filter(
      option => !option.disabled && !option.hidden,
    );
    const target = options[Math.min(index, options.length - 1)];
    if (target) {
      target.focus();
      return;
    }
    this.list(side === 'available' ? 'selected' : 'available')?.focus();
  }

  /** After a button move, keeps focus inside the component if the button turned disabled. */
  private async keepFocus(button: HTMLElement, fallback: Side) {
    await this.updateComplete;
    if ((button as HTMLElement & { disabled?: boolean }).disabled) {
      this.list(fallback)?.focus();
    }
  }

  private optionFromEvent(event: Event): ListboxOption | undefined {
    return event.composedPath().find(isListboxOption);
  }

  private handleListChange(side: Side, event: CustomEvent) {
    // The listbox's own `change` is about the checks, not the value; keep it inside.
    event.stopPropagation();
    const detail = event.detail as { values?: string[] };
    this.setChecked(side, [...(detail.values ?? [])]);
  }

  private handleListKeyDown(side: Side, event: KeyboardEvent) {
    const option = this.optionFromEvent(event);
    if (!option || option.disabled) return;
    const shown = (this.list(side)?.options ?? []).filter(o => !o.hidden);
    const index = shown.indexOf(option);

    if (event.key === 'Enter' && !event.altKey) {
      // Before the listbox, which would toggle the check.
      event.preventDefault();
      event.stopPropagation();
      if (this.move([option.optionValue], side)) this.refocus(side, index);
      return;
    }

    if (
      side === 'selected' &&
      this.ordered &&
      event.altKey &&
      (event.key === 'ArrowUp' || event.key === 'ArrowDown')
    ) {
      event.preventDefault();
      event.stopPropagation();
      const value = option.optionValue;
      if (this.reorder([value], event.key === 'ArrowUp' ? -1 : 1)) {
        this.refocusValue(value);
      }
    }
  }

  private async refocusValue(value: string) {
    await this.updateComplete;
    await this.selectedList?.updateComplete;
    this.selectedList?.options.find(o => o.optionValue === value)?.focus();
  }

  private handleListDblClick(side: Side, event: MouseEvent) {
    const option = this.optionFromEvent(event);
    if (!option || option.disabled) return;
    this.move([option.optionValue], side);
  }

  private handleSearchInput(side: Side, event: CustomEvent) {
    event.stopPropagation();
    const text = String((event.detail as { value?: string })?.value ?? '');
    if (side === 'available') this.availableQuery = text;
    else this.selectedQuery = text;
  }

  /** Keeps the search box's own field events inside the component. */
  private stopEvent(event: Event) {
    event.stopPropagation();
  }

  private handleMoveChecked(from: Side, event: Event) {
    const button = event.currentTarget as HTMLElement;
    if (this.move(this.movableChecked(from), from)) {
      this.keepFocus(button, from);
    }
  }

  private handleMoveAll(from: Side, event: Event) {
    const button = event.currentTarget as HTMLElement;
    if (
      this.move(
        this.movable(from).map(option => option.value),
        from,
      )
    ) {
      this.keepFocus(button, from === 'available' ? 'selected' : 'available');
    }
  }

  private handleReorder(direction: -1 | 1, event: Event) {
    const button = event.currentTarget as HTMLElement;
    const checked = this.movableChecked('selected');
    if (this.reorder(checked, direction)) {
      this.keepFocus(button, 'selected');
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderOption(option: TransferListOption, side: Side) {
    return html`<wc-listbox-option
      value=${option.value}
      ?disabled=${!!option.disabled}
      ?hidden=${!this.matchesSearch(option, side)}
      >${option.label}${option.description
        ? html`<span slot="supporting-text">${option.description}</span>`
        : nothing}</wc-listbox-option
    >`;
  }

  private renderEmpty(side: Side, options: TransferListOption[]) {
    if (options.some(option => this.matchesSearch(option, side)))
      return nothing;
    const text = options.length
      ? this.i18n.t('transferListNoMatches')
      : this.i18n.t('transferListEmpty');
    return html`<div class="empty">${text}</div>`;
  }

  private renderReorderButtons() {
    if (!this.ordered) return nothing;
    const off = !this.isInteractive;
    return html`<div class="reorder">
      <wc-icon-button
        class="move-up"
        shape="round"
        variant="text"
        size="xs"
        aria-label=${this.i18n.t('transferListMoveUp')}
        ?disabled=${off || !this.canReorder(-1)}
        @click=${(event: Event) => this.handleReorder(-1, event)}
        ><wc-icon name="arrow_upward"></wc-icon
      ></wc-icon-button>
      <wc-icon-button
        class="move-down"
        shape="round"
        variant="text"
        size="xs"
        aria-label=${this.i18n.t('transferListMoveDown')}
        ?disabled=${off || !this.canReorder(1)}
        @click=${(event: Event) => this.handleReorder(1, event)}
        ><wc-icon name="arrow_downward"></wc-icon
      ></wc-icon-button>
    </div>`;
  }

  private renderPane(side: Side) {
    const options = this.sideOptions(side);
    const headline = this.headline(side);
    const headlineWithCount = this.i18n.t('transferListHeadline')(
      headline,
      this.formatCount(options.length),
    );
    const headingId = `${this.idPrefix}-${side}-heading`;
    const searchText =
      side === 'available' ? this.availableQuery : this.selectedQuery;
    return html`
      <div class=${`pane pane-${side}`}>
        <div class="pane-header">
          <span class="headline" id=${headingId}>${headlineWithCount}</span>
          ${side === 'selected' ? this.renderReorderButtons() : nothing}
        </div>
        ${this.searchable
          ? html`<wc-search
              class=${`search search-${side}`}
              size="sm"
              variant="outlined"
              label=${this.i18n.t('transferListSearch')(headline)}
              .value=${searchText}
              ?disabled=${this.disabled}
              @input=${(event: CustomEvent) =>
                this.handleSearchInput(side, event)}
              @change=${this.stopEvent}
              @search=${this.stopEvent}
              @clear=${this.stopEvent}
            ></wc-search>`
          : nothing}
        <div
          class="list-wrapper"
          @keydown=${{
            handleEvent: (event: KeyboardEvent) =>
              this.handleListKeyDown(side, event),
            capture: true,
          }}
          @dblclick=${(event: MouseEvent) =>
            this.handleListDblClick(side, event)}
        >
          <wc-listbox
            class=${`list list-${side}`}
            multiple
            label=${headlineWithCount}
            .value=${live(this.checked(side).join(','))}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            @change=${(event: CustomEvent) =>
              this.handleListChange(side, event)}
          >
            ${repeat(
              options,
              option => option.value,
              option => this.renderOption(option, side),
            )}
          </wc-listbox>
          ${this.renderEmpty(side, options)}
        </div>
      </div>
    `;
  }

  private renderMoveButton(
    className: string,
    icon: string,
    label: string,
    enabled: boolean,
    onClick: (event: Event) => void,
  ) {
    return html`<wc-icon-button
      class=${`move ${className}`}
      shape="round"
      variant="tonal"
      size="sm"
      aria-label=${label}
      ?disabled=${!this.isInteractive || !enabled}
      @click=${onClick}
      ><wc-icon class="direction-icon" name=${icon}></wc-icon
    ></wc-icon-button>`;
  }

  private renderActions() {
    const toSelected = this.headline('selected');
    const toAvailable = this.headline('available');
    return html`<div class="actions">
      ${this.renderMoveButton(
        'move-checked-to-selected',
        'chevron_right',
        this.i18n.t('transferListMoveChecked')(toSelected),
        this.movableChecked('available').length > 0,
        event => this.handleMoveChecked('available', event),
      )}
      ${this.renderMoveButton(
        'move-all-to-selected',
        'keyboard_double_arrow_right',
        this.i18n.t('transferListMoveAll')(toSelected),
        this.movable('available').length > 0,
        event => this.handleMoveAll('available', event),
      )}
      ${this.renderMoveButton(
        'move-checked-to-available',
        'chevron_left',
        this.i18n.t('transferListMoveChecked')(toAvailable),
        this.movableChecked('selected').length > 0,
        event => this.handleMoveChecked('selected', event),
      )}
      ${this.renderMoveButton(
        'move-all-to-available',
        'keyboard_double_arrow_left',
        this.i18n.t('transferListMoveAll')(toAvailable),
        this.movable('selected').length > 0,
        event => this.handleMoveAll('selected', event),
      )}
    </div>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const labelId = `${this.idPrefix}-label`;
    const descriptionId = `${this.idPrefix}-description`;
    const errorText = this.error ? this.errorText : this.validationText;
    const description = errorText || this.helperText;

    return html`
      <div
        class=${classMap({
          'transfer-list': true,
          disabled: this.disabled,
          readonly: this.readonly,
          'has-error': this.error || !!errorText,
        })}
        role="group"
        aria-labelledby=${this.label ? labelId : nothing}
        aria-describedby=${description ? descriptionId : nothing}
      >
        ${this.label
          ? html`<div class="label" id=${labelId}>
              ${this.label}${this.required
                ? html`<span class="required" aria-hidden="true">*</span>`
                : nothing}
            </div>`
          : nothing}
        <div class="panes">
          ${this.renderPane('available')} ${this.renderActions()}
          ${this.renderPane('selected')}
        </div>
        ${description
          ? html`<div class="helper" id=${descriptionId}>${description}</div>`
          : nothing}
        <div class="screen-reader-only" role="status" aria-live="polite">
          ${this.announcement}
        </div>
      </div>
    `;
  }
}
