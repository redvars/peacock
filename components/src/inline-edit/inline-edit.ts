import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import IndividualComponent from '@/IndividualComponent.js';

import styles from './inline-edit.scss';

/** What ended an edit: a key or button in the editor, or focus leaving it. */
type CommitSource = 'key' | 'action' | 'blur';

/** The editor element: a `wc-input` or `wc-textarea`. */
type EditorElement = HTMLElement & {
  value: string;
  updateComplete?: Promise<boolean>;
};

/**
 * @label Inline Edit
 * @tag wc-inline-edit
 * @rawTag inline-edit
 *
 * @summary Click-to-edit text for record pages: a title, a description, a field value.
 * @overview
 * <p>Inline edit shows <code>value</code> as text, or <code>placeholder</code> in a muted style
 * when it is empty, with a pencil button after it. Clicking the text or the pencil button (or
 * pressing Enter or Space on the button) opens the editor: a <code>wc-input</code>, or with
 * <code>multiline</code> a <code>wc-textarea</code>. The text takes the font of its surroundings,
 * so it can sit in a heading.</p>
 * <p>Keys: Enter saves (Ctrl+Enter or Cmd+Enter with <code>multiline</code>, where Enter starts a
 * new line) and Escape cancels. <b>Moving focus out of the editor saves</b>, exactly like Enter,
 * so nothing typed is lost. A save of an unchanged value just closes the editor and fires nothing.
 * After a save or cancel from the keyboard or the buttons, focus returns to the pencil button.
 * <code>show-actions</code> adds Save and Cancel buttons after the editor.</p>
 * <p>Saving fires a cancelable <code>change</code> with the new text in <code>detail.value</code>.
 * The contract:</p>
 * <ul>
 * <li><b>Synchronous:</b> do nothing. The component sets <code>value</code> and closes the
 * editor.</li>
 * <li><b>Rejected:</b> call <code>event.preventDefault()</code>. The editor stays open with the
 * text; set <code>error-text</code> to say why.</li>
 * <li><b>Asynchronous:</b> set <code>loading</code> in the handler. The editor stays open, read
 * only, with a progress indicator. When the server answers, set <code>loading</code> back to
 * false: with <code>error-text</code> set the editor stays open and shows the error, so the person
 * can fix the text and save again; with <code>error-text</code> empty the editor closes and
 * <code>value</code> becomes the saved text (set <code>value</code> before clearing
 * <code>loading</code> to show the server's version instead). Clear <code>error-text</code> when
 * you start the next save and on <code>cancel</code>.</li>
 * </ul>
 * <p>With <code>required</code> an empty (or blank) text is not saved: the editor stays open with
 * a message. <code>maxlength</code> limits the text and shows a character counter. While
 * <code>loading</code>, Escape and blur do nothing: a save in flight cannot be cancelled.</p>
 * <p><code>label</code> names both views for assistive technology: the pencil button is
 * "Edit <i>label</i>" and the editor is named <i>label</i>. The label is not shown.
 * <code>disabled</code> and <code>readonly</code> show the text without the pencil button.</p>
 * <p>Inline edit is <b>not a form field</b>: it is not form-associated and has no
 * <code>name</code>. It edits a record that the app saves at once. For a value submitted with a
 * form, use <code>wc-input</code> or <code>wc-textarea</code> inside a <code>wc-form</code>.</p>
 *
 * @fires {CustomEvent<{value: string}>} change - Cancelable. Dispatched when the person saves a changed text. Cancel it to keep the editor open; set `loading` in the handler for an asynchronous save.
 * @fires {CustomEvent} cancel - Dispatched when the person cancels an edit (Escape or the Cancel button).
 *
 * @cssprop --inline-edit-hover-color - Background of the text on hover.
 *
 * @example
 * ```html
 * <wc-inline-edit label="Title" value="Quarterly report"></wc-inline-edit>
 * ```
 * @example
 * ```html
 * <wc-inline-edit label="Description" multiline placeholder="Add a description"></wc-inline-edit>
 * ```
 * @tags input, collaboration
 */
@IndividualComponent
export class InlineEdit extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The saved text. */
  @property({ type: String })
  value = '';

  /** Shown in a muted style when the value is empty, for example "Add a description". */
  @property({ type: String })
  placeholder = '';

  /** Edits with a `wc-textarea`; Enter starts a new line and Ctrl/Cmd+Enter saves. */
  @property({ type: Boolean, reflect: true })
  multiline = false;

  /** Accessible name of the pencil button ("Edit <label>") and of the editor. Not shown. */
  @property({ type: String })
  label = '';

  /** Shows the text dimmed, without the pencil button. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Shows the text without the pencil button. */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /** An empty or blank text cannot be saved. */
  @property({ type: Boolean, reflect: true })
  required = false;

  /** Most characters allowed; the editor shows a character counter. */
  @property({ type: Number, attribute: 'maxlength' })
  maxLength?: number;

  /** Set by the app while it saves; the editor stays open and read only. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /** A save error from the app, shown under the editor while it is open. */
  @property({ type: String, attribute: 'error-text' })
  errorText = '';

  /** Adds Save and Cancel buttons after the editor. */
  @property({ type: Boolean, attribute: 'show-actions' })
  showActions = false;

  /** Whether the editor is open. Open it with `edit()`; it reflects for styling. */
  @property({ type: Boolean, reflect: true })
  editing = false;

  // ── State ────────────────────────────────────────────────────────────────

  /** The text in the editor. */
  @state()
  private draft = '';

  /** Whether the required message shows. */
  @state()
  private missing = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.edit-button')
  private editButton?: HTMLElement;

  @query('.control')
  private editor?: EditorElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the buttons. */
  private readonly i18n = new I18nController(this);

  /** Set while an asynchronous save runs: `loading` turning false ends it. */
  private pendingSave = false;

  /** Whether focus goes back to the pencil button when the pending save ends. */
  private focusAfterSave = false;

  /** `value` when the pending save started, to tell whether the app set a new one. */
  private valueAtSave = '';

  /** Whether the editor gets focus after the next render. */
  private focusEditorOnUpdate = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('editing') && this.editing && !changed.get('editing')) {
      this.draft = this.value ?? '';
      this.missing = false;
    }
    if (
      changed.has('loading') &&
      !this.loading &&
      changed.get('loading') &&
      this.pendingSave
    ) {
      this.pendingSave = false;
      if (!this.errorText) {
        if (this.value === this.valueAtSave) this.value = this.draft;
        this.close(this.focusAfterSave || this.hasFocusWithin());
      }
    }
  }

  protected override updated() {
    if (this.focusEditorOnUpdate && this.editing) {
      this.focusEditorOnUpdate = false;
      this.focusEditor();
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Opens the editor with the current value and focuses it. */
  edit() {
    if (this.disabled || this.readonly || this.editing) return;
    this.editing = true;
    this.focusEditorOnUpdate = true;
  }

  /** Saves the editor's text, as Enter does. */
  save() {
    this.commit('action');
  }

  /** Closes the editor without saving, as Escape does. Does nothing while `loading`. */
  cancel() {
    if (!this.editing || this.loading) return;
    const returnFocus = this.hasFocusWithin();
    this.draft = this.value ?? '';
    this.close(returnFocus);
    this.dispatchEvent(
      new CustomEvent('cancel', { bubbles: true, composed: true }),
    );
  }

  /** Focuses the editor when open, else the pencil button. */
  override focus(options?: Parameters<HTMLElement['focus']>[0]) {
    if (this.editing) this.editor?.focus(options);
    else this.editButton?.focus(options);
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private get editable(): boolean {
    return !this.disabled && !this.readonly;
  }

  private hasFocusWithin(): boolean {
    return this.matches(':focus-within');
  }

  private commit(source: CommitSource) {
    if (!this.editing || this.loading) return;
    const returnFocus = source !== 'blur';
    if (this.draft === (this.value ?? '')) {
      this.close(returnFocus);
      return;
    }
    if (this.required && !this.draft.trim()) {
      this.missing = true;
      return;
    }
    this.valueAtSave = this.value;
    const event = new CustomEvent('change', {
      detail: { value: this.draft },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (!this.dispatchEvent(event)) return;
    if (this.loading) {
      // The app saves asynchronously; `loading` turning false finishes the save.
      this.pendingSave = true;
      this.focusAfterSave = returnFocus;
      return;
    }
    if (this.value === this.valueAtSave) this.value = this.draft;
    this.close(returnFocus);
  }

  private close(returnFocus: boolean) {
    this.editing = false;
    this.missing = false;
    if (!returnFocus) return;
    this.updateComplete.then(() => this.editButton?.focus());
  }

  private async focusEditor() {
    const { editor } = this;
    if (!editor) return;
    await editor.updateComplete;
    editor.focus();
    // Select a one-line text to retype it; put the caret at the end of a longer one.
    const control = editor.shadowRoot?.querySelector<
      HTMLInputElement | HTMLTextAreaElement
    >('input, textarea');
    if (!control) return;
    if (this.multiline) {
      const end = control.value.length;
      control.setSelectionRange(end, end);
    } else {
      control.select();
    }
  }

  private handleTextClick() {
    // Keep a text selection made with the mouse instead of opening the editor.
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.toString()) return;
    this.edit();
  }

  private handleEditorInput(event: Event) {
    // Keep the editor's own events inside: the component fires `change` itself.
    event.stopPropagation();
    this.draft = (event.target as EditorElement).value ?? '';
    this.missing = false;
  }

  private stopEvent(event: Event) {
    event.stopPropagation();
  }

  private handleEditorKeydown(event: KeyboardEvent) {
    if (event.isComposing || event.key !== 'Enter') return;
    const modified = event.ctrlKey || event.metaKey;
    if (this.multiline ? !modified : event.shiftKey || event.altKey) return;
    event.preventDefault();
    this.commit('key');
  }

  private handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || event.isComposing) return;
    // Escape belongs to the editor: keep it from closing a dialog around it.
    event.preventDefault();
    event.stopPropagation();
    this.cancel();
  }

  private handleFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (next && (this.renderRoot.contains(next) || this.contains(next))) {
      return;
    }
    // The window lost focus (another tab or app): keep editing.
    if (!next && !document.hasFocus()) return;
    this.commit('blur');
  }

  private keepFocus(event: Event) {
    // A press on the action buttons must not blur the editor first, which would save.
    event.preventDefault();
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderDisplay() {
    const empty = !this.value;
    const { editable } = this;
    // The pencil button is the keyboard way in; a click on the text is a mouse shortcut.
    /* eslint-disable lit-a11y/click-events-have-key-events */
    return html`<div
      class=${classMap({
        display: true,
        editable,
        disabled: this.disabled,
      })}
    >
      <div
        class=${classMap({ text: true, placeholder: empty })}
        @click=${editable ? this.handleTextClick : nothing}
      >
        <span class="value">${empty ? this.placeholder : this.value}</span>
      </div>
      ${editable
        ? html`<wc-icon-button
            class="edit-button"
            variant="text"
            size="xs"
            shape="round"
            aria-label=${this.i18n.t('inlineEditEdit')(this.label)}
            @click=${() => this.edit()}
          >
            <wc-icon name="edit"></wc-icon>
          </wc-icon-button>`
        : nothing}
    </div>`;
    /* eslint-enable lit-a11y/click-events-have-key-events */
  }

  private renderEditor() {
    const errorText =
      this.errorText || (this.missing ? this.i18n.t('valueMissing') : '');
    const aria: Record<string, string> = {};
    if (this.label) aria['aria-label'] = this.label;
    if (this.required) aria['aria-required'] = 'true';
    const progress = this.loading
      ? html`<wc-circular-progress
          slot="end"
          class="progress"
          indeterminate
          aria-hidden="true"
        ></wc-circular-progress>`
      : nothing;
    const control = this.multiline
      ? html`<wc-textarea
          class="control"
          auto-grow
          .value=${this.draft}
          placeholder=${this.placeholder}
          maxlength=${this.maxLength ?? nothing}
          ?readonly=${this.loading}
          ?error=${!!errorText}
          error-text=${errorText}
          .configAria=${aria}
          @input=${this.handleEditorInput}
          @change=${this.stopEvent}
          @keydown=${this.handleEditorKeydown}
          >${progress}</wc-textarea
        >`
      : html`<wc-input
          class="control"
          .value=${this.draft}
          placeholder=${this.placeholder}
          maxlength=${this.maxLength ?? nothing}
          ?readonly=${this.loading}
          ?error=${!!errorText}
          error-text=${errorText}
          .configAria=${aria}
          @input=${this.handleEditorInput}
          @change=${this.stopEvent}
          @keydown=${this.handleEditorKeydown}
          >${progress}</wc-input
        >`;
    return html`<div
      class="editor"
      aria-busy=${this.loading ? 'true' : nothing}
      @keydown=${this.handleKeydown}
      @focusout=${this.handleFocusOut}
    >
      ${control} ${this.showActions ? this.renderActions() : nothing}
      <span class="screen-reader-only" role="status"
        >${this.loading ? this.i18n.t('inlineEditSaving') : ''}</span
      >
    </div>`;
  }

  private renderActions() {
    return html`<div class="actions" @pointerdown=${this.keepFocus}>
      <wc-icon-button
        class="save-button"
        variant="tonal"
        size="sm"
        shape="round"
        aria-label=${this.i18n.t('inlineEditSave')}
        ?disabled=${this.loading}
        @click=${() => this.commit('action')}
      >
        <wc-icon name="check"></wc-icon>
      </wc-icon-button>
      <wc-icon-button
        class="cancel-button"
        variant="text"
        size="sm"
        shape="round"
        aria-label=${this.i18n.t('inlineEditCancel')}
        ?disabled=${this.loading}
        @click=${() => this.cancel()}
      >
        <wc-icon name="close"></wc-icon>
      </wc-icon-button>
    </div>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return this.editing ? this.renderEditor() : this.renderDisplay();
  }
}
