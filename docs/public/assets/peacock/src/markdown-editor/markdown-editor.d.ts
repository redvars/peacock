import { type PropertyValues } from 'lit';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import BaseInput from '../input/BaseInput.js';
/**
 * @label Markdown Editor
 * @tag wc-markdown-editor
 * @rawTag markdown-editor
 *
 * @summary A block-based Markdown editor with a slash menu and a formatting toolbar, and a switch between rendered and raw Markdown.
 * @overview
 * <p>The editor is built on Tiptap. Type <code>/</code> to open a slash menu for inserting
 * headings, lists, quotes, code blocks, and dividers. Select text to reveal
 * a floating bubble toolbar with inline formatting actions.</p>
 *
 * <p>The canonical <code>value</code> is Markdown. Use the bottom segmented
 * switch to toggle between the rendered editor and the raw markdown source.
 * The component fires <code>input</code> with <code>{ value }</code> as the content changes
 * (after <code>debounce</code> milliseconds without typing) and <code>change</code> with
 * <code>{ value }</code> when focus leaves the editor after an edit. With
 * <code>required</code>, an empty editor blocks form submission.</p>
 *
 * <p><code>size</code> sets the text size: <code>sm</code> or <code>md</code> (the default), as on
 * <code>wc-code-editor</code>.</p>
 *
 * @cssprop --markdown-editor-min-height - Minimum height of the editable area. Defaults to 12rem.
 * @cssprop --markdown-editor-bubble-background - Background color of the selection bubble menu.
 * @cssprop --markdown-editor-slash-background - Background color of the slash command menu.
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the content changes, after `debounce` milliseconds without typing.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when focus leaves the editor after an edit.
 *
 * @example
 * ```html
 * <wc-markdown-editor
 *   label="Notes"
 *   value="# Hello\n\nType a slash on a new line to insert blocks."
 * ></wc-markdown-editor>
 * ```
 * @tags input editor
 */
export declare class MarkdownEditor extends BaseInput {
    static styles: import("lit").CSSResultGroup[];
    /** Current Markdown value of the editor. */
    value: string;
    /** Label displayed above the editor. */
    label: string;
    /** Placeholder text shown when the editor is empty. Defaults to Peacock's "Type '/' for commands…". */
    placeholder: string;
    /** Visual style of the wrapping field. */
    variant: 'filled' | 'outlined' | 'default';
    /** Size of the text: `sm` or `md`. */
    size: 'sm' | 'md';
    /** Helper text displayed below the editor. */
    helperText: string;
    /** Whether to show an error state. */
    error: boolean;
    /** Error message text. */
    errorText: string;
    /** Debounce in milliseconds for dispatching `input`. */
    debounce: number;
    /** Overrides Peacock's strings for this instance only. */
    strings?: Partial<PeacockStrings>;
    /** Whether the editor currently has focus. */
    private _focused;
    /** Current view mode: rendered editor or raw markdown. */
    private _mode;
    /** Whether the bubble toolbar is visible. */
    private _bubbleOpen;
    /** Whether the slash command menu is visible. */
    private _slashOpen;
    /** Filtered slash menu items. */
    private _slashItems;
    /** Currently highlighted slash menu index. */
    private _slashIndex;
    /** Whether the block handle panel is visible. */
    private _blockHandleVisible;
    private _editorEl?;
    private _bubbleEl?;
    private _slashEl?;
    private _blockHandleEl?;
    /** TipTap editor instance. */
    private _editor?;
    /** Debounce timer for the `input` event. */
    private _inputTimeout?;
    /** Whether focus is somewhere inside the editor. */
    private _focusWithin;
    /** The value when focus entered the editor; `change` fires on leaving when it differs. */
    private _valueAtFocus;
    /** Most recent slash-suggestion bounding rect (for popup placement). */
    private _slashClientRect;
    /** Slash-suggestion command callback to invoke on selection. */
    private _slashCommand?;
    /** ProseMirror doc position (inside-block) of the block under the handle. */
    private _blockHandleNodePos;
    /** Timer id for delayed hide of the block handle. */
    private _blockHandleHideTimeout?;
    /** Peacock's strings for the menus, handles, modes, tags and placeholder. */
    private readonly i18n;
    /** Reusable Turndown serializer instance. */
    private _turndown;
    constructor();
    protected firstUpdated(): void;
    disconnectedCallback(): void;
    protected updated(changed: PropertyValues<this>): void;
    focus(): void;
    private static _normalizeMd;
    private _markdownToHtml;
    private _htmlToMarkdown;
    /** The `placeholder`, or Peacock's default when it is empty. */
    private _placeholderText;
    private _destroyEditor;
    private _initializeEditor;
    private _focusEditorOnContainerClick;
    private _buildSlashExtension;
    private _positionSlashMenu;
    private _onSlashItemClick;
    private _buildBlockHandleExtension;
    private _positionBlockHandle;
    private _onBlockHandleMouseEnter;
    private _onBlockHandleMouseLeave;
    private _onInsertBlockClick;
    private _onDragHandleMouseDown;
    private _onDragHandleDragStart;
    private _onDragHandleDragEnd;
    private _updateBubbleMenu;
    private _emitValue;
    private _dispatchDebouncedInput;
    /** Fires a pending debounced `input` now. */
    private _flushInput;
    private _onFocusIn;
    private _onFocusOut;
    /** Commits the value: `change` when it differs from the value when focus entered. */
    private _commit;
    private _stopEvent;
    private _execCommand;
    private _switchMode;
    /** The source editor's `input`: take its value. */
    private _handleSourceInput;
    private _renderToolbarButton;
    private _renderBubbleMenu;
    private _renderSlashMenu;
    private _renderBlockHandle;
    private _renderReadonlyTag;
    render(): import("lit-html").TemplateResult<1>;
}
