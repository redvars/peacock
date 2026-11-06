import { html, nothing, type PropertyValues } from 'lit';
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
 * <p>It validates like a native textarea: <code>required</code>, <code>minlength</code> and
 * <code>maxlength</code> block form submission, and the message shows under the field once the
 * value is committed or the form is submitted. With <code>maxlength</code> a character counter
 * shows under the field.</p>
 * <p><code>rows</code> sets the starting height. With <code>auto-grow</code> the height follows the
 * content, up to <code>max-rows</code> when it is set; <code>resize</code> controls whether the
 * person can drag the corner to resize it.</p>
 * @tags input
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the user types.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the value is committed.
 *
 * @example
 * ```html
 * <wc-textarea label="Description" placeholder="Enter text"></wc-textarea>
 * ```
 * @example
 * ```html
 * <wc-textarea label="Bio" maxlength="280" auto-grow max-rows="8"></wc-textarea>
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

  /** Visible lines of text; the starting height with `auto-grow`. */
  @property({ type: Number }) rows = 3;

  /** Fewest characters allowed. */
  @property({ type: Number, attribute: 'minlength' })
  minLength?: number;

  /** Most characters allowed; the textarea stops taking more and shows a character counter. */
  @property({ type: Number, attribute: 'maxlength' })
  maxLength?: number;

  /** Grows the height with the content instead of scrolling. */
  @property({ type: Boolean, attribute: 'auto-grow', reflect: true })
  autoGrow = false;

  /** With `auto-grow`, the most lines it grows to before it scrolls; unset for no limit. */
  @property({ type: Number, attribute: 'max-rows' })
  maxRows?: number;

  /** Which way the person can resize it by dragging the corner. */
  @property({ type: String, reflect: true })
  resize: 'none' | 'vertical' | 'both' = 'vertical';

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

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (
      changed.has('value') ||
      changed.has('autoGrow') ||
      changed.has('maxRows') ||
      changed.has('rows')
    ) {
      this.fitToContent();
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

  /** With `auto-grow`, sets the height to the content's, capped at `max-rows` lines. */
  private fitToContent() {
    const textarea = this.inputElement;
    if (!textarea) return;
    if (!this.autoGrow) {
      textarea.style.removeProperty('block-size');
      textarea.style.removeProperty('overflow-y');
      return;
    }
    textarea.style.blockSize = 'auto';
    const content = textarea.scrollHeight;
    let height = content;
    if (this.maxRows && this.maxRows > 0) {
      const style = getComputedStyle(textarea);
      const lineHeight =
        parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
      const padding =
        parseFloat(style.paddingBlockStart) + parseFloat(style.paddingBlockEnd);
      height = Math.min(content, lineHeight * this.maxRows + padding);
    }
    textarea.style.blockSize = `${height}px`;
    textarea.style.overflowY = content > height ? 'auto' : 'hidden';
  }

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
        minlength=${this.minLength ?? nothing}
        maxlength=${this.maxLength ?? nothing}
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
      {
        populated: !!this.value,
        textCount: this.characterCount(this.maxLength),
      },
    );
  }
}
