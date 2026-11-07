import { html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { spread } from '@/__internal/directive/spread.js';
import { FloatingController } from '@/__internal/controllers/floating-controller.js';
import { OverlayController } from '@/__internal/controllers/overlay-controller.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import IndividualComponent from '@/IndividualComponent.js';
import BaseField from '../input/BaseField.js';
import { type ControlValidity, nativeValidity } from '../input/BaseInput.js';
import { caretCoordinates } from './caret-coordinates.js';
import {
  findQuery,
  type Mention,
  type MentionQuery,
  type MentionSuggestion,
  shiftMentions,
  validMentions,
} from './mention-model.js';
import styles from './mention-input.scss';

/** `detail` of `input` and `change`. */
export interface MentionInputValueDetail {
  value: string;
  mentions: Mention[];
}

/** `detail` of `search`. */
export interface MentionSearchDetail {
  /** The trigger character typed, such as `@`. */
  trigger: string;
  /** The text typed after it; empty right after the trigger. */
  query: string;
}

/** `detail` of `mention`. */
export interface MentionInsertDetail {
  mention: Mention;
  suggestion: MentionSuggestion;
}

let listCount = 0;

/**
 * @label Mention Input
 * @tag wc-mention-input
 * @rawTag mention-input
 * @summary A multiline text field where typing a trigger character, such as the at sign, suggests people or tags to mention.
 * @overview
 * <p>Mention input is a textarea in which a trigger character, <code>@</code> by default, opens a
 * list of suggestions at the caret. Picking one inserts the trigger and the suggestion's label as
 * text, such as <code>@Ana Lima</code>, followed by a space.</p>
 * <p><code>value</code> is the plain text the person sees, and it is what the field submits with a
 * form. <code>mentions</code> lists the mentions in it, each <code>{id, label, trigger, start,
 * end}</code>; the field keeps the positions up to date as the text changes. Editing inside a
 * mention turns it back into plain text; Backspace right after a mention (or Delete right before
 * it) removes the whole mention. To load saved text, set <code>value</code> and then
 * <code>mentions</code>; entries that do not match the text are dropped.</p>
 * <p>The app supplies the suggestions: on <code>search</code> (<code>detail: {trigger,
 * query}</code>) it sets <code>suggestions</code> to the matches, each <code>{id, label,
 * description?, avatar?}</code>, and sets <code>loading</code> while it fetches them. The list
 * shows while there are suggestions or <code>loading</code> is set. <code>triggers</code> takes
 * several characters, such as <code>"@#"</code> for people and tags.</p>
 * <p>Focus stays in the textarea: Arrow Up and Down move the highlighted suggestion
 * (<code>aria-activedescendant</code>), Enter or Tab inserts it, Escape closes the list. A
 * trigger counts at the start of the text or after a space or an opening bracket or quote, so
 * email addresses do not open the list.</p>
 * <p>It validates like <code>wc-textarea</code> (<code>required</code>, <code>minlength</code>,
 * <code>maxlength</code>) and grows with the text with <code>auto-grow</code>. It is a
 * plain-text field; for rich comments use <code>wc-comment-composer</code>.</p>
 * @tags input, form
 *
 * @fires {CustomEvent<{value: string, mentions: Mention[]}>} input - Dispatched as the text changes, including when a mention is inserted or removed.
 * @fires {CustomEvent<{value: string, mentions: Mention[]}>} change - Dispatched when the field loses focus with a changed value.
 * @fires {CustomEvent<{trigger: string, query: string}>} search - Dispatched as the person types after a trigger; set `suggestions` in response.
 * @fires {CustomEvent<{mention: Mention, suggestion: MentionSuggestion}>} mention - Dispatched when a suggestion is inserted.
 *
 * @cssprop --mention-input-list-max-height - Maximum height of the suggestion list. Defaults to `16rem`.
 * @cssprop --mention-input-list-width - Width of the suggestion list. Defaults to `18rem`.
 *
 * @example
 * ```html
 * <wc-mention-input id="note" label="Note" placeholder="Type @ to mention someone"></wc-mention-input>
 * <script>
 *   const people = [{ id: '42', label: 'Ana Lima', description: 'Design' }];
 *   const note = document.getElementById('note');
 *   note.addEventListener('search', event => {
 *     const q = event.detail.query.toLowerCase();
 *     note.suggestions = people.filter(p => p.label.toLowerCase().includes(q));
 *   });
 * </script>
 * ```
 */
@IndividualComponent
export class MentionInput extends BaseField {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The text, with mentions as their visible text (`@Ana Lima`). Submitted with a form. */
  @property({ type: String })
  get value(): string {
    return this._value;
  }

  set value(next: string) {
    const text = next ?? '';
    this._value = text;
    // Text set from outside (reset, a cleared composer): keep only mentions that still match.
    if (text !== this._text) {
      this._text = text;
      this._mentions = validMentions(this._mentions, text);
      this._query = null;
    }
  }

  /**
   * The mentions in `value`, sorted by position. Set it after `value` to load saved text;
   * entries whose trigger and label are not at `start`–`end` are dropped.
   */
  @property({ attribute: false })
  get mentions(): Mention[] {
    return this._mentions.map(mention => ({ ...mention }));
  }

  set mentions(next: Mention[]) {
    this._mentions = validMentions(next ?? [], this._value);
  }

  /** Characters that start a mention, such as `"@"` (default) or `"@#"`. */
  @property({ type: String }) triggers = '@';

  /** The suggestions for the current query; set it on `search`. */
  @property({ attribute: false }) suggestions: MentionSuggestion[] = [];

  /** Shows a progress row in the list while the app fetches suggestions. */
  @property({ type: Boolean, reflect: true }) loading = false;

  /** Visible lines of text; the starting height with `auto-grow`. */
  @property({ type: Number }) rows = 3;

  /** Fewest characters allowed. */
  @property({ type: Number, attribute: 'minlength' }) minLength?: number;

  /** Most characters allowed; shows a character counter. A mention that would not fit is not inserted. */
  @property({ type: Number, attribute: 'maxlength' }) maxLength?: number;

  /** Grows the height with the content instead of scrolling. */
  @property({ type: Boolean, attribute: 'auto-grow', reflect: true })
  autoGrow = false;

  /** With `auto-grow`, the most lines it grows to before it scrolls; unset for no limit. */
  @property({ type: Number, attribute: 'max-rows' }) maxRows?: number;

  // ── State ────────────────────────────────────────────────────────────────

  /** The query being typed after a trigger, or null. */
  @state() private _query: MentionQuery | null = null;

  /** Index of the highlighted suggestion; -1 for none. */
  @state() private _activeIndex = -1;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.input-element') private _textarea?: HTMLTextAreaElement;

  @query('.suggestions') private _list?: HTMLElement;

  @query('.caret-anchor') private _anchor?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  private _value = '';

  private _mentions: Mention[] = [];

  /** The text the mentions were last placed against; tells own edits from outside sets. */
  private _text = '';

  /** The value when the field got focus, to fire `change` on blur. */
  private _valueAtFocus = '';

  /** Start of a query the person closed with Escape; it stays closed until they leave it. */
  private _dismissedAt: number | null = null;

  /** Whether the list is in the top layer. */
  private _listShown = false;

  private readonly _listId = `wc-mention-input-list-${(listCount += 1)}`;

  private readonly i18n = new I18nController(this);

  /** Keeps the list next to the caret. */
  private readonly _floating = new FloatingController(this, {
    placement: 'bottom-start',
    strategy: 'fixed',
    offset: 4,
    trigger: 'manual',
    closeOnClickOutside: false,
    fitViewport: true,
  });

  /** Puts the list in the top layer, above modals; blur and Escape close it. */
  private readonly _overlay = new OverlayController(this, {
    surface: () => this._list,
    closeOnEscape: () => false,
    focusOnOpen: () => false,
    restoreFocus: () => false,
    requestClose: () => this._closeList(),
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    if (changed.has('suggestions') || changed.has('_query')) {
      if (
        this._activeIndex < 0 ||
        this._activeIndex >= this.suggestions.length ||
        changed.has('_query')
      ) {
        this._activeIndex = this.suggestions.length ? 0 : -1;
      }
    }
    if (this.disabled || this.readonly) this._query = null;
  }

  protected override updated(changed: PropertyValues) {
    super.updated(changed);
    if (
      changed.has('value') ||
      changed.has('autoGrow') ||
      changed.has('maxRows') ||
      changed.has('rows')
    ) {
      this._fitToContent();
    }
    const show = this._listVisible();
    if (show !== this._listShown) {
      this._listShown = show;
      if (show) {
        this._overlay.sync(true);
        this._placeAnchor();
        this._floating.open();
      } else {
        this._floating.close();
        this._overlay.sync(false);
      }
    } else if (show && changed.has('_query')) {
      this._placeAnchor();
    }
    if (changed.has('_activeIndex')) {
      this.renderRoot
        .querySelector<HTMLElement>(`#${this._listId}-${this._activeIndex}`)
        ?.scrollIntoView?.({ block: 'nearest' });
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this._textarea?.focus();
  }

  override blur() {
    this._textarea?.blur();
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected override computeValidity(): ControlValidity {
    return this._textarea
      ? nativeValidity(this._textarea)
      : super.computeValidity();
  }

  protected override validityAnchor() {
    return this._textarea ?? undefined;
  }

  /** The field event contract, with the mentions alongside the value. */
  protected override emitValue(type: 'input' | 'change') {
    this.dispatchEvent(
      new CustomEvent<MentionInputValueDetail>(type, {
        detail: { value: this.value, mentions: this.mentions },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private _triggerChars(): string[] {
    return Array.from(this.triggers).filter(char => char.trim());
  }

  private _listVisible(): boolean {
    return (
      !!this._query &&
      (this.loading || this.suggestions.length > 0) &&
      !this.disabled &&
      !this.readonly
    );
  }

  /** Moves the invisible anchor to the caret, and the list with it. */
  private _placeAnchor() {
    const textarea = this._textarea;
    const anchor = this._anchor;
    const list = this._list;
    if (!textarea || !anchor || !list || !this._query) return;
    const caret = caretCoordinates(textarea, this._query.start);
    anchor.style.insetBlockStart = `${textarea.offsetTop + caret.top}px`;
    // The mirror measures physical offsets, from the left.
    anchor.style.setProperty('left', `${textarea.offsetLeft + caret.left}px`);
    anchor.style.blockSize = `${caret.height}px`;
    this._floating.setElements(anchor, list);
  }

  /** With `auto-grow`, sets the height to the content's, capped at `max-rows` lines. */
  private _fitToContent() {
    const textarea = this._textarea;
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

  /** Looks for a query at the caret; opens, updates or closes the list. */
  private _detectQuery() {
    const textarea = this._textarea;
    if (
      !textarea ||
      this.disabled ||
      this.readonly ||
      textarea.selectionStart !== textarea.selectionEnd
    ) {
      this._query = null;
      return;
    }
    const found = findQuery(
      this._value,
      textarea.selectionEnd,
      this._triggerChars(),
      this._mentions,
    );
    if (!found) {
      this._dismissedAt = null;
      this._query = null;
      return;
    }
    if (found.start === this._dismissedAt) {
      this._query = null;
      return;
    }
    this._dismissedAt = null;
    const current = this._query;
    if (
      current &&
      current.start === found.start &&
      current.query === found.query &&
      current.trigger === found.trigger
    ) {
      return;
    }
    this._query = found;
    this.dispatchEvent(
      new CustomEvent<MentionSearchDetail>('search', {
        detail: { trigger: found.trigger, query: found.query },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _closeList() {
    this._query = null;
  }

  /** Writes new text and mentions from an edit of the field's own, then fires `input`. */
  private _commitEdit(text: string, mentions: Mention[], caret: number) {
    const textarea = this._textarea;
    if (textarea) {
      textarea.value = text;
      textarea.setSelectionRange(caret, caret);
    }
    this._text = text;
    this.value = text;
    this.mentions = mentions;
    this.emitValue('input');
  }

  /** Inserts a suggestion in place of the query. */
  private _choose(index: number) {
    const suggestion = this.suggestions[index];
    const current = this._query;
    if (!suggestion || !current) return;
    const text = this._value;
    const queryEnd = current.start + 1 + current.query.length;
    const inserted = `${current.trigger}${suggestion.label}`;
    const rest = text.slice(queryEnd);
    const spacer = /^\s/.test(rest) ? '' : ' ';
    const next = `${text.slice(0, current.start)}${inserted}${spacer}${rest}`;
    if (this.maxLength !== undefined && next.length > this.maxLength) return;

    const delta = next.length - text.length;
    const mention: Mention = {
      id: suggestion.id,
      label: suggestion.label,
      trigger: current.trigger,
      start: current.start,
      end: current.start + inserted.length,
    };
    const mentions = [
      ...this._mentions.map(other =>
        other.start >= queryEnd
          ? { ...other, start: other.start + delta, end: other.end + delta }
          : other,
      ),
      mention,
    ];
    this._query = null;
    // The caret goes after the space, whether inserted or already there.
    this._commitEdit(next, mentions, mention.end + 1);
    this.dispatchEvent(
      new CustomEvent<MentionInsertDetail>('mention', {
        detail: { mention: { ...mention }, suggestion },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Removes a whole mention, for Backspace after it or Delete before it. */
  private _removeMention(mention: Mention) {
    const text = this._value;
    const next = text.slice(0, mention.start) + text.slice(mention.end);
    const length = mention.end - mention.start;
    const mentions = this._mentions
      .filter(other => other !== mention)
      .map(other =>
        other.start >= mention.end
          ? { ...other, start: other.start - length, end: other.end - length }
          : other,
      );
    this._commitEdit(next, mentions, mention.start);
    this._detectQuery();
  }

  private _move(step: number) {
    const count = this.suggestions.length;
    if (!count) return;
    if (this._activeIndex < 0) {
      this._activeIndex = step > 0 ? 0 : count - 1;
      return;
    }
    this._activeIndex = (this._activeIndex + step + count) % count;
  }

  private _handleInput(event: Event) {
    // Replace the native event, which escapes the shadow root, with the field's own.
    event.stopPropagation();
    const textarea = event.target as HTMLTextAreaElement;
    const next = textarea.value;
    const mentions = shiftMentions(
      this._mentions,
      this._text,
      next,
      textarea.selectionEnd,
    );
    this._text = next;
    this.value = next;
    this.mentions = mentions;
    this.emitValue('input');
    this._detectQuery();
  }

  private _handleKeydown(event: KeyboardEvent) {
    if (event.isComposing) return;
    const modified = event.ctrlKey || event.metaKey || event.altKey;
    if (this._listVisible()) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this._move(1);
          return;
        case 'ArrowUp':
          event.preventDefault();
          this._move(-1);
          return;
        case 'Enter':
        case 'Tab':
          if (modified || event.shiftKey || this._activeIndex < 0) break;
          event.preventDefault();
          // Keep a wrapping comment thread from sending on this Enter.
          event.stopPropagation();
          this._choose(this._activeIndex);
          return;
        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          this._dismissedAt = this._query?.start ?? null;
          this._closeList();
          return;
        default:
          break;
      }
    }
    if (
      (event.key === 'Backspace' || event.key === 'Delete') &&
      !modified &&
      !this.readonly
    ) {
      const textarea = event.target as HTMLTextAreaElement;
      if (textarea.selectionStart !== textarea.selectionEnd) return;
      const caret = textarea.selectionStart;
      const mention = this._mentions.find(candidate =>
        event.key === 'Backspace'
          ? candidate.end === caret
          : candidate.start === caret,
      );
      if (!mention) return;
      event.preventDefault();
      this._removeMention(mention);
    }
  }

  /** The caret moved without an edit (arrows, a click): the query may have changed. */
  private _handleCaretMove(event: Event) {
    if (event instanceof KeyboardEvent) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        return;
      }
    }
    this._detectQuery();
  }

  private _handleFocus(event: FocusEvent) {
    this.handleFieldFocus(event);
    this._valueAtFocus = this._value;
  }

  private _handleBlur(event: FocusEvent) {
    this.handleFieldFocus(event);
    this._closeList();
    this._dismissedAt = null;
    if (this._value !== this._valueAtFocus) {
      this._valueAtFocus = this._value;
      this.emitValue('change');
    }
  }

  private _handleOptionClick(index: number) {
    this._activeIndex = index;
    this._choose(index);
    this._textarea?.focus();
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private _renderOption(suggestion: MentionSuggestion, index: number) {
    const active = index === this._activeIndex;
    // Options are driven from the textarea (aria-activedescendant); the pointer only picks them.
    /* eslint-disable lit-a11y/click-events-have-key-events */
    return html`<div
      id="${this._listId}-${index}"
      class=${classMap({ option: true, active })}
      role="option"
      aria-selected=${active ? 'true' : 'false'}
      @click=${() => this._handleOptionClick(index)}
      @pointermove=${() => {
        this._activeIndex = index;
      }}
    >
      ${suggestion.avatar !== undefined
        ? html`<wc-avatar
            class="option-avatar"
            size="sm"
            name=${suggestion.label}
            src=${suggestion.avatar || nothing}
            aria-hidden="true"
          ></wc-avatar>`
        : nothing}
      <span class="option-text">
        <span class="option-label">${suggestion.label}</span>
        ${suggestion.description
          ? html`<span class="option-description"
              >${suggestion.description}</span
            >`
          : nothing}
      </span>
    </div>`;
    /* eslint-enable lit-a11y/click-events-have-key-events */
  }

  private _renderList() {
    const visible = this._listVisible();
    // A press on the list must not take focus from the textarea.
    return html`<div
      id=${this._listId}
      class="suggestions"
      popover="manual"
      role="listbox"
      aria-label=${this.i18n.t('mentionSuggestions')}
      aria-busy=${this.loading ? 'true' : nothing}
      @mousedown=${(event: MouseEvent) => event.preventDefault()}
    >
      ${visible
        ? this.suggestions.map((suggestion, index) =>
            this._renderOption(suggestion, index),
          )
        : nothing}
      ${visible && this.loading
        ? html`<div class="loading-row" role="presentation">
            <wc-circular-progress
              class="loading-indicator"
              indeterminate
              aria-hidden="true"
            ></wc-circular-progress>
            <span>${this.i18n.t('loading')}</span>
          </div>`
        : nothing}
    </div>`;
  }

  /** Text for the polite live region: the number of suggestions while the list shows. */
  private _announcement(): string {
    if (!this._listVisible()) return '';
    if (this.loading && !this.suggestions.length) return this.i18n.t('loading');
    const count = this.suggestions.length;
    const formatted = new Intl.NumberFormat(this.i18n.locale).format(count);
    return this.i18n.t('mentionResults')(count, formatted);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const visible = this._listVisible();
    const active =
      visible && this._activeIndex >= 0
        ? `${this._listId}-${this._activeIndex}`
        : '';
    return this.renderField(
      html`<div class="control">
        <textarea
          class="input input-element"
          rows=${this.rows}
          placeholder=${this.placeholder}
          minlength=${this.minLength ?? nothing}
          maxlength=${this.maxLength ?? nothing}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-controls=${this._listId}
          aria-activedescendant=${active || nothing}
          ?data-handles-escape=${visible}
          .value=${this.value}
          ?readonly=${this.readonly}
          ?required=${this.required}
          ?disabled=${this.disabled}
          @input=${this._handleInput}
          @change=${(event: Event) => event.stopPropagation()}
          @keydown=${this._handleKeydown}
          @keyup=${this._handleCaretMove}
          @click=${this._handleCaretMove}
          @focus=${this._handleFocus}
          @blur=${this._handleBlur}
          ${spread(this.fieldAria())}
        ></textarea>
        <span class="caret-anchor" aria-hidden="true"></span>
        ${this._renderList()}
        <span class="screen-reader-only" role="status"
          >${this._announcement()}</span
        >
      </div>`,
      {
        populated: !!this.value,
        textCount: this.characterCount(this.maxLength),
      },
    );
  }
}
