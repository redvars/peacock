import { html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import '@ui-sdk/web/input';

import { spread } from '@/__internal/directive/spread.js';
import { setupImplicitSubmission } from '@/__internal/implicit-submission.js';
import IndividualComponent from '@/IndividualComponent.js';

import BaseField from './BaseField.js';
import { type ControlValidity, nativeValidity } from './BaseInput.js';
import styles from './input.scss';

/**
 * @label Input
 * @tag wc-input
 * @rawTag input
 *
 * @summary A single-line text field for plain text, an email address or a phone number.
 * @overview
 * <p>Input is form-associated: inside a <code>&lt;form&gt;</code> its <code>value</code> is submitted
 * under its <code>name</code>, and <code>form.reset()</code> restores the starting value. Enter
 * submits the form as in a native text input: it clicks the form's first submit button, or,
 * without one, submits a form that has no other text field. A disabled default button blocks it,
 * and <code>preventDefault()</code> on the <code>keydown</code> stops it.</p>
 * <p>It validates like a native input: <code>required</code> and an invalid <code>type="email"</code>
 * block form submission, and the message shows under the field once the value is committed or the
 * form is submitted. <code>checkValidity()</code>, <code>reportValidity()</code> and
 * <code>setCustomValidity()</code> work as on <code>&lt;input&gt;</code>, and so do
 * <code>minlength</code>, <code>maxlength</code> and <code>pattern</code>. With
 * <code>maxlength</code> a character counter shows under the field.</p>
 * <p>For a password, use <code>wc-password-field</code>.</p>
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the user types.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the value is committed.
 *
 * @example
 * ```html
 * <wc-input label="Name" required placeholder="Enter your name"></wc-input>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class Input extends BaseField {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  @property({ type: String })
  value = '';

  /** Kind of text. For a password, use `wc-password-field`. */
  @property({ type: String })
  type: 'text' | 'email' | 'tel' = 'text';

  /**
   * Autofill hint for the browser, any `autocomplete` token such as `email`, `username`, `name`,
   * `tel`, `one-time-code` or `off`. Unset by default, so the browser decides.
   */
  @property({ type: String })
  autocomplete = '';

  /** Fewest characters allowed. */
  @property({ type: Number, attribute: 'minlength' })
  minLength?: number;

  /** Most characters allowed; the input stops taking more and shows a character counter. */
  @property({ type: Number, attribute: 'maxlength' })
  maxLength?: number;

  /** Regular expression the whole value must match, as on `<input pattern>`. */
  @property({ type: String })
  pattern = '';

  /**
   * The `inputmode` attribute: which virtual keyboard to show (`numeric`, `decimal`, `email`,
   * `tel`, `url`, `search`, `none`). Passed to the native input only when set.
   */
  @property({ type: String, attribute: 'inputmode' })
  protected inputModeAttribute: string | null = null;

  /**
   * The `spellcheck` attribute (`true` or `false`). Passed to the native input only when set, so
   * the browser default applies otherwise.
   */
  @property({ type: String, attribute: 'spellcheck' })
  protected spellcheckAttribute: string | null = null;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.input-element')
  private inputElement?: HTMLInputElement;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  constructor() {
    super();
    // Enter submits the surrounding form, as in a native text input.
    setupImplicitSubmission(this, () => this.inputElement);
  }

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
    return this.inputElement;
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

  /**
   * `ui-input` reports every change. Typing already arrives through the native `input` and
   * `change` events; a change from its `api`, such as an agent's `setValue`, fires only `input`,
   * so commit it here as a `change` too.
   */
  private handleUiValueChange(event: CustomEvent<{ reason?: string }>) {
    if (event.detail?.reason !== 'imperative') return;
    this.updateComplete.then(() => this.emitValue('change'));
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return this.renderField(
      html`<ui-input class="ui-input" @valuechange=${this.handleUiValueChange}
        ><input
          class="input input-element"
          type=${this.type}
          placeholder=${this.placeholder}
          autocomplete=${this.autocomplete || nothing}
          minlength=${this.minLength ?? nothing}
          maxlength=${this.maxLength ?? nothing}
          pattern=${this.pattern || nothing}
          inputmode=${this.inputModeAttribute ?? nothing}
          spellcheck=${this.spellcheckAttribute ?? nothing}
          .value=${this.value}
          ?readonly=${this.readonly}
          ?required=${this.required}
          ?disabled=${this.disabled}
          @input=${this.handleInput}
          @change=${this.handleChange}
          @focus=${this.handleFieldFocus}
          @blur=${this.handleFieldFocus}
          ${spread(this.fieldAria())}
      /></ui-input>`,
      {
        populated: !!this.value,
        textCount: this.characterCount(this.maxLength),
      },
    );
  }
}
