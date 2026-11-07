import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { ALWAYS_SENSITIVE } from '@/__internal/ai/ai-controller.js';
import { spread } from '@/__internal/directive/spread.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import IndividualComponent from '@/IndividualComponent.js';

import BaseField from '../input/BaseField.js';
import { type ControlValidity, nativeValidity } from '../input/BaseInput.js';
import styles from './password-field.scss';

/**
 * @label Password Field
 * @tag wc-password-field
 * @rawTag password-field
 *
 * @summary A text field for a password, with a button that shows or hides what was typed.
 * @overview
 * <p>Password field hides what is typed until the person presses the show button; pressing it
 * again hides the text. Set <code>autocomplete="new-password"</code> on sign-up and
 * change-password forms so password managers offer to generate one; the default,
 * <code>current-password</code>, suits sign-in forms.</p>
 * <p>It validates like a native password input: <code>required</code>, <code>minlength</code>,
 * <code>maxlength</code> and <code>pattern</code> block form submission, and the message shows under
 * the field once the value is committed or the form is submitted. Inside a <code>&lt;form&gt;</code>
 * its <code>value</code> is submitted under its <code>name</code>.</p>
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the user types.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the value is committed.
 *
 * @example
 * ```html
 * <wc-password-field label="Password" required></wc-password-field>
 * ```
 * @example
 * ```html
 * <wc-password-field
 *   label="New password"
 *   autocomplete="new-password"
 *   minlength="12"
 *   helper-text="At least 12 characters"
 * ></wc-password-field>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class PasswordField extends BaseField {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  /** A password never reaches a model (ADR-030002). */
  static readonly [ALWAYS_SENSITIVE] = true;

  // ── Properties ───────────────────────────────────────────────────────────

  @property({ type: String })
  value = '';

  /** Tells password managers whether this is an existing password or a new one. */
  @property({ type: String })
  autocomplete: 'current-password' | 'new-password' = 'current-password';

  /** Fewest characters allowed. */
  @property({ type: Number, attribute: 'minlength' })
  minLength?: number;

  /** Most characters allowed; the input stops taking more. */
  @property({ type: Number, attribute: 'maxlength' })
  maxLength?: number;

  /** Regular expression the whole value must match, as on `<input pattern>`. */
  @property({ type: String })
  pattern = '';

  // ── State ────────────────────────────────────────────────────────────────

  @state()
  private passwordVisible = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.input-element')
  private inputElement?: HTMLInputElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the show/hide toggle. */
  private readonly i18n = new I18nController(this);

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.inputElement?.focus();
  }

  override blur() {
    this.inputElement?.blur();
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected override computeValidity(): ControlValidity {
    return this.inputElement
      ? nativeValidity(this.inputElement)
      : super.computeValidity();
  }

  protected override validityAnchor() {
    // `@query` gives null before the first render.
    return this.inputElement ?? undefined;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private handleInput(event: Event) {
    // Replace the native event, which escapes the shadow root, with the field's own.
    event.stopPropagation();
    this.value = (event.target as HTMLInputElement).value;
    this.emitValue('input');
  }

  private handleChange(event: Event) {
    event.stopPropagation();
    this.emitValue('change');
  }

  private togglePasswordVisible() {
    this.passwordVisible = !this.passwordVisible;
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderToggle() {
    const label = this.passwordVisible
      ? this.i18n.t('hidePassword')
      : this.i18n.t('showPassword');
    return html`
      <wc-icon-button
        class="password-toggle"
        shape="round"
        variant="text"
        size="sm"
        slot="field-end"
        aria-label=${label}
        aria-pressed=${String(this.passwordVisible)}
        tooltip=${label}
        ?disabled=${this.disabled}
        @click=${this.togglePasswordVisible}
      >
        <wc-icon
          name=${this.passwordVisible ? 'visibility_off' : 'visibility'}
        ></wc-icon>
      </wc-icon-button>
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return this.renderField(
      html`<input
        class="input input-element"
        type=${this.passwordVisible ? 'text' : 'password'}
        placeholder=${this.placeholder}
        autocomplete=${this.autocomplete}
        spellcheck="false"
        autocapitalize="off"
        minlength=${this.minLength ?? nothing}
        maxlength=${this.maxLength ?? nothing}
        pattern=${this.pattern || nothing}
        .value=${this.value}
        ?readonly=${this.readonly}
        ?required=${this.required}
        ?disabled=${this.disabled}
        @input=${this.handleInput}
        @change=${this.handleChange}
        @focus=${this.handleFieldFocus}
        @blur=${this.handleFieldFocus}
        ${spread(this.fieldAria())}
      />`,
      { populated: !!this.value, end: this.renderToggle() },
    );
  }
}
