import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-DG7CA1et.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`@charset "UTF-8";
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  display: contents;
  --modal-container-color: var(--color-surface-container-high);
  --modal-scrim-color: color-mix(in srgb, var(--color-scrim), transparent 32%);
  --modal-shape: var(--shape-corner-extra-large);
  --modal-min-width: 280px;
  --modal-max-width: 560px;
  --modal-max-height: 90dvh;
  --modal-transition-duration: var(--duration-medium2);
  --modal-transition-easing: var(--easing-emphasized);
  --modal-heading-color: var(--color-on-surface);
  --modal-subheading-color: var(--color-on-surface-variant);
  --modal-content-color: var(--color-on-surface-variant);
  --modal-divider-color: var(--color-outline-variant);
  --modal-elevation: var(--elevation-level3);
}

/*
 * Native dialog opened with showModal(): it renders in the browser's top layer, so no page
 * z-index or stacking context can draw above it. It covers the viewport and stays transparent;
 * the scrim and the container below are drawn inside it, in DOM order, without z-index.
 */
.native-dialog {
  background: transparent;
  block-size: 100%;
  border: 0;
  color: inherit;
  inline-size: 100%;
  inset: 0;
  margin: 0;
  max-block-size: none;
  max-inline-size: none;
  overflow: hidden;
  padding: 0;
  position: fixed;
}
.native-dialog::backdrop {
  background: transparent;
}

/* Scrim backdrop */
.scrim {
  background-color: var(--modal-scrim-color);
  inset: 0;
  opacity: 0;
  position: absolute;
  transition: opacity var(--modal-transition-duration) var(--modal-transition-easing);
}

.scrim.visible {
  opacity: 1;
}

/* Dialog wrapper — centres the dialog on screen; a click on it (not the container) is a scrim click */
.dialog-wrapper {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  inset: 0;
  justify-content: center;
  overflow-y: auto;
  padding: var(--spacing-400, 2rem) var(--spacing-200, 1rem);
  position: absolute;
}

/* Dialog container */
.dialog {
  background-color: var(--modal-container-color);
  border-radius: var(--modal-shape);
  box-shadow: var(--modal-elevation);
  display: flex;
  flex-direction: column;
  max-height: var(--modal-max-height);
  max-width: var(--modal-max-width);
  min-width: min(var(--modal-min-width), 100%);
  outline: none;
  overflow: hidden;
  position: relative;
  width: 100%;
  /*
   * The open state keeps no transform: a transformed ancestor would become the containing
   * block of fixed-position menus, selects and tooltips opened inside the modal.
   */
}
.dialog.open {
  animation: modal-enter var(--modal-transition-duration) var(--modal-transition-easing) backwards;
}
.dialog:not(.open) {
  animation: modal-exit var(--modal-transition-duration) var(--modal-transition-easing) forwards;
}

/* Sizes */
.dialog.size-xs {
  --modal-max-width: 320px;
}

.dialog.size-sm {
  --modal-max-width: 420px;
}

.dialog.size-md {
  --modal-max-width: 560px;
}

.dialog.size-lg {
  --modal-max-width: 800px;
}

.dialog.size-fullscreen {
  --modal-max-width: 100%;
  --modal-max-height: 100%;
  border-radius: 0;
  max-height: 100dvh;
  max-width: 100vw;
}

.dialog-wrapper:has(.dialog.size-fullscreen) {
  padding: 0;
}

/* Header */
.dialog-header {
  align-items: flex-start;
  display: flex;
  gap: var(--spacing-200, 1rem);
  padding: var(--spacing-300, 1.5rem) var(--spacing-300, 1.5rem) var(--spacing-200, 1rem);
}

.dialog-heading-section {
  flex: 1;
  min-width: 0;
}

.dialog-subheading {
  color: var(--modal-subheading-color);
  font-family: var(--typography-label-medium-font-family, sans-serif);
  font-size: var(--typography-label-medium-font-size, 0.75rem);
  font-weight: var(--typography-label-medium-font-weight, 500);
  letter-spacing: var(--typography-label-medium-letter-spacing, 0.05em);
  line-height: var(--typography-label-medium-line-height, 1.25rem);
  margin: 0 0 var(--spacing-050, 0.25rem);
  text-transform: uppercase;
}

.dialog-heading {
  color: var(--modal-heading-color);
  font-family: var(--typography-headline-small-font-family, sans-serif);
  font-size: var(--typography-headline-small-font-size, 1.5rem);
  font-weight: var(--typography-headline-small-font-weight, 400);
  letter-spacing: var(--typography-headline-small-letter-spacing, 0);
  line-height: var(--typography-headline-small-line-height, 2rem);
  margin: 0;
}

.dialog-close {
  flex-shrink: 0;
  margin-block-start: -0.25rem;
  margin-inline-end: -0.25rem;
}

/* Body content */
.dialog-content {
  color: var(--modal-content-color);
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 0 var(--spacing-300, 1.5rem) var(--spacing-300, 1.5rem);
}

/* When there is no header */
.dialog:not(:has(.dialog-header)) .dialog-content {
  padding-top: var(--spacing-300, 1.5rem);
}

/* Footer */
.dialog-footer {
  border-top: 1px solid transparent;
}

.dialog-footer:has(slot:not(:empty)),
.dialog-footer slot::slotted(*) {
  border-top-color: var(--modal-divider-color);
}

/* Loading overlay */
.dialog-loader {
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  position: absolute;
}

.dialog-loader-scrim {
  background-color: var(--modal-container-color);
  inset: 0;
  opacity: 0.72;
  position: absolute;
}

@media (prefers-reduced-motion: reduce) {
  .scrim {
    transition: none;
  }
  .dialog.open,
  .dialog:not(.open) {
    animation: none;
  }
}
/* Animations */
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes modal-exit {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}`;

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
let Modal = class Modal extends i$1 {
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
        /** When true, hides the close button in the header. */
        this.hideClose = false;
        /** When true, renders a loading overlay inside the modal. */
        this.showLoader = false;
        /** When true, clicking the scrim will not close the modal. */
        this.noScrimClose = false;
    }
    // ── Lifecycle ────────────────────────────────────────────────────────────
    disconnectedCallback() {
        super.disconnectedCallback();
        document.body.style.overflow = '';
        if (this._dialog?.open)
            this._dialog.close();
    }
    updated(changedProperties) {
        if (changedProperties.has('open'))
            this._syncDialog();
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
    _syncDialog() {
        const dialog = this._dialog;
        if (!dialog)
            return;
        if (this.open) {
            if (!dialog.open)
                dialog.showModal();
            document.body.style.overflow = 'hidden';
            return;
        }
        document.body.style.overflow = '';
        if (!dialog.open)
            return;
        const animations = this._panel?.getAnimations() ?? [];
        if (animations.length === 0) {
            dialog.close();
            return;
        }
        Promise.all(animations.map(animation => animation.finished))
            .catch(() => undefined)
            .then(() => {
            if (!this.open && dialog.open)
                dialog.close();
        });
    }
    _close(reason) {
        if (!this.open)
            return;
        this.open = false;
        this.dispatchEvent(new CustomEvent('modal-close', {
            detail: { reason },
            bubbles: true,
            composed: true,
        }));
    }
    /** Escape: close through `open` so the property stays the source of truth. */
    _handleCancel(event) {
        event.preventDefault();
        this._close('escape');
    }
    /** The browser closed the dialog by itself (for example a forced Escape): keep `open` in step. */
    _handleNativeClose() {
        if (this.open)
            this._close('escape');
    }
    /** A click that lands outside the dialog container, not on its content, is a scrim click. */
    _handleDialogClick(event) {
        const target = event.target;
        if (!target.classList?.contains('dialog-wrapper'))
            return;
        if (!this.noScrimClose)
            this._close('scrim');
    }
    _handleCloseClick() {
        this._close('close-button');
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
              aria-label="Close dialog"
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
        // The scrim click has its keyboard equivalent in Escape, which the native dialog reports as
        // `cancel`; lit-a11y does not count that as a key listener.
        /* eslint-disable lit-a11y/click-events-have-key-events */
        return b `
      <dialog
        class="native-dialog"
        part="dialog"
        aria-labelledby=${this.heading ? 'modal-heading' : A}
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
            ? b `<div class="dialog-loader" aria-hidden="true">
                  <div class="dialog-loader-scrim"></div>
                  <wc-spinner></wc-spinner>
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
    n({ type: Boolean, reflect: true, attribute: 'show-loader' })
], Modal.prototype, "showLoader", void 0);
__decorate([
    n({ type: Boolean, attribute: 'no-scrim-close' })
], Modal.prototype, "noScrimClose", void 0);
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
