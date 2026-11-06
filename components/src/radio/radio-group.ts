import { html, LitElement, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import type { Radio } from './radio.js';
import styles from './radio-group.scss';

let radioGroupCount = 0;

/** The radio states a group can push down, each tracked so it only undoes what it set. */
type GroupFlag = 'disabled' | 'required' | 'readonly';

/**
 * @label Radio Group
 * @tag wc-radio-group
 * @rawTag radio-group
 * @summary Groups radios under one label, one name and one value.
 * @overview
 * <p>Radio group gives its <code>wc-radio</code> children a shared <code>name</code> (its own, or a
 * generated one), so only one can be checked. Its <code>value</code> is the value of the checked radio,
 * and setting it checks the matching radio.</p>
 * <p>The radios stay form-associated, so the group submits once, through the checked radio.
 * <code>disabled</code>, <code>readonly</code> and <code>required</code> are passed to every radio;
 * a required group blocks form submission until a radio is checked.</p>
 * <p>Below the radios the group shows <code>helper-text</code>, or <code>error-text</code> while
 * <code>error</code> is set, or the radios' validation message after a failed check
 * (<code>reportValidity()</code> or a form submission).</p>
 *
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the user checks a different radio. The group swallows the radios' own `change` events.
 *
 * @cssprop --radio-group-gap - Space between radios. Defaults to `--spacing-100`.
 *
 * @example
 * ```html
 * <wc-radio-group label="Size" name="size" value="md" required helper-text="Pick one">
 *   <wc-radio value="sm" label="Small"></wc-radio>
 *   <wc-radio value="md" label="Medium"></wc-radio>
 *   <wc-radio value="lg" label="Large"></wc-radio>
 * </wc-radio-group>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class RadioGroup extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Name given to every radio in the group, and submitted with forms. Generated when empty. */
  @property({ type: String, reflect: true })
  name: string = '';

  /** Value of the checked radio. Setting it checks the radio with that value. */
  @property({ type: String })
  value: string = '';

  /** Group label, shown above the radios and used as the accessible name. */
  @property({ type: String })
  label: string = '';

  /** Lays the radios out in a column (default) or a row. */
  @property({ type: String, reflect: true })
  orientation: 'vertical' | 'horizontal' = 'vertical';

  /** Disables every radio in the group. */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /** Requires a radio to be checked; passed to every radio, which validate as a group. */
  @property({ type: Boolean, reflect: true })
  required: boolean = false;

  /** Makes every radio read-only: focusable, but the choice cannot change. */
  @property({ type: Boolean, reflect: true })
  readonly: boolean = false;

  /** Help text shown below the radios. */
  @property({ type: String, attribute: 'helper-text' })
  helperText = '';

  /** Shows the group in its error state with `error-text`. */
  @property({ type: Boolean, reflect: true })
  error = false;

  @property({ type: String, attribute: 'error-text' })
  errorText = '';

  // ── State ────────────────────────────────────────────────────────────────

  /** Whether to show the radios' validation message: after a failed check. */
  @state()
  private showValidity = false;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly generatedName = `wc-radio-group-${(radioGroupCount += 1)}`;

  private readonly labelId = `${this.generatedName}-label`;

  private readonly descriptionId = `${this.generatedName}-description`;

  /** Radios the group changed, so turning a flag off leaves radios that set it on their own alone. */
  private readonly setByGroup: Record<GroupFlag, WeakSet<Radio>> = {
    disabled: new WeakSet(),
    required: new WeakSet(),
    readonly: new WeakSet(),
  };

  /** Whether the group has looked at its radios once, to adopt a radio checked in markup. */
  private hasAdopted = false;

  /** The form the group was connected in, whose `reset` hides the message again. */
  private form: HTMLFormElement | null = null;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('change', this.handleRadioChange, { capture: true });
    // `invalid` does not bubble; the capture phase still passes the group.
    this.addEventListener('invalid', this.handleRadioInvalid, {
      capture: true,
    });
    this.form = this.closest('form');
    this.form?.addEventListener('reset', this.handleFormReset);
  }

  override disconnectedCallback() {
    this.removeEventListener('change', this.handleRadioChange, {
      capture: true,
    });
    this.removeEventListener('invalid', this.handleRadioInvalid, {
      capture: true,
    });
    this.form?.removeEventListener('reset', this.handleFormReset);
    this.form = null;
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues<this>) {
    if (
      changed.has('name') ||
      changed.has('value') ||
      changed.has('disabled') ||
      changed.has('required') ||
      changed.has('readonly')
    ) {
      this.syncRadios();
      // The message reads the radios' validity, which the sync just changed.
      if (this.showValidity && changed.has('value')) this.requestUpdate();
    }
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private getRadios(): Radio[] {
    return Array.from(this.querySelectorAll<Radio>('wc-radio'));
  }

  /** Pushes the group's name, value, disabled, required and read-only state down to its radios. */
  private syncRadios = () => {
    const radios = this.getRadios();
    const name = this.name || this.generatedName;

    for (const radio of radios) {
      if (radio.name !== name) radio.name = name;
    }
    this.syncFlag(radios, 'disabled');
    this.syncFlag(radios, 'required');
    this.syncFlag(radios, 'readonly');

    if (!this.value && !this.hasAdopted) {
      // First look with no value set: adopt the radio that was checked in markup.
      this.value = radios.find(radio => radio.checked)?.value ?? '';
    } else {
      // An empty value clears the selection.
      for (const radio of radios) radio.checked = radio.value === this.value;
    }
    if (radios.length > 0) this.hasAdopted = true;
  };

  private syncFlag(radios: Radio[], flag: GroupFlag) {
    const byGroup = this.setByGroup[flag];
    for (const radio of radios) {
      if (this[flag] && !radio[flag]) {
        radio[flag] = true;
        byGroup.add(radio);
      } else if (!this[flag] && byGroup.has(radio)) {
        radio[flag] = false;
        byGroup.delete(radio);
      }
    }
  }

  /** The text under the radios: the consumer's error, else the validation message once shown. */
  private get errorMessage(): string {
    if (this.error) return this.errorText;
    if (!this.showValidity) return '';
    const [radio] = this.getRadios();
    return radio && !radio.validity.valid ? radio.validationMessage : '';
  }

  private handleRadioChange = (event: Event) => {
    if (event.target === this) return;
    const radio = (event.target as Element).closest?.(
      'wc-radio',
    ) as Radio | null;
    if (!radio) return;

    // Capture phase: swallow the radio's `change` so listeners on the group and above see one
    // `change`, the group's.
    event.stopPropagation();
    this.value = radio.value;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private handleRadioInvalid = (event: Event) => {
    if (event.target !== this) this.showValidity = true;
  };

  private handleFormReset = () => {
    this.showValidity = false;
  };

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const { errorMessage } = this;
    const invalid = this.error || !!errorMessage;
    const description = errorMessage || this.helperText;

    return html`
      <div
        class=${classMap({
          'radio-group': true,
          [`orientation-${this.orientation}`]: true,
          disabled: this.disabled,
          error: invalid,
        })}
        role="radiogroup"
        aria-labelledby=${this.label ? this.labelId : nothing}
        aria-describedby=${description ? this.descriptionId : nothing}
        aria-required=${this.required ? 'true' : nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
        aria-readonly=${this.readonly ? 'true' : nothing}
        aria-invalid=${invalid ? 'true' : nothing}
      >
        ${this.label
          ? html`<div class="label" id=${this.labelId}>
              ${this.label}${this.required
                ? html`<span class="required" aria-hidden="true">*</span>`
                : nothing}
            </div>`
          : nothing}
        <div class="radios">
          <slot @slotchange=${this.syncRadios}></slot>
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
