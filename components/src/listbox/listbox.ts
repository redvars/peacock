import { html, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import BaseInput from '@/input/BaseInput.js';
import { RovingFocusController } from '@/__internal/controllers/roving-focus-controller.js';
import {
  type FormValue,
  getFormValue,
} from '@/__internal/mixins/form-associated.js';
import { peacockString } from '@/__internal/i18n/strings.js';
import { ListboxOption } from './listbox-option.js';
import styles from './listbox.scss';

/** Detail of the listbox `change` event; `values` is set with `multiple`. */
export interface ListboxChangeDetail {
  value: string;
  values?: string[];
}

function isOption(element: Element): element is ListboxOption {
  return element.localName === 'wc-listbox-option';
}

/**
 * @label Listbox
 * @tag wc-listbox
 * @rawTag listbox
 *
 * @summary A list the person chooses one or several options from, always visible.
 * @overview
 * <p>The listbox follows the WAI-ARIA listbox pattern: the host has <code>role="listbox"</code>
 * (with <code>aria-multiselectable</code> when <code>multiple</code>), each
 * <code>wc-listbox-option</code> has <code>role="option"</code> and
 * <code>aria-selected</code>. It is one tab stop; Up and Down move between options, Home and End
 * jump to the first and last, and typing a letter moves to the next option starting with it.
 * Disabled options are skipped.</p>
 * <p>In a single listbox the selection follows focus. With <code>multiple</code>, Space (or a
 * click) toggles the focused option and Ctrl+A (Cmd+A) selects all.</p>
 * <p>It is a form control: it submits <code>value</code> under <code>name</code> (one entry per
 * value with <code>multiple</code>), and <code>required</code> blocks submission until an option is
 * chosen. Name it with <code>label</code> or <code>aria-labelledby</code>. For a list of
 * navigation links use <code>wc-list</code> with <code>current</code>.</p>
 *
 * @slot - `wc-listbox-option` elements.
 *
 * @fires {CustomEvent<{value: string, values?: string[]}>} change - Dispatched when the person changes the selection. `values` is set with `multiple`.
 *
 * @example
 * ```html
 * <wc-listbox label="Fruit" name="fruit">
 *   <wc-listbox-option value="apple">Apple</wc-listbox-option>
 *   <wc-listbox-option value="banana">Banana</wc-listbox-option>
 *   <wc-listbox-option value="cherry" disabled>Cherry</wc-listbox-option>
 * </wc-listbox>
 * ```
 *
 * @example
 * ```html
 * <wc-listbox label="Toppings" multiple value="cheese,olives">
 *   <wc-listbox-option value="cheese">Cheese</wc-listbox-option>
 *   <wc-listbox-option value="olives">Olives</wc-listbox-option>
 *   <wc-listbox-option value="peppers">Peppers</wc-listbox-option>
 * </wc-listbox>
 * ```
 * @tags form
 */
@IndividualComponent
export class Listbox extends BaseInput {
  // ── Static

  static styles = [styles];

  static Option = ListboxOption;

  // ── Properties

  /**
   * The selected value. With `multiple`, a comma-separated list of values (use `values`), so
   * option values must not contain commas.
   */
  @property({ type: String }) value = '';

  /** Whether the person can choose several options. */
  @property({ type: Boolean, reflect: true }) multiple = false;

  /** The accessible name, when no `aria-label` or `aria-labelledby` is set. */
  @property({ type: String }) label = '';

  // ── Private fields

  private readonly roving = new RovingFocusController(this, {
    items: () => this.options,
    orientation: () => 'vertical',
    typeahead: () => true,
    initialItem: items =>
      items.find(option => (option as ListboxOption).selected) ?? items[0],
    isFocusable: item =>
      !this.disabled && !(item as ListboxOption).disabled && !item.hidden,
    onMove: item => {
      if (!this.multiple) this.__choose(item as ListboxOption);
    },
  });

  // ── Lifecycle

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'listbox');
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has('multiple')) {
      this.setAttribute('aria-multiselectable', String(this.multiple));
    }
    if (changed.has('label')) {
      if (this.label) this.setAttribute('aria-label', this.label);
      else if (changed.get('label')) this.removeAttribute('aria-label');
    }
    this.__toggleAria('aria-disabled', this.disabled);
    this.__toggleAria('aria-required', this.required);
    this.__toggleAria('aria-readonly', this.readonly);
    this.__syncOptions();
    // A value set from outside moves the tab stop to the (first) selected option.
    if (changed.has('value') && !this.matches(':focus-within')) {
      const selected = this.options.find(option => option.selected);
      if (selected) this.roving.setActive(selected, false);
    }
  }

  // ── Public

  /** The options, in order. */
  get options(): ListboxOption[] {
    const slot = this.shadowRoot?.querySelector('slot');
    return (slot?.assignedElements({ flatten: true }) ?? []).filter(isOption);
  }

  /**
   * The selected values, kept in sync with `value`. For a single listbox it holds at most one
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
    this.roving.sync();
    this.roving.activeItem?.focus(options);
  }

  // ── Form association

  override [getFormValue](): FormValue | null {
    if (!this.multiple) return this.value || null;
    const data = new FormData();
    for (const value of this.values) data.append(this.name, value);
    return data;
  }

  // ── Protected

  protected override valueMissingText(): string {
    return peacockString('valueMissingSelect');
  }

  protected override validityAnchor(): HTMLElement | undefined {
    return this.roving.activeItem ?? this.options[0];
  }

  // ── Private

  private __toggleAria(name: string, on: boolean) {
    if (on) this.setAttribute(name, 'true');
    else this.removeAttribute(name);
  }

  /** Pushes `selected` and `multiple` onto the options, and moves the tab stop to a selection. */
  private __syncOptions() {
    const { values } = this;
    for (const option of this.options) {
      option.selected = values.includes(option.optionValue);
      option.multiple = this.multiple;
    }
    this.roving.sync();
  }

  /** Whether the person may change the selection now. */
  private get __interactive() {
    return !this.disabled && !this.readonly;
  }

  /** Single: makes `option` the value. Multiple: toggles it. Fires `change` when it changed. */
  private __choose(option: ListboxOption) {
    if (!this.__interactive || option.disabled) return;
    const value = option.optionValue;
    let next: string[];
    if (this.multiple) {
      const { values } = this;
      next = values.includes(value)
        ? values.filter(v => v !== value)
        : this.__inOptionOrder([...values, value]);
    } else {
      next = [value];
    }
    this.__commit(next);
  }

  /** Values sorted in the order of their options, so `value` does not depend on click order. */
  private __inOptionOrder(values: string[]) {
    const order = this.options.map(option => option.optionValue);
    return [...values].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }

  private __commit(next: string[]) {
    const value = next.join(',');
    if (value === this.value) return;
    this.value = value;
    // Mirror the options now, so listeners see them up to date.
    this.__syncOptions();
    const detail: ListboxChangeDetail = this.multiple
      ? { value, values: [...next] }
      : { value };
    this.dispatchEvent(
      new CustomEvent<ListboxChangeDetail>('change', {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
  }

  private __optionFromEvent(event: Event) {
    const { options } = this;
    return event
      .composedPath()
      .find(
        (node): node is ListboxOption =>
          node instanceof Element && options.includes(node as ListboxOption),
      );
  }

  private __handleClick = (event: MouseEvent) => {
    const option = this.__optionFromEvent(event);
    if (!option || option.disabled || this.disabled) return;
    this.roving.setActive(option);
    this.__choose(option);
  };

  private __handleKeyDown = (event: KeyboardEvent) => {
    const option = this.__optionFromEvent(event);
    if (!option) return;

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      // Single: selects the focused option (it usually already is). Multiple: toggles it.
      this.__choose(option);
      return;
    }

    if (
      this.multiple &&
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'a'
    ) {
      event.preventDefault();
      if (!this.__interactive) return;
      const enabled = this.options.filter(o => !o.disabled && !o.hidden);
      const all = enabled.every(o => this.values.includes(o.optionValue));
      // Ctrl+A again clears the enabled options, like most multi-select lists.
      const kept = this.values.filter(
        v => !enabled.some(o => o.optionValue === v),
      );
      this.__commit(
        this.__inOptionOrder(
          all ? kept : [...kept, ...enabled.map(o => o.optionValue)],
        ),
      );
      return;
    }

    this.roving.handleKeyDown(event);
  };

  private __handleSlotChange = () => {
    this.__syncOptions();
  };

  // ── Render

  render() {
    return html`
      <div
        class="listbox"
        part="container"
        @click=${this.__handleClick}
        @keydown=${this.__handleKeyDown}
        @focusin=${this.roving.handleFocusIn}
      >
        <slot @slotchange=${this.__handleSlotChange}></slot>
      </div>
    `;
  }
}
