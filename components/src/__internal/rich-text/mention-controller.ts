import {
  html,
  nothing,
  type ReactiveController,
  type ReactiveControllerHost,
  type TemplateResult,
} from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { Editor } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import type {
  SuggestionKeyDownProps,
  SuggestionOptions,
  SuggestionProps,
} from '@tiptap/suggestion';

import { FloatingController } from '../controllers/floating-controller.js';
import { OverlayController } from '../controllers/overlay-controller.js';
import type { I18nController } from '../i18n/i18n-controller.js';
import type { MentionSuggestion } from '../../mention-input/mention-model.js';
import type { RichTextMention } from './mention.js';

/** `search` detail: the person typed `query` after `trigger`; the app answers with `suggestions`. */
export interface RichTextSearchDetail {
  trigger: string;
  query: string;
}

/** `mention` detail: the person picked `suggestion`, inserted as `mention`. */
export interface RichTextMentionDetail {
  mention: RichTextMention;
  suggestion: MentionSuggestion;
}

/** What an editor that offers mentions provides. Its API matches `wc-mention-input`. */
export interface RichTextMentionHost
  extends ReactiveControllerHost, HTMLElement {
  /** Characters that start a mention, such as `"@"` or `"@#"`. */
  triggers: string;
  /** What the app offers for the current query. */
  suggestions: MentionSuggestion[];
  /** Whether the app is still looking for suggestions. */
  suggestionsLoading: boolean;
  disabled: boolean;
  readonly: boolean;
  readonly renderRoot: HTMLElement | DocumentFragment;
}

interface ControllerOptions {
  /** The editor, once created. */
  editor: () => Editor | undefined;
  /** The host's strings. */
  i18n: I18nController;
}

/** The query being typed. */
interface ActiveQuery {
  trigger: string;
  query: string;
  /** Document position of the trigger character. */
  from: number;
}

let controllerCount = 0;

/**
 * Mentions in a Tiptap editor, with the same contract as `wc-mention-input`: typing a trigger
 * fires `search {trigger, query}`, the app sets `suggestions` (and `suggestions-loading` while it
 * looks), and picking one inserts a mention node and fires `mention {mention, suggestion}`.
 *
 * The list is a `popover` listbox in the host's shadow root, next to the caret. Focus stays in the
 * editor; the active option is announced through `aria-activedescendant`.
 *
 * Usage: pass `suggestionOptions()` to `buildExtensions` as `mentions`, render `render()` in the
 * host's template and import the `mention-list` styles.
 */
export class RichTextMentionController implements ReactiveController {
  /** Index of the highlighted suggestion, or -1. */
  activeIndex = -1;

  private readonly host: RichTextMentionHost;

  private readonly options: ControllerOptions;

  private readonly listId = `wc-rich-text-mentions-${(controllerCount += 1)}`;

  private active: ActiveQuery | null = null;

  /** Position of a query the person closed with Escape; it stays closed until they leave it. */
  private dismissedFrom: number | null = null;

  private insert?: (attrs: { id: string; label: string }) => void;

  private caretRect?: () => DOMRect | null;

  private lastSuggestions: MentionSuggestion[] = [];

  private shown = false;

  private readonly floating: FloatingController;

  private readonly overlay: OverlayController;

  constructor(host: RichTextMentionHost, options: ControllerOptions) {
    this.host = host;
    this.options = options;
    host.addController(this);
    this.floating = new FloatingController(host, {
      placement: 'bottom-start',
      strategy: 'fixed',
      offset: 4,
      trigger: 'manual',
      closeOnClickOutside: false,
      fitViewport: true,
    });
    this.overlay = new OverlayController(host, {
      surface: () => this.list,
      closeOnEscape: () => false,
      focusOnOpen: () => false,
      restoreFocus: () => false,
      requestClose: () => this.dismiss(),
    });
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  hostUpdate() {
    if (this.host.suggestions !== this.lastSuggestions) {
      this.lastSuggestions = this.host.suggestions;
      const { length } = this.host.suggestions;
      if (this.activeIndex < 0 || this.activeIndex >= length) {
        this.activeIndex = length ? 0 : -1;
      }
    }
  }

  hostUpdated() {
    const show = this.visible;
    if (show !== this.shown) {
      this.shown = show;
      if (show) {
        this.overlay.sync(true);
        this.placeAnchor();
        this.floating.open();
      } else {
        this.floating.close();
        this.overlay.sync(false);
      }
    } else if (show) {
      this.placeAnchor();
    }
    this.syncEditorAria();
    if (show) {
      this.host.renderRoot
        .querySelector<HTMLElement>(`#${this.listId}-${this.activeIndex}`)
        ?.scrollIntoView?.({ block: 'nearest' });
    }
  }

  hostDisconnected() {
    this.active = null;
    this.shown = false;
  }

  // ── Public ───────────────────────────────────────────────────────────────

  /** Whether the suggestion list shows. */
  get visible(): boolean {
    return (
      !!this.active &&
      this.dismissedFrom !== this.active.from &&
      (this.host.suggestionsLoading || this.host.suggestions.length > 0) &&
      !this.host.disabled &&
      !this.host.readonly
    );
  }

  /** The trigger characters, one per suggestion plugin. */
  get triggerChars(): string[] {
    return Array.from(new Set(Array.from(this.host.triggers ?? '@'))).filter(
      char => char.trim(),
    );
  }

  /** The suggestion plugins for `buildExtensions({ mentions })`. */
  suggestionOptions(): Omit<SuggestionOptions, 'editor'>[] {
    return this.triggerChars.map(char => ({
      char,
      pluginKey: new PluginKey(`peacockMention${char.charCodeAt(0)}`),
      allowSpaces: false,
      items: () => [],
      // Tiptap's own command collapses `window.getSelection()`, which throws when the editor is
      // in a shadow root; insert the node and a space without it.
      command: ({ editor, range, props }) => {
        const to = editor.state.selection.$to.nodeAfter?.text?.startsWith(' ')
          ? range.to + 1
          : range.to;
        editor
          .chain()
          .focus()
          .insertContentAt({ from: range.from, to }, [
            {
              type: 'mention',
              attrs: { ...props, mentionSuggestionChar: char },
            },
            { type: 'text', text: ' ' },
          ])
          .run();
      },
      render: () => ({
        onStart: (props: SuggestionProps) => this.onQuery(char, props),
        onUpdate: (props: SuggestionProps) => this.onQuery(char, props),
        onExit: () => this.onExit(),
        onKeyDown: (props: SuggestionKeyDownProps) => this.onKeyDown(props),
      }),
    }));
  }

  /**
   * Types a trigger at the caret, opening the list; for a toolbar's mention button. Adds a space
   * first when the caret follows a word, since a trigger only counts after whitespace.
   */
  insertTrigger(trigger = this.triggerChars[0] ?? '@') {
    const editor = this.options.editor();
    if (!editor || this.host.disabled || this.host.readonly) return;
    const before = editor.state.selection.$from.nodeBefore?.text?.slice(-1);
    const prefix = before && !/\s/.test(before) ? ' ' : '';
    editor.chain().focus().insertContent(`${prefix}${trigger}`).run();
  }

  /** Inserts the suggestion at `index` in place of the query. */
  choose(index: number) {
    const suggestion = this.host.suggestions[index];
    const { active, insert } = this;
    if (!suggestion || !active || !insert) return;
    insert({ id: suggestion.id, label: suggestion.label });
    this.host.dispatchEvent(
      new CustomEvent<RichTextMentionDetail>('mention', {
        detail: {
          mention: {
            id: suggestion.id,
            label: suggestion.label,
            trigger: active.trigger,
          },
          suggestion,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** The list, its caret anchor and the live region, for the host's template. */
  render(): TemplateResult {
    const { visible } = this;
    const { suggestions, suggestionsLoading } = this.host;
    const { i18n } = this.options;
    // A press on the list must not take focus from the editor.
    return html`<span class="mention-anchor" aria-hidden="true"></span>
      <div
        id=${this.listId}
        class="mention-list"
        popover="manual"
        role="listbox"
        aria-label=${i18n.t('mentionSuggestions')}
        aria-busy=${suggestionsLoading ? 'true' : nothing}
        @mousedown=${(event: MouseEvent) => event.preventDefault()}
      >
        ${visible
          ? suggestions.map((suggestion, index) =>
              this.renderOption(suggestion, index),
            )
          : nothing}
        ${visible && suggestionsLoading
          ? html`<div class="mention-loading" role="presentation">
              <wc-circular-progress
                class="mention-loading-indicator"
                indeterminate
                aria-hidden="true"
              ></wc-circular-progress>
              <span>${i18n.t('loading')}</span>
            </div>`
          : nothing}
      </div>
      <span class="screen-reader-only" role="status"
        >${this.announcement()}</span
      >`;
  }

  // ── Suggestion plugin callbacks ──────────────────────────────────────────

  private onQuery(trigger: string, props: SuggestionProps) {
    const changed =
      !this.active ||
      this.active.trigger !== trigger ||
      this.active.query !== props.query ||
      this.active.from !== props.range.from;
    if (this.active && this.active.from !== props.range.from) {
      this.dismissedFrom = null;
    }
    this.active = { trigger, query: props.query, from: props.range.from };
    this.insert = attrs => props.command(attrs);
    this.caretRect = props.clientRect ?? undefined;
    if (changed && this.dismissedFrom !== props.range.from) {
      this.activeIndex = this.host.suggestions.length ? 0 : -1;
      this.host.dispatchEvent(
        new CustomEvent<RichTextSearchDetail>('search', {
          detail: { trigger, query: props.query },
          bubbles: true,
          composed: true,
        }),
      );
    }
    this.host.requestUpdate();
  }

  private onExit() {
    this.active = null;
    this.insert = undefined;
    this.caretRect = undefined;
    this.dismissedFrom = null;
    this.host.requestUpdate();
  }

  private onKeyDown({ event }: SuggestionKeyDownProps): boolean {
    if (!this.visible) return false;
    const { length } = this.host.suggestions;
    switch (event.key) {
      case 'ArrowDown':
        if (length) this.activeIndex = (this.activeIndex + 1) % length;
        this.host.requestUpdate();
        return true;
      case 'ArrowUp':
        if (length) this.activeIndex = (this.activeIndex - 1 + length) % length;
        this.host.requestUpdate();
        return true;
      case 'Enter':
      case 'Tab':
        if (this.activeIndex < 0) return false;
        this.choose(this.activeIndex);
        return true;
      case 'Escape':
        this.dismiss();
        return true;
      default:
        return false;
    }
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private dismiss() {
    if (this.active) this.dismissedFrom = this.active.from;
    this.host.requestUpdate();
  }

  private get list(): HTMLElement | null {
    return this.host.renderRoot.querySelector<HTMLElement>(`#${this.listId}`);
  }

  private get anchor(): HTMLElement | null {
    return this.host.renderRoot.querySelector<HTMLElement>('.mention-anchor');
  }

  /** Moves the invisible anchor onto the caret, and the list with it. */
  private placeAnchor() {
    const rect = this.caretRect?.();
    const { anchor, list } = this;
    if (!rect || !anchor || !list) return;
    anchor.style.setProperty('top', `${rect.top}px`);
    // The caret rectangle is physical, measured from the left.
    anchor.style.setProperty('left', `${rect.left}px`);
    anchor.style.blockSize = `${rect.height}px`;
    this.floating.setElements(anchor, list);
  }

  /** Tells assistive technology which option is active while the list shows. */
  private syncEditorAria() {
    const editor = this.options.editor();
    if (!editor || editor.isDestroyed) return;
    const { dom } = editor.view;
    if (this.visible) {
      dom.setAttribute('aria-controls', this.listId);
      dom.setAttribute('aria-expanded', 'true');
      dom.setAttribute('aria-autocomplete', 'list');
      if (this.activeIndex >= 0) {
        dom.setAttribute(
          'aria-activedescendant',
          `${this.listId}-${this.activeIndex}`,
        );
      } else {
        dom.removeAttribute('aria-activedescendant');
      }
    } else if (dom.getAttribute('aria-controls') === this.listId) {
      // The slash menu shares these attributes; only clear them when this list set them.
      dom.removeAttribute('aria-controls');
      dom.removeAttribute('aria-expanded');
      dom.removeAttribute('aria-activedescendant');
    }
  }

  private announcement(): string {
    if (!this.visible) return '';
    const { i18n } = this.options;
    const { suggestions, suggestionsLoading } = this.host;
    if (suggestionsLoading && !suggestions.length) return i18n.t('loading');
    const count = suggestions.length;
    const formatted = new Intl.NumberFormat(i18n.locale).format(count);
    return i18n.t('mentionResults')(count, formatted);
  }

  private renderOption(suggestion: MentionSuggestion, index: number) {
    const active = index === this.activeIndex;
    // Options are driven from the editor (aria-activedescendant); the pointer only picks them.
    /* eslint-disable lit-a11y/click-events-have-key-events */
    return html`<div
      id="${this.listId}-${index}"
      class=${classMap({ 'mention-option': true, active })}
      role="option"
      aria-selected=${active ? 'true' : 'false'}
      @click=${() => this.choose(index)}
      @pointermove=${() => {
        if (this.activeIndex === index) return;
        this.activeIndex = index;
        this.host.requestUpdate();
      }}
    >
      ${suggestion.avatar !== undefined
        ? html`<wc-avatar
            class="mention-option-avatar"
            size="sm"
            name=${suggestion.label}
            src=${suggestion.avatar || nothing}
            aria-hidden="true"
          ></wc-avatar>`
        : nothing}
      <span class="mention-option-text">
        <span class="mention-option-label">${suggestion.label}</span>
        ${suggestion.description
          ? html`<span class="mention-option-description"
              >${suggestion.description}</span
            >`
          : nothing}
      </span>
    </div>`;
    /* eslint-enable lit-a11y/click-events-have-key-events */
  }
}
