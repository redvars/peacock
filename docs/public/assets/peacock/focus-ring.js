import { i, _ as __decorate, I as IndividualComponent, a as i$1 } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { A as AttachableController } from './attachable-controller-CAKVrfcG.js';

var css_248z = i`:host {
  display: none;
  pointer-events: none;
  position: absolute;
  border-start-start-radius: var(--focus-ring-container-shape-start-start);
  border-start-end-radius: var(--focus-ring-container-shape-start-end);
  border-end-start-radius: var(--focus-ring-container-shape-end-start);
  border-end-end-radius: var(--focus-ring-container-shape-end-end);
  corner-shape: var(--focus-ring-container-shape-variant);
  --focus-ring-color: var(--color-primary);
  inset: calc(-1 * var(--focus-ring-inset, 2px));
  animation-delay: 0s, calc(var(--focus-ring-duration, 600ms) * 0.25);
  animation-duration: calc(var(--focus-ring-duration, 600ms) * 0.25), calc(var(--focus-ring-duration, 600ms) * 0.75);
  animation-timing-function: var(--easing-standard);
  animation-name: outward-grow, outward-shrink;
}

:host([visible]) {
  display: flex;
  outline: 3px solid var(--focus-ring-color);
}`;

/**
 * Events that the focus ring listens to.
 */
const EVENTS = ['focusin', 'focusout', 'pointerdown'];
const HANDLED_BY_FOCUS_RING = Symbol('handledByFocusRing');
/**
 * @label Focus Ring
 *
 * @tag wc-focus-ring
 * @rawTag focus-ring
 *
 * @summary Adds a focus ring to an element.
 *
 *
 * @tags display
 *
 * @fires visibility-changed {Event} Fired whenever `visible` changes.
 */
let FocusRing = class FocusRing extends i$1 {
    constructor() {
        super(...arguments);
        /** When true, the focus ring is visible. Toggled automatically based on `:focus-visible` state. */
        this.visible = false;
        /** When true, the ring animates inward instead of outward (for use inside containers). */
        this.inward = false;
        this.attachableController = new AttachableController(this, this.onControlChange.bind(this));
    }
    get htmlFor() {
        return this.attachableController.htmlFor;
    }
    set htmlFor(htmlFor) {
        this.attachableController.htmlFor = htmlFor;
    }
    get control() {
        return this.attachableController.control;
    }
    set control(control) {
        this.attachableController.control = control;
    }
    attach(control) {
        this.attachableController.attach(control);
    }
    detach() {
        this.attachableController.detach();
    }
    connectedCallback() {
        super.connectedCallback();
        // Needed for VoiceOver, which will create a "group" if the element is a
        // sibling to other content.
        this.setAttribute('aria-hidden', 'true');
    }
    /** @private */
    handleEvent(event) {
        if (event[HANDLED_BY_FOCUS_RING]) {
            // This ensures the focus ring does not activate when multiple focus rings
            // are used within a single component.
            return;
        }
        switch (event.type) {
            case 'focusin':
                this.visible = this.control?.matches(':focus-visible') ?? false;
                break;
            case 'focusout':
            case 'pointerdown':
                this.visible = false;
                break;
            default:
                return;
        }
        // eslint-disable-next-line no-param-reassign
        event[HANDLED_BY_FOCUS_RING] = true;
    }
    onControlChange(prev, next) {
        for (const event of EVENTS) {
            prev?.removeEventListener(event, this);
            next?.addEventListener(event, this);
        }
    }
    update(changed) {
        if (changed.has('visible')) {
            // This logic can be removed once the `:has` selector has been introduced
            // to Firefox. This is necessary to allow correct submenu styles.
            this.dispatchEvent(new Event('visibility-changed'));
        }
        super.update(changed);
    }
};
FocusRing.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], FocusRing.prototype, "visible", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], FocusRing.prototype, "inward", void 0);
FocusRing = __decorate([
    IndividualComponent
], FocusRing);

export { FocusRing };
//# sourceMappingURL=focus-ring.js.map
