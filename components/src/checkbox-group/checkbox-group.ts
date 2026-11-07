import { html, nothing, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { live } from 'lit/directives/live.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  type FormValue,
  getFormState,
  getFormValue,
} from '@/__internal/mixins/form-associated.js';
import IndividualComponent from '@/IndividualComponent.js';
import type { Checkbox } from '@/checkbox/checkbox.js';
import BaseInput, { type ControlValidity } from '../input/BaseInput.js';
import styles from './checkbox-group.scss';

let checkboxGroupCount = 0;

/** Detail of the checkbox group `change` event. */
export interface CheckboxGroupChangeDetail {
  /** The checked values, comma-separated. */
  value: string;
  /** The checked values, in checkbox order. */
  values: string[];
}

/** The checkbox states the group pushes down, each tracked so it only undoes what it set. */
type GroupFlag = 'disabled' | 'readonly';

/**
 * @label Checkbox Group
 * @tag wc-checkbox-group
 * @rawTag checkbox-group
 * @summary Groups checkboxes under one label, one name and a list of checked values.
 * @overview
 * <p>Checkbox group is the multi-select sibling of <code>wc-radio-group</code>. Its
 * <code>wc-checkbox</code> children are the options: <code>values</code> lists the values of the
 * checked ones, in checkbox order, and <code>value</code> is the same list comma-separated (as on
 * <code>wc-listbox multiple</code> and <code>wc-select multiple</code>), so checkbox values must not
 * contain commas. Setting either checks the matching checkboxes. With no value set, the group
 * adopts the checkboxes checked in markup.</p>
 * <p>The group is the form control: it submits one entry per checked value under its
 * <code>name</code>, like native checkboxes sharing a name. Its checkboxes do not submit on their
 * own: the group removes their <code>name</code> while they are inside it (and gives it back when
 * one leaves). <code>required</code> blocks form submission until at least one checkbox is
 * checked; <code>disabled</code> and <code>readonly</code> are passed to every checkbox.</p>
 * <p><code>select-all</code> adds a parent checkbox above the options that checks or clears every
 * enabled option, and shows the mixed state while only some are checked.</p>
 * <p>The group has <code>role="group"</code>, named by its <code>label</code>; the helper,
 * error or validation text below it is linked with <code>aria-describedby</code>.</p>
 *
 * @slot - `wc-checkbox` elements, each with its own `value`.
 *
 * @fires {CustomEvent<{value: string, values: string[]}>} change - Dispatched when the person checks or clears a checkbox (or uses select all). The group swallows the checkboxes' own `change` events.
 *
 * @cssprop --checkbox-group-gap - Space between checkboxes. Defaults to `--spacing-100` (`--spacing-300` in a row).
 *
 * @example
 * ```html
 * <wc-checkbox-group label="Toppings" name="toppings" value="cheese,olives" required>
 *   <wc-checkbox value="cheese" label="Cheese"></wc-checkbox>
 *   <wc-checkbox value="olives" label="Olives"></wc-checkbox>
 *   <wc-checkbox value="peppers" label="Peppers"></wc-checkbox>
 * </wc-checkbox-group>
 * ```
 *
 * @example
 * ```html
 * <wc-checkbox-group label="Notify me about" name="notify" select-all>
 *   <wc-checkbox value="comments" label="Comments"></wc-checkbox>
 *   <wc-checkbox value="mentions" label="Mentions"></wc-checkbox>
 *   <wc-checkbox value="releases" label="Releases"></wc-checkbox>
 * </wc-checkbox-group>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class CheckboxGroup extends BaseInput {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────
  // `name`, `disabled`, `required` and `readonly` are inherited.

  /** The checked values, comma-separated (use `values` for the list). */
  @property({ type: String })
  value: string = '';

  /** Group label, shown above the checkboxes and used as the accessible name. */
  @property({ type: String })
  label: string = '';

  /** Lays the checkboxes out in a column (default) or a row. */
  @property({ type: String, reflect: true })
  orientation: 'vertical' | 'horizontal' = 'vertical';

  /** Adds a parent checkbox that checks or clears every enabled checkbox. */
  @property({ type: Boolean, reflect: true, attribute: 'select-all' })
  selectAll: boolean = false;

  /** Help text shown below the checkboxes. */
  @property({ type: String, attribute: 'helper-text' })
  helperText = '';

  /** Shows the group in its error state with `error-text`. */
  @property({ type: Boolean, reflect: true })
  error = false;

  /** Text shown below the checkboxes while `error` is set. */
  @property({ type: String, attribute: 'error-text' })
  errorText = '';

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.select-all') private selectAllElement?: Checkbox;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  private readonly baseId = `wc-checkbox-group-${(checkboxGroupCount += 1)}`;

  private readonly labelId = `${this.baseId}-label`;

  private readonly descriptionId = `${this.baseId}-description`;

  /** Checkboxes the group changed, so turning a flag off leaves checkboxes that set it alone. */
  private readonly setByGroup: Record<GroupFlag, WeakSet<Checkbox>> = {
    disabled: new WeakSet(),
    readonly: new WeakSet(),
  };

  /** The checkboxes in the group, with the `name` attribute each had before the group took it. */
  private readonly ownNames = new Map<Checkbox, string | null>();

  /** Whether the group has looked at its checkboxes, to adopt the ones checked in markup. */
  private hasAdopted = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('change', this.handleCheckboxChange, {
      capture: true,
    });
  }

  override disconnectedCallback() {
    this.removeEventListener('change', this.handleCheckboxChange, {
      capture: true,
    });
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues<this>) {
    if (
      changed.has('value') ||
      changed.has('disabled') ||
      changed.has('readonly')
    ) {
      this.syncCheckboxes();
    }
    super.updated(changed);
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** The checked values, in checkbox order, kept in sync with `value`. The form gets one entry each. */
  get values(): string[] {
    return this.value ? this.value.split(',') : [];
  }

  set values(next: string[]) {
    this.value = next.join(',');
  }

  /** Focuses the first enabled checkbox. */
  override focus(options?: Parameters<HTMLElement['focus']>[0]) {
    const first = this.getCheckboxes().find(checkbox => !checkbox.disabled);
    if (first) first.focus();
    else super.focus(options);
  }

  // ── Form association ─────────────────────────────────────────────────────

  override [getFormValue](): FormValue | null {
    if (!this.name) return null;
    const data = new FormData();
    for (const value of this.values) data.append(this.name, value);
    return data;
  }

  override [getFormState](): FormValue | null {
    return this.value;
  }

  override formResetCallback() {
    super.formResetCallback();
    // The checkboxes reset themselves in the same task; with no default value, adopt their
    // checked state again once they have.
    this.hasAdopted = false;
    this.requestUpdate();
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected override computeValidity(): ControlValidity {
    if (this.required && this.values.length === 0 && !this.disabled) {
      return {
        flags: { valueMissing: true },
        message: this.valueMissingText(),
      };
    }
    return { flags: {}, message: '' };
  }

  protected override valueMissingText(): string {
    return this.i18n.t('valueMissingCheckboxGroup');
  }

  protected override validityAnchor(): HTMLElement | undefined {
    return this.getCheckboxes().find(checkbox => !checkbox.disabled);
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private getCheckboxes(): Checkbox[] {
    return Array.from(this.querySelectorAll<Checkbox>('wc-checkbox'));
  }

  /** Pushes the group's value, disabled and read-only state down, and takes the checkboxes' names. */
  private syncCheckboxes = () => {
    const checkboxes = this.getCheckboxes();
    this.syncNames(checkboxes);
    this.syncFlag(checkboxes, 'disabled');
    this.syncFlag(checkboxes, 'readonly');

    if (!this.value && !this.hasAdopted) {
      // First look with no value set: adopt the checkboxes checked in markup.
      const adopted = this.checkedValues(checkboxes);
      if (adopted !== this.value) this.value = adopted;
      else if (this.selectAll) this.requestUpdate();
    } else {
      const { values } = this;
      for (const checkbox of checkboxes) {
        checkbox.checked = values.includes(checkbox.value);
      }
      // The select-all state reads the checkboxes.
      if (this.selectAll) this.requestUpdate();
    }
    if (checkboxes.length > 0) this.hasAdopted = true;
  };

  /** Takes the `name` of checkboxes that joined, so only the group submits; returns it to those that left. */
  private syncNames(checkboxes: Checkbox[]) {
    for (const [checkbox, name] of this.ownNames) {
      if (!checkboxes.includes(checkbox)) {
        if (name !== null) checkbox.setAttribute('name', name);
        this.ownNames.delete(checkbox);
      }
    }
    for (const checkbox of checkboxes) {
      if (!this.ownNames.has(checkbox)) {
        this.ownNames.set(checkbox, checkbox.getAttribute('name'));
      }
      if (checkbox.hasAttribute('name')) checkbox.removeAttribute('name');
    }
  }

  private syncFlag(checkboxes: Checkbox[], flag: GroupFlag) {
    const byGroup = this.setByGroup[flag];
    for (const checkbox of checkboxes) {
      if (this[flag] && !checkbox[flag]) {
        checkbox[flag] = true;
        byGroup.add(checkbox);
      } else if (!this[flag] && byGroup.has(checkbox)) {
        checkbox[flag] = false;
        byGroup.delete(checkbox);
      }
    }
  }

  private checkedValues(checkboxes: Checkbox[]): string {
    return checkboxes
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value)
      .join(',');
  }

  /** The select-all checkbox's state, over the enabled checkboxes. */
  private get selectAllState() {
    const enabled = this.getCheckboxes().filter(checkbox => !checkbox.disabled);
    const checked = enabled.filter(checkbox => checkbox.checked).length;
    return {
      empty: enabled.length === 0,
      all: enabled.length > 0 && checked === enabled.length,
      some: checked > 0 && checked < enabled.length,
    };
  }

  /** The text under the checkboxes: the consumer's error, else the validation message once shown. */
  private get errorMessage(): string {
    if (this.error) return this.errorText;
    return this.validationText;
  }

  private handleCheckboxChange = (event: Event) => {
    const [first] = event.composedPath();
    if (first === this) return;
    const origin = first as Checkbox;
    const checkboxes = this.getCheckboxes();
    const isSelectAll = origin === this.selectAllElement;
    if (!isSelectAll && !checkboxes.includes(origin)) return;

    // Capture phase: swallow the checkbox's `change` so listeners on the group and above see one
    // `change`, the group's.
    event.stopPropagation();
    if (isSelectAll) {
      // The parent checkbox has just toggled itself: on checks every enabled option, off clears them.
      for (const checkbox of checkboxes) {
        if (!checkbox.disabled) checkbox.checked = origin.checked;
      }
    }

    this.value = this.checkedValues(checkboxes);
    this.dispatchEvent(
      new CustomEvent<CheckboxGroupChangeDetail>('change', {
        detail: { value: this.value, values: this.values },
        bubbles: true,
        composed: true,
      }),
    );
  };

  /** A suggestion for a checkbox group is a comma-separated string or an array of values. */
  protected override writeSuggestionValue(value: unknown): void {
    if (Array.isArray(value)) this.values = value.map(String);
    else this.value = value == null ? '' : String(value);
  }

  protected override emitSuggestionValue(): void {
    for (const type of ['input', 'change']) {
      this.dispatchEvent(
        new CustomEvent<CheckboxGroupChangeDetail>(type, {
          detail: { value: this.value, values: this.values },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderSelectAll() {
    const state = this.selectAllState;
    return html`<wc-checkbox
      class="select-all"
      label=${this.i18n.t('checkboxGroupSelectAll')}
      .checked=${live(state.all)}
      .indeterminate=${live(state.some)}
      ?disabled=${this.disabled || state.empty}
      ?readonly=${this.readonly}
    ></wc-checkbox>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const { errorMessage } = this;
    const invalid = this.error || !!errorMessage;
    const description =
      errorMessage || this.suggestionReason || this.helperText;

    return html`
      <div
        class=${classMap({
          'checkbox-group': true,
          [`orientation-${this.orientation}`]: true,
          disabled: this.disabled,
          error: invalid,
        })}
        role="group"
        aria-labelledby=${this.label ? this.labelId : nothing}
        aria-describedby=${description ? this.descriptionId : nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
      >
        ${this.label
          ? this.labelWithSuggestion(
              html`<div class="label" id=${this.labelId}>
                ${this.label}${this.required
                  ? html`<span class="required" aria-hidden="true">*</span>`
                  : nothing}
              </div>`,
            )
          : this.suggestionBadge()}
        ${this.selectAll ? this.renderSelectAll() : nothing}
        <div class=${classMap({ checkboxes: true, nested: this.selectAll })}>
          <slot @slotchange=${this.syncCheckboxes}></slot>
        </div>
        ${description
          ? html`<div
              class=${errorMessage ? 'helper error-text' : 'helper'}
              id=${this.descriptionId}
            >
              ${description}
            </div>`
          : nothing}
      </div>
    `;
  }
}
