import { i, _ as __decorate, I as IndividualComponent, a as i$1 } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { A as AttachableController } from './attachable-controller-DofeyflD.js';

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
 * @summary A ring drawn around a control while it has keyboard focus, so people can see where focus is.
 *
 * @overview
 * <p>Attach it to a control with <code>for</code> (the control's id), by setting
 * <code>control</code>, or by calling <code>attach()</code>; otherwise it follows its parent. It
 * shows when the control gains focus and matches <code>:focus-visible</code>, and hides on blur
 * or a pointer press, so mouse and touch users do not see it. When several focus rings sit inside
 * one component, only the first to handle a focus event reacts.</p>
 * <p><code>inward</code> draws the ring inside the control's edge, for controls inside a
 * container. <code>visible</code> reflects whether the ring shows and fires
 * <code>visibility-changed</code> when it changes. The ring is hidden from assistive
 * technology.</p>
 *
 * @tags display
 *
 * @fires {Event} visibility-changed - Dispatched whenever `visible` changes.
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
    /** The id of the control the ring attaches to, as the `for` attribute. */
    get htmlFor() {
        return this.attachableController.htmlFor;
    }
    set htmlFor(htmlFor) {
        this.attachableController.htmlFor = htmlFor;
    }
    /** The control the ring attaches to; without `for` or this, it follows its parent. */
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
