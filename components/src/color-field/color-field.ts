import { html, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { spread } from '@/__internal/directive/spread.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import BaseField from '../input/BaseField.js';
import type { ControlValidity } from '../input/BaseInput.js';
import type { Popover } from '../popover/popover.js';
import styles from './color-field.scss';

const HEX_COLOR = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Normalizes `abc`, `#ABC` or `#aabbcc` to `#aabbcc`; returns null for anything else. */
function normalizeHex(input: string): string | null {
  const match = input.trim().match(HEX_COLOR);
  if (!match) return null;
  const hex = match[1].toLowerCase();
  return `#${hex.length === 3 ? hex.replace(/./g, c => c + c) : hex}`;
}

/**
 * @label Color Field
 * @tag wc-color-field
 * @rawTag color-field
 *
 * @summary A text field for a hex color, with a swatch that opens a color picker.
 * @overview
 * <p>Color field shows the current color as a swatch next to its hex value. Type a hex value, or
 * click the swatch to pick one with <code>wc-color-picker</code> in a popover.</p>
 * <p>It is form-associated: the hex value is submitted under its <code>name</code>.
 * <code>required</code> and text that is not a hex color block form submission.</p>
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched while the color changes in the picker.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when a color is committed, from the picker or the text field.
 *
 * @example
 * ```html
 * <wc-color-field label="Brand color" value="#7c5df0"></wc-color-field>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class ColorField extends BaseField {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The color as a 6-digit hex string, such as `"#7c5df0"`. */
  @property({ type: String }) value = '#7c5df0';

  /** Where the picker opens, relative to the field. */
  @property({ type: String }) placement: Popover['placement'] = 'bottom-start';

  // ── State ────────────────────────────────────────────────────────────────

  /** Text in the hex input; differs from `value` while the user is typing. */
  @state() private draft = '';

  @state() private pickerOpen = false;

  /** True after the user typed something that is not a hex color. */
  @state() private invalid = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('wc-popover') private popoverElement?: Popover;

  @query('.input') private inputElement?: HTMLInputElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the swatch, input and error labels. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('value')) {
      this.draft = this.value;
      this.invalid = false;
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.inputElement?.focus();
  }

  override blur() {
    this.inputElement?.blur();
  }

  /** Opens the color picker. */
  showPicker() {
    if (this.disabled || this.readonly) return;
    this.popoverElement?.show();
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected override computeValidity(): ControlValidity {
    if (this.invalid && !this.disabled) {
      return {
        flags: { badInput: true },
        message: this.i18n.t('hexColorError'),
      };
    }
    return super.computeValidity();
  }

  protected override validityAnchor() {
    // `@query` gives null before the first render.
    return this.inputElement ?? undefined;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private commit(value: string) {
    this.value = value;
    this.emitValue('change');
  }

  private handleSwatchClick(event: MouseEvent) {
    // Keep the field from moving focus to the text input.
    event.stopPropagation();
    if (this.pickerOpen) {
      this.popoverElement?.hide();
    } else {
      this.showPicker();
    }
  }

  private handleTextInput(event: Event) {
    // The native event escapes the shadow root; the field fires `input` only for value changes.
    event.stopPropagation();
    this.draft = (event.target as HTMLInputElement).value;
    this.invalid = false;
  }

  private handleTextChange(event: Event) {
    event.stopPropagation();
    this.commitDraft();
  }

  private commitDraft() {
    const hex = normalizeHex(this.draft);
    if (!hex) {
      this.invalid = this.draft.trim() !== '';
      return;
    }
    if (hex !== this.value) this.commit(hex);
    else this.draft = hex;
  }

  private handleTextKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.commitDraft();
    if (event.key === 'ArrowDown' && event.altKey) {
      event.preventDefault();
      this.showPicker();
    }
  }

  private handlePickerInput(event: Event) {
    event.stopPropagation();
    // Only the picker's own CustomEvent carries a value; ignore native events from its inputs.
    if (
      !(event instanceof CustomEvent) ||
      typeof event.detail?.value !== 'string'
    )
      return;
    this.value = event.detail.value;
    this.emitValue('input');
  }

  private handlePickerChange(event: Event) {
    event.stopPropagation();
    if (
      !(event instanceof CustomEvent) ||
      typeof event.detail?.value !== 'string'
    )
      return;
    this.commit(event.detail.value);
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderSwatch() {
    return html`<button
      slot="field-start"
      class="swatch"
      type="button"
      aria-label=${this.i18n.t('chooseColor')}
      aria-haspopup="dialog"
      aria-expanded=${String(this.pickerOpen)}
      ?disabled=${this.disabled || this.readonly}
      style=${styleMap({ '--_swatch-color': this.value })}
      @click=${this.handleSwatchClick}
    ></button>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const controlError = this.invalid ? this.i18n.t('hexColorError') : '';
    const aria = this.fieldAria(controlError);
    if (!aria['aria-label']) aria['aria-label'] = this.i18n.t('hexColor');

    return html`
      <wc-popover
        class="popover"
        trigger="manual"
        placement=${this.placement}
        offset="4"
        @wc-popover--open=${() => {
          this.pickerOpen = true;
        }}
        @wc-popover--close=${() => {
          this.pickerOpen = false;
        }}
      >
        ${this.renderField(
          html`<input
            class="input"
            spellcheck="false"
            autocomplete="off"
            maxlength="7"
            placeholder=${this.placeholder}
            .value=${this.draft}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            ?required=${this.required}
            @input=${this.handleTextInput}
            @change=${this.handleTextChange}
            @keydown=${this.handleTextKeyDown}
            @focus=${this.handleFieldFocus}
            @blur=${this.handleFieldFocus}
            ${spread(aria)}
          />`,
          {
            populated: true,
            focused: this.focused || this.pickerOpen,
            controlError,
            start: this.renderSwatch(),
          },
        )}
        <wc-popover-content class="picker-panel">
          <wc-color-picker
            .value=${this.value}
            ?disabled=${this.disabled || this.readonly}
            @input=${this.handlePickerInput}
            @change=${this.handlePickerChange}
          ></wc-color-picker>
        </wc-popover-content>
      </wc-popover>
    `;
  }
}
