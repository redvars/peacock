import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';

import { AiController } from '@/__internal/ai/ai-controller.js';
import { sparkle } from '@/__internal/ai/sparkle.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './ai-badge.scss';

/** What the marked output is. */
export type AiBadgeKind = 'suggested' | 'draft' | 'generated';

/**
 * @label AI Badge
 * @tag wc-ai-badge
 * @rawTag ai-badge
 * @summary Marks a value, draft or text as made by the assistant, says why, and can clear it in one action.
 * @overview
 * <p>The one marker for AI output in Peacock (ADR-030002). Put it beside anything the assistant
 * made until a person accepts it:</p>
 * <ul>
 *   <li><code>suggested</code> (default): a value the person hasn't accepted, such as a field the
 *   assistant filled in.</li>
 *   <li><code>draft</code>: a record or text waiting to be confirmed, such as an incident the
 *   assistant prepared.</li>
 *   <li><code>generated</code>: read-only output, such as a summary. Shown as colored text without
 *   a container.</li>
 * </ul>
 * <p><code>reason</code> says why, in a sentence: it shows in a tooltip on hover or keyboard focus
 * and is read as the badge's description. <code>dismissible</code> adds a clear button that fires
 * <code>dismiss</code>; the app then removes the suggestion, discards the draft or hides the
 * summary.</p>
 * <p>When AI is off for the page (<code>setPeacockAi({ enabled: false })</code>) the badge renders
 * nothing, so a page that still passes AI state in never shows a stale marker.</p>
 * <p>The label is always text, never only the color or the sparkle. Replace it with the default
 * slot, for example "Summary by the assistant".</p>
 * @tags display, ai
 *
 * @slot - The label, instead of the default one for the kind.
 *
 * @csspart badge - The badge container.
 * @csspart sparkle - The sparkle glyph.
 * @csspart dismiss - The clear button.
 *
 * @cssprop --ai-badge-container-color - Background of the badge.
 * @cssprop --ai-badge-color - Text and sparkle color.
 *
 * @fires {CustomEvent<void>} dismiss - Fired when the clear button is pressed.
 *
 * @example
 * ```html
 * <wc-ai-badge reason="You didn't say you can't work."></wc-ai-badge>
 * ```
 * @example
 * ```html
 * <wc-ai-badge kind="generated">Summary by the assistant</wc-ai-badge>
 * ```
 */
@IndividualComponent
export class AiBadge extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** What the marked output is: `suggested`, `draft` or `generated`. */
  @property({ type: String, reflect: true }) kind: AiBadgeKind = 'suggested';

  /** Why the assistant made this, in a sentence. Shown in a tooltip and read as the description. */
  @property({ type: String }) reason = '';

  /** Adds a button that clears the output in one action. */
  @property({ type: Boolean, reflect: true }) dismissible = false;

  /** Per-instance string overrides. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly _ai = new AiController(this);

  private readonly i18n = new I18nController(this);

  // ── Private methods ──────────────────────────────────────────────────────

  private _label(): string {
    if (this.kind === 'draft') return this.i18n.t('aiDraft');
    if (this.kind === 'generated') return this.i18n.t('aiGenerated');
    return this.i18n.t('aiSuggested');
  }

  private _dismissLabel(): string {
    if (this.kind === 'draft') return this.i18n.t('aiDiscardDraft');
    if (this.kind === 'generated') return this.i18n.t('aiHideGenerated');
    return this.i18n.t('aiClearSuggestion');
  }

  private _onDismiss(event: Event) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('dismiss', { bubbles: true, composed: true }),
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    if (!this._ai.available) return nothing;
    const reason = this.reason.trim();
    // The tooltip sits outside the badge so it doesn't inherit the badge's one-line label styles.
    return html`<span class="badge" part="badge"
        ><span class="label" id="label" tabindex=${reason ? 0 : nothing}
          >${sparkle}<slot>${this._label()}</slot></span
        >${this.dismissible
          ? html`<button
              class="dismiss"
              part="dismiss"
              type="button"
              aria-label=${this._dismissLabel()}
              @click=${this._onDismiss}
            >
              <wc-icon name="close"></wc-icon>
            </button>`
          : nothing}</span
      >${reason
        ? html`<wc-tooltip for="label" placement="bottom-start"
            >${reason}</wc-tooltip
          >`
        : nothing}`;
  }
}
