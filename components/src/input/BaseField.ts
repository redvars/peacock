import { html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

import { peacockString } from '@/__internal/i18n/strings.js';
import type { Size } from '@/__internal/utils/size.js';
import BaseInput from './BaseInput.js';

/** What a field component passes to `renderField()`. */
export interface FieldRenderOptions {
  /** Whether the field has a value; outlined fields float their label when it does. */
  populated: boolean;
  /** Overrides the field's own focus state, for fields whose popup keeps them active. */
  focused?: boolean;
  /** An error the control found itself, such as text that does not parse. */
  controlError?: string;
  /** Extra content before the control (after the `start` slot). */
  start?: unknown;
  /** Extra content after the control (after the `end` slot), such as a picker button. */
  end?: unknown;
}

let fieldCount = 0;

/**
 * Base class for Peacock's text-like fields (input, textarea, number, URL, select, date/time,
 * color). It adds the props every field shares (label, helper/error/warning text, variant, size,
 * clearable, `start`/`end` slots) and renders the `wc-field` frame.
 *
 * It also makes the inner control accessible across the shadow boundary: `fieldAria()` gives it
 * an accessible name from `label`, `aria-invalid` while an error shows, and `aria-describedby`
 * pointing at a hidden copy of the helper or error text in the same shadow root.
 *
 * Subclasses call `renderField(control, options)` in `render()`, spread `fieldAria()` onto the
 * native control, call `emitValue('input' | 'change')` instead of re-dispatching native events
 * (the field event contract: `CustomEvent<{ value }>`, bubbling and composed), and override
 * `clearValue()` if clearing means more than `value = ''`.
 */
export default abstract class BaseField extends BaseInput {
  // ── Properties ───────────────────────────────────────────────────────────

  /** Label shown above the field; also the control's accessible name. */
  @property({ type: String }) label = '';

  @property({ type: String }) placeholder = '';

  /** Help text shown below the field. */
  @property({ type: String, attribute: 'helper-text' }) helperText = '';

  /** Shows the field in its error state with `error-text`. */
  @property({ type: Boolean }) error = false;

  @property({ type: String, attribute: 'error-text' }) errorText = '';

  /** Shows the field in its warning state with `warning-text`. */
  @property({ type: Boolean }) warning = false;

  @property({ type: String, attribute: 'warning-text' }) warningText = '';

  /** Visual variant of the field. */
  @property({ type: String }) variant: 'default' | 'filled' | 'outlined' =
    'default';

  /** Height of the field: `sm` (2.5rem, default), `md` (3.5rem) or `lg` (4rem). */
  @property({ type: String, reflect: true }) size: Size = 'sm';

  /** Shows a button that clears the value while the field has one. */
  @property({ type: Boolean }) clearable = false;

  /** ARIA attributes moved from the host onto the inner control. */
  @property({ type: Object }) configAria: Record<string, string> = {};

  // ── State ────────────────────────────────────────────────────────────────

  @state() protected focused = false;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Id of the hidden description the inner control points at. */
  protected readonly fieldDescriptionId = `wc-field-description-${(fieldCount += 1)}`;

  /** A `tabindex` set on the host, moved to the inner control. */
  protected controlTabIndex?: string;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    // `aria-*` and `tabindex` set on the host belong to the inner control; move them there.
    for (const attr of Array.from(this.attributes)) {
      if (attr.name.startsWith('aria-')) {
        this.configAria = { ...this.configAria, [attr.name]: attr.value };
        this.removeAttribute(attr.name);
      }
    }
    if (this.hasAttribute('tabindex')) {
      this.controlTabIndex = this.getAttribute('tabindex') ?? undefined;
      this.removeAttribute('tabindex');
    }
  }

  // ── Protected ────────────────────────────────────────────────────────────

  /**
   * The error text the field shows: the consumer's `error-text` while `error` is set, else an
   * error the control found itself, else the validation message once it should show.
   */
  protected fieldErrorText(controlError = ''): string {
    if (this.error) return this.errorText;
    return controlError || this.validationText;
  }

  /**
   * Attributes for the native control: accessible name, invalid state, description and the
   * host's `tabindex`, plus `configAria`. Spread them onto it with `spread(this.fieldAria())`.
   */
  protected fieldAria(controlError = ''): Record<string, string | undefined> {
    const invalid = this.error || !!this.fieldErrorText(controlError);
    return {
      tabindex: this.controlTabIndex,
      'aria-label': this.label || undefined,
      'aria-invalid': invalid ? 'true' : undefined,
      'aria-describedby': this.fieldDescription(controlError)
        ? this.fieldDescriptionId
        : undefined,
      ...this.configAria,
    };
  }

  /** Renders the `wc-field` frame around `control`, plus the hidden description. */
  protected renderField(
    control: unknown,
    options: FieldRenderOptions,
  ): TemplateResult {
    const errorText = this.fieldErrorText(options.controlError);
    const description = this.fieldDescription(options.controlError);
    return html`
      <wc-field
        label=${this.label}
        size=${this.size}
        variant=${this.variant}
        helper-text=${this.helperText}
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this.skeleton}
        ?error=${this.error || !!errorText}
        error-text=${errorText}
        ?warning=${this.warning}
        warning-text=${this.warningText}
        ?populated=${options.populated}
        ?focused=${options.focused ?? this.focused}
        .host=${this}
        class="field"
      >
        <slot name="start" slot="field-start"></slot>
        ${options.start ?? nothing} ${control}
        <slot name="end" slot="field-end"></slot>
        ${this.renderClearButton(options.populated)} ${options.end ?? nothing}
      </wc-field>
      ${description
        ? html`<span id=${this.fieldDescriptionId} hidden>${description}</span>`
        : nothing}
    `;
  }

  /** Dispatches `input` or `change` with the current value: the field event contract. */
  protected emitValue(type: 'input' | 'change') {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Clears the value for the clear button. Fields with another empty value override it. */
  protected clearValue() {
    this.value = '';
    this.emitValue('input');
    this.emitValue('change');
  }

  /** Tracks focus of the inner control; bind it to the control's `focus` and `blur`. */
  protected handleFieldFocus = (event: FocusEvent) => {
    this.focused = event.type === 'focus';
  };

  // ── Private ──────────────────────────────────────────────────────────────

  /** The text the description carries: the error, else the warning, else the help. */
  private fieldDescription(controlError = ''): string {
    const errorText = this.fieldErrorText(controlError);
    if (errorText) return errorText;
    if (this.warning && this.warningText) return this.warningText;
    return this.helperText;
  }

  private renderClearButton(populated: boolean) {
    if (!this.clearable || !populated || this.disabled || this.readonly) {
      return nothing;
    }
    return html`<wc-icon-button
      slot="field-end"
      class="clear-button"
      shape="round"
      variant="text"
      size="sm"
      aria-label=${peacockString('clear')}
      @click=${() => {
        this.clearValue();
        this.focus();
      }}
    >
      <wc-icon name="close"></wc-icon>
    </wc-icon-button>`;
  }
}
