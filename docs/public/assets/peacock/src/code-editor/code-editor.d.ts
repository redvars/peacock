import { PropertyValues } from 'lit';
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
 * @summary A Monaco-based code editing component with syntax highlighting, completions and debugging marks.
 * @overview
 *  - CodeEditor wraps Monaco Editor as a web component, in the same frame as `wc-code-highlighter`: an optional header with a title and actions, or a copy button that floats at the top end. Monaco is bundled with Peacock and loaded when the first editor appears; nothing comes from a CDN, so it works under a content security policy that allows only its own origin. The code shows as plain text until Monaco is ready.
 *  - Its colors come from the theme's color roles and the code highlighter's syntax colors, so light, dark, the system color scheme and custom themes all follow the tokens.
 *  - Supports TypeScript, JavaScript, JSON, HTML, CSS, SCSS and Markdown, with completions and errors for TypeScript, JavaScript and JSON; read-only mode, line numbers, line wrapping and a minimap.
 *  - `lib-source` adds TypeScript declarations for completions, such as the modules a script may import.
 *  - With `breakpoint-gutter`, a click in the gutter fires `breakpoint-toggle`; `breakpoints` and `current-line` draw the marks a debugger shows.
 *  - `markers` underline problems, such as where a run failed.
 *  - With `fill`, the editor drops its frame and takes the height of its container, as a pane of its own.
 *  - Emits `change` when content is edited and updates value from property changes.
 *
 * @slot title - Header title content. Overrides `label` and shows the header.
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
 * @fires {Event} change - Dispatched when the user edits the content.
 * @fires {CustomEvent<{value: string}>} copied - Dispatched after the copy button copies the content.
 * @fires {CustomEvent<{line: number}>} breakpoint-toggle - Dispatched when the gutter of a line is clicked, with `breakpoint-gutter` set. The component does not change `breakpoints` itself.
 *
 * @example
 * ```html
 * <wc-code-editor
 *   language="css"
 *   label="theme.css"
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
    /** Header title, such as a file name. Shows the header. */
    label: string;
    /** TypeScript declarations (a `.d.ts`) for completions in TypeScript and JavaScript, such as the modules the code may import. */
    libSource: string | undefined;
    /** Compiler options for TypeScript and JavaScript, over the editor's defaults (target and modules ESNext, strict), such as `{ lib: ['es2022'] }`. */
    compilerOptions: Record<string, unknown> | undefined;
    /** Whether line numbers show in the gutter. */
    lineNumbers: 'off' | 'on';
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
    /** Whether the editor text has focus. */
    private hasFocus;
    /** Whether the copy button was just used; shows a check for a moment. */
    private _copied;
    /** The Monaco editor instance, once loaded. */
    private editorMonacoInstance?;
    private editorElement?;
    private probeElement?;
    /** The Monaco API, once loaded. */
    monaco: Monaco | undefined;
    /** This editor's model's address, unique on the page so two editors never share a model. */
    private readonly __id;
    /** Stops listening for theme changes. */
    private __unobserveTheme?;
    /** The system color scheme, watched so the editor follows it. */
    private __colorScheme?;
    /** Re-renders when slotted header content is added or removed. */
    private __childObserver?;
    /** Resets the copied state of the copy button. */
    private __copiedTimer?;
    /** The declarations added for `libSource`. */
    private __lib?;
    /** The breakpoint and current-line marks. */
    private __decorations?;
    /** The font and padding last given to Monaco, to skip unchanged updates. */
    private __layoutKey;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected firstUpdated(): void;
    protected updated(changedProperties: PropertyValues<this>): void;
    initializeMonaco(): Promise<void>;
    setFocus(): Promise<void>;
    setBlur(): Promise<void>;
    /** Scrolls `line` into view and puts the cursor at its start. */
    revealLine(line: number): void;
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
    private __handleCopyClick;
    private __handleWrapClick;
    private renderBadge;
    private renderActions;
    private renderHeader;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
