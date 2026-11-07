import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStringKey } from '@/__internal/i18n/strings.js';
import { isApplePlatform } from '@/__internal/utils/platform.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './kbd.scss';

/** Which platform's key names and symbols to show. */
export type KbdPlatform = 'auto' | 'apple' | 'other';

/** One key as shown and as read. */
export interface KbdKey {
  /** What shows on the key cap, such as `⌘` or `Ctrl`. */
  label: string;
  /** What a screen reader reads, such as `Command` or `Control`. */
  spoken: string;
}

/** A visible label: literal text, or a string from the table. */
type Text = string | { key: PeacockStringKey };

interface KeyDefinition {
  apple: [label: Text, spoken: Text];
  other: [label: Text, spoken: Text];
}

const t = (key: PeacockStringKey) => ({ key });

/** Named keys. Letters and other single characters show upper-cased and read as they are. */
const KEYS: Record<string, KeyDefinition> = {
  mod: {
    apple: ['⌘', t('kbdCommand')],
    other: [t('kbdCtrlShort'), t('kbdControl')],
  },
  ctrl: {
    apple: ['⌃', t('kbdControl')],
    other: [t('kbdCtrlShort'), t('kbdControl')],
  },
  meta: {
    apple: ['⌘', t('kbdCommand')],
    other: [t('kbdWinShort'), t('kbdWindows')],
  },
  alt: {
    apple: ['⌥', t('kbdOption')],
    other: [t('kbdAlt'), t('kbdAlt')],
  },
  shift: {
    apple: ['⇧', t('kbdShift')],
    other: [t('kbdShift'), t('kbdShift')],
  },
  enter: {
    apple: ['↩', t('kbdReturn')],
    other: [t('kbdEnter'), t('kbdEnter')],
  },
  escape: {
    apple: ['esc', t('kbdEscape')],
    other: [t('kbdEscShort'), t('kbdEscape')],
  },
  tab: { apple: ['⇥', t('kbdTab')], other: [t('kbdTab'), t('kbdTab')] },
  backspace: {
    apple: ['⌫', t('kbdDelete')],
    other: [t('kbdBackspace'), t('kbdBackspace')],
  },
  delete: {
    apple: ['⌦', t('kbdDelete')],
    other: [t('kbdDelShort'), t('kbdDelete')],
  },
  space: {
    apple: [t('kbdSpace'), t('kbdSpace')],
    other: [t('kbdSpace'), t('kbdSpace')],
  },
  up: { apple: ['↑', t('kbdArrowUp')], other: ['↑', t('kbdArrowUp')] },
  down: { apple: ['↓', t('kbdArrowDown')], other: ['↓', t('kbdArrowDown')] },
  left: { apple: ['←', t('kbdArrowLeft')], other: ['←', t('kbdArrowLeft')] },
  right: {
    apple: ['→', t('kbdArrowRight')],
    other: ['→', t('kbdArrowRight')],
  },
  pageup: {
    apple: ['⇞', t('kbdPageUp')],
    other: [t('kbdPageUpShort'), t('kbdPageUp')],
  },
  pagedown: {
    apple: ['⇟', t('kbdPageDown')],
    other: [t('kbdPageDownShort'), t('kbdPageDown')],
  },
  home: { apple: ['↖', t('kbdHome')], other: [t('kbdHome'), t('kbdHome')] },
  end: { apple: ['↘', t('kbdEnd')], other: [t('kbdEnd'), t('kbdEnd')] },
  capslock: {
    apple: ['⇪', t('kbdCapsLock')],
    other: [t('kbdCapsLock'), t('kbdCapsLock')],
  },
};

/** Other spellings of the named keys. */
const ALIASES: Record<string, string> = {
  control: 'ctrl',
  cmd: 'meta',
  command: 'meta',
  win: 'meta',
  super: 'meta',
  option: 'alt',
  opt: 'alt',
  return: 'enter',
  esc: 'escape',
  del: 'delete',
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  pgup: 'pageup',
  pgdn: 'pagedown',
};

export { isApplePlatform };

/** Splits a shortcut such as `mod+shift+p` into its keys; `ctrl++` is Ctrl and the plus key. */
export function splitShortcut(shortcut: string): string[] {
  return shortcut
    .split(/\+(?=.)/)
    .map(part => part.trim())
    .filter(Boolean);
}

/**
 * @label Kbd
 * @tag wc-kbd
 * @rawTag kbd
 * @summary Shows a keyboard shortcut as key caps, with the platform's key names and symbols.
 * @overview
 * <p><code>keys</code> takes a shortcut such as <code>mod+shift+p</code> and shows one
 * <code>&lt;kbd&gt;</code> per key. <code>mod</code> is Command on Apple platforms and Ctrl
 * elsewhere. On Apple platforms modifiers show as symbols without separators (⌘⇧P), as macOS
 * menus do; elsewhere they show as names joined by <code>+</code> (Ctrl+Shift+P).
 * <code>platform</code> forces one style, for documentation.</p>
 * <p>Key names: <code>mod</code>, <code>ctrl</code>, <code>meta</code> (<code>cmd</code>),
 * <code>alt</code> (<code>option</code>), <code>shift</code>, <code>enter</code>,
 * <code>escape</code> (<code>esc</code>), <code>tab</code>, <code>backspace</code>,
 * <code>delete</code>, <code>space</code>, <code>up</code>, <code>down</code>, <code>left</code>,
 * <code>right</code>, <code>pageup</code>, <code>pagedown</code>, <code>home</code>,
 * <code>end</code>, <code>capslock</code>; any other key shows as written, a single letter
 * upper-cased.</p>
 * <p>Screen readers read symbols badly, so the caps are hidden from them and a spelled-out copy is
 * read instead, such as "Control+Shift+P". The names come from Peacock's strings and can be
 * translated.</p>
 * <p>Without <code>keys</code>, the content shows as one key cap:
 * <code>&lt;wc-kbd&gt;Esc&lt;/wc-kbd&gt;</code>.</p>
 * @tags display
 *
 * @slot - A key to show as written, when `keys` is not set.
 *
 * @csspart key - Each key cap.
 * @csspart separator - The `+` between keys off Apple platforms.
 *
 * @cssprop --kbd-background - Background of a key cap.
 * @cssprop --kbd-color - Text color of a key cap.
 * @cssprop --kbd-border-color - Border color of a key cap.
 *
 * @example
 * ```html
 * <wc-kbd keys="mod+k"></wc-kbd>
 * ```
 * @example
 * ```html
 * <p>Press <wc-kbd>Esc</wc-kbd> to close.</p>
 * ```
 */
@IndividualComponent
export class Kbd extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The shortcut, keys joined by `+`, such as `mod+shift+p`. Unset to show the content. */
  @property({ type: String }) keys = '';

  /** Whose key names and symbols to show: the person's (`auto`, default), `apple` or `other`. */
  @property({ type: String, reflect: true }) platform: KbdPlatform = 'auto';

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  // ── Public methods ───────────────────────────────────────────────────────

  /** The keys as shown and as read, for the current platform. */
  resolveKeys(): KbdKey[] {
    const apple = this._isApple();
    return splitShortcut(this.keys).map(part => {
      const lower = part.toLowerCase();
      const definition = KEYS[ALIASES[lower] ?? lower];
      if (!definition) {
        const text = part.length === 1 ? part.toUpperCase() : part;
        return { label: text, spoken: text };
      }
      const [label, spoken] = apple ? definition.apple : definition.other;
      return { label: this._text(label), spoken: this._text(spoken) };
    });
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private _text(text: Text): string {
    return typeof text === 'string' ? text : String(this.i18n.t(text.key));
  }

  private _isApple(): boolean {
    return this.platform === 'auto'
      ? isApplePlatform()
      : this.platform === 'apple';
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    if (!this.keys.trim()) {
      return html`<kbd class="key" part="key"><slot></slot></kbd>`;
    }
    const keys = this.resolveKeys();
    const separate = !this._isApple();
    return html`<kbd class="shortcut"
      ><span class="keys" aria-hidden="true"
        >${keys.map(
          (key, index) =>
            html`${separate && index > 0
                ? html`<span class="separator" part="separator">+</span>`
                : nothing}<kbd class="key" part="key">${key.label}</kbd>`,
        )}</span
      ><span class="screen-reader-only"
        >${keys.map(key => key.spoken).join('+')}</span
      ></kbd
    >`;
  }
}
