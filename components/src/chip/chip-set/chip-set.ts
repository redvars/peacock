import { html, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import BaseInput, { type ControlValidity } from '@/input/BaseInput.js';
import { RovingFocusController } from '@/__internal/controllers/roving-focus-controller.js';
import {
  type FormValue,
  getFormValue,
} from '@/__internal/mixins/form-associated.js';
import { peacockString } from '@/__internal/i18n/strings.js';
import type { Chip } from '../chip/chip.js';
import styles from './chip-set.scss';

/** Detail of the chip set `change` event; `values` is set with `multiple`. */
export interface ChipSetChangeDetail {
  value: string;
  values?: string[];
}

function isChip(element: Element): element is Chip {
  return element.localName === 'wc-chip';
}

/** The value a chip stands for: its `value`, or else its text. */
function chipValue(chip: Chip): string {
  return chip.value || (chip.textContent ?? '').trim();
}

/**
 * @label Chip Set
 * @tag wc-chip-set
 * @rawTag chip-set
 * @summary A group of chips: a wrapping layout, or a filter-chip group the person selects from.
 * @overview
 * <p>Without options the chip set only lays its chips out, wrapping them onto new lines.</p>
 * <p>With <code>selectable</code> it becomes a filter-chip group: a click, Space or Enter on a
 * chip selects it (and again clears it), and <code>value</code> holds the chosen chip's
 * <code>value</code> (or its text). Add <code>multiple</code> to select several; then
 * <code>value</code> is a comma-separated list and <code>values</code> the array. Each change
 * fires <code>change</code> with <code>{ value, values? }</code>.</p>
 * <p>A selecting chip set is one tab stop with <code>role="group"</code>; the arrow keys move
 * between chips (wrapping, mirrored in right-to-left), Home and End jump to the first and last,
 * and every chip is a toggle button with <code>aria-pressed</code>. Name the group with
 * <code>label</code>.</p>
 * <p>It is a form control: it submits <code>value</code> under <code>name</code> (one entry per
 * value with <code>multiple</code>), and <code>required</code> blocks submission until a chip is
 * selected.</p>
 *
 * @slot - `wc-chip` elements.
 *
 * @cssprop --chip-set-gap - Space between chips.
 *
 * @fires {CustomEvent<{value: string, values?: string[]}>} change - Dispatched when the person changes the selection. `values` is set with `multiple`.
 *
 * @example
 * ```html
 * <wc-chip-set>
 *   <wc-chip>One</wc-chip>
 *   <wc-chip>Two</wc-chip>
 * </wc-chip-set>
 * ```
 *
 * @example
 * ```html
 * <wc-chip-set label="Status" selectable multiple value="open">
 *   <wc-chip value="open">Open</wc-chip>
 *   <wc-chip value="closed">Closed</wc-chip>
 *   <wc-chip value="draft">Draft</wc-chip>
 * </wc-chip-set>
 * ```
 * @tags form
 */
@IndividualComponent
export class ChipSet extends BaseInput {
  // ── Static

  static styles = [styles];

  // ── Properties

  /**
   * The selected chip's value. With `multiple`, a comma-separated list of values (use `values`),
   * so chip values must not contain commas.
   */
  @property({ type: String }) value = '';

  /** Turns the chip set into a filter-chip group whose chips the person selects. */
  @property({ type: Boolean, reflect: true }) selectable = false;

  /** Whether the person can select several chips. Implies `selectable`. */
  @property({ type: Boolean, reflect: true }) multiple = false;

  /** The accessible name of the group, when no `aria-label` or `aria-labelledby` is set. */
  @property({ type: String }) label = '';

  // ── Private fields

  private readonly roving = new RovingFocusController(this, {
    items: () => (this.__selecting ? this.chips : []),
    orientation: () => 'horizontal',
    wrap: () => true,
    initialItem: items =>
      items.find(chip => (chip as Chip).selected) ?? items[0],
    isFocusable: item =>
      !this.disabled &&
      !(item as Chip).disabled &&
      !(item as Chip).skeleton &&
      !item.hidden,
  });

  /** Chips this set made `selectable`, so it can undo that when it stops selecting. */
  private readonly __madeSelectable = new WeakSet<Chip>();

  // ── Lifecycle

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has('label')) {
      if (this.label) this.setAttribute('aria-label', this.label);
      else if (changed.get('label')) this.removeAttribute('aria-label');
    }
    if (this.__selecting || this.label) this.setAttribute('role', 'group');
    else if (this.getAttribute('role') === 'group')
      this.removeAttribute('role');
    this.__toggleAria('aria-disabled', this.__selecting && this.disabled);
    this.__toggleAria('aria-required', this.__selecting && this.required);
    this.__syncChips();
    // A value set from outside moves the tab stop to the (first) selected chip.
    if (
      changed.has('value') &&
      this.__selecting &&
      !this.matches(':focus-within')
    ) {
      const selected = this.chips.find(chip => chip.selected);
      if (selected) this.roving.setActive(selected, false);
    }
  }

  // ── Public

  /** The chips, in order. */
  get chips(): Chip[] {
    const slot = this.shadowRoot?.querySelector('slot');
    return (slot?.assignedElements({ flatten: true }) ?? []).filter(isChip);
  }

  /**
   * The selected values, kept in sync with `value`. Without `multiple` it holds at most one
   * value. The form gets one entry per value.
   */
  get values(): string[] {
    if (!this.value) return [];
    return this.multiple ? this.value.split(',') : [this.value];
  }

  set values(next: string[]) {
    this.value = (this.multiple ? next : next.slice(0, 1)).join(',');
  }

  override focus(options?: Parameters<HTMLElement['focus']>[0]) {
    if (!this.__selecting) {
      super.focus(options);
      return;
    }
    this.roving.sync();
    this.roving.activeItem?.focus();
  }

  // ── Form association

  override [getFormValue](): FormValue | null {
    if (!this.__selecting) return null;
    if (!this.multiple) return this.value || null;
    const data = new FormData();
    for (const value of this.values) data.append(this.name, value);
    return data;
  }

  // ── Protected

  protected override computeValidity(): ControlValidity {
    if (!this.__selecting) return { flags: {}, message: '' };
    return super.computeValidity();
  }

  protected override valueMissingText(): string {
    return peacockString('valueMissingSelect');
  }

  protected override validityAnchor(): HTMLElement | undefined {
    return this.roving.activeItem ?? this.chips[0];
  }

  // ── Private

  /** Whether the set selects chips (`selectable` or `multiple`). */
  private get __selecting() {
    return this.selectable || this.multiple;
  }

  /** Whether the person may change the selection now. */
  private get __interactive() {
    return this.__selecting && !this.disabled && !this.readonly;
  }

  private __toggleAria(name: string, on: boolean) {
    if (on) this.setAttribute(name, 'true');
    else this.removeAttribute(name);
  }

  /** Pushes `selected` and `selectable` onto the chips, and the tab stop. */
  private __syncChips() {
    const { chips } = this;
    if (this.__selecting) {
      const { values } = this;
      for (const chip of chips) {
        if (!chip.selectable) {
          chip.selectable = true;
          this.__madeSelectable.add(chip);
        }
        chip.selected = values.includes(chipValue(chip));
      }
      this.roving.sync();
      return;
    }
    // Not selecting: undo what this set did, and give the chips back their own tab stops.
    for (const chip of chips) {
      if (this.__madeSelectable.has(chip)) {
        chip.selectable = false;
        this.__madeSelectable.delete(chip);
      }
      if (chip.getAttribute('tabindex') === '-1')
        chip.removeAttribute('tabindex');
    }
  }

  /** Values sorted in the order of their chips, so `value` does not depend on click order. */
  private __inChipOrder(values: string[]) {
    const order = this.chips.map(chipValue);
    return [...values].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }

  /** Toggles `chip`: with `multiple` alongside the others, otherwise in place of them. */
  private __toggle(chip: Chip) {
    if (
      !this.__interactive ||
      chip.disabled ||
      chip.softDisabled ||
      chip.skeleton
    ) {
      return;
    }
    const value = chipValue(chip);
    const { values } = this;
    let next: string[];
    if (values.includes(value)) {
      next = values.filter(v => v !== value);
    } else {
      next = this.multiple ? this.__inChipOrder([...values, value]) : [value];
    }
    this.__commit(next);
  }

  private __commit(next: string[]) {
    const value = next.join(',');
    if (value === this.value) return;
    this.value = value;
    // Mirror the chips now, so listeners see them up to date.
    this.__syncChips();
    const detail: ChipSetChangeDetail = this.multiple
      ? { value, values: [...next] }
      : { value };
    this.dispatchEvent(
      new CustomEvent<ChipSetChangeDetail>('change', {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
  }

  private __chipFromEvent(event: Event) {
    const { chips } = this;
    return event
      .composedPath()
      .find(
        (node): node is Chip =>
          node instanceof Element && chips.includes(node as Chip),
      );
  }

  private __handleClick = (event: MouseEvent) => {
    if (!this.__selecting) return;
    const chip = this.__chipFromEvent(event);
    if (!chip) return;
    // The dismiss button of a dismissible chip is not a selection.
    const fromDismiss = event
      .composedPath()
      .some(
        node => node instanceof Element && node.classList.contains('close-btn'),
      );
    if (fromDismiss) return;
    if (!this.disabled && !chip.disabled) this.roving.setActive(chip, false);
    this.__toggle(chip);
  };

  private __handleKeyDown = (event: KeyboardEvent) => {
    if (!this.__selecting) return;
    this.roving.handleKeyDown(event);
  };

  private __handleSlotChange = () => {
    this.__syncChips();
  };

  // ── Render

  override render() {
    // Space and Enter reach `__handleClick` as the click of the chip's own button.
    return html`<slot
      @click=${this.__handleClick}
      @keydown=${this.__handleKeyDown}
      @focusin=${this.roving.handleFocusIn}
      @slotchange=${this.__handleSlotChange}
    ></slot>`;
  }
}
