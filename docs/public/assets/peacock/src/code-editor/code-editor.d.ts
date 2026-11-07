import { PropertyValues } from 'lit';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import BaseInput from '../input/BaseInput.js';
export type CodeEditorLanguage = 'javascript' | 'typescript' | 'json' | 'html' | 'css' | 'scss' | 'markdown';
export type CodeEditorSize = 'sm' | 'md';
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
 * @summary A code editor built on Monaco, with syntax highlighting, completions and debugging marks.
 * @overview
 * <ul>
 * <li>CodeEditor wraps Monaco Editor as a web component, in the same frame as
 * <code>wc-code-highlighter</code>: an optional header with a title and actions, or a copy button
 * that floats at the top end. Monaco is bundled with Peacock and loaded when the first editor
 * appears; nothing comes from a CDN, so it works under a content security policy that allows only
 * its own origin. The code shows as plain text until Monaco is ready.</li>
 * <li>Its colors come from the theme's color roles and the code highlighter's syntax colors, so
 * light, dark, the system color scheme and custom themes all follow the tokens.</li>
 * <li>Supports TypeScript, JavaScript, JSON, HTML, CSS, SCSS and Markdown, with completions and
 * errors for TypeScript, JavaScript and JSON; read-only mode, line numbers, line wrapping and a
 * minimap.</li>
 * <li><code>lib-source</code> adds TypeScript declarations for completions, such as the modules a
 * script may import.</li>
 * <li>With <code>breakpoint-gutter</code>, a click in the gutter fires
 * <code>breakpoint-toggle</code>; <code>breakpoints</code> and <code>current-line</code> draw the
 * marks a debugger shows.</li>
 * <li><code>markers</code> underline problems, such as where a run failed.</li>
 * <li>With <code>fill</code>, the editor drops its frame and takes the height of its container, as
 * a pane of its own.</li>
 * <li>It is a form field: <code>label</code> shows above the editor (and names it for assistive
 * technology), <code>helper-text</code> below it, <code>error</code> with <code>error-text</code>
 * puts it in its error state, and <code>required</code> blocks form submission while it is empty,
 * with the message shown below once the value is committed or the form is submitted.</li>
 * <li><code>file-name</code> is the header title, such as <code>theme.css</code>.</li>
 * <li>Fires <code>input</code> with <code>{ value }</code> on each edit and <code>change</code> with
 * <code>{ value }</code> when the editor loses focus after an edit.</li>
 * <li><code>size</code> sets the size of the code text: <code>sm</code> or <code>md</code> (the
 * default), as on <code>wc-code-highlighter</code>.</li>
 * <li>Line numbers show by default; <code>line-numbers="false"</code> (or the
 * <code>lineNumbers = false</code> property) hides them.</li>
 * </ul>
 *
 * @slot title - Header title content. Overrides `file-name` and shows the header.
 * @slot icon - Icon shown before the title in the header.
 * @slot actions - Extra action buttons, shown in the header or floating at the top end.
 *
 * @csspart container - The outer frame.
 * @csspart header - The header row.
 * @csspart title - The header title.
 * @csspart actions - The action buttons group.
 * @csspart editor - The area Monaco renders into.
 *
 * @cssprop --code-editor-height - Height of the editing area. Defaults to 300px. Ignored with `fill`.
 * @cssprop --code-editor-background - Frame background. Defaults to `--color-surface-container-low`.
 * @cssprop --code-editor-border-color - Frame border color. Defaults to `--color-outline-variant`.
 * @cssprop --code-editor-shape - Frame corner radius. Defaults to `--shape-corner-medium`.
 * @cssprop --code-highlighter-token-keyword - Keyword color, shared with `wc-code-highlighter`, like the other `--code-highlighter-token-*` colors.
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched on each edit.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the editor loses focus after an edit.
 * @fires {CustomEvent<{value: string}>} copied - Dispatched by the copy button (`wc-copy-button`) after it copies the content.
 * @fires {CustomEvent<{value: string, error: unknown}>} copy-error - Dispatched by the copy button when the content could not be copied.
 * @fires {CustomEvent<{line: number}>} breakpoint-toggle - Dispatched when the gutter of a line is clicked, with `breakpoint-gutter` set. The component does not change `breakpoints` itself.
 *
 * @example
 * ```html
 * <wc-code-editor
 *   language="css"
 *   file-name="theme.css"
 *   readonly
 *   style="width: 100%; --code-editor-height: 10rem;"
 *   value=":root { --color-primary: #6341d5; }">
 * </wc-code-editor>
 * ```
 * @tags input, editor
 */
export declare class CodeEditor extends BaseInput {
    static styles: import("lit").CSSResultGroup[];
    /** The code shown in the editor. Updated as the user types. */
    value: string;
    /** Language used for syntax highlighting. Can be changed after the editor loads. */
    language: CodeEditorLanguage;
    /** Label shown above the editor; also its accessible name. */
    label: string;
    /** Header title, such as a file name. Shows the header when set. */
    fileName: string;
    /** Help text shown below the editor. */
    helperText: string;
    /** Shows the editor in its error state with `error-text`. */
    error: boolean;
    errorText: string;
    /** TypeScript declarations (a `.d.ts`) for completions in TypeScript and JavaScript, such as the modules the code may import. */
    libSource: string | undefined;
    /** Compiler options for TypeScript and JavaScript, over the editor's defaults (target and modules ESNext, strict), such as `{ lib: ['es2022'] }`. */
    compilerOptions: Record<string, unknown> | undefined;
    /** Whether line numbers show in the gutter. On by default; `line-numbers="false"` hides them. */
    lineNumbers: boolean;
    /** Wraps long lines instead of scrolling horizontally. */
    wrap: boolean;
    /** Shows a button that turns line wrapping on and off. */
    wrapToggle: boolean;
    /** Shows the minimap. Leave the attribute out to hide it. */
    minimap: boolean;
    /** Size of the editor. `sm` uses smaller text and padding. */
    size: CodeEditorSize;
    /** Hides the copy button. */
    hideCopy: boolean;
    /** Shows a "Read only" badge while the editor is read-only or disabled. */
    showReadonlyBadge: boolean;
    /** Shows a gutter for breakpoints; a click there, or on a line number, fires `breakpoint-toggle`. */
    breakpointGutter: boolean;
    /** The lines with a breakpoint, from 1. */
    breakpoints: number[];
    /** The line a debugger is paused at, marked and scrolled into view; none when unset. */
    currentLine: number | undefined;
    /** Problems to underline, such as where a run failed. */
    markers: CodeEditorMarker[];
    /** Drops the frame and takes the height of the container instead of `--code-editor-height`. */
    fill: boolean;
    /** Overrides Peacock's strings for this instance only. */
    strings?: Partial<PeacockStrings>;
    /** Whether the editor text has focus. */
    private hasFocus;
    /** The Monaco editor instance, once loaded. */
    private editorMonacoInstance?;
    private editorElement?;
    private probeElement?;
    /** The Monaco API, once loaded. */
    monaco: Monaco | undefined;
    /** This editor's model's address, unique on the page so two editors never share a model. */
    private readonly __id;
    /** Peacock's strings for the toolbar, badge and gutter hovers. */
    private readonly i18n;
    /** Stops listening for theme changes. */
    private __unobserveTheme?;
    /** The system color scheme, watched so the editor follows it. */
    private __colorScheme?;
    /** Re-renders when slotted header content is added or removed. */
    private __childObserver?;
    /** The declarations added for `libSource`. */
    private __lib?;
    /** The breakpoint and current-line marks. */
    private __decorations?;
    /** The font and padding last given to Monaco, to skip unchanged updates. */
    private __layoutKey;
    /** The value when the editor text gained focus; `change` fires on blur when it differs. */
    private __valueAtFocus;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected firstUpdated(): void;
    protected updated(changedProperties: PropertyValues<this>): void;
    initializeMonaco(): Promise<void>;
    focus(): void;
    setFocus(): Promise<void>;
    setBlur(): Promise<void>;
    /** Scrolls `line` into view and puts the cursor at its start. */
    revealLine(line: number): void;
    /** The editor text gained focus: remember the value, to commit on blur. */
    protected handleEditorFocus(): void;
    /** The editor text lost focus: commit the value with `change` when it was edited. */
    protected handleEditorBlur(): void;
    /** Monaco's accessible name. */
    private get __accessibleName();
    /** The text under the editor: the consumer's error, the validation message or the help. */
    private get __footerText();
    /** Dispatches `input` or `change` with the current value. */
    private __emitValue;
    /** Stops Monaco's native `input` events, which cross the shadow boundary, at the editor. */
    private __stopNativeInput;
    /** Defines the page's editor theme from the tokens around this editor. */
    private __applyTheme;
    /** The font and padding the styles give the code, for Monaco's options. */
    private __readLayout;
    /** Gives Monaco the font and padding when the header or size changed them. */
    private __applyLayout;
    /** Whether light-DOM children are assigned to the named slot. */
    private __hasSlotted;
    private libSourceChanged;
    private drawDecorations;
    private drawMarkers;
    /**
     * Hands the copy button the editor's current text just before it copies: a capture listener on
     * the button runs before the button's own click handler, and the text changes as the person
     * types without a re-render.
     */
    private __prepareCopy;
    private __handleWrapClick;
    private renderBadge;
    private renderActions;
    private renderHeader;
    private renderFieldLabel;
    private renderFooter;
    render(): import("lit-html").TemplateResult<1>;
}
export default CodeEditor;
