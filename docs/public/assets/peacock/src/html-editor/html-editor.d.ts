import { type PropertyValues } from 'lit';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import BaseInput, { type ControlValidity } from '../input/BaseInput.js';
/** A mention suggestion. */
export interface HtmlEditorMention {
    label: string;
    value: string;
}
/**
 * @label HTML Editor
 * @tag wc-html-editor
 * @rawTag html-editor
 *
 * @summary A rich text editor for HTML, with formatting actions and a switch to edit the HTML source.
 * @overview
 * <p>The editor is built on Tiptap. It wraps the editable area in a styled <code>wc-field</code>,
 * exposes common formatting actions, and includes a segmented switch between
 * <strong>Visual</strong> and <strong>HTML</strong> source modes.</p>
 *
 * <p>Get and set the HTML content via the <code>value</code> property; an empty editor has the
 * value <code>''</code>. The component fires <code>input</code> with <code>{ value }</code> as the
 * content changes (after <code>debounce</code> milliseconds without typing) and
 * <code>change</code> with <code>{ value }</code> when focus leaves the editor after an edit.
 * With <code>required</code>, an empty editor blocks form submission.</p>
 *
 * <p>Mention suggestions come from the <code>mentions</code> property. With
 * <code>mentions-search="managed"</code> the editor fires <code>mention-search</code> with the
 * typed <code>query</code>; set <code>mentions</code> in response, at once or after a request.</p>
 *
 * <p><code>size</code> sets the text size: <code>sm</code> or <code>md</code> (the default), as on
 * <code>wc-code-editor</code>.</p>
 *
 * @cssprop --html-editor-min-height - Minimum height of the editable area. Defaults to 8rem.
 * @cssprop --html-editor-toolbar-background - Background color of the toolbar.
 * @cssprop --html-editor-toolbar-border-color - Border color between toolbar and editing area.
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the content changes, after `debounce` milliseconds without typing.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when focus leaves the editor after an edit.
 * @fires {CustomEvent<{query: string}>} mention-search - Dispatched in managed mention mode as the user types after the suggestion character. Set `mentions` in response. *
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
    private static _normalizeHtml;
    /** Current HTML value of the editor; `''` while it is empty. */
    value: string;
    /** Label displayed above the editor. */
    label: string;
    /** Placeholder text shown when the editor is empty. Defaults to Peacock's `enterTextPlaceholder` string. */
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
    /** Hides the formatting toolbar of the visual mode. */
    hideToolbar: boolean;
    /** Mention suggestions used by the mention extension. */
    mentions: HtmlEditorMention[];
    /** Mention filtering mode: `contains` filters `mentions`; `managed` fires `mention-search`. */
    mentionsSearch: 'contains' | 'managed';
    /** Character that triggers mention suggestions. */
    suggestionCharacter: string;
    /** Leaves the suggestion character out of rendered mention text. */
    hideSuggestionCharacter: boolean;
    /** Debounce in milliseconds for dispatching `input`. */
    debounce: number;
    /** Overrides Peacock's strings for this instance only. */
    strings?: Partial<PeacockStrings>;
    private _focused;
    private _mode;
    private _editorEl?;
    private _editor?;
    /** Timer of the debounced `input` event. */
    private _inputTimeout?;
    /** Whether focus is somewhere inside the editor. */
    private _focusWithin;
    /** The value when focus entered the editor; `change` fires on leaving when it differs. */
    private _valueAtFocus;
    /** Resolves the pending managed mention search with the next `mentions`. */
    private _resolveMentionSearch?;
    /** Peacock's strings for the toolbar, modes, tags and placeholder. */
    private readonly i18n;
    constructor();
    disconnectedCallback(): void;
    protected firstUpdated(): void;
    protected updated(changed: PropertyValues<this>): void;
    focus(): void;
    /** `required` fails while the editor has no content, even an empty paragraph. */
    protected computeValidity(): ControlValidity;
    /** The editor's content as `value` holds it: normalized HTML, or `''` when empty. */
    private _editorValue;
    /** The `placeholder`, or Peacock's default when it is empty. */
    private _placeholderText;
    /** Whether mention text includes the suggestion character. */
    private _showSuggestionCharacter;
    private _destroyEditor;
    private _initializeEditor;
    private _focusEditorOnContainerClick;
    private _emitValue;
    private _dispatchDebouncedInput;
    /** Fires a pending debounced `input` now. */
    private _flushInput;
    private _onFocusIn;
    private _onFocusOut;
    /** Commits the value: `change` when it differs from the value when focus entered. */
    private _commit;
    private _requestManagedMentions;
    private _getMentionItem;
    private _execCommand;
    private _switchMode;
    /** The source editor's `input`: take its value. */
    private _handleSourceInput;
    /** The source editor's own `change`; the editor commits when focus leaves it as a whole. */
    private _stopEvent;
    private _toolbarButton;
    private _renderToolbar;
    private _renderReadonlyTag;
    render(): import("lit-html").TemplateResult<1>;
}
