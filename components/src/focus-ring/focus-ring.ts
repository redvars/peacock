import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './focus-ring.scss';

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
 */
export class FocusRing extends LitElement {
  static styles = [styles];

  @property({ type: Boolean, reflect: true }) visible: boolean = false;

  @property({ type: String }) for = '';


  render() {
    return nothing;
  }

  _control?: HTMLElement;

  _focusTarget?: HTMLElement;

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

  set forElement(value: HTMLElement | null) {
    if (value) {
      this._focusTarget = value;
      this.attach();
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
    const focusTarget = this.__getFocusTarget();
    this.visible = focusTarget?.matches(':focus-visible') ?? false;
  }

  __focusout() {
    this.visible = false;
  }

  __pointerdown() {
    this.visible = false;
  }

  __getFocusTarget(): HTMLElement | undefined {

    if (this._focusTarget) {
      return this._focusTarget;
    }

    const focusTarget = document.getElementById(this.for);
     if (focusTarget) {
      return focusTarget
     }
     return undefined;
  }

  attach() {
    const focusTarget = this.__getFocusTarget();
    if (focusTarget) {
      focusTarget.addEventListener('focusin', this.__focusin.bind(this));
      focusTarget.addEventListener('focusout', this.__focusout.bind(this));
      focusTarget.addEventListener('pointerdown', this.__pointerdown.bind(this));
    }
  }

  detach() {
    const focusTarget = this.__getFocusTarget();
    if (focusTarget) {
      focusTarget.removeEventListener('focusin', this.__focusin.bind(this));
      focusTarget.removeEventListener('focusout', this.__focusout.bind(this));
      focusTarget.removeEventListener('pointerdown', this.__pointerdown.bind(this));
    }
    this._control = undefined;
  }
}
