import BaseInput from '../input/BaseInput.js';
/**
 * @label HTML Editor
 * @tag wc-html-editor
 * @rawTag html-editor
 *
 * @summary A Tiptap-powered HTML editor with visual and source editing modes.
 * @overview
 * <p>The HTML Editor provides a rich-text editing experience built on Tiptap.
 * It wraps the editable area in A styled <code>wc-field</code>,
 * exposes common formatting actions, and includes a segmented switch between
 * <strong>Visual</strong> and <strong>HTML</strong> source modes.</p>
 *
 * <p>Get and set the HTML content via the <code>value</code> property. The component
 * dispatches a <code>change</code> event whenever the content is modified.
 * Mention suggestions are supported through the <code>mentions</code> property,
 * with optional externally managed lookup via the <code>search</code> event.</p>
 *
 * @cssprop --html-editor-min-height - Minimum height of the editable area. Defaults to 8rem.
 * @cssprop --html-editor-toolbar-background - Background color of the toolbar.
 * @cssprop --html-editor-toolbar-border-color - Border color between toolbar and editing area.
 *
 * @fires {Event} change - Fired whenever the editable content changes.
 * @fires {CustomEvent} search - Fired in managed mention mode with { query, callback } detail.
 *
 * @example
 * ```html
 * <wc-html-editor
 *   label="Description"
 *   value="<p>Hello <strong>world</strong></p>"
 *   .mentions="[{ label: 'Alex', value: 'alex' }]"
 * ></wc-html-editor>
 * ```
 * @tags input editor
 */
export declare class HtmlEditor extends BaseInput {
    static styles: import("lit").CSSResultGroup[];
    private _editor?;
    private _changeTimeout?;
    /** Current HTML value of the editor. */
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
    /** Whether toolbar controls should be displayed in visual mode. */
    showToolbar: boolean;
    /** Mention suggestions used by the mention extension. */
    mentions: Array<{
        label: string;
        value: string;
    }>;
    /** Mention filtering mode. */
    mentionsSearch: 'contains' | 'managed';
    /** Character that triggers mention suggestions. */
    suggestionCharacter: string;
    /** Whether to include the suggestion character in rendered mention text. */
    showSuggestionCharacter: boolean;
    /** Debounce in milliseconds for dispatching `change`. */
    debounce: number;
    private _focused;
    private _mode;
    private _editorEl;
    protected firstUpdated(): void;
    disconnectedCallback(): void;
    protected updated(changed: Map<string, unknown>): void;
    private static _normalizeHtml;
    private _destroyEditor;
    private _initializeEditor;
    private _focusEditorOnContainerClick;
    private _dispatchDebouncedChange;
    private _requestManagedMentions;
    private _getMentionItem;
    private _execCommand;
    private _switchMode;
    private _handleSourceChange;
    private _toolbarButton;
    private _renderToolbar;
    private _renderReadonlyTag;
    render(): import("lit-html").TemplateResult<1>;
}
