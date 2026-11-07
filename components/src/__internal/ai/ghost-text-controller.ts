import {
  html,
  nothing,
  type ReactiveController,
  type ReactiveControllerHost,
  type TemplateResult,
} from 'lit';
import { styleMap } from 'lit/directives/style-map.js';

import type { I18nController } from '../i18n/i18n-controller.js';
import { AiController } from './ai-controller.js';

interface GhostHost extends ReactiveControllerHost, HTMLElement {
  readonly renderRoot: HTMLElement | DocumentFragment;
  sensitive?: boolean;
  noAi?: boolean;
  name?: string;
  label?: string;
  disabled: boolean;
  readonly: boolean;
}

interface GhostOptions {
  /** The native control the ghost text belongs to. */
  control: () => HTMLTextAreaElement | null | undefined;
  /** Whether the host asked for ghost text (`ai-completion`). */
  enabled: () => boolean;
  /** Inserts accepted text at the caret and fires the host's `input`. */
  insert: (text: string) => void;
  i18n: I18nController;
  /** Milliseconds without typing before a suggestion is asked for. */
  delay?: number;
}

/** Computed styles copied onto the mirror so its text wraps exactly like the control's. */
const MIRRORED = [
  'boxSizing',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'lineHeight',
  'letterSpacing',
  'wordSpacing',
  'textIndent',
  'textTransform',
  'tabSize',
  'direction',
  'textAlign',
] as const;

const CONTEXT_BEFORE = 4000;
const CONTEXT_AFTER = 1000;

let ghostCount = 0;

/**
 * Ghost text for a native textarea (ADR-030002): after a pause in typing at the end of a line, the
 * provider's `complete` suggests how to go on, shown in grey after the caret. Tab takes it, Mod+→
 * takes the next word, Escape or any other key dismisses it. Nothing is inserted until the person
 * takes it.
 *
 * The suggestion is drawn in a mirror laid over the control, with the control's text metrics, so
 * it wraps like real text. Screen readers get it through the control's description.
 *
 * Usage: wrap the control in an element with `position: relative`, render `render()` beside it,
 * call `onInput()` from the control's `input`, `onKeyDown()` from its `keydown`, and `clear()` on
 * blur, scroll and selection changes; spread `describedBy()` into its `aria-describedby`.
 */
export class GhostTextController implements ReactiveController {
  private readonly host: GhostHost;

  private readonly options: GhostOptions;

  private readonly ai: AiController;

  private readonly hintId = `wc-ghost-text-${(ghostCount += 1)}`;

  private timer?: number;

  private ghost: { text: string; position: number } | null = null;

  private mirrorStyle: Record<string, string> = {};

  constructor(host: GhostHost, options: GhostOptions) {
    this.host = host;
    this.options = options;
    this.ai = new AiController(host, 'complete');
    host.addController(this);
  }

  hostUpdated() {
    // Keep the mirror's scroll in step with the control's.
    const mirror =
      this.host.renderRoot.querySelector<HTMLElement>('.ghost-mirror');
    const control = this.options.control();
    if (mirror && control) mirror.scrollTop = control.scrollTop;
  }

  hostDisconnected() {
    this.clear();
  }

  /** Whether ghost text can be offered now. */
  get available(): boolean {
    return (
      this.options.enabled() &&
      this.ai.available &&
      !this.host.disabled &&
      !this.host.readonly
    );
  }

  /** The suggestion shown, or `''`. */
  get text(): string {
    return this.ghost?.text ?? '';
  }

  /** The id to add to the control's `aria-describedby` while a suggestion shows. */
  describedBy(): string | undefined {
    return this.ghost ? this.hintId : undefined;
  }

  /** The person typed: drop the suggestion and ask again after a pause. */
  onInput() {
    this.clear();
    if (!this.available) return;
    this.timer = window.setTimeout(
      () => this.request(),
      this.options.delay ?? 600,
    );
  }

  /** Tab takes the suggestion, Mod+→ a word, Escape dismisses; other keys dismiss it too. */
  onKeyDown(event: KeyboardEvent) {
    if (!this.ghost) return;
    const word = event.key === 'ArrowRight' && (event.ctrlKey || event.metaKey);
    const all =
      event.key === 'Tab' &&
      !event.shiftKey &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey;
    if (all || word) {
      event.preventDefault();
      this.accept(all ? 'all' : 'word');
      return;
    }
    if (event.key === 'Escape') {
      // The suggestion takes this Escape, not a dialog around the field.
      event.preventDefault();
      event.stopPropagation();
    }
    if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) this.clear();
  }

  /** Drops the suggestion and any request for it. */
  clear() {
    window.clearTimeout(this.timer);
    this.timer = undefined;
    this.ai.abort();
    if (!this.ghost) return;
    this.ghost = null;
    this.host.requestUpdate();
  }

  /** The mirror with the suggestion, and the screen-reader hint. */
  render(): TemplateResult | typeof nothing {
    const { ghost } = this;
    const control = this.options.control();
    if (!ghost || !control) return nothing;
    const before = control.value.slice(0, ghost.position);
    // No whitespace inside the mirror: it keeps white space, so any would show as text.
    // prettier-ignore
    return html`<div class="ghost-mirror" aria-hidden="true" style=${styleMap(this.mirrorStyle)}><span class="ghost-before">${before}</span><span class="ghost-text">${ghost.text}</span></div>
      <span id=${this.hintId} hidden
        >${this.options.i18n.t('aiGhostHint')(ghost.text)}</span
      >`;
  }

  private async request() {
    const control = this.options.control();
    const { provider } = this.ai;
    if (!control || !provider?.complete || !this.available) return;
    const { value, selectionStart, selectionEnd } = control;
    if (selectionStart !== selectionEnd) return;
    const position = selectionStart ?? value.length;
    const rest = value.slice(position);
    // Only at the end of a line, where text after the caret can't be in the way.
    if (rest.split('\n')[0].trim()) return;
    if (!value.slice(0, position).trim()) return;
    const text = await this.ai.run(signal =>
      provider.complete!({
        signal,
        context: this.ai.context(),
        before: value.slice(0, position).slice(-CONTEXT_BEFORE),
        after: rest.slice(0, CONTEXT_AFTER),
      }),
    );
    if (!text || control.value !== value) return;
    if (control.selectionStart !== position) return;
    this.mirrorStyle = this.measure(control);
    this.ghost = { text, position };
    this.host.requestUpdate();
  }

  private accept(part: 'all' | 'word') {
    const { ghost } = this;
    if (!ghost) return;
    const taken =
      part === 'all' ? ghost.text : (/^\s*\S+/.exec(ghost.text)?.[0] ?? '');
    const rest = ghost.text.slice(taken.length);
    this.ghost = null;
    if (taken) this.options.insert(taken);
    this.ghost = rest
      ? { text: rest, position: ghost.position + taken.length }
      : null;
    this.host.requestUpdate();
  }

  private measure(control: HTMLTextAreaElement): Record<string, string> {
    const computed = getComputedStyle(control);
    const style: Record<string, string> = {};
    for (const property of MIRRORED) {
      style[property.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)] =
        computed[property];
    }
    style['border-color'] = 'transparent';
    style['border-style'] = 'solid';
    return style;
  }
}
