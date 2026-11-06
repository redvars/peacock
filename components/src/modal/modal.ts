import { LitElement, html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '../IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import styles from './modal.scss';

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'fullscreen';

/**
 * @label Modal
 * @tag wc-modal
 * @rawTag modal
 * @summary A dialog/modal for displaying content in a layer above the page, with optional header, body, and footer slots.
 * @overview
 * <p>The modal opens a native <code>&lt;dialog&gt;</code> with <code>showModal()</code>, so it renders in the
 * browser's top layer: above sticky headers, app bars, cards and any stacking context on the page,
 * whatever their z-index. Menus, selects and tooltips opened inside the modal render above it.</p>
 *
 * @cssprop --modal-container-color - Background color of the dialog container.
 * @cssprop --modal-scrim-color - Color of the scrim backdrop.
 * @cssprop --modal-shape - Corner radius of the dialog container.
 * @cssprop --modal-min-width - Minimum width of the dialog.
 * @cssprop --modal-max-width - Maximum width of the dialog.
 * @cssprop --modal-max-height - Maximum height of the dialog.
 *
 * @fires modal-close - Fired when the modal closes. `detail.reason` is `"close-button"`, `"scrim"`, `"escape"` or `"programmatic"`.
 *
 * @example
 * ```html
 * MODAL
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

  /** When true, hides the close button in the header. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-close' })
  hideClose = false;

  /** When true, renders a loading overlay inside the modal. */
  @property({ type: Boolean, reflect: true, attribute: 'show-loader' })
  showLoader = false;

  /** When true, clicking the scrim will not close the modal. */
  @property({ type: Boolean, attribute: 'no-scrim-close' }) noScrimClose =
    false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('dialog') private _dialog?: HTMLDialogElement;

  @query('.dialog') private _panel?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the close button label. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.style.overflow = '';
    if (this._dialog?.open) this._dialog.close();
  }

  protected updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open')) this._syncDialog();
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Opens the modal. */
  show() {
    this.open = true;
  }

  /** Closes the modal. */
  hide() {
    this._close('programmatic');
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** Opens the native dialog in the top layer, or closes it once the exit animation ends. */
  private _syncDialog() {
    const dialog = this._dialog;
    if (!dialog) return;

    if (this.open) {
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = 'hidden';
      return;
    }

    document.body.style.overflow = '';
    if (!dialog.open) return;
    const animations = this._panel?.getAnimations() ?? [];
    if (animations.length === 0) {
      dialog.close();
      return;
    }
    Promise.all(animations.map(animation => animation.finished))
      .catch(() => undefined)
      .then(() => {
        if (!this.open && dialog.open) dialog.close();
      });
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

  /** Escape: close through `open` so the property stays the source of truth. */
  private _handleCancel(event: Event) {
    event.preventDefault();
    this._close('escape');
  }

  /** The browser closed the dialog by itself (for example a forced Escape): keep `open` in step. */
  private _handleNativeClose() {
    if (this.open) this._close('escape');
  }

  /** A click that lands outside the dialog container, not on its content, is a scrim click. */
  private _handleDialogClick(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.classList?.contains('dialog-wrapper')) return;
    if (!this.noScrimClose) this._close('scrim');
  }

  private _handleCloseClick() {
    this._close('close-button');
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
    // The scrim click has its keyboard equivalent in Escape, which the native dialog reports as
    // `cancel`; lit-a11y does not count that as a key listener.
    /* eslint-disable lit-a11y/click-events-have-key-events */
    return html`
      <dialog
        class="native-dialog"
        part="dialog"
        aria-labelledby=${this.heading ? 'modal-heading' : nothing}
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
              'show-loader': this.showLoader,
            })}
          >
            ${this._renderHeader()}

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
      </dialog>
    `;
    /* eslint-enable lit-a11y/click-events-have-key-events */
  }
}
