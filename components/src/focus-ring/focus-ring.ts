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

  @property({ type: Object}) forElement?: HTMLElement;


  render() {
    return nothing;
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

  /**
   * Resolves the element that should receive focus-ring event listeners.
   * Prefers a `for` lookup from the current control's root node, then falls
   * back to the control itself or a document-level `for` lookup.
   *
   * @returns The resolved focus target, if one can be found.
   */
  __getFocusTarget(): HTMLElement | undefined {

    if (this.forElement) {
      // Without a `for` target, the control itself owns the focus ring.
      return this.forElement;
    }

    if (this.for) {
      // Resolve the referenced target within the control's current root.
      const root = this.parentElement?.getRootNode() as ShadowRoot | Document;
      if (root) {
        const focusTarget = root.getElementById(this.for);
        if (focusTarget) {
          return focusTarget
        }
      }
      const focusTarget = document.getElementById(this.for);
      if (focusTarget) {
        return focusTarget
      }
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
  }
}
