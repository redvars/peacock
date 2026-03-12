import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './focus-ring.scss';

/**
 * @label Focus Ring
 *
 * @tag focus-ring
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

  @property({ type: String}) element = '';


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

  __focusin() {
    // @ts-ignore
    this.visible = this._control[this.element].matches(':focus-visible') ?? false;
  }

  __focusout() {
    this.visible = false;
  }

  __pointerdown() {
    this.visible = false;
  }

  attach() {
    // @ts-ignore
    if (this._control && this._control[this.element]) {
      // @ts-ignore
      this._control[this.element].addEventListener('focusin', this.__focusin.bind(this));
      // @ts-ignore
      this._control[this.element].addEventListener('focusout', this.__focusin.bind(this));
      // @ts-ignore
      this._control[this.element].addEventListener('pointerdown', this.__focusin.bind(this));
    }
  }

  detach() {
    // @ts-ignore
    if (this._control && this._control[this.element]) {
      // @ts-ignore
      this._control[this.element].removeEventListener('focusin', this.__focusin);
      // @ts-ignore
      this._control[this.element].removeEventListener('focusout', this.__focusout);
      // @ts-ignore
      this._control[this.element].removeEventListener('pointerdown', this.__pointerdown);
    }
    this._control = undefined;
  }
}
