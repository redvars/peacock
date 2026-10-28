import { html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import BaseInput from '../input/BaseInput.js';
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
 * <p>It is form-associated: the hex value is submitted under its <code>name</code>.</p>
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
export class ColorField extends BaseInput {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The color as a 6-digit hex string, such as `"#7c5df0"`. */
  @property({ type: String, reflect: true }) value = '#7c5df0';

  /** Label shown above the field. */
  @property({ type: String }) label = '';

  /** Helper text shown below the field. */
  @property({ type: String, attribute: 'helper-text' }) helperText = '';

  /** Visual variant of the field. */
  @property({ type: String }) variant: 'filled' | 'outlined' | 'default' =
    'default';

  /** Where the picker opens, relative to the field. */
  @property({ type: String }) placement: Popover['placement'] = 'bottom-start';

  // ── State ────────────────────────────────────────────────────────────────

  /** Text in the hex input; differs from `value` while the user is typing. */
  @state() private draft = '';

  @state() private focused = false;

  @state() private pickerOpen = false;

  /** True after the user typed something that is not a hex color. */
  @state() private invalid = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('wc-popover') private popoverElement?: Popover;

  @query('.input') private inputElement?: HTMLInputElement;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: Map<PropertyKey, unknown>) {
    if (changed.has('value')) {
      this.draft = this.value;
      this.invalid = false;
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.inputElement?.focus();
  }

  /** Opens the color picker. */
  showPicker() {
    if (this.disabled || this.readonly) return;
    this.popoverElement?.show();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private commit(value: string) {
    this.value = value;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
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

  private handleTextInput(event: InputEvent) {
    this.draft = (event.target as HTMLInputElement).value;
    this.invalid = false;
  }

  private handleTextChange() {
    const hex = normalizeHex(this.draft);
    if (!hex) {
      this.invalid = this.draft.trim() !== '';
      return;
    }
    if (hex !== this.value) this.commit(hex);
    else this.draft = hex;
  }

  private handleTextKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.handleTextChange();
    if (event.key === 'ArrowDown' && event.altKey) {
      event.preventDefault();
      this.showPicker();
    }
  }

  private handlePickerInput(event: CustomEvent<{ value: string }>) {
    event.stopPropagation();
    this.value = event.detail.value;
    this.dispatchEvent(
      new CustomEvent('input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handlePickerChange(event: CustomEvent<{ value: string }>) {
    event.stopPropagation();
    this.commit(event.detail.value);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
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
        <wc-field
          label=${this.label}
          helper-text=${this.helperText}
          variant=${this.variant}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?skeleton=${this.skeleton}
          ?error=${this.invalid}
          error-text="Enter a hex color, such as #7c5df0"
          populated
          ?focused=${this.focused || this.pickerOpen}
          .host=${this}
        >
          <button
            slot="field-start"
            class="swatch"
            type="button"
            aria-label="Choose color"
            aria-haspopup="dialog"
            aria-expanded=${String(this.pickerOpen)}
            ?disabled=${this.disabled || this.readonly}
            style=${styleMap({ '--_swatch-color': this.value })}
            @click=${this.handleSwatchClick}
          ></button>
          <input
            class="input"
            name=${this.name}
            spellcheck="false"
            autocomplete="off"
            maxlength="7"
            aria-label=${this.label || 'Hex color'}
            .value=${this.draft}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            ?required=${this.required}
            @input=${this.handleTextInput}
            @change=${this.handleTextChange}
            @keydown=${this.handleTextKeyDown}
            @focus=${() => {
              this.focused = true;
            }}
            @blur=${() => {
              this.focused = false;
            }}
          />
        </wc-field>
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
