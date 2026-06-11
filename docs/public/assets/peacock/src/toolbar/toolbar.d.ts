import { LitElement } from 'lit';
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
export declare class Toolbar extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Visual and layout variant of the toolbar.
     * - `"docked"`: A full-width bar attached to the edge of the screen (default).
     * - `"floating"`: A detached pill-shaped toolbar that floats over content.
     */
    variant: 'docked' | 'floating';
    /**
     * Orientation of the toolbar content.
     * - `"horizontal"`: Items are laid out left to right (default).
     * - `"vertical"`: Items are stacked top to bottom. Primarily useful for the floating variant.
     */
    orientation: 'horizontal' | 'vertical';
    /**
     * Size of the docked toolbar.
      * - `"small"`: 80dp height (default).
      * - `"medium"`: 96dp height.
      * - `"large"`: 112dp height.
     */
    size: 'small' | 'medium' | 'large';
    /**
     * Whether the toolbar is visually elevated (adds a shadow).
     */
    elevated: boolean;
    render(): import("lit-html").TemplateResult<1>;
    private static __renderDocked;
    private static __renderFloating;
}
