import { _ as __decorate, I as IndividualComponent, a as i, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-NDIkZErE.js';
import { I as I18nController } from './i18n-controller-Cp43HjJl.js';
import { O as OverlayController } from './overlay-controller-BOk-kfil.js';
import { c as css_248z } from './modal-B78gUfEO.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';
import './strings-BJPuhKJk.js';
import './locale-DEsJZCQG.js';

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
let Modal = class Modal extends i {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        /** Whether the modal is open. */
        this.open = false;
        /** Heading text shown in the modal header. */
        this.heading = '';
        /** Optional subheading / label text shown above the heading. */
        this.subheading = '';
        /**
         * Size of the modal dialog.
         * - `"xs"`: Extra-small.
         * - `"sm"`: Small.
         * - `"md"`: Medium (default).
         * - `"lg"`: Large.
         * - `"fullscreen"`: Full-screen dialog.
         */
        this.size = 'md';
        /** Hides the close button in the header. */
        this.hideClose = false;
        /** Shows a loading overlay inside the modal. */
        this.loading = false;
        /** Keeps the modal open when the scrim is clicked. Escape still closes it. */
        this.noLightDismiss = false;
        // ── Private fields ───────────────────────────────────────────────────────
        /** Peacock's strings for the close button label. */
        this.i18n = new I18nController(this);
        this.overlay = new OverlayController(this, {
            surface: () => this._dialog,
            modal: true,
            exitAnimationTargets: () => [this._panel],
            requestClose: reason => this._close(reason),
        });
    }
    // ── Lifecycle ────────────────────────────────────────────────────────────
    updated(changed) {
        if (!changed.has('open'))
            return;
        this.overlay.sync(this.open);
        if (this.open) {
            this.dispatchEvent(new CustomEvent('open', { bubbles: true, composed: true }));
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
    _close(reason) {
        if (!this.open)
            return;
        this.open = false;
        this.dispatchEvent(new CustomEvent('close', {
            detail: { reason },
            bubbles: true,
            composed: true,
        }));
    }
    /** The native Escape `cancel`: the overlay controller handles Escape, so keep `open` in charge. */
    _handleCancel(event) {
        event.preventDefault();
        this._close('escape');
    }
    /**
     * The browser closed the dialog by itself: keep `open` in step. A `close` from content inside
     * the dialog (a popover, menu or select closing; they bubble and are composed) is not ours.
     */
    _handleNativeClose(event) {
        if (event.target !== this._dialog)
            return;
        if (this.overlay.takeOwnClose())
            return;
        if (this.open)
            this._close('escape');
    }
    /** A click that lands outside the dialog container, not on its content, is a scrim click. */
    _handleDialogClick(event) {
        const target = event.target;
        if (!target.classList?.contains('dialog-wrapper'))
            return;
        if (!this.noLightDismiss)
            this._close('light-dismiss');
    }
    _handleCloseClick() {
        this._close('action');
    }
    // ── Render helpers ───────────────────────────────────────────────────────
    _renderHeader() {
        const hasHeader = this.heading || this.subheading || !this.hideClose;
        if (!hasHeader)
            return A;
        return b `
      <div class="dialog-header">
        <div class="dialog-heading-section">
          ${this.subheading
            ? b `<p class="dialog-subheading">${this.subheading}</p>`
            : A}
          ${this.heading
            ? b `<h2 id="modal-heading" class="dialog-heading">
                ${this.heading}
              </h2>`
            : A}
        </div>
        ${!this.hideClose
            ? b `<wc-icon-button
              class="dialog-close"
              variant="text"
              shape="round"
              aria-label=${this.i18n.t('closeDialog')}
              @click=${this._handleCloseClick}
            >
              <wc-icon name="close"></wc-icon>
            </wc-icon-button>`
            : A}
      </div>
    `;
    }
    // ── Render ───────────────────────────────────────────────────────────────
    render() {
        // The scrim click has its keyboard equivalent in Escape, which the overlay controller
        // handles; lit-a11y does not count that as a key listener.
        /* eslint-disable lit-a11y/click-events-have-key-events */
        return b `
      <dialog
        class="native-dialog"
        part="dialog"
        aria-labelledby=${this.heading ? 'modal-heading' : A}
        aria-busy=${this.loading ? 'true' : A}
        @cancel=${this._handleCancel}
        @close=${this._handleNativeClose}
        @click=${this._handleDialogClick}
      >
        <div
          class=${e$1({ scrim: true, visible: this.open })}
          aria-hidden="true"
        ></div>

        <div class="dialog-wrapper">
          <div
            class=${e$1({
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
            ? b `<div class="dialog-loader" aria-hidden="true">
                  <div class="dialog-loader-scrim"></div>
                  <wc-circular-progress indeterminate></wc-circular-progress>
                </div>`
            : A}
          </div>
        </div>
      </dialog>
    `;
        /* eslint-enable lit-a11y/click-events-have-key-events */
    }
};
Modal.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], Modal.prototype, "open", void 0);
__decorate([
    n({ type: String, reflect: true })
], Modal.prototype, "heading", void 0);
__decorate([
    n({ type: String, reflect: true })
], Modal.prototype, "subheading", void 0);
__decorate([
    n({ type: String, reflect: true })
], Modal.prototype, "size", void 0);
__decorate([
    n({ type: Boolean, reflect: true, attribute: 'hide-close' })
], Modal.prototype, "hideClose", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Modal.prototype, "loading", void 0);
__decorate([
    n({ type: Boolean, attribute: 'no-light-dismiss' })
], Modal.prototype, "noLightDismiss", void 0);
__decorate([
    e('dialog')
], Modal.prototype, "_dialog", void 0);
__decorate([
    e('.dialog')
], Modal.prototype, "_panel", void 0);
Modal = __decorate([
    IndividualComponent
], Modal);

export { Modal };
//# sourceMappingURL=modal.js.map
