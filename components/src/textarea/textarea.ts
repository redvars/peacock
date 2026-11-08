import { html, nothing, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';

import { spread } from '@/__internal/directive/spread.js';
import { GhostTextController } from '@/__internal/ai/ghost-text-controller.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';

import IndividualComponent from '@/IndividualComponent.js';
import BaseField from '../input/BaseField.js';
import { type ControlValidity, nativeValidity } from '../input/BaseInput.js';
import styles from './textarea.scss';

/**
 * @label Textarea
 * @tag wc-textarea
 * @rawTag textarea
 * @summary A multi-line text field that can grow with its content.
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
 * <p>With <code>ai-completion</code> and a provider that offers completions (ADR-030002), a pause
 * in typing at the end of a line shows ghost text: how the assistant would go on, in grey after the
 * caret. Tab takes it, Ctrl+→ (⌘→) takes a word, Escape or typing dismisses it. Nothing is inserted
 * until the person takes it, and <code>sensitive</code> fields never ask.</p>
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

  /** Whether the browser may autofill the field: `"on"` or `"off"` (default). */
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

  /**
   * Suggests how to go on after a pause in typing, as ghost text after the caret: Tab takes it.
   * Needs a provider with `complete`.
   */
  @property({ type: Boolean, reflect: true, attribute: 'ai-completion' })
  aiCompletion = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.input-element')
  private inputElement?: HTMLTextAreaElement;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  private readonly ghost = new GhostTextController(this, {
    control: () => this.inputElement,
    enabled: () => this.aiCompletion,
    insert: text => this.insertAtCaret(text),
    i18n: this.i18n,
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

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

  // ── Protected methods ────────────────────────────────────────────────────

  /** Just the sparkle: a label beside the text would narrow every line. */
  protected override get suggestionBadgeIconOnly(): boolean {
    return true;
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
    this.ghost.onInput();
  }

  private handleChange(event: Event) {
    event.stopPropagation();
    this.emitValue('change');
  }

  private handleKeyDown(event: KeyboardEvent) {
    this.ghost.onKeyDown(event);
  }

  private handleBlur(event: FocusEvent) {
    this.handleFieldFocus(event);
    this.ghost.clear();
  }

  /** Inserts accepted ghost text at the caret, as if typed: the value changes and `input` fires. */
  private insertAtCaret(text: string) {
    const textarea = this.inputElement;
    if (!textarea) return;
    const start = textarea.selectionStart ?? textarea.value.length;
    textarea.setRangeText(text, start, textarea.selectionEnd ?? start, 'end');
    this.value = textarea.value;
    this.emitValue('input');
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const aria = this.fieldAria();
    const ghostHint = this.ghost.describedBy();
    if (ghostHint) {
      aria['aria-describedby'] = [aria['aria-describedby'], ghostHint]
        .filter(Boolean)
        .join(' ');
    }
    const control = html`<textarea
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
      @keydown=${this.handleKeyDown}
      @pointerdown=${() => this.ghost.clear()}
      @scroll=${() => this.ghost.clear()}
      @focus=${this.handleFieldFocus}
      @blur=${this.handleBlur}
      ${spread(aria)}
    ></textarea>`;
    return this.renderField(
      // With ai-completion the ghost text's mirror sits over the textarea.
      this.aiCompletion
        ? html`<div class="ghost-wrap">${control}${this.ghost.render()}</div>`
        : control,
      {
        populated: !!this.value,
        textCount: this.characterCount(this.maxLength),
      },
    );
  }
}
