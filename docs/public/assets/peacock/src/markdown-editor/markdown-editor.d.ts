import BaseInput from '../input/BaseInput.js';
/**
 * @label Markdown Editor
 * @tag wc-markdown-editor
 * @rawTag markdown-editor
 *
 * @summary A Tiptap-powered Notion-like Markdown editor with a bottom toggle
 *   between rendered and raw markdown views.
 * @overview
 * <p>The Markdown Editor provides a block-based, Notion-like writing surface
 * built on Tiptap. Type <code>/</code> to open a slash menu for inserting
 * headings, lists, quotes, code blocks, and dividers. Select text to reveal
 * a floating bubble toolbar with inline formatting actions.</p>
 *
 * <p>The canonical <code>value</code> is Markdown. Use the bottom segmented
 * switch to toggle between the rendered editor and the raw markdown source.
 * The component dispatches a <code>change</code> event whenever content
 * changes.</p>
 *
 * @cssprop --markdown-editor-min-height - Minimum height of the editable area. Defaults to 12rem.
 * @cssprop --markdown-editor-bubble-background - Background color of the selection bubble menu.
 * @cssprop --markdown-editor-slash-background - Background color of the slash command menu.
 *
 * @fires {Event} change - Fired whenever the markdown content changes.
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
    /** Placeholder text shown when the editor is empty. */
    placeholder: string;
    /** Visual style of the wrapping field. */
    variant: 'filled' | 'outlined' | 'default';
    /** Helper text displayed below the editor. */
    helperText: string;
    /** Whether to show an error state. */
    error: boolean;
    /** Error message text. */
    errorText: string;
    /** Debounce in milliseconds for dispatching `change`. */
    debounce: number;
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
    private _editorEl;
    private _bubbleEl?;
    private _slashEl?;
    private _blockHandleEl?;
    /** TipTap editor instance. */
    private _editor?;
    /** Debounce timer for the `change` event. */
    private _changeTimeout?;
    /** Most recent slash-suggestion bounding rect (for popup placement). */
    private _slashClientRect;
    /** Slash-suggestion command callback to invoke on selection. */
    private _slashCommand?;
    /** ProseMirror doc position (inside-block) of the block under the handle. */
    private _blockHandleNodePos;
    /** Timer id for delayed hide of the block handle. */
    private _blockHandleHideTimeout?;
    /** Reusable Turndown serializer instance. */
    private _turndown;
    protected firstUpdated(): void;
    disconnectedCallback(): void;
    protected updated(changed: Map<string, unknown>): void;
    private static _normalizeMd;
    private _markdownToHtml;
    private _htmlToMarkdown;
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
    private _dispatchDebouncedChange;
    private _execCommand;
    private _switchMode;
    private _handleSourceChange;
    private _renderToolbarButton;
    private _renderBubbleMenu;
    private _renderSlashMenu;
    private _renderBlockHandle;
    private _renderReadonlyTag;
    render(): import("lit-html").TemplateResult<1>;
}
