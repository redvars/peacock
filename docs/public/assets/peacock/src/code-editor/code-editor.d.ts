import { PropertyValues } from 'lit';
import BaseInput from '../input/BaseInput.js';
export type CodeEditorLanguage = 'javascript' | 'json' | 'html' | 'css' | 'scss';
/**
 * @label Code Editor
 * @tag wc-code-editor
 * @rawTag code-editor
 *
 * @summary A Monaco-based code editing component with syntax highlighting and theming.
 * @overview
 *  - CodeEditor wraps Monaco Editor as a web component.
 *  - Supports JavaScript, JSON, HTML, CSS and SCSS, read-only mode, line numbers, minimap, and dark/light theme.
 *  - Has a copy button; hide it with `hide-copy`.
 *  - Emits `change` when content is edited and updates value from property changes.
 *
 * @cssprop --code-editor-height - Height of the editor. Defaults to 300px.
 *
 * @fires {Event} change - Dispatched when the user edits the content.
 * @fires {CustomEvent<{value: string}>} copied - Dispatched after the copy button copies the content.
 *
 * @example
 * ```html
 * <wc-code-editor
 *   language="css"
 *   readonly
 *   style="width: 100%; --code-editor-height: 10rem;"
 *   value=":root { --color-primary: #6341d5; }">
 * </wc-code-editor>
 * ```
 * @tags input, editor
 */
export default class CodeEditor extends BaseInput {
    static styles: import("lit").CSSResultGroup[];
    /** The code shown in the editor. Updated as the user types. */
    value: string;
    /** Language used for syntax highlighting. Can be changed after the editor loads. */
    language: CodeEditorLanguage;
    /** Extra source loaded as a separate model, e.g. type definitions for completions. */
    libSource: any;
    /** Whether line numbers show in the gutter. */
    lineNumbers: 'off' | 'on';
    /** Shows the minimap. Leave the attribute out to hide it. */
    minimap: boolean;
    /** Hides the copy button. */
    hideCopy: boolean;
    /** Shows a "Read Only" badge while the editor is read-only or disabled. */
    showReadonlyBadge: boolean;
    /** Whether the page is in dark mode; picks the Monaco theme. */
    private _isDarkMode;
    /** Whether the editor text has focus. */
    private hasFocus;
    /** Whether the copy button was just used; shows a check for a few seconds. */
    private _copied;
    /** The Monaco editor instance, once loaded. */
    private editorMonacoInstance?;
    private editorElement;
    /** The Monaco API returned by modern-monaco's init(). */
    monaco: any;
    /** Stops listening for theme changes. */
    private __unobserveTheme?;
    /** Resets the copied state of the copy button. */
    private __copiedTimer?;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected firstUpdated(): void;
    protected updated(changedProperties: PropertyValues<this>): void;
    initializeMonaco(): Promise<void>;
    setFocus(): Promise<void>;
    setBlur(): Promise<void>;
    private libSourceChanged;
    private getTheme;
    private __handleCopyClick;
    private renderToolbar;
    render(): import("lit-html").TemplateResult<1>;
}
