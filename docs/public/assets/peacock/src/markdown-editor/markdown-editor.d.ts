import type { Editor } from '@tiptap/core';
import RichTextInput, { type RichTextContent } from '../__internal/rich-text/rich-text-input.js';
/**
 * @label Markdown Editor
 * @tag wc-markdown-editor
 * @rawTag markdown-editor
 *
 * @summary A rich-text field whose value is Markdown: people format text as they type, and can view the Markdown source.
 * @overview
 * <p>Use it where a form needs more than a textarea, such as a description, notes or a release
 * note. People edit formatted text directly; the value is Markdown, so it stores as plain text and
 * shows the same way in <code>wc-markdown</code>.</p>
 *
 * <ul>
 * <li><strong>Toolbar.</strong> Text style, bold, italic, strikethrough, inline code, link, lists,
 * checklist, quote, code block, table, divider and mention. While the caret is in a table, a
 * <em>Table</em> menu adds and removes rows and columns. <code>hide-toolbar</code> hides it.</li>
 * <li><strong>Selection bubble.</strong> Selecting text shows the inline formats and link.</li>
 * <li><strong>Slash menu.</strong> Typing <code>/</code> inserts a block; Markdown shortcuts such
 * as <code>## </code>, <code>- </code> and <code>**bold**</code> work too.</li>
 * <li><strong>Block handle.</strong> Hovering a block shows a handle to drag it and a + to insert
 * one below.</li>
 * <li><strong>View source.</strong> The last toolbar button shows the Markdown, editable, in
 * <code>wc-code-editor</code>.</li>
 * </ul>
 *
 * <p><strong>Mentions.</strong> Typing a character from <code>triggers</code> (<code>@</code> by
 * default) fires <code>search</code> with <code>{ trigger, query }</code>; answer by setting
 * <code>suggestions</code>, and <code>suggestions-loading</code> while you look. A chosen mention is
 * stored as <code>[@Ana Lima](mention:usr_142)</code> and fires <code>mention</code>. Set
 * <code>triggers=""</code> to turn mentions off.</p>
 *
 * <p>The editor is form-associated. It fires <code>input</code> with <code>{ value }</code> as the
 * content changes (after <code>debounce</code> milliseconds without typing) and <code>change</code>
 * when focus leaves after an edit. <code>required</code> blocks an empty submit, and
 * <code>maxlength</code> limits the number of characters and shows a count.</p>
 *
 * <p><code>rows</code> sets the height of the empty editor in lines; it grows with the text, up to
 * <code>max-rows</code> if set, and then scrolls.</p>
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
 * <wc-markdown-editor
 *   label="Description"
 *   value="## Steps\n\n1. Open **billing**"
 * ></wc-markdown-editor>
 * ```
 * @tags input editor
 */
export declare class MarkdownEditor extends RichTextInput {
    static styles: import("lit").CSSResultGroup[];
    protected readonly profile: "markdown";
    protected readonly sourceLanguage: "markdown";
    protected readonly sourceIcon = "markdown";
    protected readFromEditor(editor: Editor): string;
    protected contentFor(value: string): RichTextContent;
    protected defaultPlaceholder(): string;
}
