import { i, a as i$1, b, A, _ as __decorate, I as IndividualComponent } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e as e$1 } from './query-CHb9Ft_d.js';
import { e } from './class-map-DG7CA1et.js';
import { o } from './if-defined-BXZpRQ4P.js';
import { i as isActivationClick, d as dispatchActivationClick } from './dispatch-event-utils-CuEqjlPT.js';
import { i as isLink } from './is-link-Dk2OV3PM.js';
import { D as DISABLED_REASON_ID } from './ButtonConstants-CahP2_NA.js';
import { m as mixinBaseButton, a as mixinHyperlink } from './hyperlink-DLvb6MXE.js';
import { m as mixinDelegatesAria, a as mixinElementInternals } from './element-internals-2CMts_0M.js';
import { m as mixinFormSubmitter, a as mixinFormAssociated } from './form-associated-BXADnjOB.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';
import './throttle-C7ZAPqtu.js';

var css_248z$2 = i`* {
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
  --fab-container-shape: var(--shape-corner-large);
  --fab-container-elevation-level: 3;
  --private-button-container-shape-start-start: var(--fab-container-shape);
  --private-button-container-shape-start-end: var(--fab-container-shape);
  --private-button-container-shape-end-start: var(--fab-container-shape);
  --private-button-container-shape-end-end: var(--fab-container-shape);
  --private-button-container-shape-variant: var(--fab-container-shape-variant);
}

/*
  * Reset native button/link styles
  */
.native-button {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  padding: 0;
}

.native-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  outline: none;
}
.native-link:link, .native-link:visited, .native-link:hover, .native-link:active {
  text-decoration: none;
  color: inherit;
}

/*
  * Reset native button/link styles
  */
.fab-element {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  text-decoration: none;
  cursor: pointer;
}

.fab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--fab-container-size);
  height: var(--fab-container-size);
  border-radius: var(--fab-container-shape);
  font-family: var(--font-family-sans) !important;
  z-index: 0;
}
.fab .fab-content {
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 0;
  gap: 0.75rem;
  color: var(--private-button-label-text-color);
  --icon-size: var(--private-button-icon-size);
  --icon-color: var(--private-button-label-text-color);
}
.fab .fab-label {
  font-size: var(--private-button-font-size) !important;
  font-weight: var(--private-button-font-weight) !important;
  line-height: var(--private-button-line-height) !important;
  letter-spacing: var(--private-button-letter-spacing) !important;
  white-space: nowrap;
}
.fab.disabled {
  cursor: not-allowed;
}

/* Extended FAB */
.fab.extended {
  width: auto;
  min-width: var(--fab-extended-min-width);
  padding: 0 1rem;
  border-radius: var(--fab-container-shape);
}

/*
  Background layers
 */
.focus-ring {
  z-index: 2;
  --focus-ring-container-shape-start-start: var(--fab-container-shape);
  --focus-ring-container-shape-start-end: var(--fab-container-shape);
  --focus-ring-container-shape-end-start: var(--fab-container-shape);
  --focus-ring-container-shape-end-end: var(--fab-container-shape);
}

.ripple {
  border-radius: var(--fab-container-shape);
  --ripple-state-opacity: var(--private-button-container-state-opacity, 0);
  --ripple-pressed-color: var(--private-button-label-text-color);
}

.background {
  display: block;
  position: absolute;
  inset: 0;
  background-color: var(--private-button-container-color);
  opacity: var(--private-button-container-opacity, 1);
  border-radius: var(--fab-container-shape);
  pointer-events: none;
}

.elevation {
  --elevation-level: var(
    --private-button-container-elevation-level,
    var(--fab-container-elevation-level)
  );
  transition-duration: 280ms;
  --elevation-container-shape-start-start: var(--fab-container-shape);
  --elevation-container-shape-start-end: var(--fab-container-shape);
  --elevation-container-shape-end-start: var(--fab-container-shape);
  --elevation-container-shape-end-end: var(--fab-container-shape);
}

/* State management */
:host:hover:not([disabled]) {
  --private-button-container-elevation-level: 4;
  --private-button-container-state-opacity: 0.08;
}

:host(:active):not([disabled]) {
  --private-button-container-elevation-level: 3;
  --private-button-container-state-opacity: 0.12;
}

:host([lowered]) {
  --fab-container-elevation-level: 1;
}
:host([lowered]):hover:not([disabled]) {
  --private-button-container-elevation-level: 2;
}
:host([lowered]):active:not([disabled]) {
  --private-button-container-elevation-level: 1;
}

:host([disabled]) {
  --private-button-container-color: var(--color-on-surface);
  --private-button-container-opacity: 0.12;
  --private-button-label-text-color: var(--color-on-surface);
  --private-button-label-text-opacity: 0.38;
  --private-button-container-elevation-level: 0;
}
:host([disabled]) .ripple {
  display: none;
}
:host([disabled]) .fab-content {
  opacity: 0.38;
}

:host([variant=tonal]) {
  --private-button-container-color: var(--tonal-fab-container-color);
  --private-button-label-text-color: var(--tonal-fab-label-text-color);
}

:host([variant=filled]) {
  --private-button-container-color: var(--filled-fab-container-color);
  --private-button-label-text-color: var(--filled-fab-label-text-color);
}`;

var css_248z$1 = i`:host {
  --tonal-fab-container-color: var(--color-surface-container-high);
  --tonal-fab-label-text-color: var(--color-on-surface);
  --filled-fab-container-color: var(--color-surface);
  --filled-fab-label-text-color: var(--color-on-surface);
}

:host([color=surface]) {
  --tonal-fab-container-color: var(--color-surface-container-high);
  --tonal-fab-label-text-color: var(--color-on-surface);
  --filled-fab-container-color: var(--color-surface);
  --filled-fab-label-text-color: var(--color-on-surface);
}

:host([color=primary]) {
  --tonal-fab-container-color: var(--color-primary-container);
  --tonal-fab-label-text-color: var(--color-on-primary-container);
  --filled-fab-container-color: var(--color-primary);
  --filled-fab-label-text-color: var(--color-on-primary);
}

:host([color=secondary]) {
  --tonal-fab-container-color: var(--color-secondary-container);
  --tonal-fab-label-text-color: var(--color-on-secondary-container);
  --filled-fab-container-color: var(--color-secondary);
  --filled-fab-label-text-color: var(--color-on-secondary);
}

:host([color=tertiary]) {
  --tonal-fab-container-color: var(--color-tertiary-container);
  --tonal-fab-label-text-color: var(--color-on-tertiary-container);
  --filled-fab-container-color: var(--color-tertiary);
  --filled-fab-label-text-color: var(--color-on-tertiary);
}`;

var css_248z = i`@charset "UTF-8";
/* Small FAB: 40×40dp, shape-corner-medium */
:host([size=sm]) {
  --fab-container-shape: var(--shape-corner-medium);
  --fab-container-size: 2.5rem;
  --private-button-icon-size: 1.5rem;
  --fab-extended-min-width: 4rem;
  --private-button-font-size: 0.875rem;
  --private-button-font-weight: var(--font-weight-medium);
  --private-button-line-height: 1.25rem;
  --private-button-letter-spacing: 0.1px;
}

/* Standard/Medium FAB: 56×56dp, shape-corner-large (default) */
:host([size=md]) {
  --fab-container-size: 3.5rem;
  --private-button-icon-size: 1.5rem;
  --fab-extended-min-width: 5rem;
  --private-button-font-size: 0.875rem;
  --private-button-font-weight: var(--font-weight-medium);
  --private-button-line-height: 1.25rem;
  --private-button-letter-spacing: 0.1px;
}

/* Large FAB: 96×96dp, shape-corner-extra-large */
:host([size=lg]) {
  --fab-container-shape: var(--shape-corner-extra-large);
  --fab-container-size: 6rem;
  --private-button-icon-size: 2.25rem;
  --fab-extended-min-width: 6rem;
  --private-button-font-size: 1rem;
  --private-button-font-weight: var(--font-weight-medium);
  --private-button-line-height: 1.5rem;
  --private-button-letter-spacing: 0.15px;
}`;

/**
 * @label FAB
 * @tag wc-fab
 * @rawTag fab
 *
 * @summary The FAB (Floating Action Button) represents the primary action on a screen.
 * @overview
 * <p>A Floating Action Button (FAB) is a circular button that represents the primary action on a screen. It follows the specification and supports four color roles and two variants.</p>
 *
 * @cssprop --fab-container-color: Background color of the FAB container.
 * @cssprop --fab-label-text-color: Text and icon color of the FAB label.
 * @cssprop --fab-container-shape: Corner radius of the FAB. Defaults to var(--shape-corner-large).
 * @cssprop --fab-container-elevation-level: Elevation level of the FAB. Defaults to 3.
 *
 * @fires {MouseEvent} click - Dispatched when the FAB is clicked.
 *
 * @example
 * ```html
 * <wc-fab><wc-icon name="add"></wc-icon></wc-fab>
 * ```
 * @tags controls
 */
let Fab = class Fab extends mixinBaseButton(mixinHyperlink(mixinDelegatesAria(mixinFormSubmitter(mixinFormAssociated(mixinElementInternals(i$1)))))) {
    constructor() {
        super();
        /**
         * The color role of the FAB.
         * `"surface"` uses the surface color role.
         * `"primary"` uses the primary color role.
         * `"secondary"` uses the secondary color role.
         * `"tertiary"` uses the tertiary color role.
         */
        this.color = 'surface';
        /**
         * The style variant of the FAB.
         * `"tonal"` uses container colors.
         * `"filled"` uses solid role colors.
         */
        this.variant = 'tonal';
        /**
         * The size of the FAB.
         * `"sm"` renders a small FAB (40×40dp).
         * `"md"` renders a standard FAB (56×56dp). This is the default.
         * `"lg"` renders a large FAB (96×96dp).
         */
        this.size = 'md';
        /**
         * If `true`, the FAB is in a lowered (resting) state with reduced elevation.
         */
        this.lowered = false;
        this.skeleton = false;
        this.toggle = false;
        this.selected = false;
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
    focus() {
        this.buttonElement?.focus();
    }
    blur() {
        this.buttonElement?.blur();
    }
    renderDisabledReason(softDisabled) {
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
    renderTooltip() {
        if (this.tooltip) {
            return b `<wc-tooltip class="tooltip" for="button"
        >${this.tooltip}</wc-tooltip
      >`;
        }
        return A;
    }
    renderFabElement(isExtended) {
        const { ariaLabel, ariaHasPopup, ariaExpanded } = this;
        const cssClasses = {
            button: true,
            fab: true,
            'fab-element': true,
            [`size-${this.size}`]: true,
            [`color-${this.color}`]: true,
            [`variant-${this.variant}`]: true,
            extended: isExtended,
            lowered: this.lowered,
            disabled: this.disabled,
        };
        if (!isLink(this)) {
            return b `<button
        class=${e(cssClasses)}
        id="button"
        type="button"
        aria-label="${ariaLabel || A}"
        aria-haspopup="${ariaHasPopup || A}"
        aria-expanded="${ariaExpanded || A}"
        aria-describedby=${o(this.softDisabled ? DISABLED_REASON_ID : undefined)}
        ?aria-disabled=${this.softDisabled}
        ?disabled=${this.disabled}
      >
        ${this.renderFabContent(isExtended)}
      </button>`;
        }
        return b `<a
      class=${e(cssClasses)}
      id="button"
      tabindex=${this.disabled ? '-1' : '0'}
      href=${o(this.href)}
      target=${this.target}
      role="button"
      aria-label="${ariaLabel || A}"
      aria-haspopup="${ariaHasPopup || A}"
      aria-expanded="${ariaExpanded || A}"
      aria-describedby=${o(this.softDisabled ? DISABLED_REASON_ID : undefined)}
      ?aria-disabled=${this.softDisabled}
    >
      ${this.renderFabContent(isExtended)}
    </a>`;
    }
    renderFabContent(isExtended) {
        return b `
      <div class="fab-content">
        <slot></slot>
        ${isExtended
            ? b `<span class="fab-label">${this.label}</span>`
            : A}
      </div>
      ${this.renderDisabledReason(this.softDisabled)}
    `;
    }
    // ── Render ────────────────────────────────────────────────────────────────
    render() {
        const isExtended = !!this.label;
        return b `
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <wc-ripple class="ripple" for="button"></wc-ripple>
      <wc-skeleton class="skeleton"></wc-skeleton>

      ${this.renderFabElement(isExtended)} ${this.renderTooltip()}
    `;
    }
};
// ── Static ───────────────────────────────────────────────────────────────
/** @nocollapse */ // eslint-disable-next-line
Fab.shadowRootOptions = {
    mode: 'open',
    delegatesFocus: true,
};
Fab.styles = [css_248z$2, css_248z$1, css_248z];
__decorate([
    n({ type: String })
], Fab.prototype, "label", void 0);
__decorate([
    n({ reflect: true })
], Fab.prototype, "color", void 0);
__decorate([
    n({ reflect: true })
], Fab.prototype, "variant", void 0);
__decorate([
    n({ reflect: true })
], Fab.prototype, "size", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Fab.prototype, "lowered", void 0);
__decorate([
    n()
], Fab.prototype, "tooltip", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Fab.prototype, "skeleton", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Fab.prototype, "toggle", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Fab.prototype, "selected", void 0);
__decorate([
    e$1('.button')
], Fab.prototype, "buttonElement", void 0);
Fab = __decorate([
    IndividualComponent
], Fab);

export { Fab };
//# sourceMappingURL=fab.js.map
