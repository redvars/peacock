import { html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { spread } from '@/__internal/directive/spread.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { warnOnce } from '@/__internal/utils/warn-once.js';
import IndividualComponent from '@/IndividualComponent.js';

import BaseField from '../input/BaseField.js';
import type { ControlValidity } from '../input/BaseInput.js';
import {
  compareAmounts,
  currencyInfo,
  currencyName,
  type CurrencyInfo,
  editableAmount,
  formatAmount,
  formatWithCurrency,
  isPlainDecimal,
  normalizeAmount,
  type ParsedAmount,
  parseAmount,
} from './amount.js';
import styles from './currency-field.scss';

/** What `input` and `change` carry. */
export interface CurrencyFieldEventDetail {
  /** The amount as a decimal string with the currency's decimals (`1234.50`), or ''. */
  value: string;
  /** The currency, ISO 4217, such as `EUR`. */
  currency: string;
}

let currencyFieldCount = 0;

/**
 * @label Currency Field
 * @tag wc-currency-field
 * @rawTag currency-field
 *
 * @summary A field for an amount of money, kept as an exact decimal string in a given currency.
 * @overview
 * <p>Currency field takes an amount of money in <code>currency</code> (ISO 4217, such as
 * <code>EUR</code>). Its <code>value</code> is a decimal <strong>string</strong> with exactly the
 * currency's decimals (<code>"1234.50"</code> for EUR, <code>"1234"</code> for JPY,
 * <code>"1.250"</code> for KWD), or '' while empty, so an amount is never rounded by binary
 * floating point on its way to the server. Inside a <code>&lt;form&gt;</code> that string is
 * submitted under its <code>name</code>.</p>
 * <p>The currency symbol sits before or after the amount, wherever the locale (the nearest
 * <code>lang</code>, else the browser's) puts it. While the field is not focused the amount shows
 * with grouping (<code>1,234.50</code>); while editing it is plain (<code>1234.50</code>). Typing
 * takes the locale's decimal separator, and pasted amounts such as <code>€1,234.50</code>,
 * <code>1.234,50 €</code> or <code>(12.00)</code> are read too.</p>
 * <p>More decimals than the currency has are <strong>rejected, not rounded</strong>:
 * <code>1.255</code> in euros shows "Enter an amount with at most 2 decimal places" and leaves
 * <code>value</code> empty until it is fixed, because silently rounding money changes it. Trailing
 * zeros are fine (<code>1.250</code> is <code>1.25</code>). <code>min</code> and <code>max</code>
 * (decimal strings) are compared exactly; with <code>required</code> and text that does not read
 * as an amount they block form submission.</p>
 * <p>Set <code>currencies</code> to let the person choose the currency: the symbol becomes a
 * currency selector and <code>currency</code> follows it. Every event carries
 * <code>detail.currency</code>.</p>
 * <p><strong>Currency field or number field?</strong> Use <code>wc-number-field</code> with
 * <code>format='{"style":"currency","currency":"EUR"}'</code> when a number that happens to be
 * shown as money is enough: its <code>value</code> is a JavaScript number, it has
 * <code>step</code> and stepper buttons, and the symbol only shows while not editing. Use
 * <code>wc-currency-field</code> for real money: an exact decimal string, decimals that follow the
 * currency, the symbol always in view, pasted formatted amounts, or a currency the person
 * chooses.</p>
 *
 * @fires {CustomEvent<{value: string, currency: string}>} input - Dispatched as the user types or picks a currency.
 * @fires {CustomEvent<{value: string, currency: string}>} change - Dispatched when the amount or the currency is committed.
 *
 * @cssprop --currency-field-symbol-color - Color of the currency symbol.
 *
 * @example
 * ```html
 * <wc-currency-field label="Price" currency="EUR" value="1234.50"></wc-currency-field>
 * ```
 * @example
 * ```html
 * <wc-currency-field
 *   label="Amount"
 *   currency="USD"
 *   currencies='["USD", "EUR", "GBP", "JPY"]'
 *   min="0"
 *   required
 * ></wc-currency-field>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class CurrencyField extends BaseField {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The amount as a decimal string with the currency's decimals (`"1234.50"`), or ''. */
  @property({ type: String })
  value = '';

  /** The currency, ISO 4217 (`EUR`). Sets the symbol and the number of decimals. Required. */
  @property({ type: String, reflect: true })
  currency = '';

  /** Currencies the person can choose from; the symbol becomes a selector when set. */
  @property({ type: Array })
  currencies?: string[];

  /** Smallest amount allowed, as a decimal string (`"0"`). */
  @property({ type: String })
  min?: string;

  /** Largest amount allowed, as a decimal string (`"10000"`). */
  @property({ type: String })
  max?: string;

  // ── State ────────────────────────────────────────────────────────────────

  /** What the person typed, or the value in its editable form. */
  @state()
  private text = '';

  /** Whether the input has focus, so it shows the plain amount to edit. */
  @state()
  private editing = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.input-element')
  private inputElement?: HTMLInputElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the selector's name and the validation messages. */
  private readonly i18n = new I18nController(this);

  /** The last value the field produced itself, so `willUpdate` can tell a consumer's value apart. */
  private __ownValue = '';

  /** The currency the field started with; `form.reset()` returns to it. */
  private __defaultCurrency?: string;

  /** Id of the hidden currency name the input points at. */
  private readonly __currencyId = `wc-currency-field-currency-${(currencyFieldCount += 1)}`;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.__defaultCurrency ??= this.currency;
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('currency') && !this.__info().known) {
      warnOnce(
        `wc-currency-field:currency:${this.currency}`,
        `[peacock] wc-currency-field needs a valid ISO 4217 currency; got "${this.currency}".`,
      );
    }
    if (changed.has('value') && this.value !== this.__ownValue) {
      this.__syncFromValue();
    } else if (changed.has('currency') && this.text) {
      // Another currency has other decimals: read the same text again.
      this.__applyText(this.text);
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.inputElement?.focus();
  }

  override blur() {
    this.inputElement?.blur();
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected override computeValidity(): ControlValidity {
    const anchor = this.inputElement;
    if (this.disabled) return { flags: {}, message: '' };
    const parsed = this.__parse(this.text);
    if (parsed.status === 'invalid') {
      return {
        flags: { badInput: true },
        message: this.i18n.t('currencyInvalid'),
        anchor,
      };
    }
    if (parsed.status === 'decimals') {
      return {
        flags: { stepMismatch: true },
        message: this.i18n.t('currencyTooManyDecimals')(this.__info().digits),
        anchor,
      };
    }
    if (this.value && isPlainDecimal(this.value)) {
      const { locale } = this.i18n;
      if (
        this.min &&
        isPlainDecimal(this.min) &&
        compareAmounts(this.value, this.min) < 0
      ) {
        return {
          flags: { rangeUnderflow: true },
          message: this.i18n.t('currencyTooLow')(
            formatWithCurrency(this.min, locale, this.currency),
          ),
          anchor,
        };
      }
      if (
        this.max &&
        isPlainDecimal(this.max) &&
        compareAmounts(this.value, this.max) > 0
      ) {
        return {
          flags: { rangeOverflow: true },
          message: this.i18n.t('currencyTooHigh')(
            formatWithCurrency(this.max, locale, this.currency),
          ),
          anchor,
        };
      }
    }
    return { ...super.computeValidity(), anchor };
  }

  protected override validityAnchor() {
    // `@query` gives null before the first render.
    return this.inputElement ?? undefined;
  }

  protected override clearValue() {
    this.text = '';
    this.__setValue('');
    this.__emit('input');
    this.__emit('change');
  }

  override formResetCallback() {
    super.formResetCallback();
    if (this.__defaultCurrency !== undefined) {
      this.currency = this.__defaultCurrency;
    }
    this.__syncFromValue();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private __info(): CurrencyInfo {
    return currencyInfo(this.i18n.locale, this.currency);
  }

  private __parse(text: string): ParsedAmount {
    return parseAmount(
      text,
      this.i18n.locale,
      this.currency,
      this.__info().digits,
    );
  }

  /** Shows a consumer's `value`: normalized to the currency's decimals when it is a plain decimal. */
  private __syncFromValue() {
    this.__ownValue = this.value;
    const { digits } = this.__info();
    const normalized = normalizeAmount(this.value, digits);
    if (normalized === undefined) {
      // Not a plain decimal with the currency's decimals: show it so the field reports it.
      this.text = this.value;
      return;
    }
    this.text = editableAmount(normalized, this.i18n.locale, digits);
    this.__setValue(normalized);
  }

  /** Reads typed text into `value`, or '' while it is not an amount. */
  private __applyText(text: string) {
    this.text = text;
    const parsed = this.__parse(text);
    this.__setValue(parsed.status === 'ok' ? parsed.value : '');
  }

  private __setValue(value: string) {
    this.__ownValue = value;
    this.value = value;
  }

  private __emit(type: 'input' | 'change') {
    this.dispatchEvent(
      new CustomEvent<CurrencyFieldEventDetail>(type, {
        detail: { value: this.value, currency: this.currency },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private __handleInput(event: Event) {
    // Replace the native event, which escapes the shadow root, with the field's own.
    event.stopPropagation();
    this.__applyText((event.target as HTMLInputElement).value);
    this.__emit('input');
  }

  private __handleChange(event: Event) {
    event.stopPropagation();
    this.__emit('change');
  }

  private __handleFocus(event: FocusEvent) {
    this.handleFieldFocus(event);
    this.editing = event.type === 'focus';
    if (this.editing && this.value && isPlainDecimal(this.value)) {
      // Edit the plain amount, as the locale writes it without grouping.
      this.text = editableAmount(
        this.value,
        this.i18n.locale,
        this.__info().digits,
      );
    }
  }

  private __handleCurrencyChange(event: Event) {
    event.stopPropagation();
    this.currency = (event.target as HTMLSelectElement).value;
    this.__applyText(this.text);
    this.__emit('input');
    this.__emit('change');
  }

  private __stopEvent(event: Event) {
    // The select's native `input` escapes the shadow root; clicks would focus the amount input.
    event.stopPropagation();
  }

  /** What the input shows: grouped while not editing a valid amount, else the text. */
  private __displayText(): string {
    if (this.editing || !this.value || !isPlainDecimal(this.value)) {
      return this.text;
    }
    if (this.__parse(this.text).status !== 'ok') return this.text;
    return formatAmount(
      this.value,
      this.i18n.locale,
      this.currency,
      this.__info().digits,
    );
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderSymbol(info: CurrencyInfo) {
    const slot = info.placement === 'end' ? 'field-end' : 'field-start';
    const choices = (this.currencies ?? []).map(code => code.toUpperCase());
    if (!choices.length) {
      if (!info.symbol) return nothing;
      return html`<span class="symbol" slot=${slot} aria-hidden="true"
        >${info.symbol}</span
      >`;
    }
    if (!choices.includes(this.currency.toUpperCase()) && this.currency) {
      choices.unshift(this.currency.toUpperCase());
    }
    const { locale } = this.i18n;
    // A transparent native select lies over the symbol: it opens the platform's list (with
    // typeahead on the names) and screen readers announce it as a combobox.
    return html`<span class="symbol picker" slot=${slot}>
      <span aria-hidden="true">${info.symbol || this.currency}</span>
      <wc-icon
        class="arrow"
        name="arrow_drop_down"
        aria-hidden="true"
      ></wc-icon>
      <select
        class="currency-select"
        aria-label=${this.i18n.t('currencyPicker')}
        autocomplete="transaction-currency"
        .value=${this.currency.toUpperCase()}
        ?disabled=${this.disabled || this.readonly}
        @change=${this.__handleCurrencyChange}
        @input=${this.__stopEvent}
        @click=${this.__stopEvent}
        @focus=${this.handleFieldFocus}
        @blur=${this.handleFieldFocus}
      >
        ${choices.map(
          code =>
            html`<option
              value=${code}
              ?selected=${code === this.currency.toUpperCase()}
            >
              ${currencyName(locale, code)} (${code})
            </option>`,
        )}
      </select>
    </span>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const info = this.__info();
    const aria = this.fieldAria();
    const describedBy = [aria['aria-describedby'], this.__currencyId]
      .filter(Boolean)
      .join(' ');
    const symbol = this.renderSymbol(info);
    const field = this.renderField(
      html`<input
        class="input input-element"
        type="text"
        inputmode="decimal"
        autocomplete="transaction-amount"
        spellcheck="false"
        placeholder=${this.placeholder}
        .value=${this.__displayText()}
        ?readonly=${this.readonly}
        ?required=${this.required}
        ?disabled=${this.disabled}
        @input=${this.__handleInput}
        @change=${this.__handleChange}
        @focus=${this.__handleFocus}
        @blur=${this.__handleFocus}
        ${spread({ ...aria, 'aria-describedby': describedBy })}
      />`,
      {
        populated: !!this.text,
        start: info.placement === 'start' ? symbol : nothing,
        end: info.placement === 'end' ? symbol : nothing,
      },
    );
    return html`${field}
      <span id=${this.__currencyId} hidden
        >${this.currency
          ? currencyName(this.i18n.locale, this.currency)
          : ''}</span
      >`;
  }
}
