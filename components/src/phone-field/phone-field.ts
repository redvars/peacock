import { html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { spread } from '@/__internal/directive/spread.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { FormRestoreState } from '@/__internal/mixins/form-associated.js';
import IndividualComponent from '@/IndividualComponent.js';

import BaseField from '../input/BaseField.js';
import type { ControlValidity } from '../input/BaseInput.js';
import {
  ALL_COUNTRIES,
  callingCode,
  countryForCode,
  flagEmoji,
  isKnownCountry,
  localeRegion,
  matchCallingCode,
  nationalNumber,
} from './countries.js';
import styles from './phone-field.scss';

/** What `input` and `change` carry. */
export interface PhoneFieldEventDetail {
  /** The number in E.164 form, such as `+442079460958`, or '' while there is no valid number. */
  value: string;
  /** The selected country, ISO 3166-1 alpha-2, such as `GB`. */
  country: string;
}

/** Characters allowed between the digits of a phone number. */
const SEPARATORS = /[\s\-()]/g;

/** E.164 allows at most 15 digits; fewer than 4 (code included) is no real number. */
const MIN_DIGITS = 4;
const MAX_DIGITS = 15;

/** The typed text, read as a phone number. */
interface ParsedText {
  /** Digits of the national number, trunk prefix dropped. */
  national: string;
  /** Whether the text is a number the field can submit. */
  valid: boolean;
}

/**
 * @label Phone Field
 * @tag wc-phone-field
 * @rawTag phone-field
 *
 * @summary A field for a phone number, with a country selector for the calling code.
 * @overview
 * <p>Phone field has a country selector at its start, showing the flag and calling code (such as
 * <code>+44</code>), and a field for the national number. Its <code>value</code> is the whole
 * number in E.164 form (<code>+442079460958</code>), ready to store or dial, or '' while the field
 * holds no valid number. A full international number typed or pasted into the field (starting
 * with <code>+</code> or <code>00</code>, such as <code>+44 20 7946 0958</code>) selects its
 * country and leaves the national part. A leading trunk 0 (<code>020 7946 0958</code>) is dropped,
 * except in Italy, Vatican City, San Marino, Côte d'Ivoire and Congo, which keep it.</p>
 * <p>The field checks the shape of the number, not whether it exists: digits only (spaces, dashes
 * and brackets are allowed between them), 4 to 15 digits with the calling code, as E.164 allows.
 * Anything else shows "Enter a valid phone number" and blocks form submission, as does an empty
 * <code>required</code> field. Inside a <code>&lt;form&gt;</code> the E.164 value is submitted under
 * its <code>name</code>.</p>
 * <p>The country list holds every ITU calling code, named in the field's locale (the nearest
 * <code>lang</code>, else the browser's). <code>country</code> starts as the locale's region (so
 * <code>lang="en-GB"</code> starts on the United Kingdom), else the United States. Countries that
 * share a code, such as the +1 countries, keep the one the person selected. Limit or order the list
 * with <code>countries</code> and pin the likely ones to the top with
 * <code>preferred-countries</code>.</p>
 *
 * @fires {CustomEvent<{value: string, country: string}>} input - Dispatched as the user types or picks a country.
 * @fires {CustomEvent<{value: string, country: string}>} change - Dispatched when the number or the country is committed.
 *
 * @cssprop --phone-field-country-gap - Space between the flag, the calling code and the arrow.
 *
 * @example
 * ```html
 * <wc-phone-field label="Phone" name="phone" required></wc-phone-field>
 * ```
 * @example
 * ```html
 * <wc-phone-field
 *   label="Mobile"
 *   country="GB"
 *   preferred-countries='["GB", "IE"]'
 *   value="+447700900123"
 * ></wc-phone-field>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class PhoneField extends BaseField {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The number in E.164 form (`+442079460958`), or '' while there is no valid number. */
  @property({ type: String })
  value = '';

  /**
   * The selected country, ISO 3166-1 alpha-2 (`GB`). Starts as the locale's region, else `US`.
   * A `value` with another calling code selects that code's country.
   */
  @property({ type: String, reflect: true })
  country = '';

  /** Limits and orders the country list, as alpha-2 codes. All countries, by name, when unset. */
  @property({ type: Array })
  countries?: string[];

  /** Countries pinned to the top of the list, in this order, above a separator. */
  @property({ type: Array, attribute: 'preferred-countries' })
  preferredCountries?: string[];

  // ── State ────────────────────────────────────────────────────────────────

  /** What the national-number input shows. */
  @state()
  private text = '';

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.input-element')
  private inputElement?: HTMLInputElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the selector's name and the validation message. */
  private readonly i18n = new I18nController(this);

  /** The last value the field produced itself, so `willUpdate` can tell a consumer's value apart. */
  private __ownValue = '';

  /** The country the field started with; `form.reset()` returns to it. */
  private __defaultCountry = '';

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    if (!this.__defaultCountry) {
      this.country = this.country.toUpperCase();
      if (!isKnownCountry(this.country)) {
        this.country = this.__resolvedCountry();
      }
      this.__syncFromValue();
      this.__defaultCountry = this.country;
    }
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('country')) this.country = this.country.toUpperCase();
    if (changed.has('value') && this.value !== this.__ownValue) {
      this.__syncFromValue();
    } else if (changed.has('country') && this.text) {
      // The country changed under a typed number: the same digits now dial another code.
      this.__applyText(this.text);
    }
    if (!isKnownCountry(this.country)) this.country = this.__resolvedCountry();
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
    if (!this.disabled && this.text && !this.__parse(this.text).valid) {
      return {
        flags: { typeMismatch: true },
        message: this.i18n.t('phoneInvalid'),
        anchor: this.inputElement,
      };
    }
    return { ...super.computeValidity(), anchor: this.inputElement };
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
    this.country = this.__defaultCountry;
    this.__syncFromValue();
  }

  override formStateRestoreCallback(restored: FormRestoreState | null) {
    super.formStateRestoreCallback(restored);
    this.__syncFromValue();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** The country to fall back to: the locale's region when the table knows it, else `US`. */
  private __resolvedCountry(): string {
    const region = localeRegion(this.i18n.locale);
    if (this.countries?.length) {
      const allowed = this.__allowedCountries();
      return allowed.includes(region) ? region : (allowed[0] ?? 'US');
    }
    return isKnownCountry(region) ? region : 'US';
  }

  /** `countries`, upper-cased and limited to the table, or every country. */
  private __allowedCountries(): string[] {
    const list = (this.countries ?? [])
      .map(country => country.toUpperCase())
      .filter(isKnownCountry);
    return list.length ? list : [...ALL_COUNTRIES];
  }

  /** Shows a consumer's `value`: selects its country and puts its national digits in the input. */
  private __syncFromValue() {
    this.__ownValue = this.value;
    const value = this.value.trim();
    if (!value) {
      this.text = '';
      return;
    }
    const digits = value.replace(/^\+/, '');
    const code = /^\+\d+$/.test(value) ? matchCallingCode(digits) : '';
    if (!code) {
      // Not E.164: show it as typed, so the field reports it as invalid.
      this.text = value;
      return;
    }
    this.country = countryForCode(code, this.country, this.countries);
    this.text = digits.slice(code.length);
  }

  /**
   * Reads typed text. An international number (`+44 …` or `0044 …`) selects its country and
   * leaves the national part in the input.
   */
  private __applyText(raw: string) {
    let text = raw;
    const international = /^\s*(\+|00)/.exec(text);
    if (international) {
      const rest = text.slice(international[0].length);
      const digits = rest.replace(SEPARATORS, '');
      const code = /^\d+/.test(digits) ? matchCallingCode(digits) : '';
      if (code) {
        this.country = countryForCode(code, this.country, this.countries);
        text = PhoneField.__dropDigits(rest, code.length);
      }
    }
    this.text = text;
    const { national, valid } = this.__parse(text);
    this.__setValue(valid ? `+${callingCode(this.country)}${national}` : '');
  }

  /** `text` without its first `count` digits and the separators around them. */
  private static __dropDigits(text: string, count: number): string {
    let seen = 0;
    let index = 0;
    while (index < text.length && seen < count) {
      if (/\d/.test(text[index])) seen += 1;
      index += 1;
    }
    return text.slice(index).replace(/^[\s\-)]+/, '');
  }

  /** The national number in `text` and whether it makes a valid E.164 number. */
  private __parse(text: string): ParsedText {
    const compact = text.replace(SEPARATORS, '');
    if (!/^\d*$/.test(compact)) return { national: '', valid: false };
    const national = nationalNumber(compact, this.country);
    const total = callingCode(this.country).length + national.length;
    return {
      national,
      valid: national.length > 0 && total >= MIN_DIGITS && total <= MAX_DIGITS,
    };
  }

  private __setValue(value: string) {
    this.__ownValue = value;
    this.value = value;
  }

  private __emit(type: 'input' | 'change') {
    this.dispatchEvent(
      new CustomEvent<PhoneFieldEventDetail>(type, {
        detail: { value: this.value, country: this.country },
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

  private __handleCountryChange(event: Event) {
    event.stopPropagation();
    this.country = (event.target as HTMLSelectElement).value;
    this.__applyText(this.text);
    this.__emit('input');
    this.__emit('change');
  }

  private __stopEvent(event: Event) {
    // The select's native `input` escapes the shadow root; clicks would focus the number input.
    event.stopPropagation();
  }

  /** Country names in the field's locale, or `undefined` where Intl cannot name regions. */
  private __displayNames(): Intl.DisplayNames | undefined {
    try {
      return new Intl.DisplayNames(this.i18n.locale, { type: 'region' });
    } catch {
      return undefined;
    }
  }

  /** The countries the selector lists: pinned first, then the rest. */
  private __countryOptions(names: Intl.DisplayNames | undefined): {
    pinned: string[];
    rest: string[];
  } {
    const allowed = this.__allowedCountries();
    if (!allowed.includes(this.country)) allowed.unshift(this.country);
    const name = (country: string) => names?.of(country) ?? country;
    if (!this.countries?.length) {
      const collator = new Intl.Collator(this.i18n.locale);
      allowed.sort((a, b) => collator.compare(name(a), name(b)));
    }
    const pinned = (this.preferredCountries ?? [])
      .map(country => country.toUpperCase())
      .filter(country => allowed.includes(country));
    return {
      pinned,
      rest: allowed.filter(country => !pinned.includes(country)),
    };
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderOption(country: string, names: Intl.DisplayNames | undefined) {
    const label = `${names?.of(country) ?? country} (+${callingCode(country)})`;
    return html`<option value=${country} ?selected=${country === this.country}>
      ${label}
    </option>`;
  }

  private renderCountry() {
    const names = this.__displayNames();
    const { pinned, rest } = this.__countryOptions(names);
    // A transparent native select lies over the flag and code: it opens the platform's list
    // (with typeahead on the names) and screen readers announce it as a combobox.
    return html`<span class="country" slot="field-start">
      <span class="flag" aria-hidden="true">${flagEmoji(this.country)}</span>
      <span class="code" aria-hidden="true">+${callingCode(this.country)}</span>
      <wc-icon
        class="arrow"
        name="arrow_drop_down"
        aria-hidden="true"
      ></wc-icon>
      <select
        class="country-select"
        aria-label=${this.i18n.t('phoneCountry')}
        autocomplete="tel-country-code"
        .value=${this.country}
        ?disabled=${this.disabled || this.readonly}
        @change=${this.__handleCountryChange}
        @input=${this.__stopEvent}
        @click=${this.__stopEvent}
        @focus=${this.handleFieldFocus}
        @blur=${this.handleFieldFocus}
      >
        ${pinned.map(country => this.renderOption(country, names))}
        ${pinned.length ? html`<hr />` : nothing}
        ${rest.map(country => this.renderOption(country, names))}
      </select>
    </span>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return this.renderField(
      html`<input
        class="input input-element"
        type="tel"
        inputmode="tel"
        autocomplete="tel-national"
        placeholder=${this.placeholder}
        .value=${this.text}
        ?readonly=${this.readonly}
        ?required=${this.required}
        ?disabled=${this.disabled}
        @input=${this.__handleInput}
        @change=${this.__handleChange}
        @focus=${this.handleFieldFocus}
        @blur=${this.handleFieldFocus}
        ${spread(this.fieldAria())}
      />`,
      { populated: !!this.text, start: this.renderCountry() },
    );
  }
}
