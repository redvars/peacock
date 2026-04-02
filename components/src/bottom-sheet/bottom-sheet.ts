import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '../IndividualComponent.js';
import styles from './bottom-sheet.scss';

/**
 * @label Bottom Sheet
 * @tag wc-bottom-sheet
 * @rawTag bottom-sheet
 * @summary Bottom sheets slide up from the bottom of the screen to reveal additional content. Supports standard and modal variants per Material Design 3.
 *
 * @cssprop --bottom-sheet-container-color - Background color of the sheet container.
 * @cssprop --bottom-sheet-scrim-color - Color of the modal scrim overlay.
 * @cssprop --bottom-sheet-shape - Corner radius of the top edge.
 * @cssprop --bottom-sheet-max-height - Maximum height of the sheet.
 *
 * @example
 * ```html
 * Bottom Sheet
 * ```
 * @tags navigation, overlay
 */
@IndividualComponent
export class BottomSheet extends LitElement {
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

  /** Whether to show the drag handle. */
  @property({ type: Boolean, attribute: 'show-handle' }) showHandle = true;

  @state() private _dragging = false;
  @state() private _dragStartY = 0;
  @state() private _dragOffsetY = 0;

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
      new CustomEvent('bottom-sheet-close', {
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

  private _handleDragStart(e: PointerEvent) {
    this._dragging = true;
    this._dragStartY = e.clientY;
    this._dragOffsetY = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  private _handleDragMove(e: PointerEvent) {
    if (!this._dragging) return;
    const delta = e.clientY - this._dragStartY;
    this._dragOffsetY = Math.max(0, delta);
  }

  private _handleDragEnd() {
    if (!this._dragging) return;
    this._dragging = false;
    if (this._dragOffsetY > 80) {
      this._close('drag');
    }
    this._dragOffsetY = 0;
  }

  render() {
    const translateY = this._dragging ? `${this._dragOffsetY}px` : undefined;

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
          dragging: this._dragging,
          [`variant-${this.variant}`]: true,
        })}
        style=${translateY ? `transform: translateY(${translateY})` : ''}
        role="dialog"
        aria-modal=${this.variant === 'modal' ? 'true' : 'false'}
        aria-hidden=${!this.open ? 'true' : 'false'}
      >
        ${this.showHandle
          ? html`<div
              class="handle-area"
              @pointerdown=${this._handleDragStart}
              @pointermove=${this._handleDragMove}
              @pointerup=${this._handleDragEnd}
              @pointercancel=${this._handleDragEnd}
            >
              <div class="handle"></div>
            </div>`
          : nothing}

        <div class="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
