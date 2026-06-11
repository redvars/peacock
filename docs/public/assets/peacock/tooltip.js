import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './class-map-DG7CA1et.js';
import { F as FloatingController } from './floating-controller-CZYwnRVu.js';
import './directive-ZPhl09Yt.js';
import './floating-ui.dom-oQieRCpS.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host(:not([preview])) {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  transition: transform var(--duration-short2) ease-in-out, opacity var(--duration-short2) ease-in-out;
  transform: scale(0);
  opacity: 0;
}
:host(:not([preview])):host([open]) {
  pointer-events: auto;
  transform: scale(1);
  opacity: 1;
}

.variant-plain .tooltip-content {
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
}

.variant-rich .tooltip-content {
  display: inline-block;
  max-width: 17.5rem;
  padding-block: var(--spacing-150) var(--spacing-100);
  color: var(--color-on-surface-variant);
  background-color: var(--color-surface-container);
  border-radius: var(--shape-corner-medium);
}
.variant-rich .elevation {
  --elevation-level: 2;
  --elevation-container-shape: var(--shape-corner-medium);
}
.variant-rich .tooltip-title {
  font-family: var(--typography-title-small-font-family) !important;
  font-size: var(--typography-title-small-font-size) !important;
  font-weight: var(--typography-title-small-font-weight) !important;
  line-height: var(--typography-title-small-line-height) !important;
  letter-spacing: var(--typography-title-small-letter-spacing) !important;
  margin-block-end: var(--spacing-050);
  padding-inline: var(--spacing-200);
}
.variant-rich .tooltip-support-text {
  font-family: var(--typography-body-medium-font-family) !important;
  font-size: var(--typography-body-medium-font-size) !important;
  font-weight: var(--typography-body-medium-font-weight) !important;
  line-height: var(--typography-body-medium-line-height) !important;
  letter-spacing: var(--typography-body-medium-letter-spacing) !important;
  padding-inline: var(--spacing-200);
}
.variant-rich .tooltip-actions {
  margin-top: var(--spacing-150);
  padding-inline: var(--spacing-050);
  display: flex;
  align-items: center;
  gap: var(--spacing-100);
}`;

/**
 * @label Tooltip
 * @tag wc-tooltip
 * @rawTag tooltip
 * @summary Displays a tooltip for an element.
 * @tags display
 *
 * @example
 * ```html
 * <wc-tooltip preview>Tooltip</wc-tooltip>
 * ```
 */
let Tooltip = class Tooltip extends i$1 {
    constructor() {
        super(...arguments);
        this.content = '';
        /**
         * The ID of the element the tooltip should attach to.
         * If not provided, it defaults to the parent element.
         */
        this.for = '';
        this.trigger = 'hover focus';
        this.open = false;
        this.variant = 'plain';
        this.preview = false;
        this._target = null;
        this._floating = null;
    }
    resolveTrigger() {
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
    detachListeners() {
        if (this._floating) {
            this._floating.close();
            this._floating = null;
        }
        this._target = null;
    }
    set forElement(value) {
        if (value) {
            this._focusTarget = value;
        }
        else {
            this._focusTarget = undefined;
        }
    }
    __getFocusTarget() {
        if (this._focusTarget) {
            return this._focusTarget;
        }
        const focusTarget = document.getElementById(this.for);
        if (focusTarget) {
            return focusTarget;
        }
        return this.parentElement;
    }
    attachListeners() {
        this.detachListeners();
        // Resolve target: ID-based lookup or fallback to parent
        const root = this.getRootNode();
        this._target = this.for
            ? root.getElementById(this.for)
            : this.parentElement;
        if (!this._target)
            return;
        this._floating = new FloatingController(this, {
            placement: 'top',
            strategy: 'fixed',
            offset: 0,
            trigger: this.resolveTrigger(),
            closeOnClickOutside: true,
            onOpenChange: isOpen => {
                if (this.open === isOpen)
                    return;
                this.open = isOpen;
            },
        });
        this._floating.setElements(this._target, this);
    }
    connectedCallback() {
        super.connectedCallback();
        this.attachListeners();
    }
    disconnectedCallback() {
        this.detachListeners();
        super.disconnectedCallback();
    }
    updated(changedProps) {
        // If the 'for' property changes, re-bind listeners to the new target
        if (changedProps.has('for')) {
            this.attachListeners();
        }
        if (changedProps.has('trigger') || changedProps.has('preview')) {
            this.attachListeners();
        }
        if (this._floating && this._target) {
            this._floating.setElements(this._target, this);
            if (changedProps.has('open') && this.open && !this._floating.isOpen) {
                this._floating.open();
            }
            if (changedProps.has('open') && !this.open && this._floating.isOpen) {
                this._floating.close();
            }
        }
    }
    render() {
        return b ` <div
      class=${e({
            tooltip: true,
            [`variant-${this.variant}`]: true,
        })}
      id="tooltip"
      role="tooltip"
      aria-hidden=${!this.open}
      aria-labelledby="tooltip-labelledby"
    >
      ${this.variant === 'plain'
            ? this.__renderPlainTooltip()
            : this.__renderRichTooltip()}
    </div>`;
    }
    // eslint-disable-next-line class-methods-use-this
    __renderPlainTooltip() {
        return b `<div class="tooltip-content" id="tooltip-labelledby">
      <slot></slot>
    </div>`;
    }
    // eslint-disable-next-line class-methods-use-this
    __renderRichTooltip() {
        return b `
      <div class="tooltip-content">
        <wc-elevation class="elevation"></wc-elevation>

        <div class="tooltip-title" id="tooltip-labelledby">
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
};
Tooltip.styles = [css_248z];
__decorate([
    n()
], Tooltip.prototype, "content", void 0);
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
], Tooltip.prototype, "variant", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Tooltip.prototype, "preview", void 0);
Tooltip = __decorate([
    IndividualComponent
], Tooltip);

export { Tooltip };
//# sourceMappingURL=tooltip.js.map
