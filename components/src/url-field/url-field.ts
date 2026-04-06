import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { redispatchEvent } from '@/__utils/dispatch-event-utils.js';

import BaseInput from '../input/BaseInput.js';
import styles from './url-field.scss';

/**
 * @label URL Field
 * @tag wc-url-field
 * @rawTag url-field
 *
 * @summary A field for entering and displaying URLs with validation.
 * @overview
 * <p>URL Field wraps an input with URL validation, showing a clickable link preview when not in edit mode.</p>
 *
 * @example
 * ```html
 * <wc-url-field label="Website" value="https://example.com"></wc-url-field>
 * ```
 * @tags form
 */
export class UrlField extends BaseInput {
  static styles = [styles];

  @property({ type: String })
  value: string = '';

  @property({ type: String })
  name: string = '';

  @property({ type: String })
  placeholder: string = '';

  @property({ type: String })
  label: string = '';

  @property({ type: Boolean, reflect: true })
  editing: boolean = false;

  @property({ type: Number })
  debounce: number = 300;

  @property({ type: String, reflect: true })
  size: 'sm' | 'md' | 'lg' = 'md';

  @property({ type: String })
  variant: 'filled' | 'outlined' | 'default' = 'default';

  @property({ type: String, attribute: 'helper-text' })
  helperText: string = '';

  @property({ type: Boolean })
  error: boolean = false;

  @property({ type: String, attribute: 'error-text' })
  errorText: string = '';

  @property({ type: Boolean })
  warning: boolean = false;

  @property({ type: String, attribute: 'warning-text' })
  warningText: string = '';

  @state()
  private focused: boolean = false;

  @state()
  private isValid: boolean = true;

  @query('.url-input')
  private inputElement?: HTMLInputElement;

  private debounceTimer?: ReturnType<typeof setTimeout>;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  override focus() {
    if (!this.editing && !this.disabled && !this.readonly) {
      this.startEditing();
      return;
    }
    this.inputElement?.focus();
  }

  override blur() {
    this.inputElement?.blur();
  }

  private startEditing() {
    if (this.disabled || this.readonly) return;
    this.editing = true;
    setTimeout(() => this.inputElement?.focus(), 80);
  }

  private closeEditing() {
    this.isValid = this.validateUrl(this.value);
    this.dispatchEvent(
      new CustomEvent('input-invalid', {
        detail: !this.isValid,
        bubbles: true,
        composed: true,
      }),
    );

    if (this.isValid) {
      this.editing = false;
    }
  }

  private validateUrl(url: string): boolean {
    if (!url) return true;

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private handleInput(event: InputEvent) {
    this.value = (event.target as HTMLInputElement).value;
    this.isValid = true;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent('value-change', {
          detail: this.value,
          bubbles: true,
          composed: true,
        }),
      );
    }, this.debounce);
  }

  private handleFocusChange() {
    this.focused = this.inputElement?.matches(':focus') ?? false;
  }

  private handleBlur() {
    this.focused = false;
    this.closeEditing();
  }

  private handleChange(event: Event) {
    redispatchEvent(this, event);
  }

  private renderDisplayValue() {
    if (!this.value) {
      return html`<span class="url-placeholder">${this.placeholder}</span>`;
    }

    return html`
      <a
        class="url-link"
        href=${this.value}
        target="_blank"
        rel="noopener noreferrer"
      >
        ${this.value}
      </a>
    `;
  }

  render() {
    const hasValue = !!this.value;
    const showInvalidState = this.error || !this.isValid;
    const resolvedErrorText = !this.isValid
      ? 'Please enter a valid URL'
      : this.errorText;

    return html`
      <wc-field
        label=${this.label}
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this.skeleton}
        helper-text=${this.helperText}
        ?error=${showInvalidState}
        error-text=${resolvedErrorText}
        ?warning=${this.warning}
        warning-text=${this.warningText}
        variant=${this.variant}
        ?populated=${hasValue || this.editing}
        ?focused=${this.focused}
        .host=${this}
        class="url-field-wrapper"
      >
        ${this.editing
          ? html`
              <input
                class="url-input"
                name=${this.name}
                type="url"
                placeholder=${this.placeholder}
                .value=${this.value}
                ?readonly=${this.readonly}
                ?required=${this.required}
                ?disabled=${this.disabled}
                @input=${this.handleInput}
                @change=${this.handleChange}
                @focus=${this.handleFocusChange}
                @blur=${this.handleBlur}
              />
            `
          : html`<div class="url-display">${this.renderDisplayValue()}</div>`}

        ${!this.editing && !this.disabled && !this.readonly
          ? html`
              <wc-icon-button
                class="edit-button"
                slot="field-end"
                variant="text"
                @click=${(event: MouseEvent) => {
                  event.stopPropagation();
                  this.startEditing();
                }}
              >
                <wc-icon name="edit"></wc-icon>
              </wc-icon-button>
            `
          : nothing}
      </wc-field>
    `;
  }
}