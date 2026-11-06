import { PropertyValues } from 'lit';
import BaseInput from '../input/BaseInput.js';
export type CodeEditorLanguage = 'javascript' | 'typescript' | 'json' | 'html' | 'css' | 'scss' | 'markdown';
/** A problem shown in the editor: a squiggle under the text and a mark in the scroll bar. Lines and columns count from 1. */
export type CodeEditorMarker = {
    line: number;
    column?: number;
    endLine?: number;
    endColumn?: number;
    message: string;
    severity?: 'error' | 'warning' | 'info';
};
type Monaco = typeof import('./monaco.js');
/**
 * @label Code Editor
 * @tag wc-code-editor
 * @rawTag code-editor
 *
 * @summary A Monaco-based code editing component with syntax highlighting, completions and debugging marks.
 * @overview
 *  - CodeEditor wraps Monaco Editor as a web component. Monaco is bundled with Peacock and loaded when the first editor appears; nothing comes from a CDN, so it works under a content security policy that allows only its own origin.
 *  - Supports TypeScript, JavaScript, JSON, HTML, CSS, SCSS and Markdown, with completions and errors for TypeScript, JavaScript and JSON; read-only mode, line numbers, minimap, and dark/light theme.
 *  - `lib-source` adds TypeScript declarations for completions, such as the modules a script may import.
 *  - With `breakpoint-gutter`, a click in the gutter fires `breakpoint-toggle`; `breakpoints` and `current-line` draw the marks a debugger shows.
 *  - `markers` underline problems, such as where a run failed.
 *  - With `fill`, the editor takes the height of its container.
 *  - Has a copy button; hide it with `hide-copy`.
 *  - Emits `change` when content is edited and updates value from property changes.
 *
 * @cssprop --code-editor-height - Height of the editor. Defaults to 300px.
 *
 * @fires {Event} change - Dispatched when the user edits the content.
 * @fires {CustomEvent<{value: string}>} copied - Dispatched after the copy button copies the content.
 * @fires {CustomEvent<{line: number}>} breakpoint-toggle - Dispatched when the gutter of a line is clicked, with `breakpoint-gutter` set. The component does not change `breakpoints` itself.
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
    /** TypeScript declarations (a `.d.ts`) for completions in TypeScript and JavaScript, such as the modules the code may import. */
    libSource: string | undefined;
    /** Compiler options for TypeScript and JavaScript, over the editor's defaults (target and modules ESNext, strict), such as `{ lib: ['es2022'] }`. */
    compilerOptions: Record<string, unknown> | undefined;
    /** Whether line numbers show in the gutter. */
    lineNumbers: 'off' | 'on';
    /** Shows the minimap. Leave the attribute out to hide it. */
    minimap: boolean;
    /** Hides the copy button. */
    hideCopy: boolean;
    /** Shows a "Read Only" badge while the editor is read-only or disabled. */
    showReadonlyBadge: boolean;
    /** Shows a gutter for breakpoints; a click there, or on a line number, fires `breakpoint-toggle`. */
    breakpointGutter: boolean;
    /** The lines with a breakpoint, from 1. */
    breakpoints: number[];
    /** The line a debugger is paused at, marked and scrolled into view; none when unset. */
    currentLine: number | undefined;
    /** Problems to underline, such as where a run failed. */
    markers: CodeEditorMarker[];
    /** Takes the height of the container instead of `--code-editor-height`. */
    fill: boolean;
    /** Whether the page is in dark mode; picks the Monaco theme. */
    private _isDarkMode;
    /** Whether the editor text has focus. */
    private hasFocus;
    /** Whether the copy button was just used; shows a check for a few seconds. */
    private _copied;
    /** The Monaco editor instance, once loaded. */
    private editorMonacoInstance?;
    private editorElement;
    /** The Monaco API, once loaded. */
    monaco: Monaco | undefined;
    /** This editor's model's address, unique on the page so two editors never share a model. */
    private readonly __id;
    /** Stops listening for theme changes. */
    private __unobserveTheme?;
    /** Resets the copied state of the copy button. */
    private __copiedTimer?;
    /** The declarations added for `libSource`. */
    private __lib?;
    /** The breakpoint and current-line marks. */
    private __decorations?;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected firstUpdated(): void;
    protected updated(changedProperties: PropertyValues<this>): void;
    initializeMonaco(): Promise<void>;
    setFocus(): Promise<void>;
    setBlur(): Promise<void>;
    /** Scrolls `line` into view and puts the cursor at its start. */
    revealLine(line: number): void;
    private libSourceChanged;
    private drawDecorations;
    private drawMarkers;
    private getTheme;
    private __handleCopyClick;
    private renderToolbar;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
