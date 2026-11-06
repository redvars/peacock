import { html, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';

import { spread } from '@/__internal/directive/spread.js';
import { deprecate } from '@/__internal/utils/deprecate.js';

import IndividualComponent from '@/IndividualComponent.js';
import BaseField from '../input/BaseField.js';
import { type ControlValidity, nativeValidity } from '../input/BaseInput.js';
import styles from './textarea.scss';

/**
 * @label Textarea
 * @tag wc-textarea
 * @rawTag textarea
 * @summary The Textarea component is used to capture user input.
 * @overview
 * <p>Textarea is form-associated: inside a <code>&lt;form&gt;</code> its <code>value</code> is
 * submitted under its <code>name</code>, and <code>form.reset()</code> restores the starting value.</p>
 * <p>It validates like a native textarea: <code>required</code> blocks form submission, and the
 * message shows under the field once the value is committed or the form is submitted.</p>
 * @tags input
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the user types.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the value is committed.
 *
 * @example
 * ```html
 * <wc-textarea label="Description" placeholder="Enter text"></wc-textarea>
 * ```
 */
@IndividualComponent
export class Textarea extends BaseField {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  @property({ type: String })
  value = '';

  /** @deprecated Has no effect; it will be removed in 4.0. */
  @property({ type: Boolean, reflect: true })
  inline = false;

  @property({ type: String }) autocomplete: 'on' | 'off' = 'off';

  @property({ type: String }) rows = '3';

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.input-element')
  private inputElement?: HTMLTextAreaElement;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('inline') && this.inline) {
      deprecate('wc-textarea', '`inline`');
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
    // `@query` gives null before the first render.
    return this.inputElement ?? undefined;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private handleInput(event: Event) {
    // Replace the native event, which escapes the shadow root, with the field's own.
    event.stopPropagation();
    this.value = (event.target as HTMLTextAreaElement).value;
    this.emitValue('input');
  }

  private handleChange(event: Event) {
    event.stopPropagation();
    this.emitValue('change');
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return this.renderField(
      html`<textarea
        class="input input-element"
        rows=${this.rows}
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
      ></textarea>`,
      { populated: !!this.value },
    );
  }
}
