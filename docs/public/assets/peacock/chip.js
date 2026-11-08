import { i, a as i$1, b, A, _ as __decorate, I as IndividualComponent } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e as e$1 } from './query-CHb9Ft_d.js';
import { e } from './class-map-NDIkZErE.js';
import { o } from './if-defined-D9DEJR_6.js';
import { o as observerSlotChangesWithCallback } from './observe-slot-change-DPxaZrZF.js';
import { i as isActivationClick, d as dispatchActivationClick, t as throttle } from './throttle-SQ9t-HL7.js';
import { i as isLink } from './is-link-Dk2OV3PM.js';
import { s as spread } from './spread-B5cgadZl.js';
import { D as DISABLED_REASON_ID } from './ButtonConstants-CahP2_NA.js';
import { a as mixinBaseButton } from './base-button-BJMGMcMv.js';
import { m as mixinHyperlink } from './hyperlink-DycWPKwU.js';
import { m as mixinDelegatesAria } from './delegate-Bw2wdPFP.js';
import { m as mixinElementInternals } from './element-internals-QME0yEz4.js';
import { I as I18nController } from './i18n-controller-DJHsE1YH.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';
import './warn-once-BNxX1Y98.js';
import './strings-DnYjGbbc.js';
import './locale-DEsJZCQG.js';

var css_248z$1 = i`* {
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
:host {
  position: relative;
  display: inline-flex;
  --chip-container-color: var(--color-surface);
  --chip-label-text-color: var(--color-on-surface);
  --chip-outline-color: var(--color-outline-variant);
  --chip-container-shape: var(--shape-corner-small);
  --chip-container-padding: 1rem;
  /* 8dp */
}

/*
  * Reset native button/link styles
  */
.button {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  padding: 0;
  outline: none;
  text-decoration: none;
}

.chip {
  display: inline-flex;
  align-items: center;
  height: var(--chip-height, var(--_chip-height, 2rem));
  flex: 1 1 auto;
  min-width: 0;
  cursor: pointer;
  z-index: 0;
}
.chip .tag-content {
  position: relative;
  z-index: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-inline: var(--chip-container-padding);
  color: var(--_chip-text-color);
  opacity: var(--_chip-text-opacity, 1);
  font-family: var(--typography-label-large-font-family) !important;
  font-size: var(--typography-label-large-font-size) !important;
  font-weight: var(--typography-label-large-font-weight) !important;
  line-height: var(--typography-label-large-line-height) !important;
  letter-spacing: var(--typography-label-large-letter-spacing) !important;
}
.chip .tag-content .label-container {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chip .tag-content .icon-slot-container {
  height: 100%;
  display: flex;
  align-items: center;
  --icon-size: 1rem;
  --icon-color: var(--color-primary);
}
.chip.disabled {
  cursor: not-allowed;
}

/*
  The dismiss button sits next to the chip's button, not inside it: a button inside a button is
  invalid and keyboard users could not reach it.
 */
.close-btn {
  position: relative;
  z-index: 1;
  flex: none;
  height: var(--chip-height, var(--_chip-height, 2rem));
  padding: 0;
  padding-inline: calc(var(--chip-container-padding) / 2);
  margin: 0;
  border: none;
  border-start-end-radius: var(--chip-container-shape);
  border-end-end-radius: var(--chip-container-shape);
  background: transparent;
  line-height: 0;
  cursor: pointer;
  opacity: var(--_chip-text-opacity, 1);
}
.close-btn .close-btn-icon {
  --icon-size: 1rem;
  --icon-color: var(--_chip-text-color);
}
.close-btn:hover {
  background: var(--chip-hover-color);
}
.close-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}
.close-btn:disabled {
  cursor: not-allowed;
}

.chip.dismissible .tag-content {
  padding-inline-end: 0;
}
.chip.dismissible.actionable .tag-content {
  padding-inline-end: calc(var(--chip-container-padding) / 2);
}
.chip.icon-slot-has-content .tag-content, .chip.selected .tag-content {
  padding-inline-start: 0;
}
.chip.icon-slot-has-content .icon-slot-container, .chip.selected .icon-slot-container {
  padding-inline: calc(var(--chip-container-padding) / 2);
}

/*
  Background layers
 */
.focus-ring {
  z-index: 2;
  display: block;
  --focus-ring-container-shape: var(--chip-container-shape);
}

.ripple {
  display: block;
  border-radius: var(--chip-container-shape);
  --ripple-state-opacity: var(--_chip-state-opacity, 0);
  --ripple-pressed-color: var(--_chip-state-color);
}

.background {
  display: block;
  position: absolute;
  top: 0;
  inset-inline-start: 0;
  width: 100%;
  height: 100%;
  border-radius: var(--chip-container-shape);
  background: var(--_chip-container-color);
  opacity: var(--_chip-container-opacity, 1);
  pointer-events: none;
}

.outline {
  z-index: 0;
  display: block;
  position: absolute;
  top: 0;
  inset-inline-start: 0;
  width: 100%;
  height: 100%;
  border-radius: var(--chip-container-shape);
  border: 1px solid var(--chip-outline-color);
}

.elevation {
  --elevation-level: 0;
  transition-duration: 280ms;
  --elevation-container-shape: var(--chip-container-shape);
}

/* Color/state management */
:host {
  --_chip-container-color: var(--chip-container-color);
  --_chip-text-color: var(--chip-label-text-color);
  --_chip-state-color: var(--_chip-text-color);
}

:host:hover {
  --_chip-state-opacity: 0.08;
}

:host(:active) {
  --_chip-state-opacity: 0.12;
}

:host([selected]) {
  --_chip-container-color: var(--color-secondary-container);
  --_chip-text-color: var(--color-on-secondary-container);
}

:host([disabled]) {
  --_chip-container-color: var(--color-on-surface);
  --_chip-container-opacity: 0.1;
  --_chip-text-color: var(--color-on-surface);
  --_chip-text-opacity: 0.38;
}
:host([disabled]) .ripple {
  display: none;
}`;

var css_248z = i`.tag {
  font-family: var(--font-family-sans) !important;
}

.tag.size-xs,
.tag.size-extra-small {
  --_button-height: 2rem;
  --_button-icon-size: 1.25rem;
  --_container-padding: 0.75rem;
  font-size: 0.875rem !important;
  font-weight: var(--font-weight-medium) !important;
  line-height: 1.25rem !important;
  letter-spacing: 0.1px !important;
}

.tag.size-sm,
.tag.size-small {
  --_button-height: 2.5rem;
  --_button-icon-size: 1.25rem;
  --_container-padding: 1rem;
  font-size: 0.875rem !important;
  font-weight: var(--font-weight-medium) !important;
  line-height: 1.25rem !important;
  letter-spacing: 0.1px !important;
}

.button.size-md,
.button.size-medium {
  --_button-height: 3.5rem;
  --_button-icon-size: 1.5rem;
  --_container-padding: 1.5rem;
  font-size: 1rem !important;
  font-weight: var(--font-weight-medium) !important;
  line-height: 1.5rem !important;
  letter-spacing: 0.15px !important;
}

.button.size-lg,
.button.size-large {
  --_button-height: 6rem;
  --_button-icon-size: 2rem;
  --_container-padding: 3rem;
  font-size: 1.5rem !important;
  font-weight: var(--font-weight-regular) !important;
  line-height: 2rem !important;
  letter-spacing: 0 !important;
}

.button.size-xl {
  --_button-height: 8.5rem;
  --_button-icon-size: 2.5rem;
  --_container-padding: 4rem;
  font-size: 2rem !important;
  font-weight: var(--font-weight-regular) !important;
  line-height: 2.5rem !important;
  letter-spacing: 0 !important;
}`;

/**
 * @label Chip
 * @tag wc-chip
 * @rawTag chip
 * @summary A compact button for an action, a filter or an entered value, with an optional icon and dismiss button.
 *
 * @overview
 * <p>A chip is a button, or a link when <code>href</code> is set. The default slot holds the label
 * and the <code>icon</code> slot a leading icon, which a check replaces while the chip is
 * <code>selected</code>. For a read-only status label use <code>wc-tag</code>; to lay chips out or
 * let the person pick from them use <code>wc-chip-set</code>.</p>
 * <p>With <code>selectable</code> the chip is a toggle (a filter chip) and its button gets
 * <code>aria-pressed</code> from <code>selected</code>. A selecting <code>wc-chip-set</code> sets
 * this and handles the selection; a standalone selectable chip does not toggle itself, so set
 * <code>selected</code> on <code>click</code>. <code>value</code> is what the chip set reports,
 * and defaults to the chip's text.</p>
 * <p><code>dismissible</code> adds a close button, labelled from Peacock's strings, that fires
 * <code>dismiss</code>; the chip does not remove itself. <code>disabled</code> turns the chip off;
 * <code>soft-disabled</code> with <code>disabled-reason</code> keeps it focusable and reads the
 * reason to screen readers. <code>skeleton</code> shows a placeholder while the content is not
 * known yet and ignores clicks. <code>tooltip</code> adds a tooltip and
 * <code>throttle-delay</code> throttles clicks.</p>
 * @tags display
 *
 * @fires {CustomEvent} dismiss - Dispatched when the dismiss button of a `dismissible` chip is clicked.
 *
 * @example
 * ```html
 * <wc-chip>Chip content</wc-chip>
 * ```
 */
let Chip = class Chip extends mixinBaseButton(mixinHyperlink(mixinDelegatesAria(mixinElementInternals(i$1)))) {
    constructor() {
        super();
        /** If true, the tag will have a close icon. */
        this.dismissible = false;
        /** True when the `icon` slot contains at least one node. */
        this._hasIconSlotContent = false;
        /**
         * When true, renders the chip as a placeholder (a skeleton) while its content is not known yet,
         * and ignores clicks. It is a look, not a busy state: for a chip whose action is running, use
         * `soft-disabled` with a `disabled-reason`.
         */
        this.skeleton = false;
        /**
         * When true, the chip is in the selected/pressed state. Assistive technology hears it only on a
         * `selectable` chip (or a chip in a selecting `wc-chip-set`), as `aria-pressed`.
         */
        this.selected = false;
        /**
         * Makes the chip a toggle (a filter chip): its button gets `aria-pressed` from `selected`. A
         * `wc-chip-set` with `selectable` or `multiple` sets it on its chips and handles the selection;
         * a standalone selectable chip does not toggle itself, so the page sets `selected` on `click`.
         */
        this.selectable = false;
        /** The value a selecting `wc-chip-set` reports for this chip; defaults to its text. */
        this.value = '';
        /** Peacock's strings for the dismiss button label. */
        this.i18n = new I18nController(this);
        this.__dispatchClickWithThrottle = event => {
            this.__dispatchClick(event);
        };
        this.__dispatchClick = (event) => {
            // If the button is soft-disabled or a disabled link, we need to explicitly
            // prevent the click from propagating to other event listeners as well as
            // prevent the default action.
            if (this.softDisabled || (this.disabled && this.href) || this.skeleton) {
                event.stopImmediatePropagation();
                event.preventDefault();
                return;
            }
            if (!isActivationClick(event) || !this.buttonElement) {
                return;
            }
            this.focus();
            dispatchActivationClick(this.buttonElement);
        };
        this.addEventListener('click', this.__dispatchClickWithThrottle);
    }
    __renderDisabledReason(softDisabled) {
        if (softDisabled)
            return b `<div
        id=${DISABLED_REASON_ID}
        role="tooltip"
        aria-label=${this.disabledReason}
        class="screen-reader-only"
      >
        ${this.disabledReason}
      </div>`;
        return A;
    }
    __renderTooltip() {
        if (this.tooltip) {
            return b `<wc-tooltip class="tooltip" for="button"
        >${this.tooltip}</wc-tooltip
      >`;
        }
        return A;
    }
    focus() {
        this.buttonElement?.focus();
    }
    blur() {
        this.buttonElement?.blur();
    }
    firstUpdated() {
        if (typeof this.throttleDelay === 'number') {
            this.__dispatchClickWithThrottle = throttle(this.__dispatchClick, this.throttleDelay);
        }
        observerSlotChangesWithCallback(this.renderRoot.querySelector('slot[name="icon"]'), hasContent => {
            this._hasIconSlotContent = hasContent;
            this.requestUpdate();
        });
    }
    _dismissClickHandler(e) {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
    }
    _renderCloseButton() {
        if (!this.dismissible)
            return A;
        return b `
      <button
        class="close-btn"
        @click=${this._dismissClickHandler}
        aria-label=${this.i18n.t('dismiss')}
        ?disabled=${this.disabled}
      >
        <wc-icon class="close-btn-icon" name="close"></wc-icon>
      </button>
    `;
    }
    render() {
        return b `
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple" for="button"></wc-ripple>

      ${this.renderChipElement()} ${this._renderCloseButton()}
      ${this.__renderTooltip()}
    `;
    }
    renderChipElement() {
        const cssClasses = {
            chip: true,
            button: true,
            selected: this.selected,
            dismissible: this.dismissible,
            'icon-slot-has-content': this._hasIconSlotContent,
        };
        if (!isLink(this)) {
            return b `<button
        class=${e(cssClasses)}
        id="button"
        aria-describedby=${o(this.softDisabled ? DISABLED_REASON_ID : undefined)}
        aria-disabled=${this.softDisabled ? 'true' : A}
        aria-pressed=${this.selectable ? String(this.selected) : A}
        ?disabled=${this.disabled}
        ${spread(this.configAria)}
      >
        ${this.renderChipContent()}
      </button>`;
        }
        return b `<a
      class=${e(cssClasses)}
      id="button"
      href=${this.href}
      target=${this.target}
      tabindex=${this.disabled ? '-1' : '0'}
      role="button"
      aria-describedby=${o(this.softDisabled ? DISABLED_REASON_ID : undefined)}
      aria-disabled=${this.softDisabled ? 'true' : A}
      aria-pressed=${this.selectable ? String(this.selected) : A}
      ${spread(this.configAria)}
    >
      ${this.renderChipContent()}
    </a>`;
    }
    renderChipContent() {
        return b `
      <div class="tag-content">
        <div class="icon-slot-container">
          ${this.selected
            ? b `<wc-icon class="selected-icon" name="check"></wc-icon>`
            : b `<slot name="icon"></slot>`}
        </div>
        <div class="label-container">
          <slot></slot>
        </div>
      </div>
    `;
    }
};
/** @nocollapse */ // eslint-disable-next-line
Chip.shadowRootOptions = {
    mode: 'open',
    delegatesFocus: true,
};
// Define styles (Lit handles Scoping via Shadow DOM by default)
// You would typically import your tag.scss.js here or use the css tag
Chip.styles = [css_248z$1, css_248z];
__decorate([
    n({ type: Boolean })
], Chip.prototype, "dismissible", void 0);
__decorate([
    n({ reflect: true })
], Chip.prototype, "configAria", void 0);
__decorate([
    r()
], Chip.prototype, "_hasIconSlotContent", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Chip.prototype, "skeleton", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Chip.prototype, "selected", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Chip.prototype, "selectable", void 0);
__decorate([
    n({ type: String, reflect: true })
], Chip.prototype, "value", void 0);
__decorate([
    n({ type: Number, attribute: 'throttle-delay' })
], Chip.prototype, "throttleDelay", void 0);
__decorate([
    n()
], Chip.prototype, "tooltip", void 0);
__decorate([
    e$1('.button')
], Chip.prototype, "buttonElement", void 0);
Chip = __decorate([
    IndividualComponent
], Chip);

export { Chip };
//# sourceMappingURL=chip.js.map
