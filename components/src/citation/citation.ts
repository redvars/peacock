import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import { safeUrl } from '@/__internal/rich-text/url.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './citation.scss';

/** `detail` of `select`. */
export interface CitationSelectDetail {
  /** The source's id. */
  value: string;
  /** The chip's text, such as `2`. */
  label: string;
  /** Where the source opens, if anywhere. */
  href?: string;
}

/**
 * @label Citation
 * @tag wc-citation
 * @rawTag citation
 * @summary A small numbered chip that links an answer to the record or page it is based on, with a preview on hover.
 * @overview
 * <p>Answers and summaries cite the records they used, so a person can check them (ADR-000007:
 * facts come from the platform, words from the model). Each citation is a chip with a short
 * <code>label</code>, usually a number. With <code>href</code> it is a link to the source;
 * without, a button that fires <code>select</code>.</p>
 * <p><code>headline</code> and <code>supporting-text</code> describe the source in a preview card
 * that opens while the chip is hovered or focused; anything in the default slot is added to the
 * card. The chip's accessible name is "Source 2: Payroll integration", so it reads well out of
 * context.</p>
 * <p><code>wc-markdown</code> renders links written as <code>[2](cite:rule_88)</code> as
 * citations, filled from its <code>citations</code> property.</p>
 * <p>Citations do not depend on the page's AI settings: a reference to a record is a fact.</p>
 * @tags display, ai
 *
 * @slot - More content for the preview card, such as a status or a link.
 *
 * @csspart chip - The chip.
 * @csspart preview - The preview card's content.
 *
 * @cssprop --citation-container-color - Background of the chip.
 * @cssprop --citation-color - Text color of the chip.
 *
 * @fires {CustomEvent<CitationSelectDetail>} select - Fired when the chip is pressed. Cancel it to stop a link from being followed.
 *
 * @example
 * ```html
 * <p>Readable by the Payroll integration<wc-citation label="2" value="rule_88"
 *   headline="Payroll integration reads Employee.Salary"
 *   supporting-text="Access rule · Human resources" href="/rules/88"></wc-citation>.</p>
 * ```
 */
@IndividualComponent
export class Citation extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The chip's text, usually a number. */
  @property({ type: String }) label = '';

  /** The source's id, sent with `select`. */
  @property({ type: String }) value = '';

  /** Title of the source, shown in the preview and read in the chip's name. */
  @property({ type: String }) headline = '';

  /** Kind and place of the source, such as "Access rule · Human resources". */
  @property({ type: String, attribute: 'supporting-text' }) supportingText = '';

  /** Where the source opens. Without it the chip is a button. */
  @property({ type: String }) href = '';

  /** Per-instance string overrides. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── State ────────────────────────────────────────────────────────────────

  @state() private _hasContent = false;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  // ── Private methods ──────────────────────────────────────────────────────

  private _onSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this._hasContent = slot
      .assignedNodes({ flatten: true })
      .some(node =>
        node.nodeType === Node.ELEMENT_NODE ? true : !!node.textContent?.trim(),
      );
  }

  private _onClick(event: Event) {
    const href = safeUrl(this.href);
    const selected = this.dispatchEvent(
      new CustomEvent<CitationSelectDetail>('select', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: {
          value: this.value,
          label: this.label,
          ...(href ? { href } : {}),
        },
      }),
    );
    if (!selected) event.preventDefault();
  }

  private _chip() {
    const href = safeUrl(this.href);
    const name = this.i18n.t('citationLabel')(this.label, this.headline);
    return href
      ? html`<a
          class="chip"
          part="chip"
          href=${href}
          aria-label=${name}
          @click=${this._onClick}
          >${this.label}</a
        >`
      : html`<button
          class="chip"
          part="chip"
          type="button"
          aria-label=${name}
          @click=${this._onClick}
        >
          ${this.label}
        </button>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const slot = html`<slot @slotchange=${this._onSlotChange}></slot>`;
    const preview = !!(
      this.headline ||
      this.supportingText ||
      this._hasContent
    );
    if (!preview) return html`${this._chip()}<span hidden>${slot}</span>`;
    return html`<wc-hover-card placement="top-start" open-delay="250"
      >${this._chip()}
      <div slot="content" class="preview" part="preview">
        ${this.supportingText
          ? html`<span class="supporting-text">${this.supportingText}</span>`
          : nothing}
        ${this.headline
          ? html`<strong class="headline">${this.headline}</strong>`
          : nothing}
        ${slot}
      </div></wc-hover-card
    >`;
  }
}
