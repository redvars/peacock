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
  width: 100%;
  /* ---- Public custom properties ---- */
  --app-bar-container-height: 4rem; /* 64dp */
  --app-bar-padding-inline: 0.25rem;
  --app-bar-shadow: none;
}

/* ---- Base ---- */
.app-bar {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  box-shadow: var(--app-bar-shadow);
  color: var(--_app-bar-headline-color);
}

.background {
  position: absolute;
  inset: 0;
  background-color: var(--_app-bar-container-color);
  pointer-events: none;
  z-index: 0;
  transition: background-color 200ms ease;
}

/* ---- Row layout ---- */
.row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  padding-inline: var(--app-bar-padding-inline);
  box-sizing: border-box;
  width: 100%;
}

.row-top {
  height: var(--app-bar-container-height);
  gap: 0.25rem;
}

/* ---- Slots ---- */
.leading,
.trailing {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0.25rem;
}

.leading {
  --icon-color: var(--_app-bar-leading-icon-color);
}

.trailing {
  --icon-color: var(--_app-bar-trailing-icon-color);
}

.headline {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: var(--typescale-title-large-font);
  font-size: var(--typescale-title-large-size);
  font-weight: var(--typescale-title-large-weight);
  line-height: var(--typescale-title-large-line-height);
  letter-spacing: var(--typescale-title-large-tracking);
  color: var(--_app-bar-headline-color);
  padding-inline: 0.75rem;
}

/* ---- Small variant (default) ---- */
:host([variant=small]) .headline,
:host(:not([variant])) .headline {
  text-align: start;
}

/* ---- Center-aligned variant ---- */
:host([variant=center-aligned]) .headline {
  text-align: center;
}

/* ---- Medium variant ---- */
:host([variant=medium]) .row-top .headline {
  display: none;
}
:host([variant=medium]) .row-bottom {
  height: 3rem; /* 48dp */
  padding-inline: calc(var(--app-bar-padding-inline) + 1rem);
  padding-block-end: 0.5rem;
  align-items: flex-end;
}
:host([variant=medium]) .row-bottom .headline {
  font: var(--typescale-headline-small-font, inherit);
  font-size: var(--typescale-headline-small-size, 1.5rem);
  font-weight: var(--typescale-headline-small-weight, 400);
  line-height: var(--typescale-headline-small-line-height, 2rem);
  letter-spacing: var(--typescale-headline-small-tracking, 0);
  padding-inline: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* ---- Large variant ---- */
:host([variant=large]) .row-top .headline {
  display: none;
}
:host([variant=large]) .row-bottom {
  height: 5.5rem; /* 88dp */
  padding-inline: calc(var(--app-bar-padding-inline) + 1rem);
  padding-block-end: 1.75rem;
  align-items: flex-end;
}
:host([variant=large]) .row-bottom .headline {
  font: var(--typescale-headline-medium-font, inherit);
  font-size: var(--typescale-headline-medium-size, 1.75rem);
  font-weight: var(--typescale-headline-medium-weight, 400);
  line-height: var(--typescale-headline-medium-line-height, 2.25rem);
  letter-spacing: var(--typescale-headline-medium-tracking, 0);
  padding-inline: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* ---- Scrolled state ---- */
:host([scrolled]) {
  --app-bar-shadow: var(--elevation-shadow-level-2, 0 2px 4px rgba(0, 0, 0, 0.12));
}`;

var css_248z = i`:host {
  --app-bar-container-color: var(--color-surface);
  --app-bar-headline-color: var(--color-on-surface);
  --app-bar-leading-icon-color: var(--color-on-surface);
  --app-bar-trailing-icon-color: var(--color-on-surface-variant);
  /* Internal aliases */
  --_app-bar-container-color: var(--app-bar-container-color);
  --_app-bar-headline-color: var(--app-bar-headline-color);
  --_app-bar-leading-icon-color: var(--app-bar-leading-icon-color);
  --_app-bar-trailing-icon-color: var(--app-bar-trailing-icon-color);
}

/* Scrolled state uses surface-container for slight tonal elevation */
:host([scrolled]) {
  --app-bar-container-color: var(--color-surface-container);
}`;

/**
 * @label App Bar
 * @tag wc-app-bar
 * @rawTag app-bar
 *
 * @summary A top app bar for page-level navigation and actions.
 * @overview
 * <p>The app bar component implements the top app bar pattern. It provides a
 * consistent header for screens, housing a navigation icon, a page title/headline, and
 * optional trailing action icons.</p>
 *
 * <p>Four size variants are available: <strong>small</strong> (64dp, single-row),
 * <strong>center-aligned</strong> (64dp, centred headline), <strong>medium</strong>
 * (112dp, headline below the row), and <strong>large</strong> (152dp, large headline).</p>
 *
 * <p>Use the <code>leading</code> slot for a navigation icon (e.g. a hamburger or back
 * button), the default slot for the headline text, and the <code>trailing</code> slot for
 * action icon buttons.</p>
 *
 * @slot leading - Navigation icon placed at the start of the bar.
 * @slot - Headline / title text.
 * @slot trailing - Trailing action icon buttons placed at the end of the bar.
 *
 * @cssprop --app-bar-container-color - Background color of the app bar.
 * @cssprop --app-bar-container-height - Height of the bar in small / center-aligned variants.
 * @cssprop --app-bar-headline-color - Color of the headline text.
 * @cssprop --app-bar-leading-icon-color - Color of the leading slot icons.
 * @cssprop --app-bar-trailing-icon-color - Color of the trailing slot icons.
 * @cssprop --app-bar-shadow - Box-shadow applied when the bar is scrolled / elevated.
 *
 * @example
 * ```html
 * <!-- Small app bar (default) -->
 * <wc-app-bar>
 *   <wc-icon-button slot="leading" variant="text"><wc-icon name="menu"></wc-icon></wc-icon-button>
 *   Page Title
 *   <wc-icon-button slot="trailing" variant="text"><wc-icon name="search"></wc-icon></wc-icon-button>
 *   <wc-icon-button slot="trailing" variant="text"><wc-icon name="more_vert"></wc-icon></wc-icon-button>
 * </wc-app-bar>
 * ```
 *
 * @example
 * ```html
 * <!-- Center-aligned app bar -->
 * <wc-app-bar variant="center-aligned">
 *   <wc-icon-button slot="leading" variant="text"><wc-icon name="arrow_back"></wc-icon></wc-icon-button>
 *   Details
 *   <wc-icon-button slot="trailing" variant="text"><wc-icon name="more_vert"></wc-icon></wc-icon-button>
 * </wc-app-bar>
 * ```
 *
 * @example
 * ```html
 * <!-- Medium app bar -->
 * <wc-app-bar variant="medium">
 *   <wc-icon-button slot="leading" variant="text"><wc-icon name="menu"></wc-icon></wc-icon-button>
 *   Medium Headline
 *   <wc-icon-button slot="trailing" variant="text"><wc-icon name="search"></wc-icon></wc-icon-button>
 * </wc-app-bar>
 * ```
 *
 * @example
 * ```html
 * <!-- Large app bar -->
 * <wc-app-bar variant="large">
 *   <wc-icon-button slot="leading" variant="text"><wc-icon name="arrow_back"></wc-icon></wc-icon-button>
 *   Large Headline
 *   <wc-icon-button slot="trailing" variant="text"><wc-icon name="more_vert"></wc-icon></wc-icon-button>
 * </wc-app-bar>
 * ```
 * @tags navigation display
 */
let AppBar = class AppBar extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Visual variant of the app bar.
         * - `"small"`: 64dp single-row bar with leading, title, and trailing (default).
         * - `"center-aligned"`: 64dp single-row bar with a centred headline.
         * - `"medium"`: Two-row bar (64dp top row + 48dp headline row).
         * - `"large"`: Two-row bar with a larger headline (64dp top row + 88dp headline row).
         */
        this.variant = 'small';
        /**
         * Whether the bar is in its scrolled state, which adds a shadow and optionally
         * changes the container color to indicate elevation above page content.
         */
        this.scrolled = false;
    }
    render() {
        const isTwoRow = this.variant === 'medium' || this.variant === 'large';
        const cssClasses = {
            'app-bar': true,
            [`variant-${this.variant}`]: true,
            scrolled: this.scrolled,
        };
        if (isTwoRow) {
            return this.__renderTwoRow(cssClasses);
        }
        return this.__renderSingleRow(cssClasses);
    }
    __renderSingleRow(cssClasses) {
        return b `
      <header class=${e(cssClasses)} role="banner">
        <div class="background"></div>
        <div class="row row-top">
          <div class="leading">
            <slot name="leading"></slot>
          </div>
          <div class="headline">
            <slot></slot>
          </div>
          <div class="trailing">
            <slot name="trailing"></slot>
          </div>
        </div>
      </header>
    `;
    }
    __renderTwoRow(cssClasses) {
        return b `
      <header class=${e(cssClasses)} role="banner">
        <div class="background"></div>
        <div class="row row-top">
          <div class="leading">
            <slot name="leading"></slot>
          </div>
          <div class="trailing">
            <slot name="trailing"></slot>
          </div>
        </div>
        <div class="row row-bottom">
          <div class="headline">
            <slot></slot>
          </div>
        </div>
      </header>
    `;
    }
};
AppBar.styles = [css_248z$1, css_248z];
__decorate([
    n({ type: String, reflect: true })
], AppBar.prototype, "variant", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], AppBar.prototype, "scrolled", void 0);
AppBar = __decorate([
    IndividualComponent
], AppBar);

export { AppBar };
//# sourceMappingURL=app-bar.js.map
