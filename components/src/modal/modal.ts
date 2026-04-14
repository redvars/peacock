import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '../IndividualComponent.js';
import styles from './modal.scss';

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'fullscreen';

/**
 * @label Modal
 * @tag wc-modal
 * @rawTag modal-wc
 * @summary A Material Design 3 dialog/modal for displaying content in a layer above the page, with optional header, body, and footer slots.
 *
 * @cssprop --modal-container-color - Background color of the dialog container.
 * @cssprop --modal-scrim-color - Color of the scrim backdrop.
 * @cssprop --modal-shape - Corner radius of the dialog container.
 * @cssprop --modal-min-width - Minimum width of the dialog.
 * @cssprop --modal-max-width - Maximum width of the dialog.
 * @cssprop --modal-max-height - Maximum height of the dialog.
 *
 * @example
 * ```html
 * <wc-modal open heading="Confirm Action">
 *   <p>Are you sure you want to continue?</p>
 *   <div slot="footer">
 *     <wc-button variant="text">Cancel</wc-button>
 *     <wc-button>Confirm</wc-button>
 *   </div>
 * </wc-modal>
 * ```
 * @tags overlay, dialog, feedback
 */
@IndividualComponent
export class Modal extends LitElement {
  static styles = [styles];

  /** Whether the modal is open. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** Heading text shown in the modal header. */
  @property({ type: String, reflect: true }) heading = '';

  /** Optional subheading / label text shown above the heading. */
  @property({ type: String, reflect: true }) subheading = '';

  /**
   * Size of the modal dialog.
   * - `"xs"`: Extra-small.
   * - `"sm"`: Small.
   * - `"md"`: Medium (default).
   * - `"lg"`: Large.
   * - `"fullscreen"`: Full-screen dialog.
   */
  @property({ type: String, reflect: true }) size: ModalSize = 'md';

  /** When true, hides the close button in the header. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-close' })
  hideClose = false;

  /** When true, renders a loading overlay inside the modal. */
  @property({ type: Boolean, reflect: true, attribute: 'show-loader' })
  showLoader = false;

  /** When true, clicking the scrim will not close the modal. */
  @property({ type: Boolean, attribute: 'no-scrim-close' }) noScrimClose = false;

  @state() private _visible = false;

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
      new CustomEvent('modal-close', {
        detail: { reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleScrimClick() {
    if (!this.noScrimClose) {
      this._close('scrim');
    }
  }

  private _handleCloseClick() {
    this._close('close-button');
  }

  private readonly _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this._close('escape');
    }
  };

  protected updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open')) {
      if (this.open) {
        this._visible = true;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', this._handleKeydown);
      } else {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this._handleKeydown);
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._handleKeydown);
  }

  private _handleAnimationEnd(e: AnimationEvent) {
    if (e.animationName === 'modal-exit') {
      this._visible = false;
    }
  }

  render() {
    if (!this.open && !this._visible) return nothing;

    const hasHeader = this.heading || this.subheading || !this.hideClose;

    return html`
      <div
        class=${classMap({ scrim: true, visible: this.open })}
        @click=${this._handleScrimClick}
        aria-hidden="true"
      ></div>

      <div class="dialog-wrapper" role="presentation">
        <div
          class=${classMap({
            dialog: true,
            open: this.open,
            [`size-${this.size}`]: true,
            'show-loader': this.showLoader,
          })}
          role="dialog"
          aria-modal="true"
          aria-labelledby=${this.heading ? 'modal-heading' : nothing}
          @animationend=${this._handleAnimationEnd}
        >
          ${hasHeader
            ? html`
                <div class="dialog-header">
                  <div class="dialog-heading-section">
                    ${this.subheading
                      ? html`<p class="dialog-subheading">${this.subheading}</p>`
                      : nothing}
                    ${this.heading
                      ? html`<h2 id="modal-heading" class="dialog-heading">
                          ${this.heading}
                        </h2>`
                      : nothing}
                  </div>
                  ${!this.hideClose
                    ? html`<wc-icon-button
                        class="dialog-close"
                        variant="text"
                        aria-label="Close dialog"
                        @click=${this._handleCloseClick}
                      >
                        <wc-icon name="close"></wc-icon>
                      </wc-icon-button>`
                    : nothing}
                </div>
              `
            : nothing}

          <div class="dialog-content">
            <slot></slot>
          </div>

          <div class="dialog-footer">
            <slot name="footer"></slot>
          </div>

          ${this.showLoader
            ? html`<div class="dialog-loader" aria-hidden="true">
                <div class="dialog-loader-scrim"></div>
                <wc-spinner></wc-spinner>
              </div>`
            : nothing}
        </div>
      </div>
    `;
  }
}
