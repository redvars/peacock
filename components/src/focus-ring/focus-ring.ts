import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './focus-ring.scss';

/**
 * @label Focus Ring
 *
 * @tag p-focus-ring
 * @rawTag focus-ring
 *
 * @summary Adds a focus ring to an element.
 *
 *
 * @tags display
 */
export class FocusRing extends LitElement {
  static styles = [styles];

  @property({ type: Boolean, reflect: true }) visible: boolean = false;

  render() {
    return nothing;
  }

  _control?: HTMLElement;

  get control() {
    return this._control || null;
  }

  set control(control: HTMLElement | null) {
    if (control) {
      this._control = control;
    } else {
      this.detach();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.attach();
  }

  disconnectedCallback() {
    this.detach();
    super.disconnectedCallback();
  }

  attach() {
    // @ts-ignore - buttonElement is not defined on the base class
    this._control?.buttonElement?.addEventListener('focusin', () => {
      this.visible =
        // @ts-ignore - buttonElement is not defined on the base class
        this._control?.buttonElement?.matches(':focus-visible') ?? false;
    });
    // @ts-ignore - buttonElement is not defined on the base class
    this._control?.buttonElement?.addEventListener('focusout', () => {
      this.visible = false;
    });
    // @ts-ignore - buttonElement is not defined on the base class
    this._control?.buttonElement?.addEventListener('pointerdown', () => {
      this.visible = false;
    });
  }

  detach() {
    this._control?.removeEventListener('focusin', () => {});
    this._control?.removeEventListener('focusout', () => {});
    this._control?.removeEventListener('pointerdown', () => {});
    this._control = undefined;
  }
}
