import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import IndividualComponent from '@/IndividualComponent.js';

import styles from './step.scss';

/** Where a step stands in the flow, derived from its position and its own `error`. */
export type StepStatus = 'complete' | 'current' | 'upcoming';

/** What the stepper tells each step about its place in the flow. */
export interface StepContext {
  /** Zero-based position among the steps. */
  index: number;
  /** Number of steps in the stepper. */
  count: number;
  status: StepStatus;
  /** Whether the step is a button the person can activate. */
  clickable: boolean;
  orientation: 'horizontal' | 'vertical';
}

/** Properties that change the stepper's derived state, so it re-derives when they change. */
const STEPPER_INPUTS = ['value', 'error', 'disabled', 'optional'] as const;

/**
 * @label Step
 * @tag wc-step
 * @rawTag step
 *
 * @summary One step of a `wc-stepper`.
 * @overview
 * <p>Step is one entry in a <code>wc-stepper</code>. Its state comes from its position: steps
 * before the stepper's <code>current</code> step are complete (a check), the current one has
 * <code>aria-current="step"</code>, and later ones are upcoming (their number). <code>error</code>
 * marks it with a warning icon and <code>error-text</code>, <code>disabled</code> takes it out of
 * navigation, and <code>optional</code> adds an "Optional" caption.</p>
 * <p>A screen reader reads each step as its position, label and state, for example
 * "Step 2 of 4, Shipping, Completed".</p>
 *
 * @slot icon - An icon shown instead of the step number while the step is current or upcoming.
 *
 * @example
 * ```html
 * <wc-step value="shipping" label="Shipping" description="Address and delivery"></wc-step>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class Step extends LitElement {
  // ── Static

  /** @nocollapse */ // eslint-disable-next-line
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = [styles];

  // ── Properties

  /** Names the step; the stepper's `current` and the `change` event use it. Defaults to the step's zero-based index. */
  @property({ type: String, reflect: true }) value?: string;

  /** The step's visible name. */
  @property({ type: String }) label = '';

  /** A line of text under the label. */
  @property({ type: String }) description = '';

  /** Marks the step as having a problem: a warning icon replaces its number or check. */
  @property({ type: Boolean, reflect: true }) error = false;

  /** Explains the error, shown under the label in place of the description. */
  @property({ type: String, attribute: 'error-text' }) errorText = '';

  /** Takes the step out of navigation: it cannot be activated or focused. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Shows an "Optional" caption; in a `linear` stepper an optional step does not block later ones. */
  @property({ type: Boolean, reflect: true }) optional = false;

  // ── State

  /** Set by the parent stepper. */
  @state() private context: StepContext = {
    index: 0,
    count: 1,
    status: 'upcoming',
    clickable: false,
    orientation: 'horizontal',
  };

  /** Whether the icon slot has content, which then replaces the number. */
  @state() private hasIcon = false;

  // ── Queries

  @query('.step') private readonly stepElement!: HTMLElement | null;

  // ── Private fields

  private readonly i18n = new I18nController(this);

  // ── Lifecycle

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  updated(changed: PropertyValues<this>) {
    if (STEPPER_INPUTS.some(name => changed.has(name))) {
      (this.closest('wc-stepper') as LitElement | null)?.requestUpdate();
    }
  }

  // ── Public methods

  /** The value the stepper uses for this step: `value`, or the step's zero-based index. */
  get key(): string {
    return this.value ?? String(this.context.index);
  }

  /** The step's derived state, as set by the stepper. */
  get status(): StepStatus {
    return this.context.status;
  }

  /** Whether the person can activate the step (it is a button). */
  get clickable(): boolean {
    return this.context.clickable;
  }

  /**
   * Called by `wc-stepper` with the step's position and state.
   * @internal
   */
  setContext(context: StepContext) {
    const old = this.context;
    if (
      old.index !== context.index ||
      old.count !== context.count ||
      old.status !== context.status ||
      old.clickable !== context.clickable ||
      old.orientation !== context.orientation
    ) {
      this.context = context;
    }
  }

  override focus(options?: Parameters<HTMLElement['focus']>[0]) {
    this.stepElement?.focus(options);
  }

  override blur() {
    this.stepElement?.blur();
  }

  // ── Private methods

  private handleIconSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasIcon = slot.assignedNodes({ flatten: true }).length > 0;
  }

  /** "Step 2 of 4, Shipping, Completed": position, label, then every state that applies. */
  private announcement() {
    const { index, count, status } = this.context;
    const parts = [
      this.i18n.t('stepPosition')(String(index + 1), String(count)),
    ];
    if (this.label) parts.push(this.label);
    if (status === 'complete' && !this.error) {
      parts.push(this.i18n.t('stepCompleted'));
    }
    if (status === 'upcoming' && !this.error) {
      parts.push(this.i18n.t('stepNotStarted'));
    }
    if (this.error) {
      parts.push(this.i18n.t('stepError'));
      if (this.errorText) parts.push(this.errorText);
    }
    if (this.optional) parts.push(this.i18n.t('stepOptional'));
    if (this.disabled) parts.push(this.i18n.t('disabled'));
    return parts.join(', ');
  }

  // ── Render helpers

  private renderIndicator() {
    const { index, status } = this.context;
    let content;
    if (this.error) {
      content = html`<wc-icon class="status-icon" name="warning"></wc-icon>`;
    } else if (status === 'complete') {
      content = html`<wc-icon class="status-icon" name="check"></wc-icon>`;
    } else {
      content = html`<span class="number" ?hidden=${this.hasIcon}
        >${index + 1}</span
      >`;
    }
    const showSlot = !this.error && status !== 'complete';
    return html`
      <span class="indicator" aria-hidden="true">
        ${content}
        <slot
          name="icon"
          ?hidden=${!showSlot}
          @slotchange=${this.handleIconSlotChange}
        ></slot>
      </span>
    `;
  }

  private renderCaption() {
    if (this.error && this.errorText) {
      return html`<span class="caption error-text" aria-hidden="true"
        >${this.errorText}</span
      >`;
    }
    if (this.optional) {
      return html`<span class="caption" aria-hidden="true"
        >${this.i18n.t('stepOptional')}</span
      >`;
    }
    return nothing;
  }

  private renderContent() {
    const { clickable } = this.context;
    // The announcement sits outside `.text`, which a narrow horizontal stepper hides.
    return html`
      <span class="screen-reader-only">${this.announcement()}</span>
      ${this.renderIndicator()}
      <span class="text">
        <span class="label" aria-hidden="true">${this.label}</span>
        ${this.description
          ? html`<span
              id="description"
              class="description"
              aria-hidden=${clickable ? 'true' : nothing}
              >${this.description}</span
            >`
          : nothing}
        ${this.renderCaption()}
      </span>
    `;
  }

  // ── Render

  render() {
    const { status, clickable, orientation, index, count } = this.context;
    const classes = {
      step: true,
      [status]: true,
      [orientation]: true,
      error: this.error,
      disabled: this.disabled,
      clickable,
      last: index === count - 1,
    };
    const current = status === 'current' ? 'step' : nothing;

    const body = clickable
      ? html`<button
          id="control"
          class=${classMap(classes)}
          type="button"
          aria-current=${current}
          aria-describedby=${this.description ? 'description' : nothing}
        >
          <wc-focus-ring class="focus-ring" for="control"></wc-focus-ring>
          ${this.renderContent()}
        </button>`
      : html`<div
          class=${classMap(classes)}
          aria-current=${current}
          aria-disabled=${this.disabled ? 'true' : nothing}
        >
          ${this.renderContent()}
        </div>`;

    return html`${body}<span
        class=${classMap({
          connector: true,
          [orientation]: true,
          complete: status === 'complete',
          last: index === count - 1,
        })}
        aria-hidden="true"
      ></span>`;
  }
}
