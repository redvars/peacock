import { i, a as i$1, b, A, _ as __decorate, I as IndividualComponent } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e as e$1 } from './query-CHb9Ft_d.js';
import { e } from './class-map-DG7CA1et.js';
import { o } from './if-defined-BXZpRQ4P.js';
import { o as observerSlotChangesWithCallback } from './observe-slot-change-DPxaZrZF.js';
import { i as isActivationClick, d as dispatchActivationClick } from './dispatch-event-utils-CuEqjlPT.js';
import { i as isLink } from './is-link-Dk2OV3PM.js';
import { t as throttle } from './throttle-C7ZAPqtu.js';
import { s as spread } from './spread-B5cgadZl.js';
import { D as DISABLED_REASON_ID } from './ButtonConstants-CahP2_NA.js';
import { m as mixinBaseButton, a as mixinHyperlink } from './hyperlink-DLvb6MXE.js';
import { m as mixinDelegatesAria, a as mixinElementInternals } from './element-internals-2CMts_0M.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

var css_248z$1 = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
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
  width: 100%;
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
.chip .tag-content .close-btn {
  height: 100%;
  padding: 0;
  padding-inline: calc(var(--chip-container-padding) / 2);
  margin: 0;
  border: none;
  background: transparent;
  line-height: 0;
  cursor: pointer;
}
.chip .tag-content .close-btn .close-btn-icon {
  --icon-size: 1rem;
  --icon-color: var(--_chip-text-color);
}
.chip .tag-content .close-btn:hover {
  background: var(--chip-hover-color);
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
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: var(--chip-container-shape);
  background: var(--_chip-container-color);
  pointer-events: none;
}

.outline {
  z-index: 0;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
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
 * @summary Chip component for displaying compact information with optional actions.
 * @tags display
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
        /** When true, renders the chip in a loading skeleton state. */
        this.skeleton = false;
        /** When true, the chip is in the selected/pressed state. */
        this.selected = false;
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
        // Custom Event: tag--dismiss
        this.dispatchEvent(new CustomEvent('tag--dismiss', {
            bubbles: true,
            composed: true,
        }));
    }
    _renderCloseButton() {
        if (!this.dismissible)
            return A;
        return b `
      <button
        class="close-btn"
        @click=${this._dismissClickHandler}
        aria-label="Dismiss"
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

      ${this.renderChipElement()} ${this.__renderTooltip()}
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
        ?aria-disabled=${this.softDisabled}
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
      ?aria-disabled=${this.softDisabled}
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
        ${this._renderCloseButton()}
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
    n()
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
