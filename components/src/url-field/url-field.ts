import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { spread } from '@/__internal/directive/spread.js';

import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import BaseField from '../input/BaseField.js';
import { type ControlValidity, nativeValidity } from '../input/BaseInput.js';
import styles from './url-field.scss';

/**
 * @label URL Field
 * @tag wc-url-field
 * @rawTag url-field
 *
 * @summary A field for entering and displaying URLs with validation.
 * @overview
 * <p>URL Field wraps an input with URL validation, showing a clickable link preview when not in edit mode.</p>
 * <p>It is form-associated: the URL is submitted under its <code>name</code>, and
 * <code>required</code> or an invalid URL blocks form submission.</p>
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the user types.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the value is committed.
 * @fires {CustomEvent<string>} value-change - Deprecated, use `change`. Dispatched `debounce` ms after the user stops typing.
 * @fires {CustomEvent<boolean>} input-invalid - Deprecated, use `validity` or `checkValidity()`. Dispatched when editing ends; `detail` is true when the URL is invalid.
 *
 * @example
 * ```html
 * <wc-url-field label="Website" value="https://example.com"></wc-url-field>
 * ```
 * @tags form
 */
@IndividualComponent
export class UrlField extends BaseField {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  @property({ type: String })
  value: string = '';

  @property({ type: Boolean, reflect: true })
  editing: boolean = false;

  /** Delay, in ms, of the deprecated `value-change` event. */
  @property({ type: Number })
  debounce: number = 300;

  // ── State ────────────────────────────────────────────────────────────────

  @state()
  private isValid: boolean = true;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.url-input')
  private inputElement?: HTMLInputElement;

  // ── Private fields ───────────────────────────────────────────────────────

  private debounceTimer?: ReturnType<typeof setTimeout>;

  /** Peacock's strings for the invalid URL message. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

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

  // ── Protected methods ────────────────────────────────────────────────────

  protected override computeValidity(): ControlValidity {
    return this.editing && this.inputElement
      ? nativeValidity(this.inputElement)
      : super.computeValidity();
  }

  protected override validityAnchor() {
    // `@query` gives null while the input is not rendered (display mode).
    return this.inputElement ?? undefined;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private startEditing() {
    if (this.disabled || this.readonly) return;
    this.editing = true;
    setTimeout(() => this.inputElement?.focus(), 80);
  }

  private closeEditing() {
    this.isValid = this.validateUrl(this.value);
    // Deprecated event (documented); no warning, since it fires whether or not anyone listens.
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

  private handleInput(event: Event) {
    // Replace the native event, which escapes the shadow root, with the field's own.
    event.stopPropagation();
    this.value = (event.target as HTMLInputElement).value;
    this.isValid = true;
    this.emitValue('input');

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      // Deprecated event (documented); no warning, since it fires whether or not anyone listens.
      this.dispatchEvent(
        new CustomEvent('value-change', {
          detail: this.value,
          bubbles: true,
          composed: true,
        }),
      );
    }, this.debounce);
  }

  private handleChange(event: Event) {
    event.stopPropagation();
    this.emitValue('change');
  }

  private handleBlur(event: FocusEvent) {
    this.handleFieldFocus(event);
    this.closeEditing();
  }

  // ── Render helpers ───────────────────────────────────────────────────────

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

  private renderEditButton() {
    if (this.editing || this.disabled || this.readonly) return nothing;
    return html`
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
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const controlError = this.isValid ? '' : this.i18n.t('invalidUrl');

    const control = this.editing
      ? html`<input
          class="url-input"
          type="url"
          placeholder=${this.placeholder}
          .value=${this.value}
          ?readonly=${this.readonly}
          ?required=${this.required}
          ?disabled=${this.disabled}
          @input=${this.handleInput}
          @change=${this.handleChange}
          @focus=${this.handleFieldFocus}
          @blur=${this.handleBlur}
          ${spread(this.fieldAria(controlError))}
        />`
      : html`<div class="url-display">${this.renderDisplayValue()}</div>`;

    return this.renderField(control, {
      populated: !!this.value || this.editing,
      controlError,
      end: this.renderEditButton(),
    });
  }
}
