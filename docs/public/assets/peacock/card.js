import { i, a as i$1, A, b, _ as __decorate, I as IndividualComponent } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e as e$1 } from './query-CHb9Ft_d.js';
import { e } from './class-map-NDIkZErE.js';
import { o } from './if-defined-D9DEJR_6.js';
import { i as isActivationClick, d as dispatchActivationClick, t as throttle } from './throttle-SQ9t-HL7.js';
import { i as isLink } from './is-link-Dk2OV3PM.js';
import { o as observerSlotChangesWithCallback } from './observe-slot-change-DPxaZrZF.js';
import { N as NativeHyperlinkMixin } from './NativeHyperlinkMixin-WdY0fM-H.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

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
  display: block;
  --card-gap: 0;
  --card-padding: 0;
  --card-container-shape: var(--shape-corner-large);
  --card-container-shape-start-start: unset;
  --card-container-shape-start-end: unset;
  --card-container-shape-end-start: unset;
  --card-container-shape-end-end: unset;
  --_container-shape-start-start: var(
    --card-container-shape-start-start,
    var(--card-container-shape)
  );
  --_container-shape-start-end: var(
    --card-container-shape-start-end,
    var(--card-container-shape)
  );
  --_container-shape-end-start: var(
    --card-container-shape-end-start,
    var(--card-container-shape)
  );
  --_container-shape-end-end: var(
    --card-container-shape-end-end,
    var(--card-container-shape)
  );
}

/*
  * Reset native button/link styles
  */
.card {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  text-decoration: none;
  text-align: unset;
}

.card {
  display: flex;
  height: 100%;
  width: 100%;
  z-index: 0;
}
.card .card-content {
  z-index: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: var(--card-padding);
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
  color: var(--_label-text-color);
  opacity: var(--_label-text-opacity, 1);
  --icon-color: var(--_label-text-color);
}
.card .card-content .slot-container {
  display: flex;
  flex-direction: column;
  gap: var(--card-gap);
  width: 100%;
  height: 100%;
}

/*
  Background layers
 */
.focus-ring {
  z-index: 2;
  display: none;
  --focus-ring-container-shape-start-start: var(--_container-shape-start-start);
  --focus-ring-container-shape-start-end: var(--_container-shape-start-end);
  --focus-ring-container-shape-end-start: var(--_container-shape-end-start);
  --focus-ring-container-shape-end-end: var(--_container-shape-end-end);
  --focus-ring-container-shape-variant: var(--_container-corner-shape-variant);
}

.ripple {
  display: none;
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
  corner-shape: var(--_container-corner-shape-variant);
  --ripple-state-opacity: var(--_container-state-opacity, 0);
  --ripple-pressed-color: var(--_container-state-color);
}

.background {
  z-index: 0;
  display: block;
  position: absolute;
  top: 0;
  inset-inline-start: 0;
  width: 100%;
  height: 100%;
  background-color: var(--_container-color);
  opacity: var(--_container-opacity, 1);
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
  corner-shape: var(--_container-corner-shape-variant);
  pointer-events: none;
}

.elevation {
  --elevation-level: var(--_container-elevation-level);
  transition-duration: 280ms;
  --elevation-container-shape-start-start: var(--_container-shape-start-start);
  --elevation-container-shape-start-end: var(--_container-shape-start-end);
  --elevation-container-shape-end-start: var(--_container-shape-end-start);
  --elevation-container-shape-end-end: var(--_container-shape-end-end);
  --elevation-container-shape-variant: var(--_container-corner-shape-variant);
}

.outline {
  z-index: 0;
  display: none;
  position: absolute;
  inset-inline-start: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border: var(--_outline-width) solid var(--_outline-color);
  opacity: var(--_outline-opacity, 1);
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
  corner-shape: var(--_container-corner-shape-variant);
}

/*
  Actionable and link cards. A disabled one with a disabled-reason stays
  focusable, so it keeps the focus ring; only enabled ones get the ripple.
 */
:host([actionable]) .focus-ring,
:host([href]) .focus-ring {
  display: block;
}
:host([actionable]) .card-content,
:host([href]) .card-content {
  pointer-events: none;
}

:host([actionable]:not([disabled])) .ripple,
:host([href]:not([disabled])) .ripple {
  display: block;
}

/*
  Variants. Hover and press states apply to enabled actionable and link cards
  only, so a static card never suggests it can be clicked.
 */
:host([variant=elevated]) {
  --_container-color: var(--elevated-card-container-color);
  --_label-text-color: var(--elevated-card-label-text-color);
  --_container-elevation-level: 1;
  --_container-state-color: var(--_label-text-color);
}

:host([variant=elevated][actionable]:not([disabled]):hover),
:host([variant=elevated][href]:not([disabled]):hover) {
  --_container-elevation-level: 2;
  --_container-state-opacity: 0.08;
}

:host([variant=elevated][actionable]:not([disabled]):active),
:host([variant=elevated][href]:not([disabled]):active) {
  --_container-elevation-level: 1;
  --_container-state-opacity: 0.12;
}

:host([variant=elevated][disabled]) {
  --_container-color: var(--color-on-surface);
  --_container-opacity: 0.1;
  --_label-text-color: var(--color-on-surface);
  --_label-text-opacity: 0.38;
}

:host([variant=filled]) {
  --_container-color: var(--filled-card-container-color);
  --_label-text-color: var(--filled-card-label-text-color);
  --_container-state-color: var(--_label-text-color);
}

:host([variant=filled][actionable]:not([disabled]):hover),
:host([variant=filled][href]:not([disabled]):hover) {
  --_container-elevation-level: 1;
  --_container-state-opacity: 0.08;
}

:host([variant=filled][actionable]:not([disabled]):active),
:host([variant=filled][href]:not([disabled]):active) {
  --_container-elevation-level: 0;
  --_container-state-opacity: 0.1;
}

:host([variant=filled][disabled]) {
  --_container-color: var(--color-on-surface);
  --_container-opacity: 0.1;
  --_label-text-color: var(--color-on-surface);
  --_label-text-opacity: 0.38;
}

:host([variant=outlined]) {
  --_outline-width: var(--outlined-card-outline-width, 0.0675rem);
  --_outline-color: var(--outlined-card-outline-color);
  --_label-text-color: var(--outlined-card-label-text-color);
  --_container-state-color: var(--_label-text-color);
}
:host([variant=outlined]) .outline {
  display: block;
}
:host([variant=outlined]) {
  /* Keep content, such as edge-to-edge media, from covering the outline. */
}
:host([variant=outlined]) .card-content {
  border: var(--_outline-width) solid transparent;
}

:host([variant=outlined][actionable]:not([disabled]):hover),
:host([variant=outlined][href]:not([disabled]):hover) {
  --_container-state-opacity: 0.08;
}

:host([variant=outlined][actionable]:not([disabled]):active),
:host([variant=outlined][href]:not([disabled]):active) {
  --_container-state-opacity: 0.12;
}

:host([variant=outlined][disabled]) {
  --_outline-color: var(--color-on-surface);
  --_label-text-color: var(--color-on-surface);
  --_label-text-opacity: 0.38;
  --_outline-opacity: 0.12;
}`;

var css_248z = i`:host {
  --filled-card-container-color: var(--color-surface-container-highest);
  --filled-card-label-text-color: var(--color-on-surface);
  --elevated-card-container-color: var(--color-surface-container-low);
  --elevated-card-label-text-color: var(--color-on-surface);
  --outlined-card-outline-color: var(--color-outline-variant);
  --outlined-card-label-text-color: var(--color-on-surface);
}`;

const DISABLED_REASON_ID = 'disabled-reason';
/**
 * @label Card
 * @tag wc-card
 * @rawTag card
 * @summary A surface that groups content and actions about one subject.
 *
 * @overview
 * <p>A card is <code>elevated</code> (the default), <code>filled</code> or <code>outlined</code>.
 * It adds no padding of its own: put text in <code>wc-card-content</code>, which can sit next to
 * edge-to-edge media.</p>
 * <p>Set <code>actionable</code> to make the whole card a single button that fires
 * <code>click</code>, or <code>href</code> (with <code>target</code>, <code>rel</code> and
 * <code>download</code>) to make it a link. The content of an actionable or link card is inert, so
 * don't put buttons or links inside one; use a plain card with its own actions instead.
 * <code>throttle-delay</code> throttles activation.</p>
 * <p><code>disabled</code> dims the card and makes its content inert; an actionable or link card
 * also stops responding to clicks and leaves the tab order. With <code>disabled-reason</code> it
 * stays focusable and screen readers read the reason with it.</p>
 *
 * @cssprop --card-container-shape - Corner radius of the card. Defaults to `--shape-corner-large`.
 * @cssprop --card-padding - Padding inside the card, around its children. Defaults to 0; `wc-card-content` adds its own padding.
 * @cssprop --card-gap - Gap between the card's children. Defaults to 0.
 *
 * @example
 * ```html
 * <wc-card variant="outlined">
 *   <wc-card-content>
 *     <h3 class="text-title-large">Title</h3>
 *     <p class="text-body-medium">Supporting text</p>
 *   </wc-card-content>
 * </wc-card>
 * ```
 */
let Card = class Card extends NativeHyperlinkMixin(i$1) {
    // ── Constructor ───────────────────────────────────────────────────────────
    constructor() {
        super();
        // ── Properties ────────────────────────────────────────────────────────────
        /**
         * Visual style of the card: `elevated` (a raised surface with a shadow), `filled` (a tonal surface)
         * or `outlined` (a bordered surface). Defaults to `elevated`.
         */
        this.variant = 'elevated';
        /**
         * Dims the card and makes its content inert. An actionable or link card also stops responding
         * to clicks and leaves the tab order, unless `disabled-reason` is set.
         */
        this.disabled = false;
        /**
         * Makes the whole card a single button that fires `click`. Its content becomes inert, so don't
         * put buttons or links inside an actionable card.
         */
        this.actionable = false;
        /**
         * Why an actionable or link card is disabled. The card stays focusable and screen readers read
         * the reason with it.
         */
        this.disabledReason = '';
        /** Whether the default slot holds meaningful content. */
        this.slotHasContent = false;
        this.__dispatchClickWithThrottle = event => {
            this.__dispatchClick(event);
        };
        this.__dispatchClick = (event) => {
            if (!isActivationClick(event) || !this.cardElement) {
                return;
            }
            this.focus();
            dispatchActivationClick(this.cardElement);
        };
        // Look the handler up on every click, so the throttled version set in
        // firstUpdated() is the one that runs.
        this.addEventListener('click', event => this.__handleClick(event));
    }
    // ── Lifecycle ─────────────────────────────────────────────────────────────
    firstUpdated() {
        if (typeof this.throttleDelay === 'number') {
            this.__dispatchClickWithThrottle = throttle(this.__dispatchClick, this.throttleDelay);
        }
        observerSlotChangesWithCallback(this.renderRoot.querySelector('slot'), hasContent => {
            this.slotHasContent = hasContent;
        });
    }
    // ── Private methods ───────────────────────────────────────────────────────
    __handleClick(event) {
        // A disabled card never activates, and consumer click listeners on it never run.
        if (this.disabled) {
            event.stopImmediatePropagation();
            event.preventDefault();
            return;
        }
        this.__dispatchClickWithThrottle(event);
    }
    /** True when a disabled interactive card should stay focusable to expose its reason. */
    __isSoftDisabled() {
        return this.disabled && !!this.disabledReason;
    }
    __getDisabledReasonID() {
        return this.__isSoftDisabled() ? DISABLED_REASON_ID : undefined;
    }
    // ── Render helpers ────────────────────────────────────────────────────────
    renderDisabledReason() {
        if (!this.__isSoftDisabled())
            return A;
        return b `<div
      id=${DISABLED_REASON_ID}
      role="tooltip"
      aria-label=${this.disabledReason}
      class="screen-reader-only"
    >
      ${this.disabledReason}
    </div>`;
    }
    renderCardElement(isLinkElement) {
        const interactive = this.actionable || isLinkElement;
        const cssClasses = {
            card: true,
            'card-element': true,
            [`variant-${this.variant}`]: true,
            actionable: interactive && !this.disabled,
            disabled: this.disabled,
            'has-content': this.slotHasContent,
        };
        const inertContent = interactive || this.disabled;
        if (!interactive) {
            return b `<div class=${e(cssClasses)} id="card">
        ${this.renderCardContent(inertContent)}
      </div>`;
        }
        const softDisabled = this.__isSoftDisabled();
        const removedFromTabOrder = this.disabled && !softDisabled;
        if (!isLinkElement) {
            return b `<button
        class=${e(cssClasses)}
        id="card"
        type="button"
        aria-describedby=${o(this.__getDisabledReasonID())}
        aria-disabled=${o(this.disabled ? 'true' : undefined)}
        ?disabled=${removedFromTabOrder}
      >
        ${this.renderCardContent(inertContent)} ${this.renderDisabledReason()}
      </button>`;
        }
        return b `<a
      class=${e(cssClasses)}
      id="card"
      href=${o(this.disabled ? undefined : this.href)}
      target=${o(this.disabled ? undefined : this.target)}
      rel=${o(this.disabled ? undefined : this.rel)}
      download=${o(this.disabled ? undefined : this.download)}
      role=${o(this.disabled ? 'link' : undefined)}
      tabindex=${removedFromTabOrder ? '-1' : '0'}
      aria-describedby=${o(this.__getDisabledReasonID())}
      aria-disabled=${o(this.disabled ? 'true' : undefined)}
    >
      ${this.renderCardContent(inertContent)} ${this.renderDisabledReason()}
    </a>`;
    }
    renderCardContent(inertContent) {
        return b `
      <div class="card-content">
        <div class="slot-container" ?inert=${inertContent}>
          <slot></slot>
        </div>
      </div>
    `;
    }
    // ── Render ────────────────────────────────────────────────────────────────
    render() {
        return b `
      <wc-focus-ring class="focus-ring" for="card"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple" for="card"></wc-ripple>

      ${this.renderCardElement(isLink(this))}
    `;
    }
};
// ── Static ────────────────────────────────────────────────────────────────
Card.styles = [css_248z$1, css_248z];
__decorate([
    n({ type: String, reflect: true })
], Card.prototype, "variant", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Card.prototype, "disabled", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Card.prototype, "actionable", void 0);
__decorate([
    n({ attribute: 'disabled-reason' })
], Card.prototype, "disabledReason", void 0);
__decorate([
    n({ type: Number, attribute: 'throttle-delay' })
], Card.prototype, "throttleDelay", void 0);
__decorate([
    r()
], Card.prototype, "slotHasContent", void 0);
__decorate([
    e$1('.card')
], Card.prototype, "cardElement", void 0);
Card = __decorate([
    IndividualComponent
], Card);

export { Card };
//# sourceMappingURL=card.js.map
