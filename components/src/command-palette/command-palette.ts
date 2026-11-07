import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '../IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import {
  type CloseReason,
  OverlayController,
} from '@/__internal/controllers/overlay-controller.js';
import modalStyles from '../modal/modal.scss';
import styles from './command-palette.scss';

/** A command the palette lists and runs. */
export interface Command {
  /** Unique id; `recent` refers to commands by it. */
  id: string;
  /** What the command does, such as "Open settings". Matched against the query. */
  label: string;
  /** Heading the command is listed under, such as "Navigation". */
  group?: string;
  /** A second line under the label. Matched against the query. */
  description?: string;
  /** Material Symbols icon name shown before the label. */
  icon?: string;
  /** Keyboard shortcut to display, such as "Ctrl+Shift+P". The palette only shows it. */
  shortcut?: string;
  /** More words that find the command, such as synonyms. Matched, not shown. */
  keywords?: string[];
  /** Listed but cannot be run. */
  disabled?: boolean;
}

/** `detail` of the `select` event. */
export interface CommandPaletteSelectDetail {
  command: Command;
}

/** How the palette filters: by itself (`contains`), or by the app on `search` (`managed`). */
export type CommandPaletteSearch = 'contains' | 'managed';

/** A run of label text, highlighted when it matched the query. */
interface Segment {
  text: string;
  match: boolean;
}

/** One heading and its commands, in display order. */
interface Section {
  heading: string;
  commands: Command[];
}

/** How many options PageUp / PageDown move. */
const PAGE_SIZE = 10;

/** The query split into lower-cased words. */
function tokenize(text: string): string[] {
  return text.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * How well a command matches: lower is better, `null` is no match. Every word of the query must
 * appear in the label, the keywords or the description.
 */
function score(command: Command, text: string, words: string[]): number | null {
  const label = command.label.toLowerCase();
  const keywords = (command.keywords ?? []).join(' ').toLowerCase();
  const description = (command.description ?? '').toLowerCase();
  const all = `${label} ${keywords} ${description}`;
  if (!words.every(word => all.includes(word))) return null;
  const whole = text.trim().toLowerCase();
  if (label.startsWith(whole)) return 0;
  const at = label.indexOf(whole);
  if (at > 0 && /\s|\W/.test(label[at - 1])) return 1;
  if (at >= 0) return 2;
  if (words.every(word => label.includes(word))) return 3;
  return 4;
}

/** Splits `text` into runs, marking every occurrence of a query word. */
function highlight(text: string, words: string[]): Segment[] {
  const lower = text.toLowerCase();
  // Lower-casing can change the length of some characters; then there is nothing safe to mark.
  if (!words.length || lower.length !== text.length) {
    return [{ text, match: false }];
  }
  const marked = new Array<boolean>(text.length).fill(false);
  for (const word of words) {
    let from = lower.indexOf(word);
    while (from >= 0) {
      marked.fill(true, from, from + word.length);
      from = lower.indexOf(word, from + word.length);
    }
  }
  const segments: Segment[] = [];
  for (let i = 0; i < text.length; i += 1) {
    const last = segments[segments.length - 1];
    if (last && last.match === marked[i]) last.text += text[i];
    else segments.push({ text: text[i], match: marked[i] });
  }
  return segments;
}

/** Groups commands under their headings, in the order the headings first appear. */
function group(commands: Command[]): Section[] {
  const sections = new Map<string, Command[]>();
  for (const command of commands) {
    const heading = command.group ?? '';
    const list = sections.get(heading);
    if (list) list.push(command);
    else sections.set(heading, [command]);
  }
  return [...sections].map(([heading, list]) => ({
    heading,
    commands: list,
  }));
}

/** Whether the person is on a Mac-like platform, where `mod` is the Command key. */
function isApplePlatform(): boolean {
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform = nav.userAgentData?.platform || navigator.platform || '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/** Whether a keydown matches a shortcut such as `mod+k` or `ctrl+shift+p`. */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: string,
  apple = isApplePlatform(),
): boolean {
  const parts = shortcut
    .toLowerCase()
    .split('+')
    .map(part => part.trim())
    .filter(Boolean);
  const key = parts.pop();
  if (!key) return false;
  const want = { ctrl: false, meta: false, shift: false, alt: false };
  for (const part of parts) {
    if (part === 'mod') want[apple ? 'meta' : 'ctrl'] = true;
    else if (part === 'ctrl' || part === 'control') want.ctrl = true;
    else if (part === 'meta' || part === 'cmd' || part === 'command')
      want.meta = true;
    else if (part === 'shift') want.shift = true;
    else if (part === 'alt' || part === 'option') want.alt = true;
    else return false;
  }
  return (
    event.key.toLowerCase() === key &&
    event.ctrlKey === want.ctrl &&
    event.metaKey === want.meta &&
    event.shiftKey === want.shift &&
    event.altKey === want.alt
  );
}

/** Whether a keydown target takes typed text: an input, a textarea, a select or editable content. */
function isEditable(target: EventTarget | undefined): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement) {
    return ![
      'button',
      'checkbox',
      'radio',
      'submit',
      'reset',
      'range',
      'color',
      'file',
      'image',
    ].includes(target.type);
  }
  return false;
}

/**
 * @label Command Palette
 * @tag wc-command-palette
 * @rawTag command-palette
 * @summary A keyboard launcher (Ctrl/Cmd+K) that finds and runs commands by name.
 * @overview
 * <p>The command palette is a modal dialog with a search field and a list of commands, grouped
 * under their <code>group</code> headings. It opens in the browser's top layer like
 * <code>wc-modal</code> (scroll lock, Escape, focus return). Commands are data: set
 * <code>commands</code> to an array of <code>{id, label, group, description, icon, shortcut,
 * keywords, disabled}</code>. While the query is empty, the commands whose ids are in
 * <code>recent</code> come first, under "Recent"; the app keeps that list, usually from
 * <code>select</code>.</p>
 * <p>Typing filters the commands: every word must appear in the label, the keywords or the
 * description, and the matching text is highlighted. Labels that start with the query rank first.
 * With <code>search="managed"</code> the palette does not filter: listen to <code>search</code>,
 * set <code>loading</code>, and replace <code>commands</code> with the results.</p>
 * <p>The field is an ARIA combobox: focus stays in it while Arrow Up/Down, Home/End and
 * PageUp/PageDown move the highlighted command (<code>aria-activedescendant</code>). Enter runs
 * the highlighted command: <code>select</code> fires, then the palette closes, unless the
 * listener called <code>preventDefault()</code>. Escape first clears the query, then closes.</p>
 * <p><code>shortcut</code> opens the palette from anywhere on the page, for example
 * <code>shortcut="mod+k"</code>, where <code>mod</code> is Command on Apple platforms and Ctrl
 * elsewhere. The shortcut is ignored while the person types in another field, and closes the
 * palette when it is open.</p>
 *
 * @cssprop --command-palette-container-color - Background color of the palette.
 * @cssprop --command-palette-scrim-color - Color of the scrim backdrop.
 * @cssprop --command-palette-shape - Corner radius of the palette.
 * @cssprop --command-palette-max-width - Maximum width of the palette. Defaults to `640px`.
 * @cssprop --command-palette-max-height - Maximum height of the result list. Defaults to `24rem`.
 * @cssprop --command-palette-highlight-color - Background of the highlighted command.
 *
 * @fires {CustomEvent} open - Fired when the palette opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Fired when the palette closes: Escape on an empty query, a scrim click, a run command or the shortcut (`action`), or `hide()` / `open = false` (`api`).
 * @fires {CustomEvent<{value: string}>} search - Fired as the query changes. With `search="managed"`, filter in the app and set `commands`.
 * @fires {CustomEvent<{command: Command}>} select - Fired when the person runs a command. Cancelable: `preventDefault()` keeps the palette open.
 *
 * @example
 * ```html
 * <wc-command-palette id="palette" shortcut="mod+k"></wc-command-palette>
 * <script>
 *   const palette = document.getElementById('palette');
 *   palette.commands = [
 *     { id: 'new-issue', label: 'New issue', group: 'Issues', icon: 'add', shortcut: 'C' },
 *     { id: 'settings', label: 'Open settings', group: 'Navigation', icon: 'settings', keywords: ['preferences'] },
 *   ];
 *   palette.addEventListener('select', event => run(event.detail.command.id));
 * </script>
 * ```
 * @tags overlay, dialog, navigation
 */
@IndividualComponent
export class CommandPalette extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [modalStyles, styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Whether the palette is open. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** The commands to list. */
  @property({ attribute: false }) commands: Command[] = [];

  /** Ids of recently run commands, most recent first; listed first while the query is empty. */
  @property({ attribute: false }) recent: string[] = [];

  /**
   * How the query filters: `"contains"` (default) filters `commands` in the palette;
   * `"managed"` leaves filtering to the app, which listens to `search` and sets `commands`.
   */
  @property({ type: String, reflect: true }) search: CommandPaletteSearch =
    'contains';

  /** Shows a progress row, for example while `search="managed"` fetches results. */
  @property({ type: Boolean, reflect: true }) loading = false;

  /**
   * A page-wide shortcut that opens the palette, such as `"mod+k"`. Modifiers: `mod` (Command on
   * Apple platforms, Ctrl elsewhere), `ctrl`, `meta`, `shift`, `alt`. Empty for none.
   */
  @property({ type: String }) shortcut = '';

  /** Accessible name of the palette. Default "Command palette". */
  @property({ type: String }) label = '';

  /** Placeholder of the search field. Default "Type a command or search". */
  @property({ type: String }) placeholder = '';

  /** Per-instance overrides of Peacock's strings. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── State ────────────────────────────────────────────────────────────────

  /** What the person typed. */
  @state() private _query = '';

  /** Index of the highlighted command in the flat result list; -1 for none. */
  @state() private _activeIndex = -1;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('dialog') private _dialog?: HTMLDialogElement;

  @query('.dialog') private _panel?: HTMLElement;

  @query('.search-input') private _input?: HTMLInputElement;

  @query('.results') private _results?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the name, placeholder, headings and empty state. */
  private readonly i18n = new I18nController(this);

  /** The sections shown, recomputed when the commands or the query change. */
  private _sections: Section[] = [];

  /** The shown commands in display order; option ids are their indexes. */
  private _flat: Command[] = [];

  /** Words of the query, for highlighting. */
  private _words: string[] = [];

  /** `_close()` already fired `close` for the `open` change being rendered. */
  private _closeFired = false;

  private readonly overlay = new OverlayController(this, {
    surface: () => this._dialog,
    modal: true,
    initialFocus: () => this._input,
    exitAnimationTargets: () => [this._panel],
    requestClose: reason => this._close(reason),
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleDocumentKeydown);
  }

  override disconnectedCallback() {
    document.removeEventListener('keydown', this._handleDocumentKeydown);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues) {
    if (changed.has('open')) {
      if (this.open) {
        this._query = '';
      } else if (changed.get('open') === true && !this._closeFired) {
        this._fireClose('api');
      }
      this._closeFired = false;
    }
    if (
      changed.has('commands') ||
      changed.has('recent') ||
      changed.has('search') ||
      changed.has('_query') ||
      changed.has('open')
    ) {
      this._computeResults();
      const enabled = this._flat.findIndex(command => !command.disabled);
      const keep =
        !changed.has('_query') &&
        !changed.has('open') &&
        this._activeIndex >= 0 &&
        this._activeIndex < this._flat.length &&
        !this._flat[this._activeIndex].disabled;
      if (!keep) this._activeIndex = enabled;
    }
  }

  protected override updated(changed: PropertyValues) {
    if (changed.has('_activeIndex')) this._scrollActiveIntoView();
    if (!changed.has('open')) return;
    this.overlay.sync(this.open);
    if (this.open) {
      if (this._results) this._results.scrollTop = 0;
      this.dispatchEvent(
        new CustomEvent('open', { bubbles: true, composed: true }),
      );
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Opens the palette with an empty query. */
  show() {
    this.open = true;
  }

  /** Closes the palette. */
  hide() {
    this._close('api');
  }

  /** Opens the palette when it is closed and closes it when it is open. */
  toggle() {
    if (this.open) this.hide();
    else this.show();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private _computeResults() {
    const text = this._query.trim();
    this._words = tokenize(text);
    if (!text) {
      const byId = new Map(this.commands.map(command => [command.id, command]));
      const recent = this.recent
        .map(id => byId.get(id))
        .filter((command): command is Command => !!command);
      const recentIds = new Set(recent.map(command => command.id));
      const rest = this.commands.filter(command => !recentIds.has(command.id));
      this._sections = [
        ...(recent.length
          ? [{ heading: this.i18n.t('commandPaletteRecent'), commands: recent }]
          : []),
        ...group(rest),
      ];
    } else if (this.search === 'managed') {
      this._sections = group(this.commands);
    } else {
      const scored = this.commands
        .map((command, index) => ({
          command,
          index,
          score: score(command, text, this._words),
        }))
        .filter(
          (
            entry,
          ): entry is { command: Command; index: number; score: number } =>
            entry.score !== null,
        )
        .sort((a, b) => a.score - b.score || a.index - b.index);
      this._sections = group(scored.map(entry => entry.command));
    }
    this._flat = this._sections.flatMap(section => section.commands);
  }

  private _close(reason: CloseReason) {
    if (!this.open) return;
    this._closeFired = true;
    this.open = false;
    this._fireClose(reason);
  }

  private _fireClose(reason: CloseReason) {
    this.dispatchEvent(
      new CustomEvent('close', {
        detail: { reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _setQuery(value: string) {
    this._query = value;
    this.dispatchEvent(
      new CustomEvent('search', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Fires `select` for a command and closes, unless the listener prevented it. */
  private _run(command: Command | undefined) {
    if (!command || command.disabled) return;
    const proceed = this.dispatchEvent(
      new CustomEvent<CommandPaletteSelectDetail>('select', {
        detail: { command },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (proceed) this._close('action');
  }

  /** Indexes of the commands that can be highlighted. */
  private _enabledIndexes(): number[] {
    return this._flat.flatMap((command, index) =>
      command.disabled ? [] : [index],
    );
  }

  /** Moves the highlight by `step` enabled commands; wraps for single steps, clamps for pages. */
  private _move(step: number) {
    const enabled = this._enabledIndexes();
    if (!enabled.length) return;
    const position = enabled.indexOf(this._activeIndex);
    if (position < 0) {
      this._activeIndex = step > 0 ? enabled[0] : enabled[enabled.length - 1];
      return;
    }
    let next = position + step;
    if (Math.abs(step) === 1) {
      next = (next + enabled.length) % enabled.length;
    } else {
      next = Math.min(Math.max(next, 0), enabled.length - 1);
    }
    this._activeIndex = enabled[next];
  }

  private _moveToEnd(last: boolean) {
    const enabled = this._enabledIndexes();
    if (!enabled.length) return;
    this._activeIndex = last ? enabled[enabled.length - 1] : enabled[0];
  }

  private _scrollActiveIntoView() {
    const option = this.renderRoot.querySelector<HTMLElement>(
      `#option-${this._activeIndex}`,
    );
    option?.scrollIntoView?.({ block: 'nearest' });
  }

  /** The page-wide shortcut: opens the palette, or closes it when it is open. */
  private _handleDocumentKeydown = (event: KeyboardEvent) => {
    if (!this.shortcut || event.defaultPrevented || event.repeat) return;
    if (!matchesShortcut(event, this.shortcut)) return;
    const path = event.composedPath();
    // Typing in another field is not a request for the palette; the palette's own field is.
    if (isEditable(path[0]) && !path.includes(this)) return;
    event.preventDefault();
    if (this.open) this._close('action');
    else this.show();
  };

  private _handleInput(event: Event) {
    event.stopPropagation();
    this._setQuery((event.target as HTMLInputElement).value);
  }

  private _handleKeydown(event: KeyboardEvent) {
    if (event.isComposing) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this._move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this._move(-1);
        break;
      case 'PageDown':
        event.preventDefault();
        this._move(PAGE_SIZE);
        break;
      case 'PageUp':
        event.preventDefault();
        this._move(-PAGE_SIZE);
        break;
      case 'Home':
        event.preventDefault();
        this._moveToEnd(false);
        break;
      case 'End':
        event.preventDefault();
        this._moveToEnd(true);
        break;
      case 'Enter':
        event.preventDefault();
        this._run(this._flat[this._activeIndex]);
        break;
      case 'Escape':
        // With a query, the input carries `data-handles-escape`, so the overlay left Escape to us.
        if (!this._query) return;
        event.preventDefault();
        event.stopPropagation();
        this._setQuery('');
        break;
      default:
        break;
    }
  }

  private _handleOptionClick(event: MouseEvent, index: number) {
    event.preventDefault();
    this._activeIndex = index;
    this._run(this._flat[index]);
    // Keep focus in the field when the palette stays open.
    this._input?.focus();
  }

  private _handleOptionPointermove(index: number) {
    if (this._activeIndex === index || this._flat[index]?.disabled) return;
    this._activeIndex = index;
  }

  /** The native Escape `cancel`: the overlay controller handles Escape, so keep `open` in charge. */
  private _handleCancel(event: Event) {
    event.preventDefault();
    if (this._query) this._setQuery('');
    else this._close('escape');
  }

  /** The browser closed the dialog by itself: keep `open` in step. Not a close from nested content. */
  private _handleNativeClose(event: Event) {
    if (event.target !== this._dialog) return;
    if (this.overlay.takeOwnClose()) return;
    if (this.open) this._close('escape');
  }

  /** A click outside the palette container is a scrim click. */
  private _handleDialogClick(event: MouseEvent) {
    const target = event.target as Element;
    if (target.classList?.contains('dialog-wrapper')) {
      this._close('light-dismiss');
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private _renderText(text: string) {
    return highlight(text, this._words).map(segment =>
      segment.match ? html`<mark>${segment.text}</mark>` : segment.text,
    );
  }

  private _renderShortcut(shortcut: string) {
    const keys = shortcut
      .split('+')
      .map(key => key.trim())
      .filter(Boolean);
    return html`<span class="shortcut"
      >${keys.map(key => html`<kbd>${key}</kbd>`)}</span
    >`;
  }

  private _renderOption(command: Command, index: number) {
    const active = index === this._activeIndex;
    // Options are driven from the field (aria-activedescendant); the pointer only highlights and
    // runs them, so they need no key handlers of their own.
    /* eslint-disable lit-a11y/click-events-have-key-events */
    return html`<div
      id="option-${index}"
      class=${classMap({
        option: true,
        active,
        disabled: !!command.disabled,
      })}
      role="option"
      aria-selected=${active ? 'true' : 'false'}
      aria-disabled=${command.disabled ? 'true' : nothing}
      @mousedown=${(event: MouseEvent) => event.preventDefault()}
      @click=${(event: MouseEvent) => this._handleOptionClick(event, index)}
      @pointermove=${() => this._handleOptionPointermove(index)}
    >
      ${command.icon
        ? html`<wc-icon
            class="option-icon"
            name=${command.icon}
            aria-hidden="true"
          ></wc-icon>`
        : nothing}
      <span class="option-text">
        <span class="option-label">${this._renderText(command.label)}</span>
        ${command.description
          ? html`<span class="option-description"
              >${this._renderText(command.description)}</span
            >`
          : nothing}
      </span>
      ${command.shortcut ? this._renderShortcut(command.shortcut) : nothing}
    </div>`;
    /* eslint-enable lit-a11y/click-events-have-key-events */
  }

  private _renderSections() {
    let index = 0;
    return this._sections.map((section, sectionIndex) => {
      const options = section.commands.map(command => {
        const option = this._renderOption(command, index);
        index += 1;
        return option;
      });
      if (!section.heading) {
        return html`<div role="presentation">${options}</div>`;
      }
      return html`<div
        class="group"
        role="group"
        aria-labelledby="group-${sectionIndex}"
      >
        <div class="group-heading" id="group-${sectionIndex}">
          ${section.heading}
        </div>
        ${options}
      </div>`;
    });
  }

  private _renderStatus() {
    if (this.loading) {
      return html`<div class="loading-row">
        <wc-circular-progress
          class="loading-indicator"
          indeterminate
          aria-hidden="true"
        ></wc-circular-progress>
        <span>${this.i18n.t('loading')}</span>
      </div>`;
    }
    if (this._flat.length) return nothing;
    const text = this._query.trim();
    return html`<div class="empty">
      <wc-icon
        class="empty-icon"
        name=${text ? 'search_off' : 'search'}
        aria-hidden="true"
      ></wc-icon>
      ${text
        ? this.i18n.t('commandPaletteNoResults')(text)
        : this.i18n.t('commandPaletteEmpty')}
    </div>`;
  }

  /** Text for the polite live region: the number of results, or the empty state, once typed. */
  private _announcement(): string {
    if (!this.open || !this._query.trim()) return '';
    if (this.loading) return this.i18n.t('loading');
    const count = this._flat.length;
    if (!count)
      return this.i18n.t('commandPaletteNoResults')(this._query.trim());
    const formatted = new Intl.NumberFormat(this.i18n.locale).format(count);
    return this.i18n.t('commandPaletteResults')(count, formatted);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const label = this.label || this.i18n.t('commandPalette');
    const active = this._activeIndex >= 0 ? `option-${this._activeIndex}` : '';
    // The scrim click has its keyboard equivalent in Escape, which the overlay controller handles.
    /* eslint-disable lit-a11y/click-events-have-key-events */
    return html`
      <dialog
        class="native-dialog"
        part="dialog"
        aria-label=${label}
        @cancel=${this._handleCancel}
        @close=${this._handleNativeClose}
        @click=${this._handleDialogClick}
      >
        <div
          class=${classMap({ scrim: true, visible: this.open })}
          aria-hidden="true"
        ></div>

        <div class="dialog-wrapper">
          <div class=${classMap({ dialog: true, open: this.open })}>
            <div class="search">
              <wc-icon
                class="search-icon"
                name="search"
                aria-hidden="true"
              ></wc-icon>
              <input
                class="search-input"
                type="text"
                role="combobox"
                autocomplete="off"
                spellcheck="false"
                aria-label=${label}
                aria-expanded="true"
                aria-controls="listbox"
                aria-autocomplete="list"
                aria-activedescendant=${active || nothing}
                placeholder=${this.placeholder ||
                this.i18n.t('commandPalettePlaceholder')}
                ?data-handles-escape=${!!this._query}
                .value=${this._query}
                @input=${this._handleInput}
                @change=${(event: Event) => event.stopPropagation()}
                @keydown=${this._handleKeydown}
              />
            </div>
            <div
              id="listbox"
              class="results"
              role="listbox"
              aria-label=${label}
              aria-busy=${this.loading ? 'true' : nothing}
            >
              ${this._renderSections()}
            </div>
            ${this._renderStatus()}
            <div class="screen-reader-only" role="status">
              ${this._announcement()}
            </div>
          </div>
        </div>
      </dialog>
    `;
    /* eslint-enable lit-a11y/click-events-have-key-events */
  }
}
