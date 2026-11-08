import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-NDIkZErE.js';
import { I as I18nController } from './i18n-controller-W5hLm7os.js';
import { O as OverlayController } from './overlay-controller-BOk-kfil.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';
import './strings-BFkowon5.js';
import './locale-DEsJZCQG.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
:host {
  display: contents;
  --side-sheet-container-color: var(--color-surface-container-low, #f7f2fa);
  --side-sheet-scrim-color: color-mix(in srgb, var(--color-scrim) 32%, transparent);
  --side-sheet-shape: var(--shape-corner-extra-large, 28px);
  --side-sheet-width: 360px;
  --side-sheet-transition-duration: var(--duration-medium2, 300ms);
  --side-sheet-transition-easing: var(--easing-standard, cubic-bezier(0.2, 0, 0, 1));
}

/* The native dialog: reset its UA box; the scrim and the sheet are drawn inside it. */
.native-dialog {
  background: transparent;
  border: 0;
  color: inherit;
  margin: 0;
  max-block-size: none;
  max-inline-size: none;
  overflow: hidden;
  padding: 0;
}
.native-dialog::backdrop {
  background: transparent;
}

/*
 * Modal: opened with showModal(), so it renders in the browser's top layer and covers the
 * viewport; it stays transparent and draws the scrim and the sheet in DOM order, without z-index.
 */
.native-dialog.variant-modal {
  block-size: 100%;
  inline-size: 100%;
  inset: 0;
  position: fixed;
}

/* Standard: opened with show(), not modal; it stays in the page flow beside the content. */
.native-dialog.variant-standard {
  block-size: 100%;
  inline-size: var(--side-sheet-width);
  inset: auto;
  max-inline-size: 100%;
  position: relative;
}

.scrim {
  background-color: var(--side-sheet-scrim-color);
  inset: 0;
  opacity: 0;
  position: absolute;
  transition: opacity var(--side-sheet-transition-duration) var(--side-sheet-transition-easing);
}

.scrim.visible {
  opacity: 1;
}

.sheet {
  --_side-sheet-offset: 100%;
  background-color: var(--side-sheet-container-color);
  block-size: 100%;
  display: flex;
  flex-direction: column;
  inline-size: var(--side-sheet-width);
  inset-block: 0;
  max-inline-size: 100%;
  overflow: hidden;
  position: absolute;
  /*
   * The open state keeps no transform: a transformed ancestor would become the containing
   * block of fixed-position menus, selects and tooltips opened inside the sheet.
   */
}
.sheet.open {
  animation: side-sheet-enter var(--side-sheet-transition-duration) var(--side-sheet-transition-easing) backwards;
}
.sheet:not(.open) {
  animation: side-sheet-exit var(--side-sheet-transition-duration) var(--side-sheet-transition-easing) forwards;
}

.variant-standard .sheet {
  inline-size: 100%;
}

.sheet.placement-end {
  border-end-start-radius: var(--side-sheet-shape);
  border-start-start-radius: var(--side-sheet-shape);
  inset-inline-end: 0;
}

.sheet.placement-start {
  --_side-sheet-offset: -100%;
  border-end-end-radius: var(--side-sheet-shape);
  border-start-end-radius: var(--side-sheet-shape);
  inset-inline-start: 0;
}

.sheet.placement-end:dir(rtl) {
  --_side-sheet-offset: -100%;
}

.sheet.placement-start:dir(rtl) {
  --_side-sheet-offset: 100%;
}

.header {
  align-items: center;
  display: flex;
  gap: var(--spacing-200, 1rem);
  padding-block: var(--spacing-300, 1.5rem) 0;
  padding-inline: var(--spacing-300, 1.5rem) var(--spacing-200, 1rem);
}

.heading {
  color: var(--color-on-surface-variant);
  flex: 1;
  font-family: var(--typography-title-large-font-family, sans-serif);
  font-size: var(--typography-title-large-font-size, 1.375rem);
  font-weight: var(--typography-title-large-font-weight, 400);
  line-height: var(--typography-title-large-line-height, 1.75rem);
  margin: 0;
  min-inline-size: 0;
}

.close {
  flex-shrink: 0;
}

.content {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: var(--spacing-300, 1.5rem);
}

@media (prefers-reduced-motion: reduce) {
  .scrim {
    transition: none;
  }
  .sheet.open,
  .sheet:not(.open) {
    animation: none;
  }
}
@keyframes side-sheet-enter {
  from {
    transform: translateX(var(--_side-sheet-offset));
  }
}
@keyframes side-sheet-exit {
  to {
    transform: translateX(var(--_side-sheet-offset));
  }
}`;

/**
 * @label Side Sheet
 * @tag wc-side-sheet
 * @rawTag side-sheet
 * @summary A panel that slides in from the start or end edge of the screen with extra content, either modal over the page or beside it.
 * @overview
 * <p>The sheet renders a native <code>&lt;dialog&gt;</code>. The <code>modal</code> variant (the default)
 * opens it with <code>showModal()</code>: it renders in the browser's top layer above the page, with a
 * scrim; the rest of the page is inert and does not scroll; focus moves to the first element with
 * <code>autofocus</code> inside it and returns where it was when the sheet closes. Escape and a click
 * on the scrim close it (<code>no-light-dismiss</code> keeps it open on scrim clicks).</p>
 * <p>The <code>standard</code> variant opens the dialog with <code>show()</code>: it is not modal, stays
 * in the page flow beside the content (place it in a flex row), and does not trap focus, lock
 * scrolling or close on Escape.</p>
 * <p><code>placement</code> is logical: <code>end</code> is the right edge in left-to-right pages and
 * the left edge in right-to-left pages.</p>
 *
 * @cssprop --side-sheet-container-color - Background color of the sheet container.
 * @cssprop --side-sheet-scrim-color - Color of the modal scrim overlay.
 * @cssprop --side-sheet-shape - Corner radius of the leading edge.
 * @cssprop --side-sheet-width - Width of the side sheet.
 *
 * @fires {CustomEvent} open - Fired when the sheet opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Fired when the sheet closes: Escape, a scrim click, the close button, or `hide()`.
 *
 * @example
 * ```html
 * <wc-button onclick="document.getElementById('filters').show()">Filters</wc-button>
 * <wc-side-sheet id="filters" heading="Filters">
 *   <wc-checkbox autofocus>In stock only</wc-checkbox>
 *   <wc-checkbox>Free shipping</wc-checkbox>
 *   <wc-button onclick="this.closest('wc-side-sheet').hide()">Apply</wc-button>
 * </wc-side-sheet>
 * ```
 * @tags navigation, overlay
 */
let SideSheet = class SideSheet extends i$1 {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        /** Whether the sheet is visible. */
        this.open = false;
        /**
         * Sheet variant. Set it before opening the sheet.
         * - `"standard"`: Non-modal; sits beside the page content in the layout, no scrim.
         * - `"modal"`: Overlays the page in the top layer with a scrim; the page is inert.
         */
        this.variant = 'modal';
        /**
         * Edge the sheet slides in from, logical: `"start"` or `"end"` (default). In right-to-left
         * pages `"end"` is the left edge.
         */
        this.placement = 'end';
        /** Heading shown in the sheet header; it also names the sheet. */
        this.heading = '';
        /** Accessible name of the sheet when it has no `heading`. */
        this.label = '';
        /** Hides the close button in the header (shown when there is a `heading`). */
        this.hideClose = false;
        /** Keeps a modal sheet open when the scrim is clicked. Escape still closes it. */
        this.noLightDismiss = false;
        // ── Private fields ───────────────────────────────────────────────────────
        /** Peacock's strings for the default label and the close button. */
        this.i18n = new I18nController(this);
        this.overlay = new OverlayController(this, {
            surface: () => this._dialog,
            modal: () => this._isModal,
            closeOnEscape: () => this._isModal,
            exitAnimationTargets: () => [this._sheet],
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
    /** Opens the sheet. */
    show() {
        this.open = true;
    }
    /** Closes the sheet. */
    hide() {
        this._close('api');
    }
    /** Opens the sheet when closed, closes it when open. */
    toggle() {
        if (this.open)
            this.hide();
        else
            this.show();
    }
    // ── Private methods ──────────────────────────────────────────────────────
    get _isModal() {
        return this.variant !== 'standard';
    }
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
    /** A click on the scrim, not on the sheet, is a light dismiss. */
    _handleDialogClick(event) {
        const target = event.target;
        if (!target.classList?.contains('scrim'))
            return;
        if (this._isModal && !this.noLightDismiss)
            this._close('light-dismiss');
    }
    _handleCloseClick() {
        this._close('action');
    }
    // ── Render helpers ───────────────────────────────────────────────────────
    _renderHeader() {
        if (!this.heading)
            return A;
        return b `
      <div class="header" part="header">
        <h2 id="side-sheet-heading" class="heading">${this.heading}</h2>
        ${!this.hideClose
            ? b `<wc-icon-button
              class="close"
              variant="text"
              shape="round"
              aria-label=${this.i18n.t('closeSheet')}
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
        const label = this.heading
            ? A
            : this.label || this.ariaLabel || this.i18n.t('sideSheet');
        // The scrim click has its keyboard equivalent in Escape, which the overlay controller
        // handles; lit-a11y does not count that as a key listener.
        /* eslint-disable lit-a11y/click-events-have-key-events */
        return b `
      <dialog
        class=${e$1({
            'native-dialog': true,
            [`variant-${this._isModal ? 'modal' : 'standard'}`]: true,
        })}
        part="dialog"
        aria-labelledby=${this.heading ? 'side-sheet-heading' : A}
        aria-label=${label}
        @cancel=${this._handleCancel}
        @close=${this._handleNativeClose}
        @click=${this._handleDialogClick}
      >
        ${this._isModal
            ? b `<div
              class=${e$1({ scrim: true, visible: this.open })}
              aria-hidden="true"
            ></div>`
            : A}

        <div
          class=${e$1({
            sheet: true,
            open: this.open,
            [`placement-${this.placement}`]: true,
        })}
          part="sheet"
        >
          ${this._renderHeader()}
          <div class="content">
            <slot></slot>
          </div>
        </div>
      </dialog>
    `;
        /* eslint-enable lit-a11y/click-events-have-key-events */
    }
};
SideSheet.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], SideSheet.prototype, "open", void 0);
__decorate([
    n({ type: String, reflect: true })
], SideSheet.prototype, "variant", void 0);
__decorate([
    n({ type: String, reflect: true })
], SideSheet.prototype, "placement", void 0);
__decorate([
    n({ type: String, reflect: true })
], SideSheet.prototype, "heading", void 0);
__decorate([
    n({ type: String })
], SideSheet.prototype, "label", void 0);
__decorate([
    n({ type: Boolean, reflect: true, attribute: 'hide-close' })
], SideSheet.prototype, "hideClose", void 0);
__decorate([
    n({ type: Boolean, attribute: 'no-light-dismiss' })
], SideSheet.prototype, "noLightDismiss", void 0);
__decorate([
    e('dialog')
], SideSheet.prototype, "_dialog", void 0);
__decorate([
    e('.sheet')
], SideSheet.prototype, "_sheet", void 0);
SideSheet = __decorate([
    IndividualComponent
], SideSheet);

export { SideSheet };
//# sourceMappingURL=side-sheet.js.map
