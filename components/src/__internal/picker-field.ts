import { html, type PropertyValues, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { spread } from '@/__internal/directive/spread.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import BaseField from '../input/BaseField.js';
import type { ControlValidity } from '../input/BaseInput.js';
import type { Popover } from '../popover/popover.js';

/** A picker hosted in a field's popover: it takes focus when the popover opens. */
interface FocusablePicker extends HTMLElement {
  focus(): void;
}

/** Why a parsed value is not allowed: the validity flag it sets and the message to show. */
export interface ValueProblem {
  flag: 'rangeUnderflow' | 'rangeOverflow' | 'badInput';
  message: string;
}

/**
 * Base for text fields that open a picker in a popover: `wc-date-field`, `wc-time-field` and
 * `wc-datetime-field`.
 *
 * The field keeps the typed text in `draft` and parses it on blur or Enter. Valid text becomes
 * `value` (always ISO, so forms submit a locale-independent value) and fires `change`; text that
 * does not parse, or falls outside `min`/`max`, keeps the draft, shows an error and makes the
 * field invalid (`badInput`, `rangeUnderflow` or `rangeOverflow`). Values picked in the popover
 * fire `input` while they change and `change` once committed.
 *
 * Subclasses supply the parsing, formatting, validation and the picker itself.
 */
export default abstract class PickerField extends BaseField {
  // ── Properties ───────────────────────────────────────────────────────────

  /** The value as an ISO string; empty when there is none. */
  @property({ type: String }) value = '';

  /** BCP 47 locale for display and typed input; defaults to the page language. */
  @property({ type: String }) locale = '';

  /** Where the picker opens, relative to the field. */
  @property({ type: String }) placement: Popover['placement'] = 'bottom-start';

  // ── State ────────────────────────────────────────────────────────────────

  /** Text in the input; differs from the formatted `value` while the person is typing. */
  @state() protected draft = '';

  @state() protected pickerOpen = false;

  /** Message for typed text that could not be used; empty when the text is fine. */
  @state() protected invalidText = '';

  /** The validity flag `invalidText` stands for. */
  @state() protected invalidFlag: ValueProblem['flag'] = 'badInput';

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('wc-popover') protected popoverElement?: Popover;

  @query('.input') protected inputElement?: HTMLInputElement;

  @query('.picker') protected pickerElement?: FocusablePicker;

  // ── Private fields ───────────────────────────────────────────────────────

  /** The last value announced with `change`; closing the popover commits anything newer. */
  private lastCommitted = '';

  /** Whether to move focus back to the input when the popover closes. */
  private restoreFocus = false;

  /** Peacock's strings and the locale values are shown in. */
  protected readonly i18n = new I18nController(this);

  // ── Abstract members ─────────────────────────────────────────────────────

  /** Material icon name for the button that opens the picker. */
  protected abstract readonly pickerIcon: string;

  /** Accessible name for the button that opens the picker. */
  protected abstract get pickerLabel(): string;

  /** Whether a value committed in the picker closes the popover. */
  protected abstract closeOnCommit(value: string): boolean;

  /** Parses typed text to an ISO value, or returns null when it cannot be read. */
  protected abstract parseText(text: string): string | null;

  /** Formats an ISO value as display text. */
  protected abstract formatValue(value: string): string;

  /** The format hint used for the placeholder and the error message. */
  protected abstract formatHint(): string;

  /** Returns the problem when a parsed value is not allowed (outside min/max), else null. */
  protected abstract validateValue(value: string): ValueProblem | null;

  /** Renders the picker inside the popover. It must carry the `picker` class. */
  protected abstract renderPicker(): TemplateResult;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.lastCommitted = this.value;
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
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
    return this.i18n.locale;
  }

  protected override computeValidity(): ControlValidity {
    if (this.invalidText && !this.disabled) {
      return {
        flags: { [this.invalidFlag]: true },
        message: this.invalidText,
      };
    }
    return super.computeValidity();
  }

  protected override validityAnchor() {
    return this.inputElement;
  }

  /** Sets the value and fires `change`. */
  protected commit(value: string) {
    this.value = value;
    this.lastCommitted = value;
    this.emitValue('change');
  }

  /** Sets the value and fires `input`, for a change that is not committed yet. */
  protected preview(value: string) {
    this.value = value;
    this.emitValue('input');
  }

  protected override clearValue() {
    this.preview('');
    this.commit('');
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

  private handleTextInput(event: InputEvent) {
    // The native event escapes the shadow root; the field fires its own `input` from the picker.
    event.stopPropagation();
    this.draft = (event.target as HTMLInputElement).value;
    this.invalidText = '';
  }

  private handleTextChange(event?: Event) {
    event?.stopPropagation();
    const text = this.draft.trim();
    if (!text) {
      this.invalidText = '';
      if (this.value) this.commit('');
      return;
    }
    const parsed = this.parseText(text);
    if (parsed === null) {
      this.invalidFlag = 'badInput';
      this.invalidText = this.i18n.t('enterFormat')(this.formatHint());
      return;
    }
    const problem = this.validateValue(parsed);
    if (problem) {
      this.invalidFlag = problem.flag;
      this.invalidText = problem.message;
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

  /**
   * The popover's `open`/`close` (and those of anything inside it) are internal: they bubble and
   * are composed, so stop them here, or consumers listening on the field would hear them.
   */
  private handleOverlayEvent = (event: Event) => {
    event.stopPropagation();
    if (event.target !== this.popoverElement) return;
    if (event.type === 'open') this.handlePopoverOpen();
    else this.handlePopoverClose();
  };

  private static stopEvent(event: Event) {
    event.stopPropagation();
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

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderPickerButton() {
    return html`<wc-icon-button
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
    </wc-icon-button>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`
      <wc-popover
        class="popover"
        trigger="manual"
        placement=${this.placement}
        offset="4"
        @keydown=${this.handleKeyDown}
        @open=${this.handleOverlayEvent}
        @close=${this.handleOverlayEvent}
        @wc-popover--open=${PickerField.stopEvent}
        @wc-popover--close=${PickerField.stopEvent}
      >
        ${this.renderField(
          html`<input
            class="input"
            spellcheck="false"
            autocomplete="off"
            placeholder=${this.placeholder || this.formatHint()}
            .value=${this.draft}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            ?required=${this.required}
            @input=${this.handleTextInput}
            @change=${this.handleTextChange}
            @keydown=${this.handleTextKeyDown}
            @focus=${this.handleFieldFocus}
            @blur=${this.handleFieldFocus}
            ${spread(this.fieldAria(this.invalidText))}
          />`,
          {
            populated: !!this.draft,
            focused: this.focused || this.pickerOpen,
            controlError: this.invalidText,
            end: this.renderPickerButton(),
          },
        )}
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
