import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { e } from './class-map-NDIkZErE.js';
import { R as RovingFocusController } from './roving-focus-controller-fm95JkZJ.js';
import './directive-ZPhl09Yt.js';

var css_248z$1 = i`* {
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
  display: inline-block;
  vertical-align: middle;
  --toolbar-container-shape: var(--shape-corner-full);
  --toolbar-padding: 0.5rem;
  --toolbar-gap: 0.25rem;
}

:host([orientation=vertical]) {
  vertical-align: top;
}

/* ---- Shared toolbar base ---- */
.toolbar {
  position: relative;
  display: flex;
  box-sizing: border-box;
  color: var(--_toolbar-content-color);
  --icon-color: var(--_toolbar-icon-color);
}

.toolbar-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  flex-wrap: var(--toolbar-wrap, nowrap);
  gap: var(--toolbar-gap);
  min-width: 0;
}

.background {
  position: absolute;
  inset: 0;
  background-color: var(--_toolbar-container-color);
  pointer-events: none;
  z-index: 0;
}

::slotted(*) {
  flex-shrink: 0;
}

::slotted(wc-icon-button) {
  --button-container-shape: var(--shape-corner-full);
  --button-container-shape-variant: round;
}

/* ---- Orientation ---- */
.orientation-horizontal .toolbar-content {
  flex-direction: row;
}

.orientation-vertical .toolbar-content {
  flex-direction: column;
}

/* Dividers separate groups of actions: a short line across the toolbar's direction. */
::slotted(wc-divider) {
  align-self: stretch;
  --divider-spacing: 0.25rem;
}

/* ---- Floating variant ---- */
.toolbar.variant-floating {
  padding: var(--toolbar-padding);
  border-radius: var(--toolbar-container-shape);
}
.toolbar.variant-floating .elevation {
  --elevation-level: 3;
  --elevation-container-shape: var(--toolbar-container-shape);
  --elevation-container-shape-variant: round;
}
.toolbar.variant-floating .background {
  border-radius: var(--toolbar-container-shape);
}
.toolbar.variant-floating.elevated .elevation {
  --elevation-level: 4;
}

/* ---- Flat variant ---- */
.toolbar.variant-flat {
  padding: 0;
}`;

var css_248z = i`:host {
  --toolbar-container-color: var(--color-surface-container-high);
  --toolbar-content-color: var(--color-on-surface);
  --toolbar-icon-color: var(--color-on-surface-variant);
  /* Internal aliases used by styles */
  --_toolbar-container-color: var(--toolbar-container-color);
  --_toolbar-content-color: var(--toolbar-content-color);
  --_toolbar-icon-color: var(--toolbar-icon-color);
}

/* The flat toolbar takes on the surface it sits on. */
:host([variant=flat]) {
  --toolbar-container-color: transparent;
}`;

/** Slotted elements that separate groups and never take focus. */
const SEPARATOR_SELECTOR = 'wc-divider, hr, [role="separator"]';
/**
 * @label Toolbar
 * @tag wc-toolbar
 * @rawTag toolbar
 *
 * @summary A group of related actions, such as editor formatting controls.
 * @overview
 * <p>The toolbar groups related actions into one control. The <code>floating</code> variant
 * (default) is an elevated pill that sits over content, such as a canvas or a selection. The
 * <code>flat</code> variant has no container of its own, for embedding in existing chrome like a
 * card or editor header. Both variants lay their actions out horizontally or vertically.</p>
 *
 * <p>Render actions directly as children. Use a <code>wc-divider</code> to separate groups of
 * actions; in a horizontal toolbar give it <code>orientation="vertical"</code>.</p>
 *
 * <p>The toolbar follows the WAI-ARIA toolbar pattern: it is a single tab stop, and the arrow
 * keys along its orientation move focus between actions (Home and End jump to the first and last).
 * Disabled actions and dividers are skipped. Give the toolbar an <code>aria-label</code>.</p>
 *
 * @cssprop --toolbar-container-color - Background color of the toolbar.
 * @cssprop --toolbar-container-shape - Border radius of the floating toolbar.
 * @cssprop --toolbar-padding - Padding of the floating toolbar.
 * @cssprop --toolbar-gap - Gap between toolbar actions.
 * @cssprop --toolbar-icon-color - Color of icons inside the toolbar.
 * @cssprop --toolbar-content-color - Color of text inside the toolbar.
 * @cssprop --toolbar-wrap - `wrap` lets actions flow onto more lines when the toolbar is narrow. Defaults to `nowrap`.
 *
 * @example
 * ```html
 * <!-- Floating toolbar -->
 * <wc-toolbar aria-label="Formatting">
 *   <wc-icon-button variant="text" color="surface" aria-label="Undo"><wc-icon name="undo"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="text" color="surface" aria-label="Redo"><wc-icon name="redo"></wc-icon></wc-icon-button>
 *   <wc-divider orientation="vertical"></wc-divider>
 *   <wc-icon-button variant="tonal" aria-label="Bold"><wc-icon name="format_bold"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="text" color="surface" aria-label="Italic"><wc-icon name="format_italic"></wc-icon></wc-icon-button>
 * </wc-toolbar>
 * ```
 *
 * @example
 * ```html
 * <!-- Vertical floating toolbar -->
 * <wc-toolbar orientation="vertical" aria-label="Tools">
 *   <wc-icon-button variant="tonal" aria-label="Select"><wc-icon name="arrow_selector_tool"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="text" color="surface" aria-label="Draw"><wc-icon name="draw"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="text" color="surface" aria-label="Text"><wc-icon name="text_fields"></wc-icon></wc-icon-button>
 * </wc-toolbar>
 * ```
 *
 * @example
 * ```html
 * <!-- Flat toolbar inside existing chrome -->
 * <wc-toolbar variant="flat" aria-label="Row actions">
 *   <wc-icon-button variant="text" color="surface" aria-label="Edit"><wc-icon name="edit"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="text" color="surface" aria-label="Delete"><wc-icon name="delete"></wc-icon></wc-icon-button>
 * </wc-toolbar>
 * ```
 * @tags display
 */
let Toolbar = class Toolbar extends i$1 {
    constructor() {
        super(...arguments);
        // ── Properties
        /**
         * Visual variant of the toolbar.
         * - `"floating"`: An elevated pill that floats over content (default).
         * - `"flat"`: No container, fill or elevation; for embedding in existing chrome.
         */
        this.variant = 'floating';
        /**
         * Orientation of the toolbar. It sets the layout direction and the arrow keys that move focus
         * (Left/Right for horizontal, Up/Down for vertical).
         */
        this.orientation = 'horizontal';
        /**
         * Raises the floating toolbar to a higher elevation. Has no effect on the flat variant.
         */
        this.elevated = false;
        // ── Private fields
        /** The toolbar's single tab stop, moved with the arrow keys along its orientation. */
        this.roving = new RovingFocusController(this, {
            items: () => this.__getItems(),
            orientation: () => this.orientation,
        });
        this.__handleSlotChange = () => {
            this.roving.sync();
        };
    }
    // ── Lifecycle
    connectedCallback() {
        super.connectedCallback();
        // The role lives on the host so the host's aria-label names the toolbar.
        this.setAttribute('role', 'toolbar');
    }
    updated(changed) {
        if (changed.has('orientation')) {
            this.setAttribute('aria-orientation', this.orientation);
        }
    }
    // ── Private methods
    /** Actions that can take focus, in slot order. */
    __getItems() {
        const slot = this.shadowRoot?.querySelector('slot');
        if (!slot)
            return [];
        return slot
            .assignedElements({ flatten: true })
            .filter((el) => el instanceof HTMLElement &&
            !el.matches(SEPARATOR_SELECTOR) &&
            !el.hasAttribute('disabled') &&
            el.getAttribute('aria-disabled') !== 'true' &&
            !el.hidden);
    }
    // ── Render
    render() {
        const floating = this.variant === 'floating';
        const cssClasses = {
            toolbar: true,
            [`variant-${this.variant}`]: true,
            [`orientation-${this.orientation}`]: true,
            elevated: floating && this.elevated,
        };
        return b `
      <div
        class=${e(cssClasses)}
        @keydown=${this.roving.handleKeyDown}
        @focusin=${this.roving.handleFocusIn}
      >
        ${floating
            ? b `<wc-elevation class="elevation"></wc-elevation>`
            : A}
        <div class="background"></div>
        <div class="toolbar-content">
          <slot @slotchange=${this.__handleSlotChange}></slot>
        </div>
      </div>
    `;
    }
};
// ── Static
Toolbar.styles = [css_248z$1, css_248z];
__decorate([
    n({ type: String, reflect: true })
], Toolbar.prototype, "variant", void 0);
__decorate([
    n({ type: String, reflect: true })
], Toolbar.prototype, "orientation", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Toolbar.prototype, "elevated", void 0);
Toolbar = __decorate([
    IndividualComponent
], Toolbar);

export { Toolbar };
//# sourceMappingURL=toolbar.js.map
