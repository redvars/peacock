import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './typing-indicator.scss';

/**
 * @label Typing Indicator
 * @tag wc-typing-indicator
 * @rawTag typing-indicator
 * @summary Shows that someone, or the assistant, is working on a reply: three pulsing dots and a short status.
 * @overview
 * <p>Show it while an answer is on its way: "Thinking…" by default, or what is happening, such as
 * "Looking up your laptop in Asset management…". Change <code>label</code> as the work moves on.
 * It is also the indicator for people typing in a discussion; put their avatar in the
 * <code>start</code> slot.</p>
 * <p>It is a polite status region (<code>role="status"</code>): screen readers read the label when
 * it appears and when it changes, never in a loop. The dots are hidden from them. With reduced
 * motion the dots hold still.</p>
 * <p>It does not depend on the page's AI settings, because people type too.</p>
 * @tags display, ai
 *
 * @slot start - Leading content, such as the typing person's avatar.
 *
 * @csspart dots - The three dots.
 * @csspart label - The status text.
 *
 * @cssprop --typing-indicator-dot-color - Color of the dots.
 * @cssprop --typing-indicator-color - Color of the label.
 *
 * @example
 * ```html
 * <wc-typing-indicator></wc-typing-indicator>
 * ```
 * @example
 * ```html
 * <wc-typing-indicator label="Ravi is typing">
 *   <wc-avatar slot="start" name="Ravi Kumar" size="sm"></wc-avatar>
 * </wc-typing-indicator>
 * ```
 */
@IndividualComponent
export class TypingIndicator extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** What is happening, such as "Looking up your laptop…". Defaults to "Thinking…". */
  @property({ type: String }) label = '';

  /** Per-instance string overrides. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'status');
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`<slot name="start"></slot
      ><span class="dots" part="dots" aria-hidden="true"
        ><i></i><i></i><i></i></span
      ><span class="label" part="label"
        >${this.label || this.i18n.t('typingThinking')}</span
      >`;
  }
}
