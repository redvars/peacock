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

const HEX_COLOR_ALPHA =
  /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** The color the picker starts on while the field is empty. */
const PICKER_START_COLOR = '#7c5df0';

/**
 * Normalizes `abc`, `#ABC` or `#aabbcc` to `#aabbcc`, and with `alpha` also `#abcd` or
 * `#aabbccdd` to `#aabbccdd`; returns null for anything else.
 */
function normalizeHex(input: string, alpha = false): string | null {
  const match = input.trim().match(alpha ? HEX_COLOR_ALPHA : HEX_COLOR);
  if (!match) return null;
  const hex = match[1].toLowerCase();
  return `#${hex.length <= 4 ? hex.replace(/./g, c => c + c) : hex}`;
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
 * <code>required</code> and text that is not a hex color block form submission. The field starts
 * empty, so an untouched field submits an empty value and <code>required</code> can catch it.</p>
 * <p>With <code>alpha</code> the picker shows an opacity slider and the value is an 8-digit hex
 * color (<code>#rrggbbaa</code>).</p>
 * <p><code>readonly</code> shows the color but keeps the picker closed and the text read-only.</p>
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

  /**
   * The color as a hex string: `#rrggbb` such as `"#7c5df0"`, or `#rrggbbaa` with `alpha`.
   * Empty when no color is set.
   */
  @property({ type: String }) value = '';

  /** Lets the color carry an opacity: the picker shows an alpha slider, the value is `#rrggbbaa`. */
  @property({ type: Boolean }) alpha = false;

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
        message: this.hexErrorText,
      };
    }
    return super.computeValidity();
  }

  // ── Private getters ──────────────────────────────────────────────────────

  private get hexErrorText(): string {
    return this.i18n.t(this.alpha ? 'hexColorAlphaError' : 'hexColorError');
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
    if (this.readonly) return;
    if (!this.draft.trim()) {
      this.invalid = false;
      if (this.value) this.commit('');
      return;
    }
    const hex = normalizeHex(this.draft, this.alpha);
    if (!hex) {
      this.invalid = true;
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

  /**
   * The popover's `open`/`close` are internal: they bubble and are composed, so stop them here,
   * or consumers listening on the field would hear them.
   */
  private handleOverlayEvent = (event: Event) => {
    event.stopPropagation();
    if (event.target !== this.popoverElement) return;
    this.pickerOpen = event.type === 'open';
  };

  private static stopEvent(event: Event) {
    event.stopPropagation();
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
    const controlError = this.invalid ? this.hexErrorText : '';
    const aria = this.fieldAria(controlError);
    if (!aria['aria-label']) aria['aria-label'] = this.i18n.t('hexColor');

    return html`
      <wc-popover
        class="popover"
        trigger="manual"
        placement=${this.placement}
        offset="4"
        @open=${this.handleOverlayEvent}
        @close=${this.handleOverlayEvent}
        @wc-popover--open=${ColorField.stopEvent}
        @wc-popover--close=${ColorField.stopEvent}
      >
        ${this.renderField(
          html`<input
            class="input"
            spellcheck="false"
            autocomplete="off"
            maxlength=${this.alpha ? 9 : 7}
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
            populated: !!this.draft,
            focused: this.focused || this.pickerOpen,
            controlError,
            start: this.renderSwatch(),
          },
        )}
        <wc-popover-content class="picker-panel">
          <wc-color-picker
            .value=${this.value || PICKER_START_COLOR}
            ?alpha=${this.alpha}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            @input=${this.handlePickerInput}
            @change=${this.handlePickerChange}
          ></wc-color-picker>
        </wc-popover-content>
      </wc-popover>
    `;
  }
}
