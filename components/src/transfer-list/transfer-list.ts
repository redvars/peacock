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

/** A press on a drag handle of the selected list, which becomes a drag past `DRAG_THRESHOLD`. */
interface DragSession {
  pointerId: number;
  handle: Element;
  startX: number;
  startY: number;
  /** The values that move, in their current order. */
  values: string[];
  active: boolean;
  /** Last pointer position, for auto-scroll. */
  clientX: number;
  clientY: number;
}

/** Pointer travel in pixels before a handle press becomes a drag. */
const DRAG_THRESHOLD = 4;

/** Distance in pixels from a list edge at which a drag scrolls the list. */
const AUTO_SCROLL_EDGE = 24;

/** Pixels a drag scrolls the list per frame at the very edge. */
const AUTO_SCROLL_SPEED = 12;

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
 * focused one. Each selected item also gets a drag handle: dragging it moves the item, or all
 * checked items when it is checked, to where the drop line shows. Escape or a release outside
 * the list cancels the drag.</p>
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

  /** Error message shown below the component while `error` is set; replaces the help text. */
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

  /** The values being dragged in the selected list; empty while no drag is active. */
  @state() private dragValues: string[] = [];

  /** Where a drag would drop, as an index among the shown selected items; `null` for nowhere. */
  @state() private dropIndex: number | null = null;

  /** Pointer position inside the selected list wrapper, for the dragged copy. */
  @state() private dragPoint: { x: number; y: number } = { x: 0, y: 0 };

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.list-available') private availableList?: Listbox;

  @query('.list-selected') private selectedList?: Listbox;

  @query('.pane-selected .list-wrapper') private selectedWrapper?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly idPrefix = `wc-transfer-list-${(transferListCount += 1)}`;

  /** Peacock's strings for the headlines, buttons and announcements. */
  private readonly i18n = new I18nController(this);

  /** The handle press that may become a drag. */
  private dragSession?: DragSession;

  /** Frame of the auto-scroll loop while a drag is near a list edge. */
  private autoScrollFrame = 0;

  /** Swallows the click that ends a drag, so it does not also check the item. */
  private suppressClick = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.endDrag(false);
  }

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

  /** Whether selected items show a drag handle. */
  private get canDrag(): boolean {
    return this.ordered && this.isInteractive;
  }

  /** The selected values a drag from `value` moves: all checked ones if it is checked. */
  private dragGroup(value: string): string[] {
    const checked = this.movableChecked('selected');
    return checked.includes(value) ? checked : [value];
  }

  /** The order after moving `moving` to the drop index among the shown selected items. */
  private orderAfterDrop(moving: string[], index: number): string[] {
    const shown = this.sideOptions('selected')
      .filter(option => this.matchesSearch(option, 'selected'))
      .map(option => option.value);
    const rest = this.values.filter(value => !moving.includes(value));
    const ordered = this.values.filter(value => moving.includes(value));
    // Before the first shown item at or below the line that stays where it is.
    const before = shown.slice(index).find(value => !moving.includes(value));
    let at: number;
    if (before !== undefined) {
      at = rest.indexOf(before);
    } else {
      // Below the last shown item, so hidden items after it keep their places.
      const after = shown
        .slice(0, index)
        .reverse()
        .find(value => !moving.includes(value));
      at = after === undefined ? rest.length : rest.indexOf(after) + 1;
    }
    return [...rest.slice(0, at), ...ordered, ...rest.slice(at)];
  }

  /** The shown options of the selected list, in display order. */
  private shownSelectedOptions(): ListboxOption[] {
    return (this.selectedList?.options ?? []).filter(option => !option.hidden);
  }

  /** The drop index for a pointer at `clientY`, or `null` outside the list or for no change. */
  private dropIndexAt(clientX: number, clientY: number): number | null {
    const wrapper = this.selectedWrapper;
    const session = this.dragSession;
    if (!wrapper || !session) return null;
    const box = wrapper.getBoundingClientRect();
    if (
      clientX < box.left ||
      clientX > box.right ||
      clientY < box.top ||
      clientY > box.bottom
    ) {
      return null;
    }
    const shown = this.shownSelectedOptions();
    let index = shown.length;
    for (let i = 0; i < shown.length; i += 1) {
      const rect = shown[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) {
        index = i;
        break;
      }
    }
    const next = this.orderAfterDrop(session.values, index);
    return next.join(',') === this.value ? null : index;
  }

  /** Top of the drop line, in the selected list wrapper's scrolled coordinates. */
  private dropLineTop(index: number): number {
    const wrapper = this.selectedWrapper;
    const shown = this.shownSelectedOptions();
    if (!wrapper || !shown.length) return 0;
    const origin = wrapper.getBoundingClientRect().top - wrapper.scrollTop;
    if (index < shown.length) {
      return shown[index].getBoundingClientRect().top - origin;
    }
    return shown[shown.length - 1].getBoundingClientRect().bottom - origin;
  }

  private handleDragPointerDown(value: string, event: PointerEvent) {
    if (!this.canDrag || event.button !== 0 || this.dragSession) return;
    // Keep the press from reaching the listbox, which would focus or check the item.
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget as Element;
    this.dragSession = {
      pointerId: event.pointerId,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      values: this.dragGroup(value),
      active: false,
      clientX: event.clientX,
      clientY: event.clientY,
    };
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // The pointer is gone already; the window listeners still end the drag.
    }
    window.addEventListener('pointermove', this.handleDragPointerMove);
    window.addEventListener('pointerup', this.handleDragPointerUp);
    window.addEventListener('pointercancel', this.handleDragPointerCancel);
    window.addEventListener('keydown', this.handleDragKeyDown, true);
  }

  private readonly handleDragPointerMove = (event: PointerEvent) => {
    const session = this.dragSession;
    if (!session || event.pointerId !== session.pointerId) return;
    session.clientX = event.clientX;
    session.clientY = event.clientY;
    if (!session.active) {
      const travel = Math.hypot(
        event.clientX - session.startX,
        event.clientY - session.startY,
      );
      if (travel < DRAG_THRESHOLD) return;
      session.active = true;
      this.dragValues = [...session.values];
    }
    event.preventDefault();
    this.updateDragPosition();
    this.startAutoScroll();
  };

  private readonly handleDragPointerUp = (event: PointerEvent) => {
    const session = this.dragSession;
    if (!session || event.pointerId !== session.pointerId) return;
    session.clientX = event.clientX;
    session.clientY = event.clientY;
    if (session.active) this.updateDragPosition();
    this.endDrag(session.active);
  };

  private readonly handleDragPointerCancel = (event: PointerEvent) => {
    if (event.pointerId === this.dragSession?.pointerId) this.endDrag(false);
  };

  private readonly handleDragKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !this.dragSession) return;
    event.preventDefault();
    event.stopPropagation();
    this.endDrag(false);
  };

  private updateDragPosition() {
    const session = this.dragSession;
    const pane = this.selectedWrapper?.parentElement;
    if (!session || !pane) return;
    const box = pane.getBoundingClientRect();
    this.dragPoint = {
      x: session.clientX - box.left,
      y: session.clientY - box.top,
    };
    this.dropIndex = this.dropIndexAt(session.clientX, session.clientY);
  }

  /** Scrolls the selected list while a drag is near its top or bottom edge. */
  private startAutoScroll() {
    if (this.autoScrollFrame) return;
    const step = () => {
      this.autoScrollFrame = 0;
      const session = this.dragSession;
      const wrapper = this.selectedWrapper;
      if (!session?.active || !wrapper) return;
      const box = wrapper.getBoundingClientRect();
      if (session.clientX < box.left || session.clientX > box.right) return;
      let delta = 0;
      if (session.clientY < box.top + AUTO_SCROLL_EDGE) {
        delta = -Math.min(
          AUTO_SCROLL_SPEED,
          AUTO_SCROLL_EDGE - (session.clientY - box.top),
        );
      } else if (session.clientY > box.bottom - AUTO_SCROLL_EDGE) {
        delta = Math.min(
          AUTO_SCROLL_SPEED,
          AUTO_SCROLL_EDGE - (box.bottom - session.clientY),
        );
      }
      if (!delta) return;
      const before = wrapper.scrollTop;
      wrapper.scrollTop += delta;
      if (wrapper.scrollTop === before) return;
      this.updateDragPosition();
      this.autoScrollFrame = requestAnimationFrame(step);
    };
    this.autoScrollFrame = requestAnimationFrame(step);
  }

  /** Ends the drag; drops the items when `drop` is set and the pointer is over a drop place. */
  private endDrag(drop: boolean) {
    const session = this.dragSession;
    window.removeEventListener('pointermove', this.handleDragPointerMove);
    window.removeEventListener('pointerup', this.handleDragPointerUp);
    window.removeEventListener('pointercancel', this.handleDragPointerCancel);
    window.removeEventListener('keydown', this.handleDragKeyDown, true);
    if (this.autoScrollFrame) cancelAnimationFrame(this.autoScrollFrame);
    this.autoScrollFrame = 0;
    if (!session) return;
    this.dragSession = undefined;
    try {
      if (session.handle.hasPointerCapture(session.pointerId)) {
        session.handle.releasePointerCapture(session.pointerId);
      }
    } catch {
      // Capture was never taken.
    }
    if (session.active) {
      // The release fires a click on the item; it ends the drag, it does not check.
      this.suppressClick = true;
      setTimeout(() => {
        this.suppressClick = false;
      });
    }
    const index = this.dropIndex;
    this.dragValues = [];
    this.dropIndex = null;
    if (drop && index !== null) this.dropAt(session.values, index);
  }

  private dropAt(moving: string[], index: number) {
    if (!this.isInteractive || !this.ordered) return;
    const next = this.orderAfterDrop(moving, index);
    if (next.join(',') === this.value) return;
    const position = this.formatCount(next.indexOf(moving[0]) + 1);
    let message: string;
    if (moving.length === 1) {
      const option = this.options.find(o => o.value === moving[0]);
      message = this.i18n.t('transferListPosition')(
        option?.label ?? moving[0],
        position,
        this.formatCount(next.length),
      );
    } else {
      message = this.i18n.t('transferListMovedToPosition')(
        this.formatCount(moving.length),
        position,
      );
    }
    this.commit(next, message);
    this.refocusValue(moving[0]);
  }

  private handleListClickCapture(event: MouseEvent) {
    if (!this.suppressClick) return;
    this.suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderDragHandle(option: TransferListOption) {
    if (!this.canDrag || option.disabled) return nothing;
    return html`<wc-icon
      slot="start"
      class="drag-handle"
      name="drag_indicator"
      aria-hidden="true"
      title=${this.i18n.t('dragToReorder')}
      @pointerdown=${(event: PointerEvent) =>
        this.handleDragPointerDown(option.value, event)}
    ></wc-icon>`;
  }

  /** The drop line, inside the scrolling list so it moves with the items. */
  private renderDropIndicator() {
    if (!this.dragValues.length || this.dropIndex === null) return nothing;
    return html`<div
      class="drop-indicator"
      style=${`top: ${this.dropLineTop(this.dropIndex)}px`}
    ></div>`;
  }

  /**
   * The lifted copy under the pointer. It sits in the pane, outside the scrolling list, so it
   * never grows the list's scroll area while auto-scroll runs.
   */
  private renderDragPreview() {
    if (!this.dragValues.length) return nothing;
    const first = this.options.find(o => o.value === this.dragValues[0]);
    const count = this.dragValues.length;
    return html`<div
      class="drag-preview"
      aria-hidden="true"
      style=${`left: ${this.dragPoint.x}px; top: ${this.dragPoint.y}px`}
    >
      <wc-icon class="drag-preview-icon" name="drag_indicator"></wc-icon>
      <span class="drag-preview-label"
        >${first?.label ?? this.dragValues[0]}</span
      >
      ${count > 1
        ? html`<span class="drag-count">${this.formatCount(count)}</span>`
        : nothing}
    </div>`;
  }

  private renderOption(option: TransferListOption, side: Side) {
    const draggable = side === 'selected';
    return html`<wc-listbox-option
      value=${option.value}
      class=${classMap({
        dragging: draggable && this.dragValues.includes(option.value),
      })}
      ?disabled=${!!option.disabled}
      ?hidden=${!this.matchesSearch(option, side)}
      >${draggable
        ? this.renderDragHandle(option)
        : nothing}${option.label}${option.description
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
          @click=${{
            handleEvent: (event: MouseEvent) =>
              this.handleListClickCapture(event),
            capture: true,
          }}
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
          ${side === 'selected' ? this.renderDropIndicator() : nothing}
        </div>
        ${side === 'selected' ? this.renderDragPreview() : nothing}
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
