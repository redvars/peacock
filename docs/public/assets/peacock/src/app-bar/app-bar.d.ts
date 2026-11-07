import { LitElement } from 'lit';
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
 * <p>Use the <code>start</code> slot for a navigation icon (e.g. a hamburger or back
 * button), the default slot for the headline text, and the <code>end</code> slot for
 * action icon buttons.</p>
 *
 * <p>The app bar is not a landmark on its own, so it can sit in cards, panes and dialogs. For the
 * page's banner, put it in a <code>&lt;header&gt;</code> element.</p>
 *
 * @slot start - Navigation icon placed at the start of the bar.
 * @slot - Headline / title text.
 * @slot end - Action icon buttons placed at the end of the bar.
 *
 * @cssprop --app-bar-container-color - Background color of the app bar.
 * @cssprop --app-bar-container-height - Height of the bar in small / center-aligned variants.
 * @cssprop --app-bar-headline-color - Color of the headline text.
 * @cssprop --app-bar-leading-icon-color - Color of the icons in the `start` slot.
 * @cssprop --app-bar-trailing-icon-color - Color of the icons in the `end` slot.
 * @cssprop --app-bar-shadow - Box-shadow applied when the bar is scrolled / elevated.
 *
 * @example
 * ```html
 * <!-- Small app bar (default), as the page banner -->
 * <header>
 *   <wc-app-bar>
 *     <wc-icon-button slot="start" variant="text"><wc-icon name="menu"></wc-icon></wc-icon-button>
 *     Page Title
 *     <wc-icon-button slot="end" variant="text"><wc-icon name="search"></wc-icon></wc-icon-button>
 *     <wc-icon-button slot="end" variant="text"><wc-icon name="more_vert"></wc-icon></wc-icon-button>
 *   </wc-app-bar>
 * </header>
 * ```
 *
 * @example
 * ```html
 * <!-- Center-aligned app bar -->
 * <wc-app-bar variant="center-aligned">
 *   <wc-icon-button slot="start" variant="text"><wc-icon name="arrow_back"></wc-icon></wc-icon-button>
 *   Details
 *   <wc-icon-button slot="end" variant="text"><wc-icon name="more_vert"></wc-icon></wc-icon-button>
 * </wc-app-bar>
 * ```
 *
 * @example
 * ```html
 * <!-- Medium app bar -->
 * <wc-app-bar variant="medium">
 *   <wc-icon-button slot="start" variant="text"><wc-icon name="menu"></wc-icon></wc-icon-button>
 *   Medium Headline
 *   <wc-icon-button slot="end" variant="text"><wc-icon name="search"></wc-icon></wc-icon-button>
 * </wc-app-bar>
 * ```
 *
 * @example
 * ```html
 * <!-- Large app bar -->
 * <wc-app-bar variant="large">
 *   <wc-icon-button slot="start" variant="text"><wc-icon name="arrow_back"></wc-icon></wc-icon-button>
 *   Large Headline
 *   <wc-icon-button slot="end" variant="text"><wc-icon name="more_vert"></wc-icon></wc-icon-button>
 * </wc-app-bar>
 * ```
 * @tags navigation display
 */
export declare class AppBar extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Visual variant of the app bar.
     * - `"small"`: 64dp single-row bar with start, title, and end content (default).
     * - `"center-aligned"`: 64dp single-row bar with a centred headline.
     * - `"medium"`: Two-row bar (64dp top row + 48dp headline row).
     * - `"large"`: Two-row bar with a larger headline (64dp top row + 88dp headline row).
     */
    variant: 'small' | 'center-aligned' | 'medium' | 'large';
    /**
     * Whether the bar is in its scrolled state, which adds a shadow and optionally
     * changes the container color to indicate elevation above page content.
     */
    scrolled: boolean;
    private renderStart;
    private renderEnd;
    private renderSingleRow;
    private renderTwoRow;
    render(): import("lit-html").TemplateResult<1>;
}
