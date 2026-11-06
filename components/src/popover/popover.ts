import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import { FloatingController } from '../__internal/controllers/floating-controller.js';
import {
  type CloseReason,
  OverlayController,
} from '../__internal/controllers/overlay-controller.js';
import {
  type OverlayPlacement,
  toPhysicalPlacement,
} from '../__internal/utils/placement.js';
import styles from './popover.scss';
import type { PopoverContent } from './popover-content.js';

let nextContentId = 0;

/**
 * @label Popover
 * @tag wc-popover
 * @rawTag popover
 * @summary Displays rich content, such as text with actions, in a floating panel anchored to a trigger element.
 * @overview
 * <p>The Popover component wraps a trigger element and a <code>wc-popover-content</code> child. The panel
 * opens in the browser's top layer, so it shows above modals, sheets, menus and any parent with
 * <code>overflow: hidden</code>; floating-ui keeps it next to the trigger and inside the viewport.</p>
 * <p>The panel is a non-modal dialog: Escape closes it, and so does a press outside the trigger and the
 * panel (<code>no-light-dismiss</code> turns that off). Name it with <code>label</code> or with an element in
 * the content's <code>heading</code> slot. With <code>trigger="click"</code> or <code>"hover"</code> the trigger gets
 * <code>aria-haspopup="dialog"</code>, <code>aria-controls</code> and <code>aria-expanded</code>; with
 * <code>"manual"</code> the component that opens the popover owns the trigger's ARIA.</p>
 * <p>Use a popover, not <code>wc-tooltip variant="rich"</code>, for rich content with actions.</p>
 * @tags display, overlay
 *
 * @slot - The trigger element followed by a `wc-popover-content`.
 *
 * @fires {CustomEvent} open - Fired when the popover opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Fired when the popover closes: Escape, a press outside, the trigger (a second click, or the pointer leaving a hover trigger is `light-dismiss`), or `hide()` / `open = false`.
 * @fires {CustomEvent} wc-popover--open - Deprecated, use `open`.
 * @fires {CustomEvent} wc-popover--close - Deprecated, use `close`.
 *
 * @example
 * ```html
 * <wc-popover trigger="click" label="Details">
 *   <wc-button>Open popover</wc-button>
 *   <wc-popover-content>
 *     <p>Popover body text goes here.</p>
 *   </wc-popover-content>
 * </wc-popover>
 * ```
 */
@IndividualComponent
export class Popover extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * Determines how the popover is triggered.
   * Possible values are `"click"`, `"hover"`, `"manual"`.
   */
  @property({ reflect: true }) trigger: 'click' | 'hover' | 'manual' = 'click';

  /**
   * Preferred placement of the panel relative to the trigger: `top`, `bottom`, `start` or `end`,
   * optionally with `-start` or `-end` alignment. `start` and `end` follow the writing direction;
   * the physical `left` and `right` still work but are deprecated.
   */
  @property({ reflect: true }) placement: OverlayPlacement = 'bottom';

  /**
   * Whether the popover is open.
   */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * Distance in pixels between the trigger element and the popover panel.
   */
  @property({ type: Number }) offset = 8;

  /**
   * Accessible name of the panel. Without it, the element in the content's `heading` slot names it.
   */
  @property() label = '';

  /** Shows an arrow on the panel that points at the trigger. */
  @property({ type: Boolean, reflect: true }) arrow = false;

  /** Keeps the popover open when the user presses outside it. Escape still closes it. */
  @property({ type: Boolean, attribute: 'no-light-dismiss' }) noLightDismiss =
    false;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Positions the panel and listens to the trigger for `click` and `hover`. */
  private _floating: FloatingController | null = null;

  private _contentEl: PopoverContent | null = null;

  private _triggerEl: HTMLElement | null = null;

  /** Trigger attributes the popover set, so it removes only those. */
  private readonly _ownedTriggerAria = new Set<string>();

  /** Content naming attributes the popover set, so it never removes the consumer's own. */
  private readonly _ownedContentAria = new Set<string>();

  /** Reason for the close in progress, sent with the `close` event. */
  private _closeReason: CloseReason = 'api';

  /** Top layer, Escape and light dismiss. */
  private readonly _overlay = new OverlayController(this, {
    surface: () => this._contentEl,
    lightDismiss: () => !this.noLightDismiss,
    insideElements: () => [this._triggerEl],
    // The panel fades out with CSS `allow-discrete` transitions after it leaves the top layer.
    exitAnimationTargets: () => [],
    // A press outside moves focus where the user pressed; do not pull it back.
    restoreFocus: () => this._closeReason !== 'light-dismiss',
    requestClose: reason => this._close(reason),
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    // Moving the popover disconnects its controllers; set it up again.
    if (this.hasUpdated) this._setup();
  }

  disconnectedCallback() {
    this._clearTriggerAria();
    this._floating?.dispose();
    this._floating = null;
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues<this>) {
    if (
      !this._floating ||
      changed.has('trigger') ||
      changed.has('placement') ||
      changed.has('offset') ||
      changed.has('arrow')
    ) {
      this._setup();
    }

    if (changed.has('label')) this._syncContentAria();

    if (changed.has('open')) this._syncOpen(changed.get('open') === true);
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /**
   * Programmatically opens the popover.
   */
  show() {
    this.open = true;
  }

  /**
   * Programmatically closes the popover.
   */
  hide() {
    this._close('api');
  }

  /** Opens the popover when it is closed and closes it when it is open. */
  toggle() {
    if (this.open) this.hide();
    else this.show();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** Finds the trigger and the content and connects positioning, ARIA and the top layer. */
  private _setup() {
    this._floating?.dispose();
    this._floating = null;

    const children = Array.from(this.children);
    const content =
      (children.find(child => child.localName === 'wc-popover-content') as
        | PopoverContent
        | undefined) ?? null;
    // The trigger is the first light-DOM child that is not the content.
    const trigger =
      (children.find(child => child.localName !== 'wc-popover-content') as
        | HTMLElement
        | undefined) ?? null;

    if (trigger !== this._triggerEl) this._clearTriggerAria();
    this._contentEl = content;
    this._triggerEl = trigger;
    if (!trigger || !content) return;

    if (!content.id) {
      nextContentId += 1;
      content.id = `wc-popover-content-${nextContentId}`;
    }
    content.setAttribute('popover', 'manual');
    content.arrow = this.arrow;
    this._syncContentAria();
    this._syncTriggerAria();

    this._floating = new FloatingController(this, {
      placement: toPhysicalPlacement(this.placement, this, 'wc-popover'),
      strategy: 'fixed',
      offset: this.offset,
      trigger: this.trigger,
      // The overlay controller handles presses outside.
      closeOnClickOutside: false,
      onOpenChange: isOpen => this._handleTriggerChange(isOpen),
    });
    this._setFloatingElements();
    // The arrow exists once the content has rendered.
    if (!content.hasUpdated) {
      content.updateComplete.then(() => this._setFloatingElements());
    }

    if (this.open) {
      this._overlay.sync(true);
      this._floating.open();
    }
  }

  private _setFloatingElements() {
    if (!this._floating || !this._triggerEl || !this._contentEl) return;
    const arrow = this.arrow
      ? (this._contentEl.arrowElement ?? undefined)
      : undefined;
    this._floating.setElements(this._triggerEl, this._contentEl, arrow);
  }

  /** The floating controller saw the trigger open or close the popover. */
  private _handleTriggerChange(isOpen: boolean) {
    if (isOpen) {
      this.open = true;
      // Enter the top layer before floating-ui measures the panel.
      this._overlay.sync(true);
    } else {
      this._close(this.trigger === 'hover' ? 'light-dismiss' : 'action');
    }
  }

  private _close(reason: CloseReason) {
    if (!this.open) return;
    this._closeReason = reason;
    this.open = false;
  }

  private _syncOpen(wasOpen: boolean) {
    const content = this._contentEl;
    if (content) {
      content.open = this.open;
      // Reflect now, so the panel's styles change in the same frame it enters or leaves the top layer.
      content.toggleAttribute('open', this.open);
    }

    if (this.open) {
      this._overlay.sync(true);
      this._floating?.open();
      this._syncContentAria();
    } else {
      this._floating?.close();
      this._overlay.sync(false);
    }
    this._syncTriggerAria();

    // Fire after the overlay moved focus back, so a listener that moves focus has the last word.
    if (this.open) {
      this._dispatch('open');
      this._dispatch('wc-popover--open');
    } else if (wasOpen) {
      const reason = this._closeReason;
      this._closeReason = 'api';
      this._dispatch('close', { reason });
      this._dispatch('wc-popover--close');
    }
  }

  private _dispatch(type: string, detail?: { reason: CloseReason }) {
    this.dispatchEvent(
      new CustomEvent(type, { detail, bubbles: true, composed: true }),
    );
  }

  /** Gives the panel `role="dialog"` and a name: `label`, else the `heading` slot. */
  private _syncContentAria() {
    const content = this._contentEl;
    if (!content) return;
    if (!content.hasAttribute('role')) {
      content.setAttribute('role', 'dialog');
    }

    this._setContentAttribute('aria-label', this.label || null);

    const heading = this.label
      ? null
      : content.querySelector<HTMLElement>(':scope > [slot="heading"]');
    if (heading && !heading.id) {
      heading.id = `${content.id}-heading`;
    }
    this._setContentAttribute('aria-labelledby', heading?.id ?? null);
  }

  /** Sets or removes a naming attribute on the content, leaving the consumer's own alone. */
  private _setContentAttribute(name: string, value: string | null) {
    const content = this._contentEl;
    if (!content) return;
    const owned = this._ownedContentAria.has(name);
    if (value !== null && (owned || !content.hasAttribute(name))) {
      content.setAttribute(name, value);
      this._ownedContentAria.add(name);
    } else if (value === null && owned) {
      content.removeAttribute(name);
      this._ownedContentAria.delete(name);
    }
  }

  /** `aria-haspopup`, `aria-controls` and `aria-expanded` on a click or hover trigger. */
  private _syncTriggerAria() {
    const trigger = this._triggerEl;
    const content = this._contentEl;
    if (!trigger || !content || this.trigger === 'manual') {
      this._clearTriggerAria();
      return;
    }

    const set = (name: string, value: string, force = false) => {
      if (
        force ||
        this._ownedTriggerAria.has(name) ||
        !trigger.hasAttribute(name)
      ) {
        trigger.setAttribute(name, value);
        this._ownedTriggerAria.add(name);
      }
    };
    set('aria-haspopup', 'dialog');
    set('aria-controls', content.id);
    set('aria-expanded', String(this.open), true);
  }

  private _clearTriggerAria() {
    for (const name of this._ownedTriggerAria) {
      this._triggerEl?.removeAttribute(name);
    }
    this._ownedTriggerAria.clear();
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`<slot></slot>`;
  }
}
