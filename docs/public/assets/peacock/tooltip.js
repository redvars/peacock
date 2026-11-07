import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { F as FloatingController } from './floating-controller-CbbD1i-z.js';
import { t as toPhysicalPlacement } from './placement-C4GO0JP9.js';
import './floating-ui.dom-IXnOdYJ1.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
:host(:not([preview])) {
  /* Reset the UA popover styles; floating-ui positions the tooltip in the top layer. */
  margin: 0;
  padding: 0;
  border: 0;
  inset: auto;
  overflow: visible;
  color: inherit;
  background: transparent;
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  transform: scale(0);
  opacity: 0;
  --_tooltip-duration: var(--duration-short2, 0.1s);
  /* \`allow-discrete\` keeps the tooltip in the top layer while it fades out. */
  transition: transform var(--_tooltip-duration) ease-in-out, opacity var(--_tooltip-duration) ease-in-out, display var(--_tooltip-duration) allow-discrete, overlay var(--_tooltip-duration) allow-discrete;
}

:host(:not([preview]):popover-open) {
  pointer-events: auto;
  transform: none;
  opacity: 1;
}
@starting-style {
  :host(:not([preview]):popover-open) {
    transform: scale(0);
    opacity: 0;
  }
}

.tooltip-content {
  display: inline-block;
  font-family: var(--typography-body-small-font-family) !important;
  font-size: var(--typography-body-small-font-size) !important;
  font-weight: var(--typography-body-small-font-weight) !important;
  line-height: var(--typography-body-small-line-height) !important;
  letter-spacing: var(--typography-body-small-letter-spacing) !important;
  max-width: 17.5rem;
  padding-inline: var(--spacing-100);
  padding-block: var(--spacing-050);
  color: var(--color-inverse-on-surface);
  background-color: var(--color-inverse-surface);
  border-radius: var(--shape-corner-extra-small);
}`;

let nextTooltipId = 0;
/**
 * @label Tooltip
 * @tag wc-tooltip
 * @rawTag tooltip
 * @summary A short text label shown next to an element on hover or keyboard focus.
 * @overview
 * <p>A short text label shown next to its target on hover or focus. It opens in the browser's top layer,
 * so it shows above modals and menus, and describes the target through <code>aria-describedby</code>.
 * Escape hides a visible tooltip without closing the dialog or menu around it.</p>
 * <p>The target is the element whose id is in <code>for</code>, looked up in the tooltip's own document or
 * shadow root, or else the parent element. When the target is in another shadow root, the link uses
 * <code>ariaDescribedByElements</code> where the browser supports it; elsewhere the target is not
 * described.</p>
 * <p>Use <code>wc-popover</code> for rich content with actions.</p>
 * @tags display
 *
 * @example
 * ```html
 * <wc-tooltip preview>Tooltip</wc-tooltip>
 * ```
 */
let Tooltip = class Tooltip extends i$1 {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        /**
         * The ID of the element the tooltip should attach to.
         * If not provided, it defaults to the parent element.
         */
        this.for = '';
        /** What shows the tooltip: any of `hover`, `focus` and `click`, separated by spaces. */
        this.trigger = 'hover focus';
        /** Whether the tooltip is visible. */
        this.open = false;
        /**
         * Preferred placement relative to the target: `top`, `bottom`, `start` or `end`, optionally with
         * `-start` or `-end` alignment. `start` and `end` follow the writing direction.
         */
        this.placement = 'top';
        /**
         * Renders the tooltip statically in the page flow, always visible.
         * @internal For the documentation demos only.
         */
        this.preview = false;
        // ── Private fields ───────────────────────────────────────────────────────
        this._target = null;
        this._floating = null;
        /** How the target was linked to the tooltip, so detaching undoes exactly that. */
        this._link = null;
        /**
         * Escape hides a visible tooltip (WCAG 1.4.13). The listener is on `window` in the capture
         * phase, so it runs before the overlay controller's and the enclosing modal or menu stays open.
         */
        this._handleKeydown = (event) => {
            if (event.key !== 'Escape' || !this.open)
                return;
            event.preventDefault();
            event.stopPropagation();
            if (this._floating?.isOpen)
                this._floating.close();
            else
                this.open = false;
        };
    }
    // ── Lifecycle ────────────────────────────────────────────────────────────
    connectedCallback() {
        super.connectedCallback();
        if (!this.id) {
            nextTooltipId += 1;
            this.id = `wc-tooltip-${nextTooltipId}`;
        }
        if (!this.hasAttribute('role'))
            this.setAttribute('role', 'tooltip');
        this._syncPopoverAttribute();
        this._attach();
    }
    disconnectedCallback() {
        this._detach();
        window.removeEventListener('keydown', this._handleKeydown, true);
        super.disconnectedCallback();
    }
    updated(changed) {
        if (changed.has('preview'))
            this._syncPopoverAttribute();
        if (changed.has('for') ||
            changed.has('trigger') ||
            changed.has('preview')) {
            this._attach();
        }
        else if (changed.has('placement') && this._floating) {
            this._floating.setOptions({ placement: this._physicalPlacement() });
        }
        if (changed.has('open') && this._floating) {
            if (this.open && !this._floating.isOpen)
                this._floating.open();
            if (!this.open && this._floating.isOpen)
                this._floating.close();
        }
        if (changed.has('open'))
            this._syncOpen();
    }
    // ── Private methods ──────────────────────────────────────────────────────
    _resolveTrigger() {
        if (this.preview)
            return 'manual';
        const triggerTokens = this.trigger.split(' ');
        const hasHover = triggerTokens.includes('hover');
        const hasFocus = triggerTokens.includes('focus');
        const hasClick = triggerTokens.includes('click');
        if (hasClick)
            return 'click';
        if (hasHover && hasFocus)
            return 'hover-focus';
        if (hasFocus)
            return 'focus';
        if (hasHover)
            return 'hover';
        return 'manual';
    }
    _physicalPlacement() {
        return toPhysicalPlacement(this.placement, this);
    }
    /** The tooltip is a manual popover in the top layer, except in preview. */
    _syncPopoverAttribute() {
        if (this.preview)
            this.removeAttribute('popover');
        else
            this.setAttribute('popover', 'manual');
    }
    /** Resolves the target and listens to it. */
    _attach() {
        this._detach();
        // Resolve target: ID-based lookup or fallback to parent
        const root = this.getRootNode();
        this._target = this.for
            ? root.getElementById?.(this.for)
            : this.parentElement;
        if (!this._target)
            return;
        this._linkTarget();
        this._floating = new FloatingController(this, {
            placement: this._physicalPlacement(),
            strategy: 'fixed',
            offset: 0,
            trigger: this._resolveTrigger(),
            closeOnClickOutside: true,
            onOpenChange: isOpen => {
                if (this.open === isOpen)
                    return;
                this.open = isOpen;
                // Enter the top layer before floating-ui measures the tooltip.
                this._syncLayer();
            },
        });
        this._floating.setElements(this._target, this);
        if (this.open)
            this._floating.open();
    }
    _detach() {
        if (this._floating) {
            this._floating.close();
            this._floating.dispose();
            this._floating = null;
        }
        this._unlinkTarget();
        this._target = null;
    }
    /** Points the target's `aria-describedby` at the tooltip. */
    _linkTarget() {
        const target = this._target;
        if (!target || this.preview)
            return;
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
    _unlinkTarget() {
        const target = this._target;
        if (!target || !this._link)
            return;
        if (this._link === 'id') {
            const ids = (target.getAttribute('aria-describedby') ?? '')
                .split(/\s+/)
                .filter(id => id && id !== this.id);
            if (ids.length)
                target.setAttribute('aria-describedby', ids.join(' '));
            else
                target.removeAttribute('aria-describedby');
        }
        else {
            const elements = (target.ariaDescribedByElements ?? []).filter(element => element !== this);
            target.ariaDescribedByElements = elements.length ? elements : null;
        }
        this._link = null;
    }
    _syncOpen() {
        this._syncLayer();
        if (this.open && !this.preview) {
            // The target may have re-rendered its own aria-describedby.
            this._linkTarget();
            window.addEventListener('keydown', this._handleKeydown, true);
        }
        else {
            window.removeEventListener('keydown', this._handleKeydown, true);
        }
    }
    /** Shows or hides the tooltip in the top layer to match `open`. */
    _syncLayer() {
        if (this.preview ||
            !this.hasAttribute('popover') ||
            typeof this.showPopover !== 'function') {
            return;
        }
        const showing = this.matches(':popover-open');
        if (this.open && this.isConnected && !showing)
            this.showPopover();
        else if (!this.open && showing)
            this.hidePopover();
    }
    // ── Render ───────────────────────────────────────────────────────────────
    render() {
        return b `<div class="tooltip" id="tooltip">
      <div class="tooltip-content">
        <slot></slot>
      </div>
    </div>`;
    }
};
Tooltip.styles = [css_248z];
__decorate([
    n()
], Tooltip.prototype, "for", void 0);
__decorate([
    n({ type: String })
], Tooltip.prototype, "trigger", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Tooltip.prototype, "open", void 0);
__decorate([
    n({ type: String, reflect: true })
], Tooltip.prototype, "placement", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Tooltip.prototype, "preview", void 0);
Tooltip = __decorate([
    IndividualComponent
], Tooltip);

export { Tooltip };
//# sourceMappingURL=tooltip.js.map
