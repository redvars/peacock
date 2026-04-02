import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '../IndividualComponent.js';
import styles from './side-sheet.scss';

/**
 * @label Side Sheet
 * @tag wc-side-sheet
 * @rawTag side-sheet
 * @summary Side sheets slide in from the edge of the screen to reveal supplemental content. Supports standard and modal variants per Material Design 3.
 *
 * @cssprop --side-sheet-container-color - Background color of the sheet container.
 * @cssprop --side-sheet-scrim-color - Color of the modal scrim overlay.
 * @cssprop --side-sheet-shape - Corner radius of the leading edge.
 * @cssprop --side-sheet-width - Width of the side sheet.
 *
 * @example
 * ```html
 * Side Sheet

 * ```
 * @tags navigation, overlay
 */
@IndividualComponent
export class SideSheet extends LitElement {
  static styles = [styles];

  /** Whether the sheet is visible. */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * Sheet variant.
   * - `"standard"`: Coexists with page content; no scrim.
   * - `"modal"`: Overlays page content with a scrim backdrop.
   */
  @property({ type: String, reflect: true }) variant: 'standard' | 'modal' =
    'modal';

  /**
   * Side from which the sheet slides in.
   * - `"left"`: Sheet opens from the left edge.
   * - `"right"`: Sheet opens from the right edge.
   */
  @property({ type: String, reflect: true }) position: 'left' | 'right' =
    'right';

  show() {
    this.open = true;
  }

  hide() {
    this._close('programmatic');
  }

  private _close(reason: string) {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('side-sheet-close', {
        detail: { reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleScrimClick() {
    if (this.variant === 'modal') {
      this._close('scrim');
    }
  }

  render() {
    return html`
      ${this.variant === 'modal'
        ? html`<div
            class=${classMap({ scrim: true, visible: this.open })}
            @click=${this._handleScrimClick}
          ></div>`
        : nothing}

      <div
        class=${classMap({
          sheet: true,
          open: this.open,
          [`variant-${this.variant}`]: true,
          [`position-${this.position}`]: true,
        })}
        role="dialog"
        aria-modal=${this.variant === 'modal' ? 'true' : 'false'}
        aria-hidden=${!this.open ? 'true' : 'false'}
      >
        <div class="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
