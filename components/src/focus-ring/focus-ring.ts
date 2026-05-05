import { isServer, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './focus-ring.scss';
import IndividualComponent from '@/IndividualComponent.js';
import {
  Attachable,
  AttachableController,
} from '@/__internal/controllers/attachable-controller.js';

/**
 * Events that the focus ring listens to.
 */
const EVENTS = ['focusin', 'focusout', 'pointerdown'];
const HANDLED_BY_FOCUS_RING = Symbol('handledByFocusRing');

interface FocusRingEvent extends Event {
  [HANDLED_BY_FOCUS_RING]: true;
}

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
@IndividualComponent
export class FocusRing extends LitElement implements Attachable {
  static styles = [styles];

  /** When true, the focus ring is visible. Toggled automatically based on `:focus-visible` state. */
  @property({ type: Boolean, reflect: true })
  visible = false;

  /** When true, the ring animates inward instead of outward (for use inside containers). */
  @property({ type: Boolean, reflect: true }) inward = false;

  get htmlFor() {
    return this.attachableController.htmlFor;
  }

  set htmlFor(htmlFor: string | null) {
    this.attachableController.htmlFor = htmlFor;
  }

  get control() {
    return this.attachableController.control;
  }

  set control(control: HTMLElement | null) {
    this.attachableController.control = control;
  }

  private readonly attachableController = new AttachableController(
    this,
    this.onControlChange.bind(this),
  );

  attach(control: HTMLElement) {
    this.attachableController.attach(control);
  }

  detach() {
    this.attachableController.detach();
  }

  override connectedCallback() {
    super.connectedCallback();
    // Needed for VoiceOver, which will create a "group" if the element is a
    // sibling to other content.
    this.setAttribute('aria-hidden', 'true');
  }

  /** @private */
  handleEvent(event: FocusRingEvent) {
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

  private onControlChange(prev: HTMLElement | null, next: HTMLElement | null) {
    if (isServer) return;

    for (const event of EVENTS) {
      prev?.removeEventListener(event, this);
      next?.addEventListener(event, this);
    }
  }

  override update(changed: PropertyValues<FocusRing>) {
    if (changed.has('visible')) {
      // This logic can be removed once the `:has` selector has been introduced
      // to Firefox. This is necessary to allow correct submenu styles.
      this.dispatchEvent(new Event('visibility-changed'));
    }
    super.update(changed);
  }
}
