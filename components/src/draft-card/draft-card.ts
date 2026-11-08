import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { AiController } from '@/__internal/ai/ai-controller.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import { safeUrl } from '@/__internal/rich-text/url.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './draft-card.scss';

/** Where a draft stands. */
export type DraftCardState =
  | 'draft'
  | 'submitting'
  | 'done'
  | 'error'
  | 'discarded';

/** One value of the drafted record. */
export interface DraftCardField {
  label: string;
  value: string;
  /** The assistant chose this value; it shows a Suggested badge. */
  suggested?: boolean;
  /** Why, shown under the value. */
  reason?: string;
}

let draftCount = 0;

/**
 * @label Draft Card
 * @tag wc-draft-card
 * @rawTag draft-card
 * @summary A record the assistant prepared, shown for the person to confirm, edit in the app's form, or discard.
 * @overview
 * <p>The only way the assistant's writes appear (ADR-000007: reads are free, writes are drafts).
 * <code>headline</code> says what it is ("New incident") and <code>supporting-text</code> where
 * ("IT service desk"); put the app's mark in the <code>start</code> slot. List the values in
 * <code>fields</code>, each optionally <code>suggested</code> with a <code>reason</code>, or slot
 * your own content.</p>
 * <p>The buttons fire events; the app does the work and sets <code>state</code>:</p>
 * <ul>
 *   <li><code>confirm</code> (the <code>confirm-label</code> button, such as "Raise incident"): set
 *   <code>submitting</code>, then <code>done</code> with <code>result-text</code> and
 *   <code>result-href</code>, or <code>error</code> with <code>error-text</code>.</li>
 *   <li><code>edit</code> (Edit in form): open the app's own form, filled with the draft, for example
 *   with <code>wc-form</code>'s <code>suggest()</code>.</li>
 *   <li><code>discard</code>: the card turns <code>discarded</code> unless the event is
 *   cancelled.</li>
 * </ul>
 * <p>With <code>irreversible</code>, Confirm asks again in a <code>wc-confirm-dialog</code> first.
 * Like every marker of the assistant, the card renders nothing while AI is off for the page.</p>
 * @tags display, ai
 *
 * @slot - Content below the fields.
 * @slot start - The app's mark, before the headline.
 * @slot actions - More buttons after Confirm and Edit in form.
 *
 * @csspart card - The card.
 *
 * @fires {CustomEvent<void>} confirm - The person confirmed the draft (after the second ask, with `irreversible`).
 * @fires {CustomEvent<void>} edit - The person wants to change the draft in the app's form.
 * @fires {CustomEvent<void>} discard - Cancelable. The person discarded the draft.
 *
 * @example
 * ```html
 * <wc-draft-card headline="New incident" supporting-text="IT service desk" confirm-label="Raise incident"></wc-draft-card>
 * ```
 */
@IndividualComponent
export class DraftCard extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** What the draft is, such as "New incident". */
  @property({ type: String }) headline = '';

  /** Where it goes, such as "IT service desk". */
  @property({ type: String, attribute: 'supporting-text' }) supportingText = '';

  /** The drafted values. */
  @property({ attribute: false }) fields: DraftCardField[] = [];

  /** Where the draft stands; the app sets it as it saves. */
  @property({ type: String, reflect: true }) state: DraftCardState = 'draft';

  /** Text of the confirm button, such as "Raise incident". Defaults to "Confirm". */
  @property({ type: String, attribute: 'confirm-label' }) confirmLabel = '';

  /** Confirm asks again first, for something that can't be undone. */
  @property({ type: Boolean, reflect: true }) irreversible = false;

  /** What the second ask says; defaults to "This can't be undone." */
  @property({ type: String, attribute: 'irreversible-text' }) irreversibleText =
    '';

  /** What happened, once `done`, such as "Raised INC-2318 in IT service desk". */
  @property({ type: String, attribute: 'result-text' }) resultText = '';

  /** Where the saved record opens, once `done`. */
  @property({ type: String, attribute: 'result-href' }) resultHref = '';

  /** What went wrong, with `error`; defaults to "This couldn't be saved." */
  @property({ type: String, attribute: 'error-text' }) errorText = '';

  /** Per-instance string overrides. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('wc-confirm-dialog')
  private _dialog?: HTMLElement & { show(): void };

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  private readonly ai = new AiController(this);

  private readonly headlineId = `wc-draft-card-${(draftCount += 1)}`;

  // ── Private methods ──────────────────────────────────────────────────────

  private _fire(type: 'confirm' | 'edit') {
    this.dispatchEvent(
      new CustomEvent(type, { bubbles: true, composed: true }),
    );
  }

  private _onConfirm = () => {
    if (this.state === 'submitting') return;
    if (this.irreversible && this._dialog) {
      this._dialog.show();
      return;
    }
    this._fire('confirm');
  };

  private _onDialogConfirm = (event: Event) => {
    event.stopPropagation();
    this._fire('confirm');
  };

  private _onDiscard = () => {
    const accepted = this.dispatchEvent(
      new CustomEvent('discard', {
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (accepted) this.state = 'discarded';
  };

  // ── Render ───────────────────────────────────────────────────────────────

  private renderFields() {
    if (!this.fields.length) return nothing;
    return html`<dl class="fields">
      ${this.fields.map(
        field =>
          html`<div class="field">
            <dt>${field.label}</dt>
            <dd>
              <span class="value">${field.value}</span>${field.suggested
                ? html` <wc-ai-badge></wc-ai-badge>`
                : nothing}
              ${field.reason
                ? html`<span class="reason">${field.reason}</span>`
                : nothing}
            </dd>
          </div>`,
      )}
    </dl>`;
  }

  private renderFooter() {
    const { i18n, state } = this;
    if (state === 'discarded') return nothing;
    if (state === 'done') {
      const href = safeUrl(this.resultHref);
      return html`<p class="done" role="status">
        <wc-icon name="check_circle" aria-hidden="true"></wc-icon>
        <span class="done-text">${this.resultText}</span>
        ${href
          ? html`<wc-link href=${href}>${i18n.t('draftOpen')}</wc-link>`
          : nothing}
      </p>`;
    }
    const submitting = state === 'submitting';
    return html`${state === 'error'
        ? html`<p class="error" role="alert">
            <wc-icon name="error" aria-hidden="true"></wc-icon>
            <span>${this.errorText || i18n.t('draftFailed')}</span>
          </p>`
        : nothing}
      <div class="actions">
        <wc-button
          size="sm"
          color=${this.irreversible ? 'danger' : nothing}
          ?loading=${submitting}
          @click=${this._onConfirm}
          >${this.confirmLabel || i18n.t('draftConfirm')}</wc-button
        >
        <wc-button
          size="sm"
          variant="text"
          ?disabled=${submitting}
          @click=${() => this._fire('edit')}
          >${i18n.t('draftEdit')}</wc-button
        >
        <slot name="actions"></slot>
        <span class="spacer"></span>
        <wc-icon-button
          variant="text"
          shape="round"
          size="sm"
          ?disabled=${submitting}
          aria-label=${i18n.t('draftDiscard')}
          tooltip=${i18n.t('draftDiscard')}
          @click=${this._onDiscard}
          ><wc-icon name="delete"></wc-icon
        ></wc-icon-button>
      </div>`;
  }

  render() {
    if (!this.ai.available) return nothing;
    const { state, i18n } = this;
    const pending =
      state === 'draft' || state === 'submitting' || state === 'error';
    return html`<section
        class=${classMap({ card: true, [`state-${state}`]: true })}
        part="card"
        aria-labelledby=${this.headlineId}
      >
        <header class="head">
          <slot name="start"></slot>
          <div class="titles">
            <h3 id=${this.headlineId} class="headline">${this.headline}</h3>
            <p class="supporting-text">
              ${state === 'discarded'
                ? i18n.t('draftDiscarded')
                : this.supportingText}
            </p>
          </div>
          ${pending ? html`<wc-ai-badge kind="draft"></wc-ai-badge>` : nothing}
        </header>
        ${state === 'discarded'
          ? nothing
          : html`${this.renderFields()}
              <div class="body"><slot></slot></div>`}
        ${this.renderFooter()}
      </section>
      ${this.irreversible
        ? html`<wc-confirm-dialog
            headline=${this.headline}
            confirm-label=${this.confirmLabel || i18n.t('draftConfirm')}
            intent="danger"
            @confirm=${this._onDialogConfirm}
            @open=${(event: Event) => event.stopPropagation()}
            @close=${(event: Event) => event.stopPropagation()}
            >${this.irreversibleText ||
            i18n.t('draftCantUndo')}</wc-confirm-dialog
          >`
        : nothing}`;
  }
}
