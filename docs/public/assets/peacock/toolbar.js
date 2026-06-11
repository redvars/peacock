import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';

var css_248z$1 = i`* {
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
  display: block;
  --toolbar-container-shape: var(--shape-corner-full);
  --toolbar-docked-container-shape: var(--shape-corner-extra-large) var(--shape-corner-extra-large) var(--shape-corner-none) var(--shape-corner-none);
  --toolbar-height: 5rem; /* 80dp - small/default docked */
  --toolbar-padding-inline: 0.75rem;
  --toolbar-gap: 0.5rem;
  --toolbar-shadow: none;
}

/* ---- Shared toolbar base ---- */
.toolbar {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--toolbar-gap);
  padding-inline: var(--toolbar-padding-inline);
  min-height: var(--toolbar-height);
  width: 100%;
  box-sizing: border-box;
  color: var(--_toolbar-title-color);
  --icon-color: var(--_toolbar-icon-color);
  box-shadow: var(--toolbar-shadow);
}

.toolbar-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}

.background {
  position: absolute;
  inset: 0;
  background-color: var(--_toolbar-container-color);
  pointer-events: none;
  z-index: 0;
}

/* ---- Docked variant ---- */
.toolbar.variant-docked {
  width: 100%;
  padding-inline: var(--toolbar-padding-inline);
  padding-block-start: 0.5rem;
  padding-block-end: calc(0.5rem + env(safe-area-inset-bottom, 0px));
}
.toolbar.variant-docked .background {
  border-radius: var(--toolbar-docked-container-shape);
}
.toolbar.variant-docked .toolbar-content {
  width: 100%;
  justify-content: space-between;
  gap: var(--toolbar-gap);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}
.toolbar.variant-docked .toolbar-content::-webkit-scrollbar {
  display: none;
}
.toolbar.variant-docked ::slotted(*) {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}
.toolbar.variant-docked ::slotted(wc-icon-button) {
  --button-container-shape: var(--shape-corner-full);
  --button-container-shape-variant: round;
}
.toolbar.variant-docked {
  /* Size variants */
}
.toolbar.variant-docked.size-small {
  --toolbar-height: 5rem;
}
.toolbar.variant-docked.size-medium {
  --toolbar-height: 6rem;
}
.toolbar.variant-docked.size-large {
  --toolbar-height: 7rem;
}
.toolbar.variant-docked.elevated {
  --toolbar-shadow: var(--elevation-shadow-level-3, 0 4px 8px rgba(0, 0, 0, 0.15));
}

/* ---- Floating variant ---- */
.toolbar.variant-floating {
  --toolbar-container-shape: var(--shape-corner-full);
  border-radius: var(--toolbar-container-shape);
  width: auto;
  display: inline-flex;
  padding: 0.75rem;
  gap: 0.5rem;
}
.toolbar.variant-floating .elevation {
  --elevation-level: 3;
  --elevation-container-shape: var(--toolbar-container-shape);
  --elevation-container-shape-variant: round;
}
.toolbar.variant-floating .background {
  border-radius: var(--toolbar-container-shape);
}
.toolbar.variant-floating .toolbar-content {
  width: auto;
  gap: 0.5rem;
}
.toolbar.variant-floating ::slotted(*) {
  position: relative;
  z-index: 1;
}
.toolbar.variant-floating ::slotted(wc-icon-button) {
  --button-container-shape: var(--shape-corner-full);
  --button-container-shape-variant: round;
}
.toolbar.variant-floating.orientation-horizontal {
  min-height: auto;
  padding-block: 0.5rem;
  padding-inline: 0.75rem;
}
.toolbar.variant-floating.orientation-horizontal .toolbar-content {
  flex-direction: row;
  align-items: center;
}
.toolbar.variant-floating.orientation-vertical {
  min-height: auto;
  width: auto;
  padding-block: 0.75rem;
  padding-inline: 0.5rem;
}
.toolbar.variant-floating.orientation-vertical .toolbar-content {
  flex-direction: column;
  align-items: center;
}
.toolbar.variant-floating.elevated .elevation {
  --elevation-level: 4;
}`;

var css_248z = i`:host {
  /* Docked toolbar */
  --toolbar-container-color: var(--color-surface-container);
  --toolbar-title-color: var(--color-on-surface);
  --toolbar-icon-color: var(--color-on-surface-variant);
  /* Internal aliases used by styles */
  --_toolbar-container-color: var(--toolbar-container-color);
  --_toolbar-title-color: var(--toolbar-title-color);
  --_toolbar-icon-color: var(--toolbar-icon-color);
}

/* Floating variant uses surface-container-high for a visible pill */
:host([variant=floating]) {
  --toolbar-container-color: var(--color-surface-container-high);
}`;

var Toolbar_1;
/**
 * @label Toolbar
 * @tag wc-toolbar
 * @rawTag toolbar
 *
 * @summary A toolbar / app bar for navigation and actions.
 * @overview
 * <p>The toolbar component implements the app bar pattern. It supports a
 * docked (attached) variant for bottom-panel navigation and a floating (detached pill-shaped)
 * variant. The floating variant supports both horizontal and vertical orientations.</p>
 *
 * <p>Render toolbar actions directly as children of the component. The docked variant is
 * optimized for a horizontal action row, while the floating variant supports both horizontal
 * and vertical layouts.</p>
 *
 * @cssprop --toolbar-container-color - Background color of the toolbar.
 * @cssprop --toolbar-container-shape - Border radius of the toolbar. Relevant for the floating variant.
 * @cssprop --toolbar-height - Height of the toolbar (docked horizontal / floating horizontal).
 * @cssprop --toolbar-padding-inline - Inline padding of the toolbar.
 * @cssprop --toolbar-gap - Gap between toolbar sections.
 * @cssprop --toolbar-icon-color - Color of icon slots.
 * @cssprop --toolbar-title-color - Color of the title (default slot) text.
 * @cssprop --toolbar-shadow - Box-shadow of the toolbar.
 *
 * @example
 * ```html
 * <!-- Docked toolbar -->
 * <wc-toolbar>
 *   <wc-icon-button variant="text" color="surface"><wc-icon name="home"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="tonal"><wc-icon name="search"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="text" color="surface"><wc-icon name="favorite"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="text" color="surface"><wc-icon name="account_circle"></wc-icon></wc-icon-button>
 * </wc-toolbar>
 * ```
 *
 * @example
 * ```html
 * <!-- Floating horizontal toolbar -->
 * <wc-toolbar variant="floating" orientation="horizontal">
 *   <wc-icon-button variant="tonal"><wc-icon name="home"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="text"><wc-icon name="search"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="text"><wc-icon name="favorite"></wc-icon></wc-icon-button>
 * </wc-toolbar>
 * ```
 *
 * @example
 * ```html
 * <!-- Floating vertical toolbar -->
 * <wc-toolbar variant="floating" orientation="vertical">
 *   <wc-icon-button variant="tonal"><wc-icon name="home"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="text"><wc-icon name="search"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="text"><wc-icon name="favorite"></wc-icon></wc-icon-button>
 * </wc-toolbar>
 * ```
 * @tags display navigation
 */
let Toolbar = Toolbar_1 = class Toolbar extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Visual and layout variant of the toolbar.
         * - `"docked"`: A full-width bar attached to the edge of the screen (default).
         * - `"floating"`: A detached pill-shaped toolbar that floats over content.
         */
        this.variant = 'docked';
        /**
         * Orientation of the toolbar content.
         * - `"horizontal"`: Items are laid out left to right (default).
         * - `"vertical"`: Items are stacked top to bottom. Primarily useful for the floating variant.
         */
        this.orientation = 'horizontal';
        /**
         * Size of the docked toolbar.
          * - `"small"`: 80dp height (default).
          * - `"medium"`: 96dp height.
          * - `"large"`: 112dp height.
         */
        this.size = 'small';
        /**
         * Whether the toolbar is visually elevated (adds a shadow).
         */
        this.elevated = false;
    }
    render() {
        const cssClasses = {
            toolbar: true,
            [`variant-${this.variant}`]: true,
            [`orientation-${this.orientation}`]: true,
            [`size-${this.size}`]: true,
            elevated: this.elevated,
        };
        if (this.variant === 'floating') {
            return Toolbar_1.__renderFloating(cssClasses);
        }
        return Toolbar_1.__renderDocked(cssClasses);
    }
    static __renderDocked(cssClasses) {
        return b `
      <div class=${e(cssClasses)} role="toolbar">
        <div class="background"></div>
        <div class="toolbar-content">
          <slot></slot>
        </div>
      </div>
    `;
    }
    static __renderFloating(cssClasses) {
        return b `
      <div class=${e(cssClasses)} role="toolbar">
        <wc-elevation class="elevation"></wc-elevation>
        <div class="background"></div>
        <div class="toolbar-content">
          <slot></slot>
        </div>
      </div>
    `;
    }
};
Toolbar.styles = [css_248z$1, css_248z];
__decorate([
    n({ type: String, reflect: true })
], Toolbar.prototype, "variant", void 0);
__decorate([
    n({ type: String, reflect: true })
], Toolbar.prototype, "orientation", void 0);
__decorate([
    n({ type: String, reflect: true })
], Toolbar.prototype, "size", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Toolbar.prototype, "elevated", void 0);
Toolbar = Toolbar_1 = __decorate([
    IndividualComponent
], Toolbar);

export { Toolbar };
//# sourceMappingURL=toolbar.js.map
