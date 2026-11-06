import { html, nothing, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { spread } from '@/__internal/directive/spread.js';
import { resolveLocale } from '@/__internal/utils/date.js';
import BaseInput from '../input/BaseInput.js';
import type { Popover } from '../popover/popover.js';

/** A picker hosted in a field's popover: it takes focus when the popover opens. */
interface FocusablePicker extends HTMLElement {
  focus(): void;
}

/**
 * Base for text fields that open a picker in a popover: `wc-date-field`, `wc-time-field` and
 * `wc-datetime-field`.
 *
 * The field keeps the typed text in `draft` and parses it on blur or Enter. Valid text becomes
 * `value` (always ISO, so forms submit a locale-independent value) and fires `change`; text that
 * does not parse, or falls outside `min`/`max`, keeps the draft and shows an error. Values picked
 * in the popover fire `input` while they change and `change` once committed.
 *
 * Subclasses supply the parsing, formatting, validation and the picker itself.
 */
export default abstract class PickerField extends BaseInput {
  // ── Properties ───────────────────────────────────────────────────────────

  /** The value as an ISO string; empty when there is none. */
  @property({ type: String, reflect: true }) value = '';

  /** Label shown above the field. */
  @property({ type: String }) label = '';

  /** Placeholder text; defaults to the format hint for the locale. */
  @property({ type: String }) placeholder = '';

  /** Helper text shown below the field. */
  @property({ type: String, attribute: 'helper-text' }) helperText = '';

  /** Shows the field in its error state with `error-text`. */
  @property({ type: Boolean }) error = false;

  @property({ type: String, attribute: 'error-text' }) errorText = '';

  /** Shows the field in its warning state with `warning-text`. */
  @property({ type: Boolean }) warning = false;

  @property({ type: String, attribute: 'warning-text' }) warningText = '';

  /** Visual variant of the field. */
  @property({ type: String }) variant: 'filled' | 'outlined' | 'default' =
    'default';

  /** BCP 47 locale for display and typed input; defaults to the page language. */
  @property({ type: String }) locale = '';

  /** Where the picker opens, relative to the field. */
  @property({ type: String }) placement: Popover['placement'] = 'bottom-start';

  /** ARIA attributes moved from the host onto the inner input. */
  @property({ type: Object }) configAria: Record<string, string> = {};

  // ── State ────────────────────────────────────────────────────────────────

  /** Text in the input; differs from the formatted `value` while the person is typing. */
  @state() protected draft = '';

  @state() protected focused = false;

  @state() protected pickerOpen = false;

  /** Message for typed text that could not be used; empty when the text is fine. */
  @state() protected invalidText = '';

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('wc-popover') protected popoverElement?: Popover;

  @query('.input') protected inputElement?: HTMLInputElement;

  @query('.picker') protected pickerElement?: FocusablePicker;

  // ── Private fields ───────────────────────────────────────────────────────

  /** The last value announced with `change`; closing the popover commits anything newer. */
  private lastCommitted = '';

  /** Whether to move focus back to the input when the popover closes. */
  private restoreFocus = false;

  // ── Abstract members ─────────────────────────────────────────────────────

  /** Material icon name for the button that opens the picker. */
  protected abstract readonly pickerIcon: string;

  /** Accessible name for the button that opens the picker. */
  protected abstract readonly pickerLabel: string;

  /** Whether a value committed in the picker closes the popover. */
  protected abstract closeOnCommit(value: string): boolean;

  /** Parses typed text to an ISO value, or returns null when it cannot be read. */
  protected abstract parseText(text: string): string | null;

  /** Formats an ISO value as display text. */
  protected abstract formatValue(value: string): string;

  /** The format hint used for the placeholder and the error message. */
  protected abstract formatHint(): string;

  /** Returns an error message when a parsed value is not allowed (outside min/max), else ''. */
  protected abstract validateValue(value: string): string;

  /** Renders the picker inside the popover. It must carry the `picker` class. */
  protected abstract renderPicker(): TemplateResult;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.lastCommitted = this.value;
    this.moveAriaToInput();
  }

  protected override willUpdate(changed: Map<PropertyKey, unknown>) {
    if (changed.has('value') || changed.has('locale')) {
      this.draft = this.formatValue(this.value);
      this.invalidText = '';
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.inputElement?.focus();
  }

  override blur() {
    this.inputElement?.blur();
  }

  /** Opens the picker and moves focus into it. */
  showPicker() {
    if (this.disabled || this.readonly) return;
    this.popoverElement?.show();
    this.updateComplete.then(() => {
      requestAnimationFrame(() => this.pickerElement?.focus());
    });
  }

  /** Closes the picker. */
  hidePicker() {
    this.popoverElement?.hide();
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected get resolvedLocale(): string {
    return resolveLocale(this.locale);
  }

  /** Sets the value and fires `change`. */
  protected commit(value: string) {
    this.value = value;
    this.lastCommitted = value;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Sets the value and fires `input`, for a change that is not committed yet. */
  protected preview(value: string) {
    this.value = value;
    this.dispatchEvent(
      new CustomEvent('input', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected handlePickerInput(event: CustomEvent<{ value: string }>) {
    event.stopPropagation();
    this.preview(event.detail.value);
  }

  protected handlePickerChange(event: CustomEvent<{ value: string }>) {
    event.stopPropagation();
    this.commit(event.detail.value);
    if (this.closeOnCommit(event.detail.value)) {
      this.restoreFocus = true;
      this.hidePicker();
    }
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private moveAriaToInput() {
    Array.from(this.attributes).forEach(attr => {
      if (attr.name.startsWith('aria-')) {
        this.configAria = { ...this.configAria, [attr.name]: attr.value };
        this.removeAttribute(attr.name);
      }
    });
  }

  private handleTextInput(event: InputEvent) {
    this.draft = (event.target as HTMLInputElement).value;
    this.invalidText = '';
  }

  private handleTextChange() {
    const text = this.draft.trim();
    if (!text) {
      this.invalidText = '';
      if (this.value) this.commit('');
      return;
    }
    const parsed = this.parseText(text);
    if (parsed === null) {
      this.invalidText = `Enter ${this.formatHint()}`;
      return;
    }
    const problem = this.validateValue(parsed);
    if (problem) {
      this.invalidText = problem;
      return;
    }
    if (parsed !== this.value) this.commit(parsed);
    // The value may be unchanged while the text differs (`6/11/26` for `06/11/2026`).
    this.draft = this.formatValue(parsed);
  }

  private handleTextKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.handleTextChange();
    if (event.key === 'ArrowDown' && event.altKey) {
      event.preventDefault();
      this.showPicker();
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.pickerOpen) {
      event.stopPropagation();
      this.restoreFocus = true;
      this.hidePicker();
    }
  }

  private handleButtonClick(event: MouseEvent) {
    // Keep the field from moving focus to the text input.
    event.stopPropagation();
    if (this.pickerOpen) this.hidePicker();
    else this.showPicker();
  }

  private handlePopoverOpen() {
    this.pickerOpen = true;
  }

  private handlePopoverClose() {
    this.pickerOpen = false;
    if (this.value !== this.lastCommitted) this.commit(this.value);
    if (this.restoreFocus) {
      this.restoreFocus = false;
      this.focus();
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const invalid = !!this.invalidText;
    return html`
      <wc-popover
        class="popover"
        trigger="manual"
        placement=${this.placement}
        offset="4"
        @keydown=${this.handleKeyDown}
        @wc-popover--open=${this.handlePopoverOpen}
        @wc-popover--close=${this.handlePopoverClose}
      >
        <wc-field
          label=${this.label}
          helper-text=${this.helperText}
          variant=${this.variant}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?skeleton=${this.skeleton}
          ?error=${this.error || invalid}
          error-text=${invalid ? this.invalidText : this.errorText}
          ?warning=${this.warning}
          warning-text=${this.warningText}
          ?populated=${!!this.draft}
          ?focused=${this.focused || this.pickerOpen}
          .host=${this}
        >
          <slot name="start" slot="field-start"></slot>
          <input
            class="input"
            name=${this.name || nothing}
            spellcheck="false"
            autocomplete="off"
            placeholder=${this.placeholder || this.formatHint()}
            aria-label=${this.label || nothing}
            aria-invalid=${invalid ? 'true' : nothing}
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
            ${spread(this.configAria)}
          />
          <slot name="end" slot="field-end"></slot>
          <wc-icon-button
            slot="field-end"
            class="picker-button"
            shape="round"
            variant="text"
            color="secondary"
            size="sm"
            aria-label=${this.pickerLabel}
            aria-haspopup="dialog"
            aria-expanded=${String(this.pickerOpen)}
            ?disabled=${this.disabled || this.readonly}
            @click=${this.handleButtonClick}
          >
            <wc-icon name=${this.pickerIcon}></wc-icon>
          </wc-icon-button>
        </wc-field>
        <wc-popover-content
          class="picker-panel"
          role="dialog"
          aria-label=${this.pickerLabel}
        >
          ${this.renderPicker()}
        </wc-popover-content>
      </wc-popover>
    `;
  }
}
