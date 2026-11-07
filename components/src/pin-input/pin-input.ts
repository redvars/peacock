import { html, nothing, type PropertyValues } from 'lit';
import { property, queryAll } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';

import { ALWAYS_SENSITIVE } from '@/__internal/ai/ai-controller.js';
import { spread } from '@/__internal/directive/spread.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import IndividualComponent from '@/IndividualComponent.js';

import BaseField from '../input/BaseField.js';
import type { ControlValidity } from '../input/BaseInput.js';
import styles from './pin-input.scss';

/** Which characters a pin input takes: digits only, or letters and digits. */
export type PinInputType = 'numeric' | 'alphanumeric';

/**
 * @label Pin Input
 * @tag wc-pin-input
 * @rawTag pin-input
 *
 * @summary A row of single-character cells for a one-time code or PIN.
 * @overview
 * <p>Pin input takes a code of <code>length</code> characters (6 by default), one per cell. Its
 * <code>value</code> is the code as one string, and inside a <code>&lt;form&gt;</code> it is
 * submitted under its <code>name</code>. The cells sit in one field box, so <code>variant</code>,
 * <code>size</code>, the states and the <code>start</code>/<code>end</code> slots look as on every
 * other field.</p>
 * <p><code>type="numeric"</code> (the default) takes digits and shows the numeric keypad on phones;
 * <code>type="alphanumeric"</code> takes the letters A–Z and digits and uppercases letters, so the
 * value is what the cells show. Anything else is ignored, so a pasted or autofilled
 * <code>123-456</code> or <code>G-123456</code> fills <code>123456</code>. <code>masked</code>
 * hides the characters like a password.</p>
 * <p>The first cell has <code>autocomplete="one-time-code"</code>, so a code from a text message can
 * be filled in by the phone. Typing moves to the next cell and typing over a filled cell replaces
 * it. Backspace clears the cell, or, in an empty cell, the one before it; Delete clears the cell.
 * Left, Right, Home and End move between cells, and Tab leaves the row. The code is always filled
 * from the start: a cell after the first empty one cannot be focused. The cells always run left to
 * right, as codes are written, also in right-to-left pages.</p>
 * <p>Validation: with <code>required</code> an empty code is <code>valueMissing</code>; a code that
 * is started but not complete is <code>tooShort</code> (whether required or not), like text under
 * a native <code>minlength</code>. The message shows once the code is committed or the form is
 * submitted.</p>
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched on every change of the code.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the code is committed: when it becomes complete, and when focus leaves the cells after a change.
 * @fires {CustomEvent<{value: string}>} complete - Dispatched when the person fills the last empty cell.
 *
 * @cssprop --pin-input-cell-width - Width of each cell.
 *
 * @example
 * ```html
 * <wc-pin-input label="Verification code" name="code" required></wc-pin-input>
 * ```
 * @example
 * ```html
 * <wc-pin-input label="PIN" length="4" masked></wc-pin-input>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class PinInput extends BaseField {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  /** A PIN or one-time code never reaches a model (ADR-030002). */
  static readonly [ALWAYS_SENSITIVE] = true;

  // ── Properties ───────────────────────────────────────────────────────────

  /** The code as one string, from the first cell on. */
  @property({ type: String })
  value = '';

  /** Number of cells, the length of a complete code. */
  @property({ type: Number })
  length = 6;

  /** Which characters the cells take: `numeric` (digits) or `alphanumeric` (A–Z and digits). */
  @property({ type: String })
  type: PinInputType = 'numeric';

  /** Hides the characters like a password. */
  @property({ type: Boolean, reflect: true })
  masked = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @queryAll('.cell')
  private cells!: ArrayLike<HTMLInputElement> & Iterable<HTMLInputElement>;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the cell names and the incomplete message. */
  private readonly i18n = new I18nController(this);

  /** The cell that takes Tab focus: the focused one, else the first empty one. */
  private activeIndex = 0;

  /** The value when it was last committed; `change` fires when it differs. */
  private committedValue = '';

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.committedValue = this.sanitize(this.value);
  }

  protected override willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    if (changed.has('value') || changed.has('length') || changed.has('type')) {
      // Keep only the characters the cells take, so `value` is always what they show.
      this.value = this.sanitize(this.value);
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Focuses the first empty cell, or the last cell when the code is complete. */
  override focus(options?: Parameters<HTMLElement['focus']>[0]) {
    this.cells?.[this.firstEmptyIndex()]?.focus(options);
  }

  override blur() {
    for (const cell of Array.from(this.cells ?? [])) cell.blur();
  }

  /** Empties every cell. Like setting `value`, it fires no events and leaves focus alone. */
  clear() {
    this.value = '';
    this.committedValue = '';
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected override computeValidity(): ControlValidity {
    if (this.disabled) return { flags: {}, message: '' };
    const anchor = this.cells?.[this.firstEmptyIndex()];
    if (!this.value) {
      return this.required
        ? {
            flags: { valueMissing: true },
            message: this.valueMissingText(),
            anchor,
          }
        : { flags: {}, message: '' };
    }
    if (this.value.length < this.cellCount) {
      return {
        flags: { tooShort: true },
        message: this.i18n.t('pinInputIncomplete')(this.cellCount),
        anchor,
      };
    }
    return { flags: {}, message: '' };
  }

  protected override validityAnchor() {
    return this.cells?.[0];
  }

  protected override clearValue() {
    super.clearValue();
    this.committedValue = '';
  }

  override formResetCallback() {
    super.formResetCallback();
    this.committedValue = this.sanitize(this.value);
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** The number of cells: `length` as a whole number, at least 1. */
  private get cellCount(): number {
    const count = Math.floor(Number(this.length));
    return Number.isFinite(count) && count >= 1 ? count : 6;
  }

  private get editable(): boolean {
    return !this.disabled && !this.readonly;
  }

  /** Index of the first empty cell; the last cell when the code is complete. */
  private firstEmptyIndex(): number {
    return Math.min(this.value.length, this.cellCount - 1);
  }

  /** Keeps the characters the type takes (uppercased for alphanumeric), up to `length`. */
  private sanitize(text: unknown): string {
    const raw = text === undefined || text === null ? '' : String(text);
    const kept =
      this.type === 'alphanumeric'
        ? raw.replace(/[^0-9a-z]/gi, '').toUpperCase()
        : raw.replace(/\D/g, '');
    return kept.slice(0, this.cellCount);
  }

  /** Writes `chars` into the cells from `index` on, then moves focus past them. */
  private fill(index: number, chars: string) {
    const before = this.value;
    const next = (
      before.slice(0, index) +
      chars +
      before.slice(index + chars.length)
    ).slice(0, this.cellCount);
    // Value first, so the cell focused next counts as reachable.
    this.setValueFromUser(next);
    this.focusCell(index + chars.length);
  }

  /** Removes the character at `index`; the ones after it move up one cell. */
  private removeAt(index: number) {
    if (index >= this.value.length) return;
    this.setValueFromUser(
      this.value.slice(0, index) + this.value.slice(index + 1),
    );
  }

  private setValueFromUser(next: string) {
    if (next === this.value) {
      // Put back a character the cell rejected.
      this.requestUpdate();
      return;
    }
    const wasComplete = this.value.length === this.cellCount;
    this.value = next;
    this.emitValue('input');
    if (!wasComplete && next.length === this.cellCount) {
      this.commit();
      this.dispatchEvent(
        new CustomEvent('complete', {
          detail: { value: next },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private commit() {
    if (this.value === this.committedValue) return;
    this.committedValue = this.value;
    this.emitValue('change');
  }

  private focusCell(index: number) {
    const target = Math.max(0, Math.min(index, this.firstEmptyIndex()));
    this.activeIndex = target;
    const cell = this.cells?.[target];
    cell?.focus();
    cell?.select();
  }

  private cellIndex(event: Event): number {
    return Number((event.target as HTMLElement).dataset.index ?? 0);
  }

  private handleKeydown(event: KeyboardEvent) {
    const index = this.cellIndex(event);
    const last = this.firstEmptyIndex();
    const { key } = event;
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      event.preventDefault();
      const step = key === 'ArrowLeft' ? -1 : 1;
      this.focusCell(Math.min(index + step, last));
      return;
    }
    if (key === 'Home' || key === 'End') {
      event.preventDefault();
      this.focusCell(key === 'Home' ? 0 : last);
      return;
    }
    if (!this.editable) return;
    if (key === 'Backspace') {
      event.preventDefault();
      if (index < this.value.length) {
        this.removeAt(index);
      } else if (index > 0) {
        this.focusCell(index - 1);
        this.removeAt(index - 1);
      }
      return;
    }
    if (key === 'Delete') {
      event.preventDefault();
      this.removeAt(index);
      return;
    }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // A typed character: take it here so the cell always holds one; ignore ones the type rejects.
      event.preventDefault();
      const char = this.sanitize(key);
      if (char) this.fill(index, char);
    }
  }

  /** Text that reached a cell without a keydown: autofill, phone keyboards, input methods. */
  private handleInput(event: Event) {
    event.stopPropagation();
    const cell = event.target as HTMLInputElement;
    const index = this.cellIndex(event);
    if (!this.editable) return;
    const old = this.value[index] ?? '';
    if (cell.value === '') {
      this.removeAt(index);
      return;
    }
    let chars = this.sanitize(cell.value);
    // A character typed next to the one already there: keep the new one.
    if (old && chars.length === 2 && chars.includes(old)) {
      chars = chars[0] === old ? chars[1] : chars[0];
    }
    if (chars) this.fill(index, chars);
    else this.requestUpdate();
  }

  private handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    if (!this.editable) return;
    const chars = this.sanitize(event.clipboardData?.getData('text') ?? '');
    if (chars) this.fill(this.cellIndex(event), chars);
  }

  private handleFocusIn(event: FocusEvent) {
    const index = this.cellIndex(event);
    const allowed = this.firstEmptyIndex();
    if (index > allowed) {
      // The code fills from the start: go to the first empty cell instead.
      this.focusCell(allowed);
      return;
    }
    this.activeIndex = index;
    (event.target as HTMLInputElement).select();
    this.focused = true;
    this.requestUpdate();
  }

  private handleFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (next && this.renderRoot.contains(next)) return;
    this.focused = false;
    this.activeIndex = this.firstEmptyIndex();
    this.commit();
  }

  private stopEvent(event: Event) {
    // Keep native events inside, and keep a click on a cell from refocusing the first empty one.
    event.stopPropagation();
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderCell(
    index: number,
    count: number,
    aria: Record<string, string | undefined>,
  ) {
    const name =
      this.type === 'alphanumeric'
        ? this.i18n.t('pinInputCharacter')(index + 1, count)
        : this.i18n.t('pinInputDigit')(index + 1, count);
    const tabIndex =
      index === (this.focused ? this.activeIndex : this.firstEmptyIndex())
        ? (aria.tabindex ?? '0')
        : '-1';
    return html`<input
      class="cell"
      data-index=${index}
      type=${this.masked ? 'password' : 'text'}
      inputmode=${this.type === 'numeric' ? 'numeric' : 'text'}
      autocomplete=${index === 0 ? 'one-time-code' : 'off'}
      autocapitalize=${this.type === 'alphanumeric' ? 'characters' : 'off'}
      autocorrect="off"
      spellcheck="false"
      enterkeyhint=${index === count - 1 ? 'done' : 'next'}
      placeholder=${this.placeholder || nothing}
      tabindex=${tabIndex}
      aria-label=${name}
      aria-invalid=${aria['aria-invalid'] ?? nothing}
      aria-describedby=${aria['aria-describedby'] ?? nothing}
      aria-required=${this.required ? 'true' : nothing}
      .value=${live(this.value[index] ?? '')}
      ?readonly=${this.readonly}
      ?disabled=${this.disabled}
      @keydown=${this.handleKeydown}
      @input=${this.handleInput}
      @change=${this.stopEvent}
      @click=${this.stopEvent}
      @paste=${this.handlePaste}
    />`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const count = this.cellCount;
    const {
      tabindex,
      'aria-invalid': invalid,
      'aria-describedby': describedBy,
      ...groupAria
    } = this.fieldAria();
    const cellAria = {
      tabindex,
      'aria-invalid': invalid,
      'aria-describedby': describedBy,
    };
    return this.renderField(
      html`<div
        class="cells"
        role="group"
        dir="ltr"
        @focusin=${this.handleFocusIn}
        @focusout=${this.handleFocusOut}
        ${spread(groupAria)}
      >
        ${Array.from({ length: count }, (_, index) =>
          this.renderCell(index, count, cellAria),
        )}
      </div>`,
      { populated: !!this.value, focused: this.focused },
    );
  }
}
