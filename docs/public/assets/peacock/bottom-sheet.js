import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-NDIkZErE.js';
import { o } from './style-map-CHOg6N_R.js';
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
  --bottom-sheet-container-color: var(--color-surface-container-low, #f7f2fa);
  --bottom-sheet-scrim-color: color-mix(in srgb, var(--color-scrim) 32%, transparent);
  --bottom-sheet-shape: var(--shape-corner-extra-large, 28px);
  --bottom-sheet-max-height: 90dvh;
  --bottom-sheet-handle-color: var(--color-on-surface-variant, #49454f);
  --bottom-sheet-transition-duration: var(--duration-medium2, 300ms);
  --bottom-sheet-transition-easing: var(--easing-standard, cubic-bezier(0.2, 0, 0, 1));
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

/* Standard: opened with show(), not modal; it stays in the page flow. */
.native-dialog.variant-standard {
  inline-size: 100%;
  inset: auto;
  position: relative;
}

.scrim {
  background-color: var(--bottom-sheet-scrim-color);
  inset: 0;
  opacity: 0;
  position: absolute;
  transition: opacity var(--bottom-sheet-transition-duration) var(--bottom-sheet-transition-easing);
}

.scrim.visible {
  opacity: 1;
}

.sheet {
  background-color: var(--bottom-sheet-container-color);
  border-start-end-radius: var(--bottom-sheet-shape);
  border-start-start-radius: var(--bottom-sheet-shape);
  display: flex;
  flex-direction: column;
  inset-block-end: 0;
  inset-inline: 0;
  max-block-size: var(--bottom-sheet-max-height);
  overflow: hidden;
  position: absolute;
  transition: transform var(--bottom-sheet-transition-duration) var(--bottom-sheet-transition-easing);
  /*
   * The open state keeps no transform: a transformed ancestor would become the containing
   * block of fixed-position menus, selects and tooltips opened inside the sheet.
   */
}
.sheet.open {
  animation: bottom-sheet-enter var(--bottom-sheet-transition-duration) var(--bottom-sheet-transition-easing) backwards;
}
.sheet:not(.open) {
  animation: bottom-sheet-exit var(--bottom-sheet-transition-duration) var(--bottom-sheet-transition-easing) forwards;
}

.variant-standard .sheet {
  position: relative;
}

.sheet.dragging {
  transition: none;
}

.handle-area {
  align-self: stretch;
  background: transparent;
  border: 0;
  border-radius: var(--shape-corner-small, 8px);
  color: inherit;
  cursor: grab;
  display: flex;
  justify-content: center;
  margin: 0;
  padding: var(--spacing-200, 1rem);
  touch-action: none;
}
.handle-area:active {
  cursor: grabbing;
}
.handle-area:focus-visible {
  outline: 2px solid var(--color-primary, currentcolor);
  outline-offset: -2px;
}

.handle {
  background-color: var(--bottom-sheet-handle-color);
  block-size: 4px;
  border-radius: var(--shape-corner-full, 9999px);
  inline-size: 2rem;
  opacity: 0.4;
}

.content {
  flex: 1 1 auto;
  overflow-y: auto;
  padding-block: var(--spacing-100, 0.5rem) var(--spacing-300, 1.5rem);
  padding-inline: var(--spacing-300, 1.5rem);
}

@media (prefers-reduced-motion: reduce) {
  .scrim,
  .sheet {
    transition: none;
  }
  .sheet.open,
  .sheet:not(.open) {
    animation: none;
  }
}
@keyframes bottom-sheet-enter {
  from {
    transform: translateY(100%);
  }
}
@keyframes bottom-sheet-exit {
  to {
    transform: translateY(100%);
  }
}`;

/** How far (px) the sheet must be dragged down to close. */
const DRAG_CLOSE_DISTANCE = 80;
/** Pointer movement (px) under which a press on the handle counts as a click, not a drag. */
const DRAG_CLICK_TOLERANCE = 4;
/**
 * @label Bottom Sheet
 * @tag wc-bottom-sheet
 * @rawTag bottom-sheet
 * @summary A panel that slides up from the bottom of the screen with extra content, either modal over the page or alongside it.
 * @overview
 * <p>The sheet renders a native <code>&lt;dialog&gt;</code>. The <code>modal</code> variant (the default)
 * opens it with <code>showModal()</code>: it renders in the browser's top layer above the page, with a
 * scrim; the rest of the page is inert and does not scroll; focus moves to the first element with
 * <code>autofocus</code> inside it and returns where it was when the sheet closes. Escape and a click
 * on the scrim close it (<code>no-light-dismiss</code> keeps it open on scrim clicks).</p>
 * <p>The drag handle closes the sheet when dragged down, clicked, or pressed with Enter or Space.</p>
 * <p>The <code>standard</code> variant opens the dialog with <code>show()</code>: it is not modal and
 * stays in the page flow at the end of its container.</p>
 *
 * @cssprop --bottom-sheet-container-color - Background color of the sheet container.
 * @cssprop --bottom-sheet-scrim-color - Color of the modal scrim overlay.
 * @cssprop --bottom-sheet-shape - Corner radius of the top edge.
 * @cssprop --bottom-sheet-max-height - Maximum height of the sheet.
 *
 * @fires {CustomEvent} open - Fired when the sheet opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Fired when the sheet closes: Escape, a scrim click, the drag handle (`action`), or `hide()`.
 *
 * @example
 * ```html
 * <wc-button onclick="document.getElementById('share').show()">Share</wc-button>
 * <wc-bottom-sheet id="share" label="Share">
 *   <wc-list>
 *     <wc-list-item autofocus>Copy link</wc-list-item>
 *     <wc-list-item>Email</wc-list-item>
 *   </wc-list>
 * </wc-bottom-sheet>
 * ```
 * @tags navigation, overlay
 */
let BottomSheet = class BottomSheet extends i$1 {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        /** Whether the sheet is visible. */
        this.open = false;
        /**
         * Sheet variant. Set it before opening the sheet.
         * - `"standard"`: Non-modal; stays in the page flow, no scrim.
         * - `"modal"`: Overlays the page in the top layer with a scrim; the page is inert.
         */
        this.variant = 'modal';
        /** Accessible name of the sheet. */
        this.label = '';
        /** Hides the drag handle. */
        this.hideHandle = false;
        /** Keeps a modal sheet open when the scrim is clicked. Escape still closes it. */
        this.noLightDismiss = false;
        // ── State ────────────────────────────────────────────────────────────────
        this._dragging = false;
        this._dragOffsetY = 0;
        // ── Private fields ───────────────────────────────────────────────────────
        /** Peacock's strings for the default label and the drag handle. */
        this.i18n = new I18nController(this);
        this.overlay = new OverlayController(this, {
            surface: () => this._dialog,
            modal: () => this._isModal,
            closeOnEscape: () => this._isModal,
            exitAnimationTargets: () => [this._sheet],
            requestClose: reason => this._close(reason),
        });
        this._dragStartY = 0;
        /** The last press on the handle moved, so the click that follows it is not a click. */
        this._suppressHandleClick = false;
    }
    // ── Lifecycle ────────────────────────────────────────────────────────────
    willUpdate(changed) {
        if (changed.has('open') && this.open) {
            this._dragOffsetY = 0;
        }
    }
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
    _handleDragStart(event) {
        this._dragging = true;
        this._suppressHandleClick = false;
        this._dragStartY = event.clientY;
        this._dragOffsetY = 0;
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        }
        catch {
            // The pointer is no longer active (or is synthetic); dragging works without capture.
        }
    }
    _handleDragMove(event) {
        if (!this._dragging)
            return;
        this._dragOffsetY = Math.max(0, event.clientY - this._dragStartY);
        if (this._dragOffsetY > DRAG_CLICK_TOLERANCE) {
            this._suppressHandleClick = true;
        }
    }
    _handleDragEnd() {
        if (!this._dragging)
            return;
        this._dragging = false;
        if (this._dragOffsetY > DRAG_CLOSE_DISTANCE) {
            // Keep the dragged offset so the exit animation starts where the sheet was let go.
            this._close('action');
            return;
        }
        this._dragOffsetY = 0;
    }
    /** A click, or Enter / Space on the focused handle (a native button), closes the sheet. */
    _handleHandleClick() {
        if (this._suppressHandleClick) {
            this._suppressHandleClick = false;
            return;
        }
        this._close('action');
    }
    // ── Render helpers ───────────────────────────────────────────────────────
    _renderHandle() {
        if (this.hideHandle)
            return A;
        return b `<button
      class="handle-area"
      part="handle"
      type="button"
      aria-label=${this.i18n.t('closeSheet')}
      @click=${this._handleHandleClick}
      @pointerdown=${this._handleDragStart}
      @pointermove=${this._handleDragMove}
      @pointerup=${this._handleDragEnd}
      @pointercancel=${this._handleDragEnd}
    >
      <span class="handle"></span>
    </button>`;
    }
    // ── Render ───────────────────────────────────────────────────────────────
    render() {
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
        aria-label=${this.label || this.ariaLabel || this.i18n.t('bottomSheet')}
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
            dragging: this._dragging,
        })}
          part="sheet"
          style=${o({
            transform: this._dragOffsetY > 0
                ? `translateY(${this._dragOffsetY}px)`
                : undefined,
        })}
        >
          ${this._renderHandle()}
          <div class="content">
            <slot></slot>
          </div>
        </div>
      </dialog>
    `;
        /* eslint-enable lit-a11y/click-events-have-key-events */
    }
};
BottomSheet.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], BottomSheet.prototype, "open", void 0);
__decorate([
    n({ type: String, reflect: true })
], BottomSheet.prototype, "variant", void 0);
__decorate([
    n({ type: String })
], BottomSheet.prototype, "label", void 0);
__decorate([
    n({ type: Boolean, reflect: true, attribute: 'hide-handle' })
], BottomSheet.prototype, "hideHandle", void 0);
__decorate([
    n({ type: Boolean, attribute: 'no-light-dismiss' })
], BottomSheet.prototype, "noLightDismiss", void 0);
__decorate([
    r()
], BottomSheet.prototype, "_dragging", void 0);
__decorate([
    r()
], BottomSheet.prototype, "_dragOffsetY", void 0);
__decorate([
    e('dialog')
], BottomSheet.prototype, "_dialog", void 0);
__decorate([
    e('.sheet')
], BottomSheet.prototype, "_sheet", void 0);
BottomSheet = __decorate([
    IndividualComponent
], BottomSheet);

export { BottomSheet };
//# sourceMappingURL=bottom-sheet.js.map
