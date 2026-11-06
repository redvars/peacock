import { html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { spread } from '@/__internal/directive/spread.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';

import BaseField from './BaseField.js';
import { type ControlValidity, nativeValidity } from './BaseInput.js';
import styles from './input.scss';

/**
 * @label Input
 * @tag wc-input
 * @rawTag input
 *
 * @summary The Input component is used to capture user input.
 * @overview
 * <p>Input is form-associated: inside a <code>&lt;form&gt;</code> its <code>value</code> is submitted
 * under its <code>name</code>, and <code>form.reset()</code> restores the starting value.</p>
 * <p>It validates like a native input: <code>required</code> and an invalid <code>type="email"</code>
 * block form submission, and the message shows under the field once the value is committed or the
 * form is submitted. <code>checkValidity()</code>, <code>reportValidity()</code> and
 * <code>setCustomValidity()</code> work as on <code>&lt;input&gt;</code>.</p>
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

  /** @deprecated Has no effect; it will be removed in 4.0. */
  @property({ type: Boolean, reflect: true })
  inline = false;

  @property({ type: String })
  type: 'text' | 'password' | 'email' | 'tel' = 'text';

  @property({ type: String })
  autocomplete: 'on' | 'off' = 'off';

  // ── State ────────────────────────────────────────────────────────────────

  @state()
  private passwordVisible = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.input-element')
  private inputElement?: HTMLInputElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the password toggle. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('inline') && this.inline) {
      deprecate('wc-input', '`inline`');
    }
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

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderPasswordToggle() {
    if (this.type !== 'password') return nothing;
    return html`
      <wc-icon-button
        class="password-toggle"
        variant="text"
        slot="field-end"
        tooltip=${this.passwordVisible
          ? this.i18n.t('hidePassword')
          : this.i18n.t('showPassword')}
        @click=${() => {
          this.passwordVisible = !this.passwordVisible;
        }}
      >
        <wc-icon
          name=${this.passwordVisible ? 'visibility_off' : 'visibility'}
        ></wc-icon>
      </wc-icon-button>
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const displayType =
      this.type === 'password' && this.passwordVisible ? 'text' : this.type;

    return this.renderField(
      html`<input
        class="input input-element"
        type=${displayType}
        placeholder=${this.placeholder}
        autocomplete=${this.autocomplete}
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
      { populated: !!this.value, end: this.renderPasswordToggle() },
    );
  }
}
