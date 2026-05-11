import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './app-bar.scss';
import colorStyles from './app-bar-colors.scss';

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
@IndividualComponent
export class AppBar extends LitElement {
  static styles = [styles, colorStyles];

  /**
   * Visual variant of the app bar.
   * - `"small"`: 64dp single-row bar with leading, title, and trailing (default).
   * - `"center-aligned"`: 64dp single-row bar with a centred headline.
   * - `"medium"`: Two-row bar (64dp top row + 48dp headline row).
   * - `"large"`: Two-row bar with a larger headline (64dp top row + 88dp headline row).
   */
  @property({ type: String, reflect: true })
  variant: 'small' | 'center-aligned' | 'medium' | 'large' = 'small';

  /**
   * Whether the bar is in its scrolled state, which adds a shadow and optionally
   * changes the container color to indicate elevation above page content.
   */
  @property({ type: Boolean, reflect: true })
  scrolled: boolean = false;

  override render() {
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

  private __renderSingleRow(cssClasses: Record<string, boolean>) {
    return html`
      <header class=${classMap(cssClasses)} role="banner">
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

  private __renderTwoRow(cssClasses: Record<string, boolean>) {
    return html`
      <header class=${classMap(cssClasses)} role="banner">
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
}
