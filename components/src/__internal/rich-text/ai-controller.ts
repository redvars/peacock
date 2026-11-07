import {
  html,
  nothing,
  type ReactiveController,
  type ReactiveControllerHost,
  type TemplateResult,
} from 'lit';
import { Extension, type Editor, type JSONContent } from '@tiptap/core';
import { Plugin, PluginKey, type Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { editScript } from '../../diff-viewer/diff.js';
import { AiController } from '../ai/ai-controller.js';
import { sparkle } from '../ai/sparkle.js';
import { readStream } from '../ai/stream.js';
import type { AiTransformAction } from '../ai/types.js';
import { FloatingController } from '../controllers/floating-controller.js';
import { OverlayController } from '../controllers/overlay-controller.js';
import type { I18nController } from '../i18n/i18n-controller.js';
import type { PeacockStringKey } from '../i18n/strings.js';
import { SET_VALUE_META } from './extensions.js';
import type { SlashAction } from './slash-controller.js';

interface AiEditorHost extends ReactiveControllerHost, HTMLElement {
  readonly renderRoot: HTMLElement | DocumentFragment;
  disabled: boolean;
  readonly: boolean;
  sensitive?: boolean;
  noAi?: boolean;
  /** Ghost text after a pause in typing. */
  aiCompletion?: boolean;
  label?: string;
}

interface AiEditorOptions {
  editor: () => Editor | undefined;
  i18n: I18nController;
}

/** What the preview panel shows. */
type PanelState = 'menu' | 'instruction' | 'streaming' | 'done' | 'error';

interface Panel {
  state: PanelState;
  action: AiTransformAction;
  /** The range the result replaces; empty for text inserted at the caret. */
  from: number;
  to: number;
  /** The text sent to the model: the selection, or the text before the caret. */
  source: string;
  /** The text the result replaces, for the Changes view; empty when inserting. */
  original: string;
  result: string;
  instruction: string;
  view: 'result' | 'changes';
  /** Whether focus moved into the panel, so it goes back to the editor on close. */
  focused: boolean;
}

/** A selection action: its string, the provider action, and whether it asks for input first. */
const SELECTION_ACTIONS: Array<{
  label: PeacockStringKey;
  action: AiTransformAction;
  asks?: boolean;
}> = [
  { label: 'aiImprove', action: 'improve' },
  { label: 'aiShorten', action: 'shorten' },
  { label: 'aiFix', action: 'fix' },
  { label: 'aiTranslate', action: 'translate', asks: true },
  { label: 'aiCustom', action: 'custom', asks: true },
];

const ACTION_LABELS: Record<AiTransformAction, PeacockStringKey> = {
  improve: 'aiImprove',
  shorten: 'aiShorten',
  fix: 'aiFix',
  translate: 'aiTranslate',
  custom: 'aiCustom',
  continue: 'aiContinue',
  summarize: 'aiSummarizeAbove',
};

/** Marks the transactions that only redraw the ghost text. */
const GHOST_META = 'peacockAiGhost';

/** How much text around the caret a request carries. */
const CONTEXT_BEFORE = 4000;
const CONTEXT_AFTER = 1000;

/** Milliseconds without typing before ghost text is asked for. */
const GHOST_DELAY = 600;

let aiCount = 0;

/** The panel's own field events are not the editor's value events. */
const stopEvent = (event: Event) => event.stopPropagation();

/**
 * Model text as editor content, never parsed as HTML or Markdown (ADR-030002: model text is
 * untrusted): paragraphs split on blank lines, single line breaks kept as spaces. The first
 * paragraph is inline, so it joins the paragraph it is inserted into.
 */
export function textToContent(text: string): JSONContent[] {
  const paragraphs = text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map(part => part.replace(/\s*\n\s*/g, ' '))
    .filter(part => part.trim().length > 0);
  if (!paragraphs.length) return [];
  const [first, ...rest] = paragraphs;
  return [
    { type: 'text', text: first },
    ...rest.map(part => ({
      type: 'paragraph',
      content: [{ type: 'text', text: part }],
    })),
  ];
}

/** One run of an inline word diff. */
export interface InlineDiffRun {
  op: 'equal' | 'delete' | 'insert';
  text: string;
}

/**
 * The changes from `before` to `after`, word by word, as one interleaved sequence for reading in
 * place: deletions next to the insertions that replace them. Falls back to "all deleted, all
 * inserted" when the texts are too different to align.
 */
export function inlineDiff(before: string, after: string): InlineDiffRun[] {
  const a = before.split(/(\s+)/).filter(Boolean);
  const b = after.split(/(\s+)/).filter(Boolean);
  const ids = new Map<string, number>();
  const id = (token: string) => {
    if (!ids.has(token)) ids.set(token, ids.size);
    return ids.get(token) as number;
  };
  const ops = editScript(a.map(id), b.map(id), 400);
  if (!ops) {
    return [
      ...(before ? [{ op: 'delete' as const, text: before }] : []),
      ...(after ? [{ op: 'insert' as const, text: after }] : []),
    ];
  }
  // Tokens in edit order; a change block collects everything between real matches.
  const steps: InlineDiffRun[] = [];
  let i = 0;
  let j = 0;
  for (const op of ops) {
    if (op === 'equal') {
      steps.push({ op, text: a[i] });
      i += 1;
      j += 1;
    } else if (op === 'delete') {
      steps.push({ op, text: a[i] });
      i += 1;
    } else {
      steps.push({ op, text: b[j] });
      j += 1;
    }
  }
  const runs: InlineDiffRun[] = [];
  let removed = '';
  let added = '';
  const flush = () => {
    if (removed) runs.push({ op: 'delete', text: removed });
    if (added) runs.push({ op: 'insert', text: added });
    removed = '';
    added = '';
  };
  steps.forEach((step, index) => {
    const changing = removed || added;
    const nextChanges = steps
      .slice(index + 1)
      .find(next => next.op !== 'equal' || next.text.trim());
    // A space matched between two changes reads better inside the change.
    const absorbed =
      step.op === 'equal' &&
      !step.text.trim() &&
      changing &&
      nextChanges &&
      nextChanges.op !== 'equal';
    if (step.op === 'delete') removed += step.text;
    else if (step.op === 'insert') added += step.text;
    else if (absorbed) {
      removed += step.text;
      added += step.text;
    } else {
      flush();
      const last = runs[runs.length - 1];
      if (last?.op === 'equal') last.text += step.text;
      else runs.push({ op: 'equal', text: step.text });
    }
  });
  flush();
  return runs;
}

/**
 * The AI layer of Peacock's rich-text editors (ADR-030002): ghost text after a pause in typing,
 * actions on the selection (Improve, Shorten, Fix, Translate, Tell it what to change) from the
 * selection bubble or the toolbar, and Continue writing and Summarize above in the slash menu.
 *
 * Nothing the model writes reaches the document until the person takes it: ghost text needs Tab,
 * and an action's result streams into a preview panel with Accept, Discard and Try again, and a
 * Changes view for rewrites. The editor stays editable meanwhile; the range the result will
 * replace follows edits.
 *
 * Every feature is offered only while the provider has it, AI is on, and the host is neither
 * `no-ai` nor `sensitive`.
 */
export class RichTextAiController implements ReactiveController {
  private readonly host: AiEditorHost;

  private readonly options: AiEditorOptions;

  private readonly transform: AiController;

  private readonly complete: AiController;

  private readonly id = `wc-rich-text-ai-${(aiCount += 1)}`;

  private readonly floating: FloatingController;

  private readonly overlay: OverlayController;

  private panel: Panel | null = null;

  private shown = false;

  private ghost: { text: string; pos: number } | null = null;

  private ghostTimer?: number;

  private ghostRequest?: AbortController;

  constructor(host: AiEditorHost, options: AiEditorOptions) {
    this.host = host;
    this.options = options;
    host.addController(this);
    this.transform = new AiController(host, 'transform');
    this.complete = new AiController(host, 'complete');
    this.floating = new FloatingController(host, {
      placement: 'bottom-start',
      strategy: 'fixed',
      offset: 8,
      trigger: 'manual',
      closeOnClickOutside: false,
      fitViewport: true,
    });
    this.overlay = new OverlayController(host, {
      surface: () => this.panelElement,
      closeOnEscape: () => true,
      focusOnOpen: () => false,
      restoreFocus: () => false,
      requestClose: () => this.discard(),
    });
  }

  hostUpdated() {
    const show = !!this.panel;
    if (show !== this.shown) {
      this.shown = show;
      if (show) {
        this.overlay.sync(true);
        this.place();
        this.floating.open();
      } else {
        this.floating.close();
        this.overlay.sync(false);
      }
    } else if (show) {
      this.place();
    }
    this.syncGhostAria();
  }

  hostDisconnected() {
    this.clearGhost();
    this.transform.abort();
    this.panel = null;
    this.shown = false;
  }

  // ── Availability ─────────────────────────────────────────────────────────

  /** Whether the selection actions and slash actions are offered. */
  get actionsAvailable(): boolean {
    return this.transform.available && this.editable;
  }

  /** Whether the preview panel is open; other popups stay closed meanwhile. */
  get open(): boolean {
    return !!this.panel;
  }

  private get editable(): boolean {
    const editor = this.options.editor();
    return (
      !!editor &&
      !editor.isDestroyed &&
      editor.isEditable &&
      !this.host.disabled &&
      !this.host.readonly
    );
  }

  private get ghostAvailable(): boolean {
    return !!this.host.aiCompletion && this.complete.available && this.editable;
  }

  // ── Tiptap extension ─────────────────────────────────────────────────────

  /** The extension for ghost text and for keeping the preview's range on edits. */
  extension() {
    const controller = this;
    const key = new PluginKey('peacockAi');
    return Extension.create({
      name: 'peacockAi',
      // Before list indentation, so Tab takes ghost text first.
      priority: 1000,
      addKeyboardShortcuts() {
        return {
          Tab: () => controller.acceptGhost('all'),
          'Mod-ArrowRight': () => controller.acceptGhost('word'),
          Escape: () => controller.dismissGhost(),
        };
      },
      addProseMirrorPlugins() {
        return [
          new Plugin({
            key,
            props: {
              decorations: state => {
                const { ghost } = controller;
                if (!ghost || ghost.pos > state.doc.content.size) return null;
                const widget = Decoration.widget(
                  ghost.pos,
                  () => {
                    const span = document.createElement('span');
                    span.className = 'ghost-text';
                    span.setAttribute('aria-hidden', 'true');
                    span.textContent = ghost.text;
                    return span;
                  },
                  { side: 1, key: `ghost:${ghost.text}` },
                );
                return DecorationSet.create(state.doc, [widget]);
              },
            },
          }),
        ];
      },
      onTransaction({ transaction }) {
        controller.onTransaction(transaction);
      },
      onBlur() {
        controller.clearGhost();
      },
    });
  }

  // ── Slash and bubble ─────────────────────────────────────────────────────

  /** Continue writing and Summarize above, for the slash menu. */
  slashActions(): SlashAction[] {
    if (!this.actionsAvailable) return [];
    const { i18n } = this.options;
    const group = i18n.t('aiAssistantGroup');
    return [
      {
        id: 'ai-continue',
        label: i18n.t('aiContinue'),
        glyph: sparkle,
        group,
        run: () => this.start('continue'),
      },
      {
        id: 'ai-summarize',
        label: i18n.t('aiSummarizeAbove'),
        glyph: sparkle,
        group,
        run: () => this.start('summarize'),
      },
    ];
  }

  /** The Ask AI button for the selection bubble; nothing while actions are unavailable. */
  bubbleButton(): TemplateResult | typeof nothing {
    if (!this.actionsAvailable) return nothing;
    return html`<span class="bubble-divider" aria-hidden="true"></span>
      <button
        class="bubble-ai"
        type="button"
        @click=${() => this.openMenu(false)}
      >
        ${sparkle}${this.options.i18n.t('aiAskAi')}
      </button>`;
  }

  /** The Ask AI tool for the fixed toolbar, so the actions are reachable from the keyboard. */
  toolbarButton(): TemplateResult | typeof nothing {
    if (!this.actionsAvailable) return nothing;
    const label = this.options.i18n.t('aiAskAi');
    return html`<wc-icon-button
      class="tool ai-tool"
      variant="text"
      color="surface"
      shape="round"
      size="xs"
      aria-label=${label}
      aria-haspopup="menu"
      tooltip=${label}
      @click=${() => this.openMenu(true)}
      >${sparkle}</wc-icon-button
    >`;
  }

  // ── Panel actions ────────────────────────────────────────────────────────

  /** Opens the list of selection actions, for the selection or the paragraph at the caret. */
  openMenu(focus: boolean) {
    const editor = this.options.editor();
    if (!editor || !this.actionsAvailable) return;
    const { from, to } = this.selectionRange(editor);
    this.panel = {
      state: 'menu',
      action: 'improve',
      from,
      to,
      source: '',
      original: '',
      result: '',
      instruction: '',
      view: 'result',
      focused: focus,
    };
    this.host.requestUpdate();
    if (focus) this.focusPanel('.ai-menu-item');
  }

  /** Starts an action: on the selection, or for `continue`/`summarize` on the text before the caret. */
  start(action: AiTransformAction, focus = false) {
    const editor = this.options.editor();
    if (!editor || !this.actionsAvailable) return;
    const { doc, selection } = editor.state;
    const inserting = action === 'continue' || action === 'summarize';
    const range = inserting
      ? { from: selection.to, to: selection.to }
      : (this.panel ?? this.selectionRange(editor));
    const source = inserting
      ? doc.textBetween(0, range.to, '\n\n', ' ').slice(-CONTEXT_BEFORE)
      : doc.textBetween(range.from, range.to, '\n\n', ' ');
    const asks = SELECTION_ACTIONS.find(item => item.action === action)?.asks;
    this.panel = {
      state: asks ? 'instruction' : 'streaming',
      action,
      from: range.from,
      to: range.to,
      source,
      original: inserting ? '' : source,
      result: '',
      instruction: '',
      view: 'result',
      focused: focus || !!asks || !!this.panel?.focused,
    };
    this.host.requestUpdate();
    if (asks) this.focusPanel('.ai-instruction');
    else this.run();
  }

  /** Puts the result into the document, replacing the range, and closes the panel. */
  accept() {
    const { panel } = this;
    const editor = this.options.editor();
    if (!panel || !editor || panel.state !== 'done') return;
    const content = textToContent(panel.result);
    this.close();
    if (!content.length) return;
    editor
      .chain()
      .focus()
      .insertContentAt({ from: panel.from, to: panel.to }, content)
      .run();
  }

  /** Closes the panel and leaves the document as it was. */
  discard() {
    if (!this.panel) return;
    this.transform.abort();
    this.close();
  }

  /** Asks again with the same text and instruction. */
  retry() {
    if (!this.panel) return;
    this.run();
  }

  /** Stops the answer where it is; what arrived can still be accepted. */
  stop() {
    this.transform.abort();
    const { panel } = this;
    if (!panel) return;
    panel.state = panel.result ? 'done' : 'error';
    this.host.requestUpdate();
  }

  // ── Ghost text ───────────────────────────────────────────────────────────

  /** Clears ghost text and any request for it. */
  clearGhost() {
    window.clearTimeout(this.ghostTimer);
    this.ghostTimer = undefined;
    this.ghostRequest?.abort();
    this.ghostRequest = undefined;
    if (!this.ghost) return;
    this.ghost = null;
    this.redrawGhost();
  }

  private scheduleGhost() {
    this.clearGhost();
    if (!this.ghostAvailable) return;
    this.ghostTimer = window.setTimeout(() => this.requestGhost(), GHOST_DELAY);
  }

  private async requestGhost() {
    const editor = this.options.editor();
    const { provider } = this.complete;
    if (!editor || !provider?.complete || !this.ghostAvailable) return;
    if (!editor.isFocused || this.panel) return;
    const { selection, doc } = editor.state;
    const { $from } = selection;
    // Only at the end of a paragraph, where text after the caret can't be in the way.
    if (!selection.empty || $from.parentOffset !== $from.parent.content.size) {
      return;
    }
    const line = $from.parent.textContent;
    if (!line.trim()) return;
    // A slash command or mention being typed has its own menu.
    if (/(^|\s)[/@#]\S*$/.test(line)) return;
    const pos = selection.from;
    const request = new AbortController();
    this.ghostRequest = request;
    try {
      const text = await provider.complete({
        signal: request.signal,
        context: this.complete.context(),
        before: doc.textBetween(0, pos, '\n\n', ' ').slice(-CONTEXT_BEFORE),
        after: doc
          .textBetween(pos, doc.content.size, '\n\n', ' ')
          .slice(0, CONTEXT_AFTER),
      });
      if (request.signal.aborted || !text) return;
      if (editor.state.doc !== doc || editor.state.selection.from !== pos) {
        return;
      }
      this.ghost = { text: text.replace(/\n+/g, ' '), pos };
      this.redrawGhost();
    } catch {
      // No ghost text this time; typing goes on as usual.
    } finally {
      if (this.ghostRequest === request) this.ghostRequest = undefined;
    }
  }

  /** Tab takes all of the ghost text, Mod+→ the next word. Returns whether it handled the key. */
  private acceptGhost(part: 'all' | 'word'): boolean {
    const { ghost } = this;
    const editor = this.options.editor();
    if (!ghost || !editor) return false;
    const taken =
      part === 'all' ? ghost.text : (/^\s*\S+/.exec(ghost.text)?.[0] ?? '');
    if (!taken) return false;
    const rest = ghost.text.slice(taken.length);
    this.ghost = null;
    // A text node, so model text is never parsed as HTML.
    editor
      .chain()
      .insertContentAt(ghost.pos, { type: 'text', text: taken })
      .run();
    if (rest) {
      this.ghost = { text: rest, pos: ghost.pos + taken.length };
      this.redrawGhost();
    }
    return true;
  }

  private dismissGhost(): boolean {
    if (!this.ghost) return false;
    this.clearGhost();
    return true;
  }

  private redrawGhost() {
    const editor = this.options.editor();
    if (!editor || editor.isDestroyed) return;
    editor.view.dispatch(editor.state.tr.setMeta(GHOST_META, true));
  }

  private syncGhostAria() {
    const editor = this.options.editor();
    if (!editor || editor.isDestroyed) return;
    const { dom } = editor.view;
    const id = `${this.id}-ghost`;
    const ids = (dom.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter(item => item && item !== id);
    if (this.ghost) ids.push(id);
    if (ids.length) dom.setAttribute('aria-describedby', ids.join(' '));
    else dom.removeAttribute('aria-describedby');
  }

  private onTransaction(transaction: Transaction) {
    if (transaction.getMeta(GHOST_META)) return;
    const { panel } = this;
    if (panel && transaction.docChanged) {
      panel.from = transaction.mapping.map(panel.from, -1);
      panel.to = transaction.mapping.map(panel.to, 1);
    }
    if (transaction.docChanged && !transaction.getMeta(SET_VALUE_META)) {
      // The person typed: what was suggested no longer fits; ask again after a pause.
      if (this.host.aiCompletion) this.scheduleGhost();
      else this.clearGhost();
    } else if (transaction.selectionSet) {
      this.clearGhost();
    }
  }

  // ── Internals ────────────────────────────────────────────────────────────

  /** The selection, or the paragraph at the caret when nothing is selected. */
  private selectionRange(editor: Editor): { from: number; to: number } {
    const { selection } = editor.state;
    if (!selection.empty) return { from: selection.from, to: selection.to };
    const { $from } = selection;
    return { from: $from.start(), to: $from.end() };
  }

  private async run() {
    const { panel } = this;
    const { provider } = this.transform;
    if (!panel || !provider?.transform) return;
    panel.state = 'streaming';
    panel.result = '';
    panel.view = 'result';
    this.host.requestUpdate();
    const { action, source, instruction } = panel;
    const text = await this.transform.run(signal =>
      readStream(
        provider.transform!({
          signal,
          context: this.transform.context(),
          action,
          text: source,
          ...(action === 'custom' ? { instruction } : {}),
          ...(action === 'translate' ? { targetLocale: instruction } : {}),
        }),
        partial => {
          if (this.panel !== panel) return;
          panel.result = partial;
          this.host.requestUpdate();
        },
        signal,
      ),
    );
    if (this.panel !== panel || panel.state !== 'streaming') return;
    if (text === undefined) {
      // Failed, or stopped before anything arrived.
      panel.state = panel.result ? 'done' : 'error';
    } else {
      panel.result = text;
      panel.state = text.trim() ? 'done' : 'error';
    }
    this.host.requestUpdate();
  }

  private close() {
    const focused = this.panel?.focused;
    this.panel = null;
    this.host.requestUpdate();
    if (focused) this.options.editor()?.commands.focus();
  }

  private focusPanel(selector: string) {
    this.host.updateComplete.then(() => {
      const target = this.panelElement?.querySelector<HTMLElement>(selector);
      target?.focus();
    });
  }

  private get panelElement(): HTMLElement | null {
    return this.host.renderRoot.querySelector<HTMLElement>(`#${this.id}`);
  }

  private place() {
    const editor = this.options.editor();
    const { panel } = this;
    const anchor = this.host.renderRoot.querySelector<HTMLElement>(
      `#${this.id}-anchor`,
    );
    const surface = this.panelElement;
    if (!editor || !panel || !anchor || !surface || editor.isDestroyed) return;
    const { size } = editor.state.doc.content;
    const start = editor.view.coordsAtPos(Math.min(panel.from, size));
    const end = editor.view.coordsAtPos(Math.min(panel.to, size));
    anchor.style.setProperty('top', `${start.top}px`);
    anchor.style.setProperty('left', `${Math.min(start.left, end.left)}px`);
    anchor.style.inlineSize = '1px';
    anchor.style.blockSize = `${Math.max(1, end.bottom - start.top)}px`;
    this.floating.setElements(anchor, surface);
  }

  /** Result or Changes. */
  private onViewChange = (event: CustomEvent<{ value: string }>) => {
    event.stopPropagation();
    if (!this.panel) return;
    this.panel.view = event.detail.value === 'changes' ? 'changes' : 'result';
    this.host.requestUpdate();
  };

  private onInstructionKey = (event: KeyboardEvent) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    this.submitInstruction();
  };

  private submitInstruction() {
    const { panel } = this;
    const input =
      this.panelElement?.querySelector<HTMLInputElement>('.ai-instruction');
    if (!panel || !input) return;
    const instruction = input.value.trim();
    if (!instruction) return;
    panel.instruction = instruction;
    this.run();
  }

  // ── Render ───────────────────────────────────────────────────────────────

  private renderMenu() {
    const { i18n } = this.options;
    return html`<div
      class="ai-menu"
      role="menu"
      aria-label=${i18n.t('aiActions')}
    >
      ${SELECTION_ACTIONS.map(
        item =>
          html`<button
            class="ai-menu-item"
            type="button"
            role="menuitem"
            @click=${() => this.start(item.action, this.panel?.focused)}
          >
            ${sparkle}<span>${i18n.t(item.label)}</span>
          </button>`,
      )}
    </div>`;
  }

  private renderInstruction(panel: Panel) {
    const { i18n } = this.options;
    const label =
      panel.action === 'translate'
        ? i18n.t('aiTargetLanguage')
        : i18n.t('aiInstruction');
    return html`<div class="ai-instruction-row">
      <input
        class="ai-instruction"
        type="text"
        aria-label=${label}
        placeholder=${label}
        @keydown=${this.onInstructionKey}
      />
      <wc-button size="sm" @click=${() => this.submitInstruction()}
        >${i18n.t('aiGo')}</wc-button
      >
    </div>`;
  }

  private renderBody(panel: Panel) {
    const { i18n } = this.options;
    if (panel.state === 'error') {
      return html`<p class="ai-error" role="alert">${i18n.t('aiFailed')}</p>`;
    }
    const streaming = panel.state === 'streaming';
    if (panel.view === 'changes' && panel.state === 'done') {
      // Word by word, in reading order: what goes is struck out next to what replaces it.
      const runs = inlineDiff(panel.original, panel.result).map(run => {
        if (run.op === 'delete') return html`<del>${run.text}</del>`;
        if (run.op === 'insert') return html`<ins>${run.text}</ins>`;
        return run.text;
      });
      // No whitespace inside: the paragraph keeps white space.
      // prettier-ignore
      return html`<p class="ai-changes">${runs}</p>`;
    }
    return html`<div
      class="ai-result"
      aria-live="polite"
      aria-busy=${streaming ? 'true' : 'false'}
    >
      ${!panel.result && streaming
        ? html`<wc-typing-indicator
            label=${i18n.t('aiWriting')}
          ></wc-typing-indicator>`
        : html`<wc-markdown
            size="sm"
            ?streaming=${streaming}
            .value=${panel.result}
          ></wc-markdown>`}
    </div>`;
  }

  private renderFooter(panel: Panel) {
    const { i18n } = this.options;
    const streaming = panel.state === 'streaming';
    return html`<div class="ai-actions">
      ${panel.state !== 'error'
        ? html`<wc-button
            size="sm"
            ?disabled=${panel.state !== 'done'}
            @click=${() => this.accept()}
            >${i18n.t('aiAccept')}</wc-button
          >`
        : nothing}
      <wc-button size="sm" variant="text" @click=${() => this.discard()}
        >${i18n.t('aiDiscard')}</wc-button
      >
      <wc-button
        size="sm"
        variant="text"
        ?disabled=${streaming}
        @click=${() => this.retry()}
        >${i18n.t('aiTryAgain')}</wc-button
      >
      <span class="ai-spacer"></span>
      ${streaming
        ? html`<wc-icon-button
            variant="text"
            shape="round"
            size="xs"
            aria-label=${i18n.t('aiStop')}
            tooltip=${i18n.t('aiStop')}
            @click=${() => this.stop()}
            ><wc-icon name="stop"></wc-icon
          ></wc-icon-button>`
        : nothing}
    </div>`;
  }

  private renderPanel(panel: Panel) {
    const { i18n } = this.options;
    if (panel.state === 'menu') return this.renderMenu();
    const rewrite = !!panel.original;
    return html`<div class="ai-head">
        <wc-ai-badge kind="draft"></wc-ai-badge>
        <span class="ai-head-label"
          >${i18n.t(ACTION_LABELS[panel.action])}</span
        >
        ${rewrite && panel.state === 'done'
          ? html`<wc-segmented-button-group
              class="ai-view"
              size="sm"
              label=${i18n.t('aiPreview')}
              value=${panel.view}
              @change=${this.onViewChange}
            >
              <wc-segmented-button value="result"
                >${i18n.t('aiResult')}</wc-segmented-button
              >
              <wc-segmented-button value="changes"
                >${i18n.t('aiChanges')}</wc-segmented-button
              >
            </wc-segmented-button-group>`
          : nothing}
      </div>
      ${panel.state === 'instruction'
        ? this.renderInstruction(panel)
        : html`${this.renderBody(panel)}${this.renderFooter(panel)}`}`;
  }

  /** The ghost-text hint for screen readers, and the preview panel with its anchor. */
  render(): TemplateResult {
    const { i18n } = this.options;
    const { panel } = this;
    return html`<span id="${this.id}-ghost" class="screen-reader-only"
        >${this.ghost ? i18n.t('aiGhostHint')(this.ghost.text) : ''}</span
      >
      <span id="${this.id}-anchor" class="ai-anchor" aria-hidden="true"></span>
      <div
        id=${this.id}
        class="ai-panel"
        popover="manual"
        role="dialog"
        aria-label=${i18n.t('aiPreview')}
        @input=${stopEvent}
        @beforeinput=${stopEvent}
        @change=${stopEvent}
        @mousedown=${(event: MouseEvent) => {
          // Keep the editor's selection, except in the instruction field.
          if (!(event.target as HTMLElement).closest?.('.ai-instruction')) {
            event.preventDefault();
          }
        }}
      >
        ${panel ? this.renderPanel(panel) : nothing}
      </div>`;
  }
}
