import { html, LitElement, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';

import { FloatingController } from '@/__internal/controllers/floating-controller.js';
import {
  type CloseReason,
  OverlayController,
} from '@/__internal/controllers/overlay-controller.js';
import {
  type OverlayPlacement,
  toPhysicalPlacement,
} from '@/__internal/utils/placement.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './hover-card.scss';

/** `detail` of `close`. */
export interface HoverCardCloseDetail {
  reason: CloseReason;
}

let contentCount = 0;

/** Whether `node` is `container` or inside it, across shadow roots and slots. */
function within(node: Node | null | undefined, container: Node | null) {
  let current: Node | null | undefined = node;
  while (current && container) {
    if (current === container) return true;
    current =
      (current as Element).assignedSlot ??
      current.parentNode ??
      (current instanceof ShadowRoot ? current.host : null);
  }
  return false;
}

/**
 * @label Hover Card
 * @tag wc-hover-card
 * @rawTag hover-card
 * @summary A rich preview, such as a profile card or a link preview, shown while the pointer rests on a trigger or the trigger has keyboard focus.
 * @overview
 * <p>The first child is the trigger, usually a link; the element with <code>slot="content"</code>
 * is the card. The card opens after <code>open-delay</code> (500 ms) of hovering or of keyboard
 * focus on the trigger, and closes <code>close-delay</code> (300 ms) after the pointer and focus
 * have left both the trigger and the card, so the pointer can cross the gap into the card. It
 * stays open while hovered or while focus is inside it. Escape closes it, and so does a press
 * outside.</p>
 * <p>Unlike <code>wc-tooltip</code>, which is short plain text that describes its target, the card
 * can hold links and buttons; unlike <code>wc-popover</code>, nothing opens it on click. The card
 * is a supplement: the trigger keeps its own action (following the link), and everything in the
 * card must also be reachable without it, for example on the page the link goes to.</p>
 * <p>The trigger gets <code>aria-details</code> pointing at the content, which screen readers
 * announce as "has details" and let the person jump to. It gets no
 * <code>aria-haspopup</code> or <code>aria-expanded</code>, because activating it does not open
 * the card. Once open, the card's content follows the trigger in the Tab order.</p>
 * <p>Touch screens have no hover: a tap activates the trigger and does not open the card. Use
 * <code>show()</code> from your own control if touch users need the preview.</p>
 * @tags display, overlay
 *
 * @slot - The trigger: the first child element.
 * @slot content - The card's content.
 *
 * @csspart card - The card surface.
 *
 * @cssprop --hover-card-background - Background of the card. Defaults to `var(--color-surface-container)`.
 * @cssprop --hover-card-padding - Padding of the card. Defaults to `var(--spacing-200)`.
 * @cssprop --hover-card-width - Width of the card. Defaults to `20rem`.
 *
 * @fires {CustomEvent} open - Fired when the card opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'api'}>} close - Fired when the card closes: Escape, the pointer and focus leaving, or a press outside (`light-dismiss`), or `hide()` / `open = false` (`api`).
 *
 * @example
 * ```html
 * <wc-hover-card>
 *   <a href="/people/ana">Ana Lima</a>
 *   <div slot="content">
 *     <strong>Ana Lima</strong>
 *     <p>Product designer, Lisbon</p>
 *     <wc-button size="sm">Follow</wc-button>
 *   </div>
 * </wc-hover-card>
 * ```
 */
@IndividualComponent
export class HoverCard extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Whether the card is open. */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * Preferred placement of the card: `top`, `bottom`, `start` or `end`, optionally with `-start`
   * or `-end` alignment. It flips to stay in the viewport.
   */
  @property({ type: String, reflect: true }) placement: OverlayPlacement =
    'bottom';

  /** Milliseconds of hover or focus on the trigger before the card opens. */
  @property({ type: Number, attribute: 'open-delay' }) openDelay = 500;

  /** Milliseconds after the pointer and focus leave before the card closes. */
  @property({ type: Number, attribute: 'close-delay' }) closeDelay = 300;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.card') private _card?: HTMLElement;

  @query('slot[name="content"]') private _contentSlot?: HTMLSlotElement;

  // ── Private fields ───────────────────────────────────────────────────────

  private _trigger: HTMLElement | null = null;

  private _content: HTMLElement | null = null;

  /** Whether the pointer is over the trigger or the card. */
  private _hovered = false;

  /** Whether focus is in the trigger or the card. */
  private _focused = false;

  /** A press on the trigger just happened; the focus it brings does not open the card. */
  private _pressed = false;

  private _openTimer?: ReturnType<typeof setTimeout>;

  private _closeTimer?: ReturnType<typeof setTimeout>;

  /** Reason for the close in progress, sent with `close`. */
  private _closeReason: CloseReason = 'api';

  /** Whether this card set the trigger's `aria-details`. */
  private _ownsDetails = false;

  private readonly _floating = new FloatingController(this, {
    strategy: 'fixed',
    trigger: 'manual',
    closeOnClickOutside: false,
    fitViewport: true,
  });

  private readonly _overlay = new OverlayController(this, {
    surface: () => this._card,
    lightDismiss: () => true,
    focusOnOpen: () => false,
    // Focus goes back to the trigger only on Escape, handled in `_close()`.
    restoreFocus: () => false,
    requestClose: reason => this._close(reason),
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this._setup();
  }

  disconnectedCallback() {
    this._clearTimers();
    this._detachTrigger();
    super.disconnectedCallback();
  }

  protected firstUpdated() {
    this._setup();
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('placement')) {
      this._floating.setOptions({
        placement: toPhysicalPlacement(this.placement, this),
      });
    }
    if (changed.has('open')) this._syncOpen(changed.get('open') === true);
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Opens the card now. */
  show() {
    this._clearTimers();
    this.open = true;
  }

  /** Closes the card now. */
  hide() {
    this._close('api');
  }

  /** Opens the card when it is closed and closes it when it is open. */
  toggle() {
    if (this.open) this.hide();
    else this.show();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** Finds the trigger and the content and wires them up. */
  private _setup() {
    const trigger =
      Array.from(this.children).find(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.slot !== 'content',
      ) ?? null;
    if (trigger !== this._trigger) {
      this._detachTrigger();
      this._trigger = trigger;
      trigger?.addEventListener('pointerenter', this._handlePointerEnter);
      trigger?.addEventListener('pointerleave', this._handlePointerLeave);
      trigger?.addEventListener('pointerdown', this._handlePointerDown);
    }
    this._content =
      (this._contentSlot?.assignedElements({ flatten: true })[0] as
        | HTMLElement
        | undefined) ?? null;
    this._syncDetails();
    if (this._trigger && this._card) {
      this._floating.setOptions({
        placement: toPhysicalPlacement(this.placement, this),
      });
      this._floating.setElements(this._trigger, this._card);
    }
  }

  private _detachTrigger() {
    const trigger = this._trigger;
    if (!trigger) return;
    trigger.removeEventListener('pointerenter', this._handlePointerEnter);
    trigger.removeEventListener('pointerleave', this._handlePointerLeave);
    trigger.removeEventListener('pointerdown', this._handlePointerDown);
    if (this._ownsDetails) trigger.removeAttribute('aria-details');
    this._ownsDetails = false;
  }

  /** Points the trigger's `aria-details` at the content, unless the page set its own. */
  private _syncDetails() {
    const trigger = this._trigger;
    const content = this._content;
    if (!trigger) return;
    if (!content) {
      if (this._ownsDetails) trigger.removeAttribute('aria-details');
      this._ownsDetails = false;
      return;
    }
    if (!content.id) {
      contentCount += 1;
      content.id = `wc-hover-card-content-${contentCount}`;
    }
    if (this._ownsDetails || !trigger.hasAttribute('aria-details')) {
      trigger.setAttribute('aria-details', content.id);
      this._ownsDetails = true;
    }
  }

  private _clearTimers() {
    clearTimeout(this._openTimer);
    clearTimeout(this._closeTimer);
    this._openTimer = undefined;
    this._closeTimer = undefined;
  }

  /** Opens after `open-delay`, unless something cancels it first. */
  private _scheduleOpen() {
    clearTimeout(this._closeTimer);
    this._closeTimer = undefined;
    if (this.open || this._openTimer) return;
    this._openTimer = setTimeout(
      () => {
        this._openTimer = undefined;
        if (this._hovered || this._focused) this.open = true;
      },
      Math.max(0, this.openDelay),
    );
  }

  /** Closes after `close-delay` once neither hover nor focus keeps the card. */
  private _scheduleClose() {
    if (this._hovered || this._focused) return;
    clearTimeout(this._openTimer);
    this._openTimer = undefined;
    if (!this.open || this._closeTimer) return;
    this._closeTimer = setTimeout(
      () => {
        this._closeTimer = undefined;
        if (!this._hovered && !this._focused) this._close('light-dismiss');
      },
      Math.max(0, this.closeDelay),
    );
  }

  private _close(reason: CloseReason) {
    this._clearTimers();
    if (!this.open) return;
    this._closeReason = reason;
    // Escape from inside the card: give focus back to the trigger, not to the page.
    if (reason === 'escape' && this._focusInCard()) this._trigger?.focus();
    this.open = false;
  }

  private _focusInCard(): boolean {
    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    return !!active && within(active, this._content ?? this._card ?? null);
  }

  private _syncOpen(wasOpen: boolean) {
    if (this.open) {
      // Enter the top layer before floating-ui measures the card.
      this._overlay.sync(true);
      this._floating.open();
      this._dispatch('open');
    } else {
      this._floating.close();
      this._overlay.sync(false);
      this._hovered = false;
      if (wasOpen) {
        const reason = this._closeReason;
        this._closeReason = 'api';
        this._dispatch('close', { reason });
      }
    }
  }

  private _dispatch(type: string, detail?: HoverCardCloseDetail) {
    this.dispatchEvent(
      new CustomEvent(type, { detail, bubbles: true, composed: true }),
    );
  }

  private _handlePointerEnter = (event: PointerEvent) => {
    // Touch has no hover; a tap activates the trigger.
    if (event.pointerType === 'touch') return;
    this._hovered = true;
    this._scheduleOpen();
  };

  private _handlePointerLeave = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    this._hovered = false;
    this._scheduleClose();
  };

  private _handlePointerDown = () => {
    this._pressed = true;
    setTimeout(() => {
      this._pressed = false;
    });
  };

  private _handleCardPointerEnter(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    this._hovered = true;
    clearTimeout(this._closeTimer);
    this._closeTimer = undefined;
  }

  private _handleFocusIn(event: FocusEvent) {
    this._focused = true;
    clearTimeout(this._closeTimer);
    this._closeTimer = undefined;
    // Focus from a press (a click, a tap) is not a request for the card; keyboard focus is.
    if (this._pressed) return;
    if (within(event.target as Node, this._trigger)) this._scheduleOpen();
  }

  private _handleFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (within(next, this)) return;
    this._focused = false;
    this._scheduleClose();
  }

  private _handleSlotChange() {
    this._setup();
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`<slot
        @slotchange=${this._handleSlotChange}
        @focusin=${this._handleFocusIn}
        @focusout=${this._handleFocusOut}
      ></slot>
      <div
        class="card"
        part="card"
        popover="manual"
        @pointerenter=${this._handleCardPointerEnter}
        @pointerleave=${this._handlePointerLeave}
        @focusin=${this._handleFocusIn}
        @focusout=${this._handleFocusOut}
      >
        <slot name="content" @slotchange=${this._handleSlotChange}></slot>
      </div>`;
  }
}
