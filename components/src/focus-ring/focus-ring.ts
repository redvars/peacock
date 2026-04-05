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

  private __boundFocusin = this.__focusin.bind(this);

  private __boundFocusout = this.__focusout.bind(this);

  private __boundPointerdown = this.__pointerdown.bind(this);

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

  updated(changed: Map<string, unknown>) {
    if (changed.has('for')) {
      const prevId = changed.get('for') as string;
      if (prevId) {
        const root = this.parentElement?.getRootNode() as ShadowRoot | Document;
        const prevEl = root?.getElementById(prevId) ?? document.getElementById(prevId);
        if (prevEl) {
          prevEl.removeEventListener('focusin', this.__boundFocusin);
          prevEl.removeEventListener('focusout', this.__boundFocusout);
          prevEl.removeEventListener('pointerdown', this.__boundPointerdown);
        }
      }
      this.attach();
    }
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
   * Resolves the element that should receive focus-ring event listeners by id.
   * Prefers lookup from the current control's root node, then falls back to a
   * document-level lookup.
   *
   * @returns The resolved focus target, if one can be found.
   */
  __getFocusTarget(): HTMLElement | undefined {
    if (this.for) {
      const root = this.parentElement?.getRootNode() as ShadowRoot | Document;
      if (root) {
        const focusTarget = root.getElementById(this.for);
        if (focusTarget) {
          return focusTarget;
        }
      }
      const focusTarget = document.getElementById(this.for);
      if (focusTarget) {
        return focusTarget;
      }
    }

    return undefined;
  }

  attach() {
    const focusTarget = this.__getFocusTarget();
    if (focusTarget) {
      focusTarget.addEventListener('focusin', this.__boundFocusin);
      focusTarget.addEventListener('focusout', this.__boundFocusout);
      focusTarget.addEventListener('pointerdown', this.__boundPointerdown);
    }
  }

  detach() {
    const focusTarget = this.__getFocusTarget();
    if (focusTarget) {
      focusTarget.removeEventListener('focusin', this.__boundFocusin);
      focusTarget.removeEventListener('focusout', this.__boundFocusout);
      focusTarget.removeEventListener('pointerdown', this.__boundPointerdown);
    }
  }
}
