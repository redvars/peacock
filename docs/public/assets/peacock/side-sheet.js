import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
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
  --side-sheet-container-color: var(--color-surface-container-low, #f7f2fa);
  --side-sheet-scrim-color: rgba(0, 0, 0, 0.32);
  --side-sheet-shape: var(--shape-corner-extra-large, 28px);
  --side-sheet-width: 360px;
  --side-sheet-transition-duration: var(--duration-medium2, 300ms);
  --side-sheet-transition-easing: var(--easing-standard, cubic-bezier(0.2, 0, 0, 1));
}

.scrim {
  inset: 0;
  position: fixed;
  background-color: var(--side-sheet-scrim-color);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--side-sheet-transition-duration) var(--side-sheet-transition-easing);
  z-index: 1000;
}

.scrim.visible {
  opacity: 1;
  pointer-events: auto;
}

.sheet {
  background-color: var(--side-sheet-container-color);
  bottom: 0;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  overflow: hidden;
  position: fixed;
  top: 0;
  transition: transform var(--side-sheet-transition-duration) var(--side-sheet-transition-easing);
  width: var(--side-sheet-width);
  will-change: transform;
  z-index: 1001;
}

.sheet.variant-standard {
  position: relative;
  z-index: 1;
}

/* Position: right */
.sheet.position-right {
  border-radius: var(--side-sheet-shape) 0 0 var(--side-sheet-shape);
  right: 0;
  transform: translateX(100%);
}

.sheet.position-right.open {
  transform: translateX(0);
}

/* Position: left */
.sheet.position-left {
  border-radius: 0 var(--side-sheet-shape) var(--side-sheet-shape) 0;
  left: 0;
  transform: translateX(-100%);
}

.sheet.position-left.open {
  transform: translateX(0);
}

.content {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: var(--spacing-300, 1.5rem);
}`;

/**
 * @label Side Sheet
 * @tag wc-side-sheet
 * @rawTag side-sheet
 * @summary Side sheets slide in from the edge of the screen to reveal supplemental content. Supports standard and modal variants.
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
let SideSheet = class SideSheet extends i$1 {
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
        /**
         * Side from which the sheet slides in.
         * - `"left"`: Sheet opens from the left edge.
         * - `"right"`: Sheet opens from the right edge.
         */
        this.position = 'right';
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
        this.dispatchEvent(new CustomEvent('side-sheet-close', {
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
    render() {
        return b `
      ${this.variant === 'modal'
            ? b `<div
            class=${e({ scrim: true, visible: this.open })}
            @click=${this._handleScrimClick}
          ></div>`
            : A}

      <div
        class=${e({
            sheet: true,
            open: this.open,
            [`variant-${this.variant}`]: true,
            [`position-${this.position}`]: true,
        })}
        role="dialog"
        aria-modal=${this.variant === 'modal' ? 'true' : 'false'}
        aria-hidden=${!this.open ? 'true' : 'false'}
      >
        <div class="content" ?inert=${!this.open}>
          <slot></slot>
        </div>
      </div>
    `;
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
], SideSheet.prototype, "position", void 0);
SideSheet = __decorate([
    IndividualComponent
], SideSheet);

export { SideSheet };
//# sourceMappingURL=side-sheet.js.map
