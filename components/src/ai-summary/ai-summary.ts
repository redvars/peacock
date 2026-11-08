import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';

import { AiController } from '@/__internal/ai/ai-controller.js';
import { sparkle } from '@/__internal/ai/sparkle.js';
import type { AiCitation } from '@/__internal/ai/types.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './ai-summary.scss';

/** What the person thought of a summary; `''` for nothing. */
export type AiSummaryFeedback = 'up' | 'down' | '';

/** `detail` of `feedback`. */
export interface AiSummaryFeedbackDetail {
  value: AiSummaryFeedback;
}

let summaryCount = 0;

/**
 * @label AI Summary
 * @tag wc-ai-summary
 * @rawTag ai-summary
 * @summary A summary written by the assistant, marked as such, with its sources, why it says what it says, and a way to hide it.
 * @overview
 * <p>Use it where the assistant sums something up: the day's items on Home, a long discussion, the
 * answer to an administrator's question, a digest of notifications (ADR-030002). The facts come from
 * the platform; the summary puts them into words and cites the records with
 * <code>[1](cite:id)</code> links and <code>citations</code>.</p>
 * <p>Give the Markdown in <code>value</code>. While it is being written, show <code>loading</code>
 * (placeholder lines and <code>status</code>), then <code>streaming</code> as the text arrives. With
 * <code>error</code> it says the summary couldn't be written and offers Try again; whatever it sits
 * on is unaffected.</p>
 * <p>It is marked "By the assistant" (<code>badge-label</code> changes it). The header has Try again
 * (<code>regenerate</code>) and Hide (<code>dismiss</code>); the footer has a good or bad rating
 * (<code>feedback</code>) and the <code>why</code> slot, for a link such as "Why these items?".</p>
 * <p><code>variant="inline"</code> is a one-line insight with a sparkle, for the
 * <code>insight</code> slot of <code>wc-stat</code> and the charts or a list's header: no headline,
 * actions or footer.</p>
 * <p>It renders nothing while AI is off for the page; the page under it must make sense without
 * it.</p>
 * @tags display, ai
 *
 * @slot - More content below the text.
 * @slot why - A link that explains the summary, such as "Why these items?".
 *
 * @csspart summary - The card.
 * @csspart content - The text.
 *
 * @cssprop --ai-summary-background - Background of the card.
 *
 * @fires {CustomEvent<void>} regenerate - The person asked for the summary again.
 * @fires {CustomEvent<void>} dismiss - The person hid the summary.
 * @fires {CustomEvent<AiSummaryFeedbackDetail>} feedback - The person rated the summary, or took the rating back.
 *
 * @example
 * ```html
 * <wc-ai-summary headline="For you today" value="- Your leave on 13 November is still waiting[1](cite:lv_7)"></wc-ai-summary>
 * ```
 */
@IndividualComponent
export class AiSummary extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** `card` (default), or `inline`: one line with a sparkle, for an insight under a number or chart. */
  @property({ type: String, reflect: true }) variant: 'card' | 'inline' =
    'card';

  /** Title of the summary, such as "For you today". */
  @property({ type: String }) headline = '';

  /** The summary, as Markdown. */
  @property({ type: String }) value = '';

  /** The summary is being prepared: placeholder lines and `status` show. */
  @property({ type: Boolean, reflect: true }) loading = false;

  /** The summary is arriving: the text grows, with a caret. */
  @property({ type: Boolean, reflect: true }) streaming = false;

  /** What is happening while `loading`, such as "Reading 14 comments…". */
  @property({ type: String }) status = '';

  /** The summary couldn't be written. */
  @property({ type: Boolean, reflect: true }) error = false;

  /** What went wrong; defaults to "The summary couldn't be written." */
  @property({ type: String, attribute: 'error-text' }) errorText = '';

  /** The sources `[n](cite:id)` links refer to. */
  @property({ attribute: false }) citations: AiCitation[] = [];

  /** Address of a cited source not in `citations`; `{id}` is replaced by its id. */
  @property({ type: String, attribute: 'citation-href' }) citationHref = '';

  /** The marker's text; defaults to "By the assistant". */
  @property({ type: String, attribute: 'badge-label' }) badgeLabel = '';

  /** The person's rating. */
  @property({ type: String, reflect: true }) feedback: AiSummaryFeedback = '';

  /** Removes Try again, Hide and the rating. */
  @property({ type: Boolean, attribute: 'hide-actions' }) hideActions = false;

  /** Per-instance string overrides. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  private readonly ai = new AiController(this);

  private readonly headlineId = `wc-ai-summary-${(summaryCount += 1)}`;

  // ── Private methods ──────────────────────────────────────────────────────

  private _fire(type: 'regenerate' | 'dismiss') {
    this.dispatchEvent(
      new CustomEvent(type, { bubbles: true, composed: true }),
    );
  }

  private _rate(value: 'up' | 'down') {
    this.feedback = this.feedback === value ? '' : value;
    this.dispatchEvent(
      new CustomEvent<AiSummaryFeedbackDetail>('feedback', {
        detail: { value: this.feedback },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  private renderBody() {
    const { i18n } = this;
    if (this.error) {
      return html`<p class="error" role="alert">
        <wc-icon name="error" aria-hidden="true"></wc-icon>
        <span>${this.errorText || i18n.t('aiSummaryFailed')}</span>
      </p>`;
    }
    if (this.loading) {
      return html`<div class="placeholder" aria-hidden="true">
          <span class="line"></span><span class="line short"></span>
        </div>
        <wc-typing-indicator
          label=${this.status || i18n.t('typingThinking')}
        ></wc-typing-indicator>`;
    }
    return html`<wc-markdown
      class="text"
      part="content"
      size="sm"
      ?streaming=${this.streaming}
      .value=${this.value}
      .citations=${this.citations}
      citation-href=${this.citationHref}
    ></wc-markdown>`;
  }

  private renderHeaderActions() {
    if (this.hideActions) return nothing;
    const { i18n } = this;
    const busy = this.loading || this.streaming;
    return html`<wc-icon-button
        variant="text"
        shape="round"
        size="sm"
        ?disabled=${busy}
        aria-label=${i18n.t('chatRegenerate')}
        tooltip=${i18n.t('chatRegenerate')}
        @click=${() => this._fire('regenerate')}
        ><wc-icon name="refresh"></wc-icon
      ></wc-icon-button>
      <wc-icon-button
        variant="text"
        shape="round"
        size="sm"
        aria-label=${i18n.t('aiHideGenerated')}
        tooltip=${i18n.t('aiHideGenerated')}
        @click=${() => this._fire('dismiss')}
        ><wc-icon name="close"></wc-icon
      ></wc-icon-button>`;
  }

  private renderFooter() {
    const { i18n } = this;
    const done = !this.loading && !this.streaming && !this.error;
    const rating = done && !this.hideActions;
    return html`<div class="footer">
      <slot name="why"></slot>
      <span class="spacer"></span>
      ${rating
        ? html`<wc-icon-button
              variant="text"
              shape="round"
              size="sm"
              toggle
              ?selected=${this.feedback === 'up'}
              aria-label=${i18n.t('aiSummaryGood')}
              tooltip=${i18n.t('aiSummaryGood')}
              @click=${() => this._rate('up')}
              ><wc-icon name="thumb_up"></wc-icon
            ></wc-icon-button>
            <wc-icon-button
              variant="text"
              shape="round"
              size="sm"
              toggle
              ?selected=${this.feedback === 'down'}
              aria-label=${i18n.t('aiSummaryBad')}
              tooltip=${i18n.t('aiSummaryBad')}
              @click=${() => this._rate('down')}
              ><wc-icon name="thumb_down"></wc-icon
            ></wc-icon-button>`
        : nothing}
      ${this.error && !this.hideActions
        ? html`<wc-button
            size="sm"
            variant="text"
            @click=${() => this._fire('regenerate')}
            >${i18n.t('chatRegenerate')}</wc-button
          >`
        : nothing}
    </div>`;
  }

  render() {
    if (!this.ai.available) return nothing;
    const busy = this.loading || this.streaming;
    if (this.variant === 'inline') {
      return html`<p
        class="inline"
        part="summary"
        aria-busy=${busy ? 'true' : nothing}
      >
        <span class="inline-sparkle" aria-hidden="true">${sparkle}</span>
        <span class="screen-reader-only"
          >${this.badgeLabel || this.i18n.t('aiGenerated')}:</span
        >
        ${this.error
          ? html`<span class="inline-error"
              >${this.errorText || this.i18n.t('aiSummaryFailed')}</span
            >`
          : html`<wc-markdown
              class="inline-text"
              part="content"
              inline
              size="sm"
              ?streaming=${this.streaming}
              .value=${this.value}
              .citations=${this.citations}
              citation-href=${this.citationHref}
            ></wc-markdown>`}
      </p>`;
    }
    return html`<section
      class="summary"
      part="summary"
      aria-labelledby=${this.headline ? this.headlineId : nothing}
      aria-busy=${busy ? 'true' : nothing}
    >
      <header class="header">
        ${this.headline
          ? html`<h2 id=${this.headlineId} class="headline">
              ${this.headline}
            </h2>`
          : nothing}
        <wc-ai-badge kind="generated"
          >${this.badgeLabel || this.i18n.t('aiGenerated')}</wc-ai-badge
        >
        <span class="spacer"></span>
        ${this.renderHeaderActions()}
      </header>
      <div class="body">${this.renderBody()}<slot></slot></div>
      ${this.renderFooter()}
    </section>`;
  }
}
