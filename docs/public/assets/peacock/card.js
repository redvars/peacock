import { i, a as i$1, A, c as __classPrivateFieldGet, b, _ as __decorate, I as IndividualComponent } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e as e$1 } from './query-CHb9Ft_d.js';
import { e } from './class-map-DG7CA1et.js';
import { i as isActivationClick, d as dispatchActivationClick } from './dispatch-event-utils-CuEqjlPT.js';
import { i as isLink } from './is-link-Dk2OV3PM.js';
import { o as observerSlotChangesWithCallback } from './observe-slot-change-DPxaZrZF.js';
import { t as throttle } from './throttle-C7ZAPqtu.js';
import { N as NativeHyperlinkMixin } from './NativeHyperlinkMixin-D9J4aBTy.js';
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
  border: 1px solid transparent; /* Fixes overflow issues with border */
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
  left: 0;
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
  left: 0;
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

:host([actionable]:not([disabled])) .focus-ring,
:host([actionable]:not([disabled])) .ripple,
:host([href]) .focus-ring,
:host([href]) .ripple {
  display: block;
}
:host([actionable]:not([disabled])) .card-content,
:host([href]) .card-content {
  pointer-events: none;
}

:host([variant=elevated]) {
  --_container-color: var(--elevated-card-container-color);
  --_label-text-color: var(--elevated-card-label-text-color);
  --_container-elevation-level: 1;
  --_container-state-color: var(--_label-text-color);
}
:host([variant=elevated]):hover:not([disabled]) {
  --_container-elevation-level: 2;
  --_container-state-opacity: 0.08;
}
:host([variant=elevated]):active:not([disabled]) {
  --_container-elevation-level: 1;
  --_container-state-opacity: 0.12;
}
:host([variant=elevated])[disabled] {
  --_container-color: var(--color-on-surface);
  --_container-opacity: 0.1;
  --_label-text-color: var(--color-on-surface);
  --_label-text-opacity: 0.38;
}
:host([variant=elevated])[disabled] .ripple {
  display: none;
}

:host([variant=filled]) {
  --_container-color: var(--filled-card-container-color);
  --_label-text-color: var(--filled-card-label-text-color);
  --_container-state-color: var(--_label-text-color);
}
:host([variant=filled]):hover:not([disabled]) {
  --_container-elevation-level: 1;
  --_container-state-opacity: 0.08;
}
:host([variant=filled]):active:not([disabled]) {
  --_container-elevation-level: 0;
  --_container-state-opacity: 0.1;
}
:host([variant=filled])[disabled] {
  --_container-color: var(--color-on-surface);
  --_container-opacity: 0.1;
  --_label-text-color: var(--color-on-surface);
  --_label-text-opacity: 0.38;
}
:host([variant=filled])[disabled] .ripple {
  display: none;
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
:host([variant=outlined]):hover:not([disabled]) {
  --_container-state-opacity: 0.08;
}
:host([variant=outlined]):active:not([disabled]) {
  --_container-state-opacity: 0.12;
}
:host([variant=outlined])[disabled] {
  --_outline-color: var(--color-on-surface);
  --_label-text-color: var(--color-on-surface);
  --_label-text-opacity: 0.38;
  --_outline-opacity: 0.12;
}
:host([variant=outlined])[disabled] .ripple {
  display: none;
}`;

var css_248z = i`:host {
  --filled-card-container-color: var(--color-surface-container-highest);
  --filled-card-label-text-color: var(--color-on-surface);
  --elevated-card-container-color: var(--color-surface-container-low);
  --elevated-card-label-text-color: var(--color-on-surface);
  --outlined-card-outline-color: var(--color-outline-variant);
  --outlined-card-label-text-color: var(--color-on-surface);
}`;

var _Card_id, _Card_tabindex;
/**
 * @label Card
 * @tag wc-card
 * @rawTag card
 * @summary A card surface for grouping related content.
 * @cssprop --card-padding - Inner padding for the card container. Defaults to 1rem.
 * @cssprop --card-shape - Corner radius for the card container. Defaults to a large radius.
 * @cssprop --card-gap - Gap between slotted children.
 *
 * @example
 * ```html
 * <wc-card variant="outlined" style="padding-block: 1rem;">
 *   <wc-card-content>
 *     <h3 class="text-headline">Title</h3>
 *     <p class="text-body">Supportive text</p>
 *   </wc-card-content>
 * </wc-card>
 * ```
 */
let Card = class Card extends NativeHyperlinkMixin(i$1) {
    constructor() {
        super();
        _Card_id.set(this, crypto.randomUUID());
        this.variant = 'elevated';
        this.disabled = false;
        this.actionable = false;
        /**
         * If button is disabled, the reason why it is disabled.
         */
        this.disabledReason = '';
        /**
         * States
         */
        this.slotHasContent = false;
        _Card_tabindex.set(this, 0);
        this.__dispatchClickWithThrottle = event => {
            this.__dispatchClick(event);
        };
        this.__dispatchClick = (event) => {
            // If the button is soft-disabled or a disabled link, we need to explicitly
            // prevent the click from propagating to other event listeners as well as
            // prevent the default action.
            if (this.disabled && this.href) {
                event.stopImmediatePropagation();
                event.preventDefault();
                return;
            }
            if (!isActivationClick(event) || !this.cardElement) {
                return;
            }
            this.focus();
            dispatchActivationClick(this.cardElement);
        };
        this.addEventListener('click', this.__dispatchClickWithThrottle);
    }
    firstUpdated() {
        if (typeof this.throttleDelay === 'number') {
            this.__dispatchClickWithThrottle = throttle(this.__dispatchClick, this.throttleDelay);
        }
        observerSlotChangesWithCallback(this.renderRoot.querySelector('slot'), hasContent => {
            this.slotHasContent = hasContent;
            this.requestUpdate();
        });
    }
    __getDisabledReasonID() {
        return this.disabled && this.disabledReason
            ? `disabled-reason-${__classPrivateFieldGet(this, _Card_id, "f")}`
            : A;
    }
    __renderDisabledReason() {
        const disabledReasonID = this.__getDisabledReasonID();
        if (disabledReasonID)
            return b `<div
        id="disabled-reason-${__classPrivateFieldGet(this, _Card_id, "f")}"
        role="tooltip"
        aria-label=${this.disabledReason}
        class="screen-reader-only"
      >
        ${this.disabledReason}
      </div>`;
        return A;
    }
    render() {
        const isLinkElement = isLink(this);
        const disableSlotTabbing = this.actionable || isLinkElement;
        return b `
      <wc-focus-ring class="focus-ring" for="card"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple" for="card"></wc-ripple>

      ${this.renderCardElement(isLinkElement, disableSlotTabbing)}
    `;
    }
    renderCardElement(isLinkElement, disableSlotTabbing) {
        const cssClasses = {
            card: true,
            'card-element': true,
            [`variant-${this.variant}`]: true,
            actionable: (this.actionable && !this.disabled) || isLinkElement,
            disabled: this.disabled,
            'has-content': this.slotHasContent,
        };
        if (!this.actionable && !isLinkElement) {
            return b `<div class=${e(cssClasses)} id="card">
        ${this.renderCardContent(disableSlotTabbing)}
      </div>`;
        }
        if (!isLinkElement) {
            return b `<button
        class=${e(cssClasses)}
        id="card"
        tabindex=${__classPrivateFieldGet(this, _Card_tabindex, "f")}
        ?aria-describedby=${this.__getDisabledReasonID()}
        aria-disabled=${`${this.disabled}`}
        ?disabled=${this.disabled}
      >
        ${this.renderCardContent(disableSlotTabbing)}
      </button>`;
        }
        return b `<a
      class=${e(cssClasses)}
      id="card"
      tabindex=${__classPrivateFieldGet(this, _Card_tabindex, "f")}
      href=${this.href}
      target=${this.target}
      role="button"
      ?aria-describedby=${this.__getDisabledReasonID()}
      aria-disabled=${`${this.disabled}`}
    >
      ${this.renderCardContent(disableSlotTabbing)}
    </a>`;
    }
    renderCardContent(disableSlotTabbing) {
        return b `
      <div class="card-content">
        <div class="slot-container" ?inert=${disableSlotTabbing}>
          <slot></slot>
        </div>
      </div>
    `;
    }
};
_Card_id = new WeakMap();
_Card_tabindex = new WeakMap();
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
    n()
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
