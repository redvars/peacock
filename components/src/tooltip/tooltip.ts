import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './tooltip.scss';
import { FloatingController } from '../__internal/controllers/floating-controller.js';
import { deprecate } from '../__internal/utils/deprecate.js';
import {
  type OverlayPlacement,
  toPhysicalPlacement,
} from '../__internal/utils/placement.js';
import IndividualComponent from '@/IndividualComponent.js';

// Define a type for valid trigger combinations
export type TooltipTrigger = 'hover' | 'focus' | 'click';

/** `ariaDescribedByElements` (element reflection), not yet in every TypeScript DOM lib. */
type DescribedByTarget = HTMLElement & {
  ariaDescribedByElements?: Element[] | null;
};

let nextTooltipId = 0;

/**
 * @label Tooltip
 * @tag wc-tooltip
 * @rawTag tooltip
 * @summary Displays a tooltip for an element.
 * @overview
 * <p>A short text label shown next to its target on hover or focus. It opens in the browser's top layer,
 * so it shows above modals and menus, and describes the target through <code>aria-describedby</code>.
 * Escape hides a visible tooltip without closing the dialog or menu around it.</p>
 * <p>The target is the element whose id is in <code>for</code>, looked up in the tooltip's own document or
 * shadow root, or else the parent element. When the target is in another shadow root, the link uses
 * <code>ariaDescribedByElements</code> where the browser supports it; elsewhere the target is not
 * described.</p>
 * <p><code>variant="rich"</code> is deprecated: use <code>wc-popover</code> for rich content with actions.</p>
 * @tags display
 *
 * @example
 * ```html
 * <wc-tooltip preview>Tooltip</wc-tooltip>
 * ```
 */
@IndividualComponent
export class Tooltip extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * The ID of the element the tooltip should attach to.
   * If not provided, it defaults to the parent element.
   */
  @property() for: string = '';

  /** What shows the tooltip: any of `hover`, `focus` and `click`, separated by spaces. */
  @property({ type: String }) trigger: string = 'hover focus';

  /** Whether the tooltip is visible. */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * Preferred placement relative to the target: `top`, `bottom`, `start` or `end`, optionally with
   * `-start` or `-end` alignment. `start` and `end` follow the writing direction.
   */
  @property({ type: String, reflect: true }) placement: OverlayPlacement =
    'top';

  /** Visual variant. `rich` is deprecated: use `wc-popover`. */
  @property({ type: String, reflect: true }) variant: 'plain' | 'rich' =
    'plain';

  /**
   * Renders the tooltip statically in the page flow, always visible.
   * @internal For the documentation demos only.
   */
  @property({ type: Boolean, reflect: true }) preview = false;

  // ── Private fields ───────────────────────────────────────────────────────

  private _target: HTMLElement | null = null;

  private _floating: FloatingController | null = null;

  /** How the target was linked to the tooltip, so detaching undoes exactly that. */
  private _link: 'id' | 'elements' | null = null;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    if (!this.id) {
      nextTooltipId += 1;
      this.id = `wc-tooltip-${nextTooltipId}`;
    }
    if (!this.hasAttribute('role')) this.setAttribute('role', 'tooltip');
    this._syncPopoverAttribute();
    this._attach();
  }

  disconnectedCallback() {
    this._detach();
    window.removeEventListener('keydown', this._handleKeydown, true);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('variant') && this.variant === 'rich') {
      deprecate('wc-tooltip', 'variant="rich"', 'wc-popover');
    }
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('preview')) this._syncPopoverAttribute();

    if (
      changed.has('for') ||
      changed.has('trigger') ||
      changed.has('preview')
    ) {
      this._attach();
    } else if (changed.has('placement') && this._floating) {
      this._floating.setOptions({ placement: this._physicalPlacement() });
    }

    if (changed.has('open') && this._floating) {
      if (this.open && !this._floating.isOpen) this._floating.open();
      if (!this.open && this._floating.isOpen) this._floating.close();
    }
    if (changed.has('open')) this._syncOpen();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private _resolveTrigger():
    | 'hover'
    | 'click'
    | 'focus'
    | 'manual'
    | 'hover-focus' {
    if (this.preview) return 'manual';

    const triggerTokens = this.trigger.split(' ');
    const hasHover = triggerTokens.includes('hover');
    const hasFocus = triggerTokens.includes('focus');
    const hasClick = triggerTokens.includes('click');

    if (hasClick) return 'click';
    if (hasHover && hasFocus) return 'hover-focus';
    if (hasFocus) return 'focus';
    if (hasHover) return 'hover';
    return 'manual';
  }

  private _physicalPlacement() {
    return toPhysicalPlacement(this.placement, this, 'wc-tooltip');
  }

  /** The tooltip is a manual popover in the top layer, except in preview. */
  private _syncPopoverAttribute() {
    if (this.preview) this.removeAttribute('popover');
    else this.setAttribute('popover', 'manual');
  }

  /** Resolves the target and listens to it. */
  private _attach() {
    this._detach();

    // Resolve target: ID-based lookup or fallback to parent
    const root = this.getRootNode() as ShadowRoot | Document;
    this._target = this.for
      ? (root.getElementById?.(this.for) as HTMLElement | null)
      : this.parentElement;

    if (!this._target) return;
    this._linkTarget();

    this._floating = new FloatingController(this, {
      placement: this._physicalPlacement(),
      strategy: 'fixed',
      offset: 0,
      trigger: this._resolveTrigger(),
      closeOnClickOutside: true,
      onOpenChange: isOpen => {
        if (this.open === isOpen) return;
        this.open = isOpen;
        // Enter the top layer before floating-ui measures the tooltip.
        this._syncLayer();
      },
    });

    this._floating.setElements(this._target, this);
    if (this.open) this._floating.open();
  }

  private _detach() {
    if (this._floating) {
      this._floating.close();
      this._floating.dispose();
      this._floating = null;
    }
    this._unlinkTarget();
    this._target = null;
  }

  /** Points the target's `aria-describedby` at the tooltip. */
  private _linkTarget() {
    const target = this._target as DescribedByTarget | null;
    if (!target || this.preview) return;

    if (target.getRootNode() === this.getRootNode()) {
      const ids = (target.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean);
      if (!ids.includes(this.id)) {
        target.setAttribute('aria-describedby', [...ids, this.id].join(' '));
      }
      this._link = 'id';
      return;
    }

    // An id cannot cross a shadow boundary; element reflection can, where supported.
    if ('ariaDescribedByElements' in target) {
      const elements = target.ariaDescribedByElements ?? [];
      if (!elements.includes(this)) {
        target.ariaDescribedByElements = [...elements, this];
      }
      this._link = 'elements';
    }
  }

  private _unlinkTarget() {
    const target = this._target as DescribedByTarget | null;
    if (!target || !this._link) return;

    if (this._link === 'id') {
      const ids = (target.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(id => id && id !== this.id);
      if (ids.length) target.setAttribute('aria-describedby', ids.join(' '));
      else target.removeAttribute('aria-describedby');
    } else {
      const elements = (target.ariaDescribedByElements ?? []).filter(
        element => element !== this,
      );
      target.ariaDescribedByElements = elements.length ? elements : null;
    }
    this._link = null;
  }

  private _syncOpen() {
    this._syncLayer();
    if (this.open && !this.preview) {
      // The target may have re-rendered its own aria-describedby.
      this._linkTarget();
      window.addEventListener('keydown', this._handleKeydown, true);
    } else {
      window.removeEventListener('keydown', this._handleKeydown, true);
    }
  }

  /** Shows or hides the tooltip in the top layer to match `open`. */
  private _syncLayer() {
    if (
      this.preview ||
      !this.hasAttribute('popover') ||
      typeof this.showPopover !== 'function'
    ) {
      return;
    }
    const showing = this.matches(':popover-open');
    if (this.open && this.isConnected && !showing) this.showPopover();
    else if (!this.open && showing) this.hidePopover();
  }

  /**
   * Escape hides a visible tooltip (WCAG 1.4.13). The listener is on `window` in the capture
   * phase, so it runs before the overlay controller's and the enclosing modal or menu stays open.
   */
  private _handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !this.open) return;
    event.preventDefault();
    event.stopPropagation();
    if (this._floating?.isOpen) this._floating.close();
    else this.open = false;
  };

  // ── Render helpers ───────────────────────────────────────────────────────

  // eslint-disable-next-line class-methods-use-this
  private _renderPlainTooltip() {
    return html`<div class="tooltip-content">
      <slot></slot>
    </div>`;
  }

  // eslint-disable-next-line class-methods-use-this
  private _renderRichTooltip() {
    return html`
      <div class="tooltip-content">
        <wc-elevation class="elevation"></wc-elevation>

        <div class="tooltip-title">
          <slot name="title"></slot>
        </div>
        <div class="tooltip-support-text">
          <slot></slot>
        </div>
        <div class="tooltip-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`<div
      class=${classMap({
        tooltip: true,
        [`variant-${this.variant}`]: true,
      })}
      id="tooltip"
    >
      ${this.variant === 'plain'
        ? this._renderPlainTooltip()
        : this._renderRichTooltip()}
    </div>`;
  }
}
