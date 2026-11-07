import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { autoUpdate } from '@floating-ui/dom';

import IndividualComponent from '@/IndividualComponent.js';
import { FloatingController } from '@/__internal/controllers/floating-controller.js';
import {
  type CloseReason,
  OverlayController,
} from '@/__internal/controllers/overlay-controller.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { isRtl } from '@/__internal/i18n/locale.js';
import {
  type OverlayPlacement,
  toPhysicalPlacement,
} from '@/__internal/utils/placement.js';
import { warnOnce } from '@/__internal/utils/warn-once.js';
import styles from './tour.scss';

/** One step of a tour. */
export interface TourStep {
  /**
   * The element to highlight: an element id (`"save-button"`) or a CSS selector
   * (`"#save-button"`, `"[data-tour=filters]"`). Leave it out for a step centered on the page,
   * such as a welcome. A step whose target is not on the page is skipped with a console warning.
   */
  target?: string;
  headline: string;
  body?: string;
  /** Where the popup sits relative to the target. Defaults to `bottom`. */
  placement?: OverlayPlacement;
}

/** Detail of `step-change`. */
export interface TourStepChangeDetail {
  /** Zero-based index of the step now shown. */
  index: number;
  step: TourStep;
}

/** Detail of the tour's `close` event. */
export interface TourCloseDetail {
  reason: CloseReason;
  /** True when the person finished the last step (Done, or `next()` on the last step). */
  completed: boolean;
}

interface ResolvedStep {
  index: number;
  target: HTMLElement | null;
}

/**
 * @label Tour
 * @tag wc-tour
 * @rawTag tour
 * @summary A product tour: a sequence of popups that point at parts of the page, with a spotlight on each.
 *
 * @overview
 * <p>Give the tour its <code>steps</code> as data: each has a <code>target</code> (an element id or
 * a CSS selector), a <code>headline</code>, a <code>body</code> and an optional
 * <code>placement</code>. <code>start()</code> shows the first step: the target scrolls into view
 * (instantly when the person prefers reduced motion), a spotlight cut out of a dimmed scrim marks it,
 * and a popup next to it shows "Step 2 of 5", the text, Back, Next (Done on the last step) and a
 * close button that skips the tour. floating-ui flips and shifts the popup so it stays in view. A
 * step without <code>target</code> is centered on the page.</p>
 * <p>A step whose target is not on the page is skipped in the direction of travel, with a console
 * warning once per target, so a tour survives a missing feature or a collapsed panel.</p>
 * <p>The popup is a <strong>non-modal</strong> dialog (<code>role="dialog"</code>, named by the
 * headline, described by the body). The scrim is only drawn, never hit: clicks reach the page, so
 * the person can try the highlighted control while the tour explains it, which a modal tour would
 * block by making the page inert. Focus moves into the popup at each step and back to where it was
 * when the tour ends. Escape ends the tour; Left and Right (mirrored in right-to-left layouts) go
 * back and forward while focus is in the popup.</p>
 * <p>Methods: <code>start(index = 0)</code>, <code>next()</code>, <code>previous()</code>,
 * <code>end()</code>. <code>step-change</code> fires with <code>detail.index</code> each time a step
 * shows, and <code>close</code> with <code>detail.reason</code> (<code>'escape'</code>,
 * <code>'action'</code> for Done or the close button, <code>'api'</code>) and
 * <code>detail.completed</code>, true when the person finished the last step. Store that to avoid
 * showing a finished tour again.</p>
 *
 * @fires {CustomEvent} open - Fired when the tour starts.
 * @fires {CustomEvent<{index: number, step: TourStep}>} step-change - Fired each time a step is shown, including the first.
 * @fires {CustomEvent<{reason: 'escape' | 'action' | 'api', completed: boolean}>} close - Fired when the tour ends.
 *
 * @cssprop --tour-scrim-color - Color of the dimmed page around the spotlight.
 * @cssprop --tour-spotlight-padding - Space between the target and the spotlight edge. Defaults to `0.5rem`.
 * @cssprop --tour-spotlight-radius - Corner radius of the spotlight.
 * @cssprop --tour-popup-width - Width of the popup. Defaults to `20rem`.
 * @cssprop --tour-z-index - Stacking order where the top layer is unavailable.
 *
 * @example
 * ```html
 * <wc-tour id="tour"></wc-tour>
 * <script>
 *   const tour = document.querySelector('#tour');
 *   tour.steps = [
 *     { headline: 'Welcome', body: 'A quick look around.' },
 *     { target: 'search', headline: 'Search', body: 'Find anything from here.' },
 *     { target: '[data-tour=new]', headline: 'Create', body: 'Start a new project.', placement: 'end' },
 *   ];
 *   tour.addEventListener('close', e => { if (e.detail.completed) localStorage.setItem('tour-done', '1'); });
 *   tour.start();
 * </script>
 * ```
 * @tags feedback, overlay
 */
@IndividualComponent
export class Tour extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The steps, in order. */
  @property({ attribute: false })
  steps: TourStep[] = [];

  /** Whether the tour is showing. Prefer `start()` and `end()`. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Zero-based index of the step shown (or shown first when the tour opens). */
  @property({ type: Number, reflect: true })
  current = 0;

  // ── State ────────────────────────────────────────────────────────────────

  /** The highlighted element of the current step; null for a centered step. */
  @state() private target: HTMLElement | null = null;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.layer') private layerElement?: HTMLElement | null;

  @query('.popup') private popupElement?: HTMLElement | null;

  @query('.spotlight') private spotlightElement?: HTMLElement | null;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  /** Sent with the next `close` event. */
  private closeDetail: TourCloseDetail = { reason: 'api', completed: false };

  /** The step `step-change` last fired for, so a re-render does not fire it again. */
  private shownIndex = -1;

  /** The target `shownIndex` was shown on. */
  private shownTarget: HTMLElement | null = null;

  /** Stops the spotlight following its target. */
  private stopSpotlight?: () => void;

  /** Places the popup next to the target. */
  private readonly floating = new FloatingController(this, {
    trigger: 'manual',
    strategy: 'fixed',
    closeOnClickOutside: false,
    offset: 16,
    viewportPadding: 8,
  });

  /** Top layer, Escape and focus return. Non-modal, without light dismiss. */
  private readonly overlay = new OverlayController(this, {
    surface: () => this.layerElement,
    lightDismiss: () => false,
    focusOnOpen: () => true,
    initialFocus: () => this.popupElement,
    exitAnimationTargets: () => [],
    requestClose: reason => this.finish(reason, false),
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

  disconnectedCallback() {
    this.stopFollowing();
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (
      this.open &&
      (changed.has('open') || changed.has('current') || changed.has('steps'))
    ) {
      const resolved = this.resolve(this.current, 1);
      if (resolved) {
        this.current = resolved.index;
        this.target = resolved.target;
      } else {
        // Nothing left to show: close without having shown anything new.
        this.closeDetail = {
          reason: 'api',
          completed: this.shownIndex >= 0,
        };
        this.open = false;
      }
    }
    if (changed.has('open') && !this.open) this.target = null;
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('open')) {
      const wasOpen = changed.get('open') === true;
      if (this.open) {
        this.overlay.sync(true);
        this.dispatch('open');
      } else {
        this.stopFollowing();
        // The floating controller re-renders its host; let this update finish first.
        this.updateComplete.then(() => {
          if (!this.open) this.floating.close();
        });
        this.overlay.sync(false);
        this.shownIndex = -1;
        this.shownTarget = null;
        if (wasOpen) {
          const detail = this.closeDetail;
          this.closeDetail = { reason: 'api', completed: false };
          this.dispatch<TourCloseDetail>('close', detail);
        }
      }
    }
    if (this.open) {
      // After this update: placing the popup re-renders the host through the floating controller.
      this.updateComplete.then(() => {
        // A newer update (the app moved on meanwhile) handles its own step.
        if (
          this.open &&
          !this.isUpdatePending &&
          (this.current !== this.shownIndex || this.target !== this.shownTarget)
        ) {
          this.showStep();
        }
      });
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Starts the tour at step `index` (default the first), skipping steps whose target is missing. */
  start(index = 0) {
    const resolved = this.resolve(index, 1);
    if (!resolved) return;
    this.current = resolved.index;
    this.open = true;
  }

  /** Shows the next step; on the last step, finishes the tour (`completed: true`). */
  next() {
    this.advance('api');
  }

  /** Shows the previous step whose target is on the page. Does nothing on the first. */
  previous() {
    if (!this.open) return;
    const resolved = this.resolve(this.current - 1, -1);
    if (resolved) this.current = resolved.index;
  }

  /** Ends the tour before the last step (`reason: 'api'`, `completed: false`). */
  end() {
    this.finish('api', false);
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private advance(reason: CloseReason) {
    if (!this.open) return;
    const resolved = this.resolve(this.current + 1, 1);
    if (resolved) this.current = resolved.index;
    else this.finish(reason, true);
  }

  private finish(reason: CloseReason, completed: boolean) {
    if (!this.open) return;
    this.closeDetail = { reason, completed };
    this.open = false;
  }

  /**
   * The first step from `from`, moving by `direction`, that can be shown: one without a target,
   * or whose target is on the page. Null when there is none.
   */
  private resolve(from: number, direction: 1 | -1): ResolvedStep | null {
    for (
      let index = from;
      index >= 0 && index < this.steps.length;
      index += direction
    ) {
      const step = this.steps[index];
      if (!step.target) return { index, target: null };
      const target = this.findTarget(step.target);
      if (target) return { index, target };
      warnOnce(
        `wc-tour:target:${step.target}`,
        `[peacock] wc-tour: the target "${step.target}" of step ${index + 1} is not on the page; the step is skipped.`,
      );
    }
    return null;
  }

  /** Finds a target by id, else by selector, in the tour's own root and then the document. */
  private findTarget(target: string): HTMLElement | null {
    const root = this.getRootNode();
    const scopes: (Document | ShadowRoot)[] =
      root instanceof ShadowRoot ? [root, document] : [document];
    for (const scope of scopes) {
      const byId = scope.getElementById(target);
      if (byId instanceof HTMLElement) return byId;
      try {
        const match = scope.querySelector(target);
        if (match instanceof HTMLElement) return match;
      } catch {
        // Not a valid selector, only an id; keep looking.
      }
    }
    return null;
  }

  /** Scrolls the target into view, highlights it, places the popup and moves focus into it. */
  private showStep() {
    const step = this.steps[this.current];
    const popup = this.popupElement;
    if (!step || !popup) return;
    this.shownIndex = this.current;
    this.shownTarget = this.target;
    this.stopFollowing();

    const { target } = this;
    if (target) {
      this.bringIntoView(target);
      const spotlight = this.spotlightElement;
      if (spotlight) {
        this.stopSpotlight = autoUpdate(target, spotlight, () =>
          this.placeSpotlight(target),
        );
      }
      this.floating.setOptions({
        placement: toPhysicalPlacement(
          step.placement ?? 'bottom',
          this,
          'wc-tour',
        ),
      });
      this.floating.setElements(target, popup);
      this.floating.open();
    } else {
      this.floating.close();
      // A centered step: drop the coordinates floating-ui wrote.
      popup.style.removeProperty('left');
      popup.style.removeProperty('top');
      popup.style.removeProperty('position');
    }

    popup.focus({ preventScroll: true });
    this.dispatch<TourStepChangeDetail>('step-change', {
      index: this.current,
      step,
    });
  }

  private bringIntoView(target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const inView =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth;
    if (inView) return;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    target.scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: reduce ? 'auto' : 'smooth',
    });
  }

  /** Puts the spotlight over the target's box, in viewport coordinates. */
  private placeSpotlight(target: HTMLElement) {
    const spotlight = this.spotlightElement;
    if (!spotlight) return;
    const rect = target.getBoundingClientRect();
    spotlight.style.setProperty('--_x', `${rect.left}px`);
    spotlight.style.setProperty('--_y', `${rect.top}px`);
    spotlight.style.setProperty('--_width', `${rect.width}px`);
    spotlight.style.setProperty('--_height', `${rect.height}px`);
  }

  private stopFollowing() {
    this.stopSpotlight?.();
    this.stopSpotlight = undefined;
  }

  private handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const forward = (event.key === 'ArrowRight') !== isRtl(this);
    event.preventDefault();
    if (forward) this.advance('action');
    else this.previous();
  }

  private dispatch<T>(type: string, detail?: T) {
    this.dispatchEvent(
      new CustomEvent<T>(type, { detail, bubbles: true, composed: true }),
    );
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderPopup(step: TourStep | undefined) {
    const total = this.steps.length;
    const isLast = this.current >= total - 1;
    const format = new Intl.NumberFormat(this.i18n.locale);
    return html`<div
      class=${classMap({ popup: true, centered: !this.target })}
      role="dialog"
      aria-labelledby="headline"
      aria-describedby=${step?.body ? 'body' : nothing}
      tabindex="-1"
      @keydown=${this.handleKeydown}
    >
      <div class="header">
        <span class="progress"
          >${this.i18n.t('stepPosition')(
            format.format(this.current + 1),
            format.format(total),
          )}</span
        >
        <wc-icon-button
          class="skip"
          variant="text"
          size="xs"
          shape="round"
          aria-label=${this.i18n.t('tourSkip')}
          @click=${() => this.finish('action', false)}
        >
          <wc-icon name="close"></wc-icon>
        </wc-icon-button>
      </div>
      <h2 class="headline" id="headline">${step?.headline ?? ''}</h2>
      ${step?.body ? html`<p class="body" id="body">${step.body}</p>` : nothing}
      <div class="footer">
        ${this.current > 0
          ? html`<wc-button
              class="back"
              variant="text"
              size="sm"
              @click=${() => this.previous()}
              >${this.i18n.t('tourBack')}</wc-button
            >`
          : nothing}
        <wc-button
          class="next"
          variant="filled"
          size="sm"
          @click=${() => this.advance('action')}
          >${this.i18n.t(isLast ? 'tourDone' : 'tourNext')}</wc-button
        >
      </div>
    </div>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const step = this.open ? this.steps[this.current] : undefined;
    return html`<div class="layer" popover="manual">
      <div
        class=${classMap({ spotlight: true, full: !this.target })}
        aria-hidden="true"
      ></div>
      ${this.renderPopup(step)}
    </div>`;
  }
}
