import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';

import { AiController } from '@/__internal/ai/ai-controller.js';
import { sparkle } from '@/__internal/ai/sparkle.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './assistant-panel.scss';

/** Why the panel closed. */
export type AssistantPanelCloseReason =
  | 'action'
  | 'escape'
  | 'light-dismiss'
  | 'api';

/** `detail` of `close`. */
export interface AssistantPanelCloseDetail {
  reason: AssistantPanelCloseReason;
}

let panelCount = 0;

/**
 * @label Assistant Panel
 * @tag wc-assistant-panel
 * @rawTag assistant-panel
 * @summary The assistant's side panel: a header that says whose access it uses, the conversation, the composer and a reminder to check drafts.
 * @overview
 * <p>The frame of a conversation with the assistant (ADR-030002). Put a <code>wc-chat-thread</code>
 * in the default slot and a <code>wc-prompt-input</code> in the <code>composer</code> slot.
 * <code>supporting-text</code> says whose access the assistant uses, such as "Acting as Alan
 * Turing, with your access"; below the composer a line reminds that the assistant can be wrong
 * (replace it with the <code>disclaimer</code> slot).</p>
 * <p>The header has <strong>New conversation</strong> (<code>new-conversation</code>) and
 * <strong>Close</strong> (<code>close</code>). With <code>variant="standard"</code> (default) the
 * panel fills its container, such as <code>wc-app-shell</code>'s <code>aside</code> slot; with
 * <code>variant="modal"</code> it opens as a modal sheet from the end edge, for small screens, with
 * <code>open</code>, <code>show()</code>, <code>hide()</code> and <code>toggle()</code>; it opens with
 * the composer focused.</p>
 * <p>Like every marker of the assistant, the panel renders nothing while AI is off for the page, so
 * a page that still mounts it shows no stale assistant.</p>
 * @tags layout, ai
 *
 * @slot - The conversation, usually a `wc-chat-thread`.
 * @slot composer - The composer, usually a `wc-prompt-input`.
 * @slot disclaimer - Replaces the reminder under the composer.
 * @slot header-actions - More buttons in the header, before New conversation.
 *
 * @csspart panel - The panel surface.
 * @csspart header - The header.
 *
 * @cssprop --assistant-panel-background - Background of the panel.
 * @cssprop --assistant-panel-width - Width of the modal sheet.
 *
 * @fires {CustomEvent<void>} new-conversation - The person asked for a new conversation.
 * @fires {CustomEvent<AssistantPanelCloseDetail>} close - The person closed the panel, or a modal panel closed (Escape, a press outside, `hide()`).
 * @fires {CustomEvent<void>} open - A modal panel opened.
 *
 * @example
 * ```html
 * <wc-assistant-panel supporting-text="Acting as Alan Turing, with your access">
 *   <wc-chat-thread></wc-chat-thread>
 *   <wc-prompt-input slot="composer"></wc-prompt-input>
 * </wc-assistant-panel>
 * ```
 */
@IndividualComponent
export class AssistantPanel extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The panel's title; defaults to "Assistant". */
  @property({ type: String }) headline = '';

  /** Whose access the assistant uses, such as "Acting as Alan Turing, with your access". */
  @property({ type: String, attribute: 'supporting-text' }) supportingText = '';

  /** `standard` fills its container; `modal` opens as a sheet from the end edge. */
  @property({ type: String, reflect: true }) variant: 'standard' | 'modal' =
    'standard';

  /** Whether a modal panel is open. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** Per-instance string overrides. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  private readonly ai = new AiController(this);

  private readonly headlineId = `wc-assistant-panel-${(panelCount += 1)}`;

  // ── Public methods ───────────────────────────────────────────────────────

  /** Opens a modal panel. */
  show() {
    this.open = true;
  }

  /** Closes a modal panel. */
  hide() {
    if (!this.open) return;
    this.open = false;
    this._dispatchClose('api');
  }

  /** Opens or closes a modal panel. */
  toggle() {
    if (this.open) this.hide();
    else this.show();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private _dispatchClose(reason: AssistantPanelCloseReason) {
    this.dispatchEvent(
      new CustomEvent<AssistantPanelCloseDetail>('close', {
        detail: { reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onClose = () => {
    if (this.variant === 'modal') this.open = false;
    this._dispatchClose('action');
  };

  private _onNewConversation = () => {
    this.dispatchEvent(
      new CustomEvent('new-conversation', { bubbles: true, composed: true }),
    );
  };

  /** The modal sheet closed itself: Escape or a press outside. */
  private _onSheetClose = (event: CustomEvent<{ reason: string }>) => {
    event.stopPropagation();
    if (!this.open) return;
    this.open = false;
    const reason = event.detail?.reason;
    this._dispatchClose(
      reason === 'escape' || reason === 'light-dismiss' ? reason : 'api',
    );
  };

  private _onSheetOpen = (event: Event) => {
    event.stopPropagation();
    // Opening the assistant is for asking: start in the composer, not on New conversation.
    const composer = this.querySelector<HTMLElement>(
      ':scope > [slot="composer"]',
    );
    if (composer) requestAnimationFrame(() => composer.focus());
    this.dispatchEvent(
      new CustomEvent('open', { bubbles: true, composed: true }),
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────

  private renderPanel() {
    const { i18n } = this;
    return html`<section
      class="panel"
      part="panel"
      aria-labelledby=${this.headlineId}
    >
      <header class="header" part="header">
        <span class="mark" aria-hidden="true">${sparkle}</span>
        <div class="titles">
          <h2 id=${this.headlineId} class="headline">
            ${this.headline || i18n.t('panelHeadline')}
          </h2>
          ${this.supportingText
            ? html`<p class="supporting-text">${this.supportingText}</p>`
            : nothing}
        </div>
        <slot name="header-actions"></slot>
        <wc-icon-button
          variant="text"
          shape="round"
          aria-label=${i18n.t('panelNewConversation')}
          tooltip=${i18n.t('panelNewConversation')}
          @click=${this._onNewConversation}
          ><wc-icon name="edit_square"></wc-icon
        ></wc-icon-button>
        <wc-icon-button
          variant="text"
          shape="round"
          aria-label=${i18n.t('panelClose')}
          tooltip=${i18n.t('panelClose')}
          @click=${this._onClose}
          ><wc-icon name="close"></wc-icon
        ></wc-icon-button>
      </header>
      <div class="body"><slot></slot></div>
      <footer class="footer">
        <slot name="composer"></slot>
        <p class="disclaimer">
          <slot name="disclaimer">${i18n.t('panelDisclaimer')}</slot>
        </p>
      </footer>
    </section>`;
  }

  render() {
    if (!this.ai.available) return nothing;
    if (this.variant !== 'modal') return this.renderPanel();
    return html`<wc-side-sheet
      class="sheet"
      variant="modal"
      placement="end"
      hide-close
      label=${this.headline || this.i18n.t('panelHeadline')}
      ?open=${this.open}
      @open=${this._onSheetOpen}
      @close=${this._onSheetClose}
      >${this.renderPanel()}</wc-side-sheet
    >`;
  }
}
