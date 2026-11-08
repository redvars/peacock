import { html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { spread } from '@/__internal/directive/spread.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { FormRestoreState } from '@/__internal/mixins/form-associated.js';

import IndividualComponent from '@/IndividualComponent.js';
import BaseField from '../input/BaseField.js';
import { type ControlValidity, nativeValidity } from '../input/BaseInput.js';
import styles from './number-field.scss';

/**
 * @label Number Field
 * @tag wc-number-field
 * @rawTag number-field
 *
 * @summary A text field for a number, with optional buttons that step it down and up.
 * @overview
 * <p>Number Field is form-associated: inside a <code>&lt;form&gt;</code> its <code>value</code> is
 * submitted under its <code>name</code>, and <code>form.reset()</code> restores the starting value.</p>
 * <p>It validates like a native number input: <code>required</code>, <code>min</code>,
 * <code>max</code> and <code>step</code> block form submission, and the message shows under the
 * field once the value is committed or the form is submitted.</p>
 * <p>For money, use <code>wc-currency-field</code>: its value is an exact decimal string with the
 * currency's number of decimals, where this field's value is a JavaScript number.</p>
 *
 * @fires {CustomEvent<{value: number | undefined}>} input - Dispatched as the user types or steps the value.
 * @fires {CustomEvent<{value: number | undefined}>} change - Dispatched when the value is committed.
 *
 * @example
 * ```html
 * <wc-number-field label="Age" placeholder="Enter your age"></wc-number-field>
 * ```
 */
@IndividualComponent
export class NumberField extends BaseField {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  @property({ type: Number })
  value?: number;

  /** The largest value allowed. */
  @property({ type: Number })
  max?: number;

  /** The smallest value allowed. */
  @property({ type: Number })
  min?: number;

  /** How much the value changes per step, and the granularity a valid value must match. */
  @property({ type: Number })
  step?: number;

  /** Whether the browser may autofill the field: `"on"` or `"off"` (default). */
  @property({ type: String })
  autocomplete: 'on' | 'off' = 'off';

  /** Shows buttons that step the value down and up. */
  @property({ type: Boolean })
  stepper: boolean = false;

  /**
   * How to show the value while the field is not focused, as `Intl.NumberFormat` options (for
   * example `{ style: 'currency', currency: 'EUR' }`). While focused the field shows the plain
   * number to edit. `value` stays a number either way. Formatted in the field's locale: the
   * nearest `lang`, else the browser's.
   */
  @property({ type: Object })
  format?: Intl.NumberFormatOptions;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.input-element')
  private inputElement?: HTMLInputElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the stepper buttons. */
  private readonly i18n = new I18nController(this);

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.inputElement?.focus();
  }

  override blur() {
    this.inputElement?.blur();
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected override computeValidity(): ControlValidity {
    return this.inputElement
      ? nativeValidity(this.inputElement)
      : super.computeValidity();
  }

  protected override validityAnchor() {
    // `@query` gives null before the first render.
    return this.inputElement ?? undefined;
  }

  protected override parseRestoreState(state: FormRestoreState): unknown {
    if (typeof state !== 'string' || state.trim() === '') return undefined;
    const number = Number(state);
    return Number.isNaN(number) ? undefined : number;
  }

  protected override clearValue() {
    this.value = undefined;
    this.emitValue('input');
    this.emitValue('change');
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** The value as `format` shows it, or '' when there is nothing to format. */
  private formattedValue(): string {
    if (!this.format || this.value === undefined) return '';
    try {
      return new Intl.NumberFormat(this.i18n.locale, this.format).format(
        this.value,
      );
    } catch {
      // Options Intl rejects (such as a currency style without a currency): show the number.
      return String(this.value);
    }
  }

  /** The input's value as a number, or `undefined` when it is empty or not a number. */
  private static __toValue(input: HTMLInputElement): number | undefined {
    const number = input.valueAsNumber;
    return Number.isNaN(number) ? undefined : number;
  }

  private __handleInput(event: Event) {
    // Replace the native event, which escapes the shadow root, with the field's own.
    event.stopPropagation();
    this.value = NumberField.__toValue(event.target as HTMLInputElement);
    this.emitValue('input');
  }

  private __handleChange(event: Event) {
    event.stopPropagation();
    this.emitValue('change');
  }

  private stepUp() {
    this.__step(1);
  }

  private stepDown() {
    this.__step(-1);
  }

  /**
   * Steps the value like the native spinner. `stepUp()`/`stepDown()` fire no events, so this
   * updates `value` and emits `input` and `change` itself.
   */
  private __step(direction: 1 | -1) {
    const input = this.inputElement;
    if (!input || this.disabled || this.readonly) return;
    if (direction === 1) input.stepUp();
    else input.stepDown();
    this.value = NumberField.__toValue(input);
    this.emitValue('input');
    this.emitValue('change');
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderStepper(direction: 'up' | 'down') {
    if (!this.stepper || this.disabled || this.readonly) return nothing;
    const up = direction === 'up';
    return html`<wc-icon-button
      class="stepper"
      variant="text"
      slot=${up ? 'field-end' : 'field-start'}
      aria-label=${up ? this.i18n.t('increase') : this.i18n.t('decrease')}
      @click=${up ? this.stepUp : this.stepDown}
    >
      <wc-icon name=${up ? 'add' : 'remove'}></wc-icon>
    </wc-icon-button>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    // The formatted text covers the input while it is not focused; the input keeps the number, so
    // validation and editing work on the raw value.
    const formatted = this.focused ? '' : this.formattedValue();
    const classes = {
      input: true,
      'input-element': true,
      'no-spin-buttons': this.stepper,
      'show-formatted': !!formatted,
    };

    const input = html`<input
      class=${classMap(classes)}
      type="number"
      placeholder=${this.placeholder}
      autocomplete=${this.autocomplete}
      .value=${this.value === undefined ? '' : String(this.value)}
      ?readonly=${this.readonly}
      ?required=${this.required}
      ?disabled=${this.disabled}
      min=${ifDefined(this.min)}
      max=${ifDefined(this.max)}
      step=${ifDefined(this.step)}
      @input=${this.__handleInput}
      @change=${this.__handleChange}
      @focus=${this.handleFieldFocus}
      @blur=${this.handleFieldFocus}
      ${spread(this.fieldAria())}
    />`;

    const control = this.format
      ? html`<span class="format-control">
          ${input}
          ${formatted
            ? html`<span class="formatted" aria-hidden="true"
                >${formatted}</span
              >`
            : nothing}
        </span>`
      : input;

    return this.renderField(control, {
      populated: this.value !== undefined,
      start: this.renderStepper('down'),
      end: this.renderStepper('up'),
    });
  }
}
