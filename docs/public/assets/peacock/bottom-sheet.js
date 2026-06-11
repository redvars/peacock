import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
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
  --bottom-sheet-container-color: var(--color-surface-container-low, #f7f2fa);
  --bottom-sheet-scrim-color: rgba(0, 0, 0, 0.32);
  --bottom-sheet-shape: var(--shape-corner-extra-large, 28px);
  --bottom-sheet-max-height: 90dvh;
  --bottom-sheet-handle-color: var(--color-on-surface-variant, #49454f);
  --bottom-sheet-transition-duration: var(--duration-medium2, 300ms);
  --bottom-sheet-transition-easing: var(--easing-standard, cubic-bezier(0.2, 0, 0, 1));
}

.scrim {
  inset: 0;
  position: fixed;
  background-color: var(--bottom-sheet-scrim-color);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--bottom-sheet-transition-duration) var(--bottom-sheet-transition-easing);
  z-index: 1000;
}

.scrim.visible {
  opacity: 1;
  pointer-events: auto;
}

.sheet {
  background-color: var(--bottom-sheet-container-color);
  border-radius: var(--bottom-sheet-shape) var(--bottom-sheet-shape) 0 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  left: 0;
  max-height: var(--bottom-sheet-max-height);
  overflow: hidden;
  position: fixed;
  right: 0;
  transform: translateY(100%);
  transition: transform var(--bottom-sheet-transition-duration) var(--bottom-sheet-transition-easing);
  will-change: transform;
  z-index: 1001;
}

.sheet.variant-standard {
  position: relative;
  z-index: 1;
}

.sheet.open {
  transform: translateY(0);
}

.sheet.dragging {
  transition: none;
}

.handle-area {
  cursor: grab;
  display: flex;
  justify-content: center;
  padding: var(--spacing-100, 0.5rem) var(--spacing-200, 1rem);
  touch-action: none;
}

.handle-area:active {
  cursor: grabbing;
}

.handle {
  background-color: var(--bottom-sheet-handle-color);
  border-radius: var(--shape-corner-full, 9999px);
  height: 4px;
  opacity: 0.4;
  width: 2rem;
}

.content {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: var(--spacing-100, 0.5rem) var(--spacing-300, 1.5rem) var(--spacing-300, 1.5rem);
}`;

/**
 * @label Bottom Sheet
 * @tag wc-bottom-sheet
 * @rawTag bottom-sheet
 * @summary Bottom sheets slide up from the bottom of the screen to reveal additional content. Supports standard and modal variants.
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
let BottomSheet = class BottomSheet extends i$1 {
    constructor() {
        super(...arguments);
        /** Whether the sheet is visible. */
        this.open = false;
        /**
         * Sheet variant.
         * - `"standard"`: Coexists with page content; no scrim.
         * - `"modal"`: Overlays page content with a scrim backdrop.
         */
        this.variant = 'modal';
        /** Whether to show the drag handle. */
        this.showHandle = true;
        this._dragging = false;
        this._dragStartY = 0;
        this._dragOffsetY = 0;
    }
    show() {
        this.open = true;
    }
    hide() {
        this._close('programmatic');
    }
    _close(reason) {
        if (!this.open)
            return;
        this.open = false;
        this.dispatchEvent(new CustomEvent('bottom-sheet-close', {
            detail: { reason },
            bubbles: true,
            composed: true,
        }));
    }
    _handleScrimClick() {
        if (this.variant === 'modal') {
            this._close('scrim');
        }
    }
    _handleDragStart(e) {
        this._dragging = true;
        this._dragStartY = e.clientY;
        this._dragOffsetY = 0;
        e.currentTarget.setPointerCapture(e.pointerId);
    }
    _handleDragMove(e) {
        if (!this._dragging)
            return;
        const delta = e.clientY - this._dragStartY;
        this._dragOffsetY = Math.max(0, delta);
    }
    _handleDragEnd() {
        if (!this._dragging)
            return;
        this._dragging = false;
        if (this._dragOffsetY > 80) {
            this._close('drag');
        }
        this._dragOffsetY = 0;
    }
    render() {
        const translateY = this._dragging ? `${this._dragOffsetY}px` : undefined;
        return b `
      ${this.variant === 'modal'
            ? b `<div
            class=${e({ scrim: true, visible: this.open })}
            @click=${this._handleScrimClick}
            @keydown=${(e) => {
                if (e.key === 'Escape')
                    this._close('esc');
            }}
          ></div>`
            : A}

      <div
        class=${e({
            sheet: true,
            open: this.open,
            dragging: this._dragging,
            [`variant-${this.variant}`]: true,
        })}
        style=${translateY ? `transform: translateY(${translateY})` : ''}
        role="dialog"
        aria-label="${this.ariaLabel ?? 'Bottom sheet'}"
        aria-modal=${this.variant === 'modal' ? 'true' : 'false'}
        aria-hidden=${!this.open ? 'true' : 'false'}
      >
        ${this.showHandle
            ? b `<div
              class="handle-area"
              @pointerdown=${this._handleDragStart}
              @pointermove=${this._handleDragMove}
              @pointerup=${this._handleDragEnd}
              @pointercancel=${this._handleDragEnd}
            >
              <div class="handle"></div>
            </div>`
            : A}

        <div class="content">
          <slot></slot>
        </div>
      </div>
    `;
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
    n({ type: Boolean, attribute: 'show-handle' })
], BottomSheet.prototype, "showHandle", void 0);
__decorate([
    r()
], BottomSheet.prototype, "_dragging", void 0);
__decorate([
    r()
], BottomSheet.prototype, "_dragStartY", void 0);
__decorate([
    r()
], BottomSheet.prototype, "_dragOffsetY", void 0);
BottomSheet = __decorate([
    IndividualComponent
], BottomSheet);

export { BottomSheet };
//# sourceMappingURL=bottom-sheet.js.map
