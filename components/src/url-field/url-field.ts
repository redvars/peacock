import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { spread } from '@/__internal/directive/spread.js';
import { deprecate } from '@/__internal/utils/deprecate.js';

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
 * <p>URL Field wraps an input with URL validation, showing a clickable link preview when not in edit mode.
 * The edit button or focusing the field starts editing; leaving the field with a valid URL ends it,
 * and Escape ends it and restores the URL editing started with. The <code>start</code> and
 * <code>end</code> slots show in both modes.</p>
 * <p>The <code>editing</code> attribute and property are deprecated: editing is internal state. The
 * attribute is still read once when the field connects, and the property still works, until 4.0.</p>
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

  /** Delay, in ms, of the deprecated `value-change` event. */
  @property({ type: Number })
  debounce: number = 300;

  // ── State ────────────────────────────────────────────────────────────────

  @state()
  private isValid: boolean = true;

  /** Whether the input shows instead of the link. Starts when the person clicks edit or focuses. */
  @state()
  private isEditing = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.url-input')
  private inputElement?: HTMLInputElement;

  // ── Private fields ───────────────────────────────────────────────────────

  private debounceTimer?: ReturnType<typeof setTimeout>;

  /** The value when editing started; Escape restores it. */
  private valueBeforeEditing = '';

  /** Peacock's strings for the invalid URL message. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    // The `editing` attribute used to be public; read it once so markup that sets it still works.
    if (this.hasAttribute('editing')) {
      deprecate('wc-url-field', 'the `editing` attribute');
      this.removeAttribute('editing');
      this.isEditing = true;
      this.valueBeforeEditing = this.value;
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /**
   * @deprecated Editing is internal state; it starts when the person clicks edit or the field
   * gets focus. Reading it still works; setting it logs a warning. Removed in 4.0.
   */
  get editing(): boolean {
    return this.isEditing;
  }

  set editing(editing: boolean) {
    deprecate('wc-url-field', '`editing`');
    if (editing && !this.isEditing) this.valueBeforeEditing = this.value;
    this.isEditing = editing;
  }

  override focus() {
    if (!this.isEditing && !this.disabled && !this.readonly) {
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
    if (!this.isEditing || !this.inputElement) return super.computeValidity();
    const validity = nativeValidity(this.inputElement);
    // Show Peacock's (translatable) message for a malformed URL instead of the browser's.
    if (validity.flags.typeMismatch) {
      return { ...validity, message: this.i18n.t('invalidUrl') };
    }
    return validity;
  }

  protected override validityAnchor() {
    // `@query` gives null while the input is not rendered (display mode).
    return this.inputElement ?? undefined;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private async startEditing() {
    if (this.disabled || this.readonly) return;
    if (!this.isEditing) this.valueBeforeEditing = this.value;
    this.isEditing = true;
    await this.updateComplete;
    this.inputElement?.focus();
  }

  /** Leaves editing, restores the value editing started with and keeps focus on the field. */
  private async cancelEditing() {
    const changed = this.value !== this.valueBeforeEditing;
    this.value = this.valueBeforeEditing;
    this.isValid = true;
    this.isEditing = false;
    if (changed) {
      this.emitValue('input');
      this.emitValue('change');
    }
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>('.edit-button')?.focus();
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
      this.isEditing = false;
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
    // Escape already left editing; the blur that follows must not report on the old text.
    if (!this.isEditing) return;
    this.closeEditing();
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    // Keep Escape from also closing a dialog the field sits in.
    event.stopPropagation();
    this.cancelEditing();
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
    if (this.isEditing || this.disabled || this.readonly) return nothing;
    return html`
      <wc-icon-button
        class="edit-button"
        slot="field-end"
        shape="round"
        variant="text"
        aria-label=${this.i18n.t('editUrl')}
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

    const control = this.isEditing
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
          @keydown=${this.handleKeyDown}
          @focus=${this.handleFieldFocus}
          @blur=${this.handleBlur}
          ${spread(this.fieldAria(controlError))}
        />`
      : html`<div class="url-display">${this.renderDisplayValue()}</div>`;

    return this.renderField(control, {
      populated: !!this.value || this.isEditing,
      controlError,
      end: this.renderEditButton(),
    });
  }
}
