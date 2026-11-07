import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';

import { AiController } from '@/__internal/ai/ai-controller.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import IndividualComponent from '@/IndividualComponent.js';
import {
  STEP_STATUS,
  type AssistantStep,
  type AssistantStepStatus,
} from './assistant-step.js';
import styles from './assistant-steps.scss';

let stepsCount = 0;

/**
 * @label Assistant Steps
 * @tag wc-assistant-steps
 * @rawTag assistant-steps
 * @summary What the assistant did to answer, in one line that opens to each step: the lookups behind an answer.
 * @overview
 * <p>Put it in a <code>wc-chat-message</code>'s <code>steps</code> slot, with a
 * <code>wc-assistant-step</code> for each lookup or action. Collapsed, it shows <code>label</code>,
 * such as "Looked up your laptop in Asset management", with an icon for how the steps stand:
 * working while any runs, an error if any failed, done otherwise. <strong>Show steps</strong> opens
 * the list.</p>
 * <p>Steps come from the platform's calls, so a person can see what an answer is based on, and a step
 * their access did not allow says so (ADR-000007: the assistant acts as the person using it).</p>
 * <p>Like every marker of the assistant, it renders nothing while AI is off for the page.</p>
 * @tags display, ai
 *
 * @slot - The `wc-assistant-step`s.
 *
 * @fires {CustomEvent<void>} open - The steps opened.
 * @fires {CustomEvent<{reason: 'action'}>} close - The steps closed.
 *
 * @example
 * ```html
 * <wc-assistant-steps label="Looked up 2 records in 2 apps">
 *   <wc-assistant-step status="done" app="Asset management">found LT-0412</wc-assistant-step>
 *   <wc-assistant-step status="blocked" app="Payroll">not read: you don't have access</wc-assistant-step>
 * </wc-assistant-steps>
 * ```
 */
@IndividualComponent
export class AssistantSteps extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** What the steps add up to, such as "Looked up 2 records in 2 apps". */
  @property({ type: String }) label = '';

  /** Whether the list of steps shows. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** Per-instance string overrides. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── State ────────────────────────────────────────────────────────────────

  @state() private _statuses: AssistantStepStatus[] = [];

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  private readonly ai = new AiController(this);

  private readonly listId = `wc-assistant-steps-${(stepsCount += 1)}`;

  private _observer?: MutationObserver;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    this._observer = new MutationObserver(() => this._sync());
    this._observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['status'],
    });
    this._sync();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** How the steps stand together: running, error, pending or done. */
  get status(): AssistantStepStatus {
    const statuses = this._statuses;
    if (statuses.includes('running')) return 'running';
    if (statuses.includes('error')) return 'error';
    if (statuses.includes('pending')) return 'pending';
    return 'done';
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private _sync() {
    this._statuses = Array.from(
      this.querySelectorAll<AssistantStep>(':scope > wc-assistant-step'),
    ).map(
      step => (step.getAttribute('status') as AssistantStepStatus) || 'pending',
    );
  }

  private _toggle() {
    this.open = !this.open;
    this.dispatchEvent(
      this.open
        ? new CustomEvent('open', { bubbles: true, composed: true })
        : new CustomEvent('close', {
            detail: { reason: 'action' },
            bubbles: true,
            composed: true,
          }),
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    if (!this.ai.available) return nothing;
    const { status } = this;
    const icon = STEP_STATUS[status];
    const hasSteps = this._statuses.length > 0;
    return html`<div class="summary status-${status}">
        <wc-icon class="icon" name=${icon.icon} aria-hidden="true"></wc-icon>
        <span class="label"
          >${this.label}<span class="screen-reader-only"
            >, ${this.i18n.t(icon.label)}</span
          ></span
        >
        ${hasSteps
          ? html`<button
              class="toggle"
              type="button"
              aria-expanded=${this.open ? 'true' : 'false'}
              aria-controls=${this.listId}
              @click=${this._toggle}
            >
              ${this.open
                ? this.i18n.t('assistantStepsHide')
                : this.i18n.t('assistantStepsShow')}
            </button>`
          : nothing}
      </div>
      <div id=${this.listId} class="list" role="list" ?hidden=${!this.open}>
        <slot></slot>
      </div>`;
  }
}
