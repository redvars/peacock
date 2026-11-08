import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { Editor, type Content, type Extensions } from '@tiptap/core';

import BaseInput, { type ControlValidity } from '../../input/BaseInput.js';
import { I18nController } from '../i18n/i18n-controller.js';
import type { PeacockStrings } from '../i18n/strings.js';
import type { MentionSuggestion } from '../../mention-input/mention-model.js';
import { RichTextAiController } from './ai-controller.js';
import { RichTextBlockHandleController } from './block-handle-controller.js';
import { RichTextBubbleController } from './bubble-controller.js';
import {
  activeTextStyle,
  BLOCKS,
  blocksFor,
  marksFor,
  type BlockCommand,
} from './commands.js';
import {
  buildExtensions,
  SET_VALUE_META,
  type RichTextProfile,
} from './extensions.js';
import { RichTextLinkController } from './link-controller.js';
import {
  RichTextMentionController,
  type RichTextMentionHost,
} from './mention-controller.js';
import { RichTextSlashController } from './slash-controller.js';

/** What the editor's constructor takes as its first content. */
export interface RichTextContent {
  content: Content;
  contentType?: 'markdown' | 'html' | 'json';
}

/** The table commands offered while the caret is in a table. */
const TABLE_ACTIONS = [
  'addRowBelow',
  'addColumnAfter',
  'deleteRow',
  'deleteColumn',
  'deleteTable',
] as const;

type TableAction = (typeof TABLE_ACTIONS)[number];

/**
 * The shared base of Peacock's rich-text fields (`wc-markdown-editor`, `wc-html-editor`,
 * `wc-comment-composer`): a form-associated Tiptap editor inside `wc-field`, with a fixed toolbar,
 * a selection bubble, a slash menu, a link editor, a block handle, mentions and a source view.
 *
 * Subclasses say what the value is: the editor `profile`, how to read the value from the editor and
 * write it back, and the source language. Everything else, including the events, is here:
 * - `input` with `{ value }`, `debounce` milliseconds after the content stops changing;
 * - `change` with `{ value }` when focus leaves after an edit;
 * - `search` and `mention`, as on `wc-mention-input`.
 *
 * With a provider that offers them (ADR-030002), the editors also get AI actions on the selection
 * (from the bubble and the toolbar), Continue writing and Summarize above in the slash menu, and,
 * with `ai-completion`, ghost text. Results show in a preview until the person accepts them.
 */
export default abstract class RichTextInput
  extends BaseInput
  implements RichTextMentionHost
{
  // ── Properties ────────────────────────────────────────────────────────────

  /** The value: Markdown or HTML, depending on the editor. */
  @property({ type: String })
  value = '';

  /** Label shown above the editor. */
  @property({ type: String })
  label = '';

  /** Text shown while the editor is empty. Each editor has its own default. */
  @property({ type: String })
  placeholder = '';

  /** Visual style of the field. */
  @property({ type: String })
  variant: 'filled' | 'outlined' | 'default' = 'default';

  /** Size of the text: `sm` or `md`. */
  @property({ type: String, reflect: true })
  size: 'sm' | 'md' = 'md';

  /** Help shown below the editor. */
  @property({ type: String, attribute: 'helper-text' })
  helperText = '';

  /** Shows the error state. */
  @property({ type: Boolean })
  error = false;

  /** The error message shown with `error`. */
  @property({ type: String, attribute: 'error-text' })
  errorText = '';

  /** Milliseconds without typing before `input` fires. */
  @property({ type: Number })
  debounce = 250;

  /** Hides the fixed toolbar; formatting stays available from the selection bubble, `/` and shortcuts. */
  @property({ type: Boolean, attribute: 'hide-toolbar' })
  hideToolbar = false;

  /** Maximum number of characters of text. Typing stops there, and a count shows below. */
  @property({ type: Number, attribute: 'maxlength' })
  maxlength?: number;

  /** Height of the empty editor, in lines. */
  @property({ type: Number })
  rows = 4;

  /** Lines the editor grows to before it scrolls. Without it, it keeps growing. */
  @property({ type: Number, attribute: 'max-rows' })
  maxRows?: number;

  /** Characters that start a mention, such as `"@"` or `"@#"`. Empty turns mentions off. */
  @property({ type: String })
  triggers = '@';

  /** Suggestions for the mention being typed; set them in answer to `search`. */
  @property({ attribute: false })
  suggestions: MentionSuggestion[] = [];

  /** Shows a loading row in the mention list while the app looks for suggestions. */
  @property({ type: Boolean, attribute: 'suggestions-loading' })
  suggestionsLoading = false;

  /** Overrides Peacock's strings for this instance only. */
  @property({ attribute: false })
  strings?: Partial<PeacockStrings>;

  /**
   * Suggests how to go on after a pause in typing, as ghost text at the end of the paragraph: Tab
   * takes it, Mod+→ takes a word, Escape dismisses it. Needs a provider with `complete`.
   */
  @property({ type: Boolean, reflect: true, attribute: 'ai-completion' })
  aiCompletion = false;

  /** Turns the AI actions and ghost text off for this editor, even when the page offers them. */
  @property({ type: Boolean, reflect: true, attribute: 'no-ai' })
  noAi = false;

  // ── State ─────────────────────────────────────────────────────────────────

  /** Whether the editor has focus. */
  @state() protected editorFocused = false;

  /** Whether the source view is showing. */
  @state() protected sourceView = false;

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.editor-root')
  private editorRoot?: HTMLElement;

  // ── Protected fields ──────────────────────────────────────────────────────

  /** The Tiptap editor, once created. */
  protected editor?: Editor;

  protected readonly i18n = new I18nController(this);

  protected readonly mentions = new RichTextMentionController(this, {
    editor: () => this.editor,
    i18n: this.i18n,
  });

  protected readonly ai = new RichTextAiController(this, {
    editor: () => this.editor,
    i18n: this.i18n,
  });

  protected readonly slash = new RichTextSlashController(this, {
    editor: () => this.editor,
    i18n: this.i18n,
    actions: () => this.ai.slashActions(),
  });

  protected readonly link = new RichTextLinkController(this, {
    editor: () => this.editor,
    i18n: this.i18n,
  });

  protected readonly bubble = new RichTextBubbleController(this, {
    editor: () => this.editor,
    i18n: this.i18n,
    allowed: () =>
      this.selectionBubble &&
      !this.sourceView &&
      !this.link.open &&
      !this.slash.visible &&
      !this.mentions.visible &&
      !this.ai.open,
    editLink: () => this.link.show(),
    extra: () => this.bubbleExtra(),
  });

  protected readonly blockHandle = new RichTextBlockHandleController(this, {
    editor: () => this.editor,
    i18n: this.i18n,
    allowed: () => !this.sourceView && this.showBlockHandle,
    insertAfter: position => this.slash.openAfterBlock(position),
  });

  // ── Private fields ────────────────────────────────────────────────────────

  private inputTimer?: number;

  private focusWithin = false;

  private valueAtFocus = '';

  // ── Abstract ──────────────────────────────────────────────────────────────

  /** Which nodes and marks the editor allows. */
  protected abstract readonly profile: RichTextProfile;

  /** The language of the source view. */
  protected abstract readonly sourceLanguage: 'markdown' | 'html';

  /** The icon of the source toggle. */
  protected abstract readonly sourceIcon: string;

  /** The value as the editor holds it now. */
  protected abstract readFromEditor(editor: Editor): string;

  /** The editor's content for a value. */
  protected abstract contentFor(value: string): RichTextContent;

  /** The placeholder when `placeholder` is empty. */
  protected abstract defaultPlaceholder(): string;

  /** Whether the block handle shows; the comment composer turns it off. */
  protected get showBlockHandle(): boolean {
    return true;
  }

  /** Whether `/` opens the block menu; the prompt input, which holds no blocks, turns it off. */
  protected get slashMenu(): boolean {
    return true;
  }

  /** Whether selecting text shows the selection bubble; the prompt input turns it off. */
  protected get selectionBubble(): boolean {
    return true;
  }

  /** Extensions a subclass adds, such as keyboard shortcuts. */
  protected extraExtensions(): Extensions {
    return [];
  }

  /** Buttons added to the selection bubble after the marks and link; Ask AI by default. */
  protected bubbleExtra(): TemplateResult | typeof nothing {
    return this.ai.bubbleButton();
  }

  /** The block tools in the toolbar: every block the schema allows except text styles. */
  protected toolbarBlocks(editor: Editor): BlockCommand[] {
    return blocksFor(editor).filter(block => !block.textStyle);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  constructor() {
    super();
    this.addEventListener('focusin', this.onFocusIn);
    this.addEventListener('focusout', this.onFocusOut);
  }

  override connectedCallback() {
    super.connectedCallback();
    // Reconnected after a move: the editor was destroyed on disconnect.
    if (this.hasUpdated && !this.editor) this.createEditor();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.flushInput();
    this.destroyEditor();
  }

  protected override firstUpdated() {
    this.createEditor();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    // Load a new value before validity is computed in updated().
    const { editor } = this;
    if (!editor || !changed.has('value')) return;
    const current = this.normalizeValue(this.readFromEditor(editor));
    if (current === this.normalizeValue(this.value)) return;
    const { content, contentType } = this.contentFor(this.value);
    editor
      .chain()
      .setMeta(SET_VALUE_META, true)
      .setContent(content, { emitUpdate: false, contentType })
      .run();
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    const { editor } = this;
    if (!editor) return;

    if (changed.has('triggers') || changed.has('maxlength')) {
      this.destroyEditor();
      this.createEditor();
      return;
    }

    if (changed.has('disabled') || changed.has('readonly')) {
      editor.setEditable(!(this.disabled || this.readonly));
    }

    if (changed.has('placeholder') || changed.has('strings')) {
      // The placeholder is a decoration; an empty transaction redraws it.
      editor.view.dispatch(editor.state.tr.setMeta('placeholder', true));
    }
  }

  // ── Public methods ────────────────────────────────────────────────────────

  override focus(options?: Parameters<HTMLElement['focus']>[0]) {
    if (this.editor && !this.sourceView) this.editor.commands.focus();
    else super.focus(options);
  }

  // ── Protected methods ─────────────────────────────────────────────────────

  /** Line endings and trailing whitespace do not count as changes. */
  protected normalizeValue(value: string): string {
    return (value ?? '').replace(/\r\n/g, '\n').replace(/\s+$/, '');
  }

  protected override computeValidity(): ControlValidity {
    const base = super.computeValidity();
    if (Object.values(base.flags).some(Boolean)) return base;
    const max = this.maxlength;
    if (typeof max === 'number' && max >= 0 && this.characters() > max) {
      return {
        flags: { tooLong: true },
        message: this.i18n.t('richTextTooLong')(max),
      };
    }
    return base;
  }

  /** The number of characters of text, as `maxlength` counts them. */
  protected characters(): number {
    return this.editor?.state.doc.textContent.length ?? 0;
  }

  /** Whether the editor holds nothing: a single empty paragraph. */
  protected isEditorEmpty(editor: Editor): boolean {
    const { doc } = editor.state;
    const first = doc.firstChild;
    return (
      doc.childCount <= 1 &&
      (!first || (first.type.name === 'paragraph' && first.content.size === 0))
    );
  }

  /** Runs an editor command, unless the editor is disabled or read-only. */
  protected run(command: (editor: Editor) => void) {
    const { editor } = this;
    if (!editor || this.disabled || this.readonly) return;
    command(editor);
  }

  // ── Private methods: editor ───────────────────────────────────────────────

  private createEditor() {
    const root = this.editorRoot;
    if (!root || this.editor) return;
    const { content, contentType } = this.contentFor(this.value);
    this.editor = new Editor({
      element: root,
      extensions: buildExtensions(this.profile, {
        placeholder: () => this.placeholder || this.defaultPlaceholder(),
        maxlength: this.maxlength,
        mentions: this.triggers ? this.mentions.suggestionOptions() : [],
        extra: [
          this.ai.extension(),
          ...(this.slashMenu ? [this.slash.extension()] : []),
          this.link.extension(),
          this.blockHandle.extension(),
          ...this.extraExtensions(),
        ],
      }),
      content,
      contentType,
      editable: !(this.disabled || this.readonly),
      editorProps: {
        attributes: {
          role: 'textbox',
          'aria-multiline': 'true',
          'aria-label':
            this.label || this.placeholder || this.defaultPlaceholder(),
        },
      },
      onFocus: () => {
        this.editorFocused = true;
      },
      onBlur: () => {
        this.editorFocused = false;
      },
      onUpdate: () => this.onEditorUpdate(),
      onTransaction: () => this.requestUpdate(),
    });
    this.requestUpdate();
  }

  private destroyEditor() {
    this.editor?.destroy();
    this.editor = undefined;
  }

  private onEditorUpdate() {
    const { editor } = this;
    if (!editor) return;
    const next = this.normalizeValue(this.readFromEditor(editor));
    if (next === this.normalizeValue(this.value)) return;
    this.value = next;
    this.queueInput();
  }

  // ── Private methods: events ───────────────────────────────────────────────

  private emit(type: 'input' | 'change') {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private queueInput() {
    window.clearTimeout(this.inputTimer);
    this.inputTimer = window.setTimeout(() => {
      this.inputTimer = undefined;
      this.emit('input');
    }, this.debounce);
  }

  /** Fires a pending `input` now. */
  private flushInput() {
    if (this.inputTimer === undefined) return;
    window.clearTimeout(this.inputTimer);
    this.inputTimer = undefined;
    this.emit('input');
  }

  private onFocusIn = () => {
    if (this.focusWithin) return;
    this.focusWithin = true;
    this.valueAtFocus = this.value;
  };

  private onFocusOut = (event: FocusEvent) => {
    // Focus moving between parts of the editor arrives retargeted to the host.
    const next = event.relatedTarget as Node | null;
    if (next && (next === this || this.contains(next))) return;
    this.focusWithin = false;
    this.flushInput();
    if (this.value === this.valueAtFocus) return;
    this.valueAtFocus = this.value;
    this.emit('change');
  };

  private onSourceInput = (event: CustomEvent<{ value: string }>) => {
    event.stopPropagation();
    const next = event.detail?.value ?? '';
    if (next === this.value) return;
    this.value = next;
    this.queueInput();
  };

  private toggleSource = () => {
    const { editor } = this;
    if (editor && !this.sourceView) {
      // Take the editor's latest value before showing it as source.
      this.value = this.normalizeValue(this.readFromEditor(editor));
    }
    this.sourceView = !this.sourceView;
    if (!this.sourceView) {
      this.updateComplete.then(() => this.editor?.commands.focus());
    }
  };

  private onTextStyle = (event: CustomEvent<{ item: HTMLElement }>) => {
    event.stopPropagation();
    const id = event.detail.item.getAttribute('value');
    const block: BlockCommand | undefined = BLOCKS.find(b => b.id === id);
    if (block) this.run(editor => block.run(editor.chain().focus()).run());
  };

  private onTableAction = (event: CustomEvent<{ item: HTMLElement }>) => {
    event.stopPropagation();
    const action = event.detail.item.getAttribute('value') as TableAction;
    this.run(editor => {
      const chain = editor.chain().focus();
      const commands: Record<TableAction, () => boolean> = {
        addRowBelow: () => chain.addRowAfter().run(),
        addColumnAfter: () => chain.addColumnAfter().run(),
        deleteRow: () => chain.deleteRow().run(),
        deleteColumn: () => chain.deleteColumn().run(),
        deleteTable: () => chain.deleteTable().run(),
      };
      commands[action]?.();
    });
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  protected toolButton(
    icon: string,
    label: string,
    action: () => void,
    selected?: boolean,
  ): TemplateResult {
    return html`<wc-icon-button
      class="tool"
      variant="text"
      color="surface"
      shape="round"
      size="xs"
      ?toggle=${selected !== undefined}
      ?selected=${!!selected}
      ?disabled=${this.disabled || this.readonly}
      aria-label=${label}
      tooltip=${label}
      @click=${action}
      ><wc-icon name=${icon}></wc-icon
    ></wc-icon-button>`;
  }

  private renderTextStyle(editor: Editor) {
    const styles = blocksFor(editor).filter(block => block.textStyle);
    if (styles.length < 2) return nothing;
    const active = activeTextStyle(editor);
    return html`<wc-dropdown-button
        class="text-style"
        size="xs"
        variant="text"
        color="surface"
        aria-label=${this.i18n.t('textStyle')}
        ?disabled=${this.disabled || this.readonly}
        @menu-item-activate=${this.onTextStyle}
      >
        ${this.i18n.t(active?.id ?? 'paragraph')}
        ${styles.map(
          block =>
            html`<wc-menu-item
              slot="menu"
              type="radio"
              value=${block.id}
              ?selected=${block === active}
              >${this.i18n.t(block.id)}</wc-menu-item
            >`,
        )}
      </wc-dropdown-button>
      <wc-divider orientation="vertical"></wc-divider>`;
  }

  private renderTableTools(editor: Editor) {
    if (!editor.isActive('table')) return nothing;
    return html`<wc-divider orientation="vertical"></wc-divider>
      <wc-dropdown-button
        class="table-tools"
        size="xs"
        variant="text"
        color="surface"
        ?disabled=${this.disabled || this.readonly}
        @menu-item-activate=${this.onTableAction}
      >
        ${this.i18n.t('table')}
        ${TABLE_ACTIONS.map(
          action =>
            html`<wc-menu-item slot="menu" value=${action}
              >${this.i18n.t(action)}</wc-menu-item
            >`,
        )}
      </wc-dropdown-button>`;
  }

  /** The formatting tools: text style, marks, link, blocks, mention and table actions. */
  protected renderTools(editor: Editor): TemplateResult {
    const { i18n } = this;
    return html`${this.renderTextStyle(editor)}
      ${marksFor(editor).map(mark =>
        this.toolButton(
          mark.icon,
          i18n.t(mark.id),
          () => this.run(e => mark.run(e.chain().focus()).run()),
          editor.isActive(mark.mark),
        ),
      )}
      ${editor.schema.marks.link
        ? this.toolButton(
            'link',
            i18n.t('link'),
            () => this.link.show(),
            editor.isActive('link'),
          )
        : nothing}
      <wc-divider orientation="vertical"></wc-divider>
      ${this.toolbarBlocks(editor).map(block =>
        this.toolButton(
          block.icon,
          i18n.t(block.id),
          () => this.run(e => block.run(e.chain().focus()).run()),
          block.id === 'divider' || block.id === 'table'
            ? undefined
            : block.active(editor),
        ),
      )}
      ${this.triggers
        ? this.toolButton('alternate_email', i18n.t('mentionSomeone'), () =>
            this.mentions.insertTrigger(),
          )
        : nothing}
      ${this.renderTableTools(editor)} ${this.ai.toolbarButton()}`;
  }

  /** Keeps the editor's selection when a tool is pressed. */
  protected keepSelection = (event: MouseEvent) => {
    if (!this.sourceView) event.preventDefault();
  };

  private renderToolbar() {
    if (this.hideToolbar) return nothing;
    const { editor, i18n } = this;
    return html`<wc-toolbar
      class="toolbar"
      variant="flat"
      aria-label=${i18n.t('formattingToolbar')}
      @mousedown=${this.keepSelection}
    >
      ${editor && !this.sourceView ? this.renderTools(editor) : nothing}
      <span class="toolbar-spacer" aria-hidden="true"></span>
      <wc-icon-button
        class="tool source-toggle"
        variant="text"
        color="surface"
        shape="round"
        size="xs"
        toggle
        ?selected=${this.sourceView}
        ?disabled=${this.disabled}
        aria-label=${i18n.t('viewSource')}
        tooltip=${i18n.t('viewSource')}
        @click=${this.toggleSource}
        ><wc-icon name=${this.sourceIcon}></wc-icon
      ></wc-icon-button>
    </wc-toolbar>`;
  }

  protected renderStateTag() {
    if (this.disabled) {
      return html`<wc-tag class="state-tag" intent="danger"
        >${this.i18n.t('disabled')}</wc-tag
      >`;
    }
    if (this.readonly) {
      return html`<wc-tag class="state-tag" intent="danger"
        >${this.i18n.t('readOnlyTag')}</wc-tag
      >`;
    }
    return nothing;
  }

  /** The count below the field, with `maxlength`. */
  private textCount(): string {
    const max = this.maxlength;
    if (typeof max !== 'number' || max < 0) return '';
    return this.i18n.t('characterCount')(this.characters(), max);
  }

  /**
   * A block dragged with the handle drops anywhere in the area, padding included, by height. The
   * listeners capture, so ProseMirror's own drop handling never sees these drags. `dragenter` is
   * cancelled too: outside editable content the browser only drops where it was.
   */
  private readonly areaDragOver = {
    handleEvent: (event: DragEvent) => this.blockHandle.dragOver(event),
    capture: true,
  };

  private readonly areaDrop = {
    handleEvent: (event: DragEvent) => this.blockHandle.drop(event),
    capture: true,
  };

  /** The editable area: Tiptap mounts into `.editor-root`. */
  protected renderEditorArea(): TemplateResult {
    const lines: Record<string, string> = { '--_rows': String(this.rows) };
    if (this.maxRows) lines['--_max-rows'] = String(this.maxRows);
    return html`<div
      class=${classMap({
        'editor-area': true,
        hidden: this.sourceView,
        'with-handle': this.showBlockHandle && !this.disabled && !this.readonly,
      })}
      style=${styleMap(lines)}
      @input=${(event: Event) => event.stopPropagation()}
      @beforeinput=${(event: Event) => event.stopPropagation()}
      @dragenter=${this.areaDragOver}
      @dragover=${this.areaDragOver}
      @drop=${this.areaDrop}
    >
      <div class="editor-root"></div>
    </div>`;
  }

  /** The mention list, slash menu, selection bubble, link editor and block handle. */
  protected renderPopups(): TemplateResult {
    return html`${this.mentions.render()}
      <span class="slash-anchor" aria-hidden="true"></span>
      ${this.slash.render()} ${this.bubble.render()} ${this.link.render()}
      ${this.blockHandle.render()} ${this.blockHandle.renderDropLine()}
      ${this.ai.render()}`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const empty = !this.value || !this.value.trim();
    const { validationText } = this;
    return html`
      <wc-field
        class=${classMap({
          'rich-text-field': true,
          'max-rows': !!this.maxRows,
        })}
        label=${this.label}
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this.skeleton}
        ?focused=${this.editorFocused}
        ?error=${this.error || !!validationText}
        error-text=${this.error ? this.errorText : validationText}
        helper-text=${this.helperText}
        text-count=${this.textCount()}
        variant=${this.variant}
        ?populated=${!empty}
        .host=${this}
      >
        <div class="shell">
          ${this.renderToolbar()} ${this.renderEditorArea()}
          ${this.sourceView
            ? html`<div class="source">
                <wc-code-editor
                  language=${this.sourceLanguage}
                  size=${this.size}
                  wrap
                  .value=${this.value}
                  ?readonly=${this.readonly}
                  ?disabled=${this.disabled}
                  @input=${this.onSourceInput}
                  @change=${(event: Event) => event.stopPropagation()}
                ></wc-code-editor>
              </div>`
            : nothing}
          ${this.renderStateTag()}
        </div>
      </wc-field>
      ${this.renderPopups()}
    `;
  }
}
