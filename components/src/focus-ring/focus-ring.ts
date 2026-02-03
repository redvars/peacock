import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './focus-ring.scss';

/**
 * @label Elevation
 * @tag p-elevation
 * @rawTag elevation
 *
 * @summary Adds elevation to an element.
 * @overview
 *  - Elevation adds a shadow effect to an element to give it depth.
 *  - It can be used to create a sense of hierarchy or to draw attention to a particular element.
 *
 * @cssprop --elevation-level - Controls the elevation level of the shadow.
 * @cssprop --elevation-color - Controls the color of the shadow.
 *
 * @example
 * ```html
 *   <div style="position: relative; padding: var(--spacing-200); border-radius: var(--shape-corner-small);">
 *     <p-elevation style='--elevation-level: 2'></p-elevation>
 *     Level 2
 *   </div>
 * ```
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
