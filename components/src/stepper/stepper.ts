import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { RovingFocusController } from '@/__internal/controllers/roving-focus-controller.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import IndividualComponent from '@/IndividualComponent.js';

import { Step, type StepStatus } from './step.js';
import styles from './stepper.scss';

/** Detail of the `change` event. */
export interface StepperChangeDetail {
  /** The chosen step's `value`, or its zero-based index as a string when it has none. */
  value: string;
  /** The chosen step's zero-based index. */
  index: number;
}

/** How the person can move between steps. */
export type StepperNavigation = 'none' | 'linear' | 'free';

/**
 * @label Stepper
 * @tag wc-stepper
 * @rawTag stepper
 *
 * @summary Shows progress through a multi-step flow, such as a wizard, onboarding or checkout.
 * @overview
 * <p>Stepper shows where the person is in a flow; the app renders each step's content itself.
 * <code>current</code> names the current step by its <code>value</code> (a step without one is
 * named by its zero-based index, so <code>current="1"</code> is the second step). An empty or
 * unknown <code>current</code> means the first step. Steps before the current one are complete
 * and later ones upcoming; each step can add <code>error</code>, <code>disabled</code> or
 * <code>optional</code>.</p>
 * <p>By default (<code>navigation="none"</code>) the stepper is a plain list and the app
 * moves it with <code>current</code>, <code>next()</code> and <code>previous()</code>. With
 * <code>navigation="free"</code> every step that is not disabled is a button; with
 * <code>navigation="linear"</code> only the steps up to the first unfinished required step are, so
 * the person can go back but not skip ahead. Activating a step fires a cancelable
 * <code>change</code> and then moves <code>current</code>. The steps are one tab stop: the arrow
 * keys (mirrored in right-to-left layouts), Home and End move between them, and Enter or Space
 * activates one.</p>
 *
 * @fires {CustomEvent<{value: string, index: number}>} change - Dispatched when the person activates a step. Cancel it to keep the current step.
 *
 * @cssprop --stepper-indicator-size - Diameter of the step indicators.
 * @cssprop --stepper-connector-color - Color of the line between upcoming steps.
 * @cssprop --stepper-connector-complete-color - Color of the line after a complete step.
 *
 * @example
 * ```html
 * <wc-stepper current="shipping">
 *   <wc-step value="cart" label="Cart"></wc-step>
 *   <wc-step value="shipping" label="Shipping"></wc-step>
 *   <wc-step value="payment" label="Payment"></wc-step>
 *   <wc-step value="review" label="Review"></wc-step>
 * </wc-stepper>
 * ```
 * @example
 * ```html
 * <wc-stepper orientation="vertical" navigation="linear" current="1">
 *   <wc-step label="Account" description="Name and email"></wc-step>
 *   <wc-step label="Team" optional></wc-step>
 *   <wc-step label="Billing" error error-text="Card declined"></wc-step>
 * </wc-stepper>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class Stepper extends LitElement {
  // ── Static

  static styles = [styles];

  static Step = Step;

  // ── Properties

  /** The current step's `value` (or zero-based index, for steps without a value). */
  @property({ type: String, reflect: true }) current = '';

  /** Lays the steps out in a row (labels collapse when narrow) or a column (with descriptions). */
  @property({ type: String, reflect: true })
  orientation: 'horizontal' | 'vertical' = 'horizontal';

  /** How the person can move between steps: not at all, back and up to the next step, or freely. */
  @property({ type: String, reflect: true })
  navigation: StepperNavigation = 'none';

  /** Size of the indicators and text. */
  @property({ type: String, reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  /** Accessible name of the list; defaults to "Progress". */
  @property({ type: String }) label = '';

  // ── Private fields

  private readonly i18n = new I18nController(this);

  /** One tab stop, on the current step; the arrow keys move focus without activating. */
  private readonly roving = new RovingFocusController(this, {
    items: () => this.steps(),
    orientation: () => this.orientation,
    initialItem: items =>
      items.find(step => (step as Step).status === 'current') ?? items[0],
    isFocusable: item => (item as Step).clickable,
    manageTabIndex: () => this.navigation !== 'none',
  });

  // ── Lifecycle

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick);
    super.disconnectedCallback();
  }

  willUpdate(changed: PropertyValues<this>) {
    // The steps' states feed the roving controller, which syncs before `updated`.
    this.syncSteps();
    // The tab stop follows `current`, also when the app moves it.
    if (changed.has('current') && this.navigation !== 'none') {
      const current = this.steps().find(step => step.status === 'current');
      if (current?.clickable) this.roving.setActive(current, false);
    }
    if (changed.has('navigation') && this.navigation === 'none') {
      for (const step of this.steps()) step.removeAttribute('tabindex');
    }
  }

  // ── Public methods

  /** Makes the next step that is not disabled current. Does not fire `change`. */
  next() {
    this.moveBy(1);
  }

  /** Makes the previous step that is not disabled current. Does not fire `change`. */
  previous() {
    this.moveBy(-1);
  }

  // ── Private methods

  private steps(): Step[] {
    return Array.from(this.children).filter(
      (child): child is Step => child instanceof Step,
    );
  }

  /** Index of the current step: the step whose key is `current`, else the first. */
  private currentIndex(steps: Step[]) {
    const index = steps.findIndex(
      (step, i) => (step.value ?? String(i)) === this.current,
    );
    return Math.max(0, index);
  }

  /** Pushes each step's position, derived state and clickability into it. */
  private syncSteps() {
    const steps = this.steps();
    const currentIndex = this.currentIndex(steps);
    const statusOf = (i: number): StepStatus => {
      if (i < currentIndex) return 'complete';
      if (i === currentIndex) return 'current';
      return 'upcoming';
    };
    // Linear: reachable up to the first step that is unfinished, required and not disabled.
    let reachable = steps.length - 1;
    if (this.navigation === 'linear') {
      const blocker = steps.findIndex(
        (step, i) =>
          !step.disabled &&
          !step.optional &&
          (statusOf(i) !== 'complete' || step.error),
      );
      if (blocker >= 0) reachable = blocker;
    }
    steps.forEach((step, index) => {
      step.setContext({
        index,
        count: steps.length,
        status: statusOf(index),
        clickable:
          this.navigation !== 'none' && !step.disabled && index <= reachable,
        orientation: this.orientation,
      });
    });
  }

  private moveBy(delta: number) {
    const steps = this.steps();
    let index = this.currentIndex(steps) + delta;
    while (index >= 0 && index < steps.length && steps[index].disabled) {
      index += delta;
    }
    const step = steps[index];
    if (step) this.current = step.value ?? String(index);
  }

  private handleClick = (event: MouseEvent) => {
    const path = event.composedPath();
    const step = this.steps().find(item => path.includes(item));
    // Only a click on the step's own button counts, not on its connector line.
    if (
      !step ||
      !step.clickable ||
      !path.some(node => node instanceof HTMLButtonElement)
    ) {
      return;
    }
    this.activate(step);
  };

  private activate(step: Step) {
    const steps = this.steps();
    const index = steps.indexOf(step);
    if (index === this.currentIndex(steps)) return;
    const detail: StepperChangeDetail = { value: step.key, index };
    const proceed = this.dispatchEvent(
      new CustomEvent<StepperChangeDetail>('change', {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail,
      }),
    );
    if (proceed) this.current = detail.value;
  }

  private handleSlotChange = () => {
    this.requestUpdate();
  };

  // ── Render

  render() {
    // A list of the slotted steps, which are `listitem`s; each step reads its own position
    // ("Step 2 of 4"), so the order does not depend on an `<ol>`, which cannot hold a slot.
    return html`
      <div
        class="stepper ${this.orientation}"
        role="list"
        aria-label=${this.label || this.i18n.t('stepperLabel')}
        @keydown=${this.roving.handleKeyDown}
        @focusin=${this.roving.handleFocusIn}
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }
}
