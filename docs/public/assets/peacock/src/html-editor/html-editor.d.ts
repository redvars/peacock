import type { Editor } from '@tiptap/core';
import RichTextInput, { type RichTextContent } from '../__internal/rich-text/rich-text-input.js';
/**
 * @label HTML Editor
 * @tag wc-html-editor
 * @rawTag html-editor
 *
 * @summary A rich-text field whose value is HTML, with the same toolbar and mentions as the Markdown editor.
 * @overview
 * <p>Use it where the value has to be HTML, such as an email body or a CMS field. It works like
 * <code>wc-markdown-editor</code>: a toolbar, a selection bubble, a slash menu, a block handle,
 * mentions and a <strong>View source</strong> button that shows the HTML in
 * <code>wc-code-editor</code>. HTML can store underline and resizable table columns, which
 * Markdown cannot, so the HTML editor offers them.</p>
 *
 * <p>Get and set the HTML through <code>value</code>; an empty editor has the value
 * <code>''</code>. Only what the editor supports is kept: other tags, attributes and scripts in a
 * value are dropped when it loads.</p>
 *
 * <p><strong>Mentions.</strong> Typing a character from <code>triggers</code> (<code>@</code> by
 * default) fires <code>search</code> with <code>{ trigger, query }</code>; answer by setting
 * <code>suggestions</code>. A mention is stored as
 * <code>&lt;span data-type="mention" data-id="usr_142" data-label="Ana Lima"&gt;@Ana Lima&lt;/span&gt;</code>.</p>
 *
 * <p>The editor is form-associated, fires <code>input</code> and <code>change</code> with
 * <code>{ value }</code>, and supports <code>required</code>, <code>maxlength</code>,
 * <code>rows</code> and <code>max-rows</code>, as the Markdown editor does.</p>
 *
 * <p><strong>Read-only and disabled.</strong> <code>readonly</code> keeps the text at full contrast
 * and leaves only <strong>View source</strong> in the toolbar, which shows the HTML read-only.
 * <code>disabled</code> dims the toolbar and the text. <code>show-readonly-badge</code> adds a
 * lock badge to the toolbar in either state.</p>
 *
 * @cssprop --rich-text-editor-background - Background behind the text.
 * @cssprop --prose-link-color - Color of links.
 * @cssprop --prose-mention-background - Background of mention chips.
 * @cssprop --prose-mention-color - Text color of mention chips.
 * @cssprop --prose-code-background - Background of inline code and code blocks.
 * @cssprop --mention-list-width - Width of the mention suggestion list.
 * @cssprop --mention-list-max-height - Maximum height of the mention suggestion list.
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the content changes, after `debounce` milliseconds without typing.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when focus leaves the editor after an edit.
 * @fires {CustomEvent<{trigger: string, query: string}>} search - Dispatched as a mention is typed; answer with `suggestions`.
 * @fires {CustomEvent<{mention: {id: string, label: string, trigger: string}, suggestion: MentionSuggestion}>} mention - Dispatched when a suggestion is inserted as a mention.
 *
 * @example
 * ```html
 * <wc-html-editor
 *   label="Email body"
 *   value="<p>Hello <strong>world</strong></p>"
 * ></wc-html-editor>
 * ```
 * @tags input editor
 */
export declare class HtmlEditor extends RichTextInput {
    static styles: import("lit").CSSResultGroup[];
    protected readonly profile: "html";
    protected readonly sourceLanguage: "html";
    protected readonly sourceIcon = "html";
    protected readFromEditor(editor: Editor): string;
    protected contentFor(value: string): RichTextContent;
    protected defaultPlaceholder(): string;
}
