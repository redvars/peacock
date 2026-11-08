import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type {
  PeacockStringKey,
  PeacockStrings,
} from '@/__internal/i18n/strings.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './assistant-step.scss';

/** Where a step stands. `blocked`: the person's access did not allow it. */
export type AssistantStepStatus =
  | 'pending'
  | 'running'
  | 'done'
  | 'error'
  | 'blocked';

/** The icon and spoken name of each status. */
export const STEP_STATUS: Record<
  AssistantStepStatus,
  { icon: string; label: PeacockStringKey }
> = {
  pending: { icon: 'radio_button_unchecked', label: 'assistantStepPending' },
  running: { icon: 'progress_activity', label: 'assistantStepRunning' },
  done: { icon: 'check', label: 'assistantStepDone' },
  error: { icon: 'error', label: 'assistantStepError' },
  blocked: { icon: 'block', label: 'assistantStepBlocked' },
};

/**
 * @label Assistant Step
 * @tag wc-assistant-step
 * @rawTag assistant-step
 * @summary One thing the assistant did to answer, such as a lookup in an app, with its status.
 * @overview
 * <p>Goes in <code>wc-assistant-steps</code>. The content says what was done, such as "found
 * LT-0412 assigned to you"; <code>app</code> names where. <code>status</code> is
 * <code>pending</code>, <code>running</code>, <code>done</code>, <code>error</code>, or
 * <code>blocked</code> when the person's access did not allow it. Steps are the platform's calls,
 * not the model's words, so they show what the answer is based on.</p>
 * @tags display, ai
 *
 * @slot - What the step did.
 *
 * @example
 * ```html
 * <wc-assistant-step status="done" app="Asset management">found LT-0412 assigned to you</wc-assistant-step>
 * ```
 */
@IndividualComponent
export class AssistantStep extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Where the step stands. Reflected, so `wc-assistant-steps` can sum them up. */
  @property({ type: String, reflect: true }) status: AssistantStepStatus =
    'pending';

  /** The app the step looked in or acted on. */
  @property({ type: String }) app = '';

  /** Per-instance string overrides. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const status = STEP_STATUS[this.status] ?? STEP_STATUS.pending;
    return html`<wc-icon
        class="icon"
        name=${status.icon}
        aria-hidden="true"
      ></wc-icon
      ><span class="text"
        >${this.app
          ? html`<span class="app">${this.app}</span
              ><span class="separator" aria-hidden="true"> · </span>`
          : nothing}<slot></slot
        ><span class="screen-reader-only"
          >, ${this.i18n.t(status.label)}</span
        ></span
      >`;
  }
}
