import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '../IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  type CloseReason,
  OverlayController,
} from '@/__internal/controllers/overlay-controller.js';
import styles from './modal.scss';

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'fullscreen';

/**
 * @label Modal
 * @tag wc-modal
 * @rawTag modal
 * @summary A dialog for content in a layer above the page, with optional header, body and footer.
 * @overview
 * <p>The modal opens a native <code>&lt;dialog&gt;</code> with <code>showModal()</code>, so it renders in the
 * browser's top layer: above sticky headers, app bars, cards and any stacking context on the page,
 * whatever their z-index. Menus, selects and tooltips opened inside the modal render above it.</p>
 * <p>While it is open the rest of the page is inert and does not scroll; focus moves to the first
 * element with <code>autofocus</code> inside it, and returns where it was when the modal closes.
 * Escape and a click on the scrim close it (<code>no-light-dismiss</code> keeps it open on scrim clicks).</p>
 *
 * @cssprop --modal-container-color - Background color of the dialog container.
 * @cssprop --modal-scrim-color - Color of the scrim backdrop.
 * @cssprop --modal-shape - Corner radius of the dialog container.
 * @cssprop --modal-min-width - Minimum width of the dialog.
 * @cssprop --modal-max-width - Maximum width of the dialog.
 * @cssprop --modal-max-height - Maximum height of the dialog.
 *
 * @fires {CustomEvent} open - Fired when the modal opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Fired when the modal closes: Escape, a scrim click, the close button, or `hide()`.
 *
 * @example
 * ```html
 * <wc-button onclick="document.getElementById('confirm').show()">Delete project</wc-button>
 * <wc-modal id="confirm" heading="Delete project?">
 *   This deletes the project and its 12 files. You can't undo this.
 *   <wc-button slot="footer" variant="text" onclick="this.closest('wc-modal').hide()">Cancel</wc-button>
 *   <wc-button slot="footer" color="danger" autofocus>Delete</wc-button>
 * </wc-modal>
 * ```
 * @tags overlay, dialog, feedback
 */
@IndividualComponent
export class Modal extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

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

  /** Hides the close button in the header. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-close' })
  hideClose = false;

  /** Shows a loading overlay inside the modal. */
  @property({ type: Boolean, reflect: true }) loading = false;

  /** Keeps the modal open when the scrim is clicked. Escape still closes it. */
  @property({ type: Boolean, attribute: 'no-light-dismiss' }) noLightDismiss =
    false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('dialog') private _dialog?: HTMLDialogElement;

  @query('.dialog') private _panel?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the close button label. */
  private readonly i18n = new I18nController(this);

  private readonly overlay = new OverlayController(this, {
    surface: () => this._dialog,
    modal: true,
    exitAnimationTargets: () => [this._panel],
    requestClose: reason => this._close(reason),
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override updated(changed: PropertyValues<this>) {
    if (!changed.has('open')) return;
    this.overlay.sync(this.open);
    if (this.open) {
      this.dispatchEvent(
        new CustomEvent('open', { bubbles: true, composed: true }),
      );
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Opens the modal. */
  show() {
    this.open = true;
  }

  /** Closes the modal. */
  hide() {
    this._close('api');
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private _close(reason: CloseReason) {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('close', {
        detail: { reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** The native Escape `cancel`: the overlay controller handles Escape, so keep `open` in charge. */
  private _handleCancel(event: Event) {
    event.preventDefault();
    this._close('escape');
  }

  /**
   * The browser closed the dialog by itself: keep `open` in step. A `close` from content inside
   * the dialog (a popover, menu or select closing; they bubble and are composed) is not ours.
   */
  private _handleNativeClose(event: Event) {
    if (event.target !== this._dialog) return;
    if (this.overlay.takeOwnClose()) return;
    if (this.open) this._close('escape');
  }

  /** A click that lands outside the dialog container, not on its content, is a scrim click. */
  private _handleDialogClick(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.classList?.contains('dialog-wrapper')) return;
    if (!this.noLightDismiss) this._close('light-dismiss');
  }

  private _handleCloseClick() {
    this._close('action');
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private _renderHeader() {
    const hasHeader = this.heading || this.subheading || !this.hideClose;
    if (!hasHeader) return nothing;

    return html`
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
              shape="round"
              aria-label=${this.i18n.t('closeDialog')}
              @click=${this._handleCloseClick}
            >
              <wc-icon name="close"></wc-icon>
            </wc-icon-button>`
          : nothing}
      </div>
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    // The scrim click has its keyboard equivalent in Escape, which the overlay controller
    // handles; lit-a11y does not count that as a key listener.
    /* eslint-disable lit-a11y/click-events-have-key-events */
    return html`
      <dialog
        class="native-dialog"
        part="dialog"
        aria-labelledby=${this.heading ? 'modal-heading' : nothing}
        aria-busy=${this.loading ? 'true' : nothing}
        @cancel=${this._handleCancel}
        @close=${this._handleNativeClose}
        @click=${this._handleDialogClick}
      >
        <div
          class=${classMap({ scrim: true, visible: this.open })}
          aria-hidden="true"
        ></div>

        <div class="dialog-wrapper">
          <div
            class=${classMap({
              dialog: true,
              open: this.open,
              [`size-${this.size}`]: true,
              'show-loader': this.loading,
            })}
          >
            ${this._renderHeader()}

            <div class="dialog-content">
              <slot></slot>
            </div>

            <div class="dialog-footer">
              <slot name="footer"></slot>
            </div>

            ${this.loading
              ? html`<div class="dialog-loader" aria-hidden="true">
                  <div class="dialog-loader-scrim"></div>
                  <wc-circular-progress indeterminate></wc-circular-progress>
                </div>`
              : nothing}
          </div>
        </div>
      </dialog>
    `;
    /* eslint-enable lit-a11y/click-events-have-key-events */
  }
}
