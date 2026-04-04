import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './toolbar.scss';
import colorStyles from './toolbar-colors.scss';

/**
 * @label Toolbar
 * @tag wc-toolbar
 * @rawTag toolbar
 *
 * @summary A Material 3 toolbar / app bar for navigation and actions.
 * @overview
 * <p>The toolbar component implements the Material 3 app bar pattern. It supports a
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
 *   <wc-icon-button variant="text"><wc-icon name="home"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="tonal"><wc-icon name="search"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="text"><wc-icon name="favorite"></wc-icon></wc-icon-button>
 *   <wc-icon-button variant="text"><wc-icon name="account_circle"></wc-icon></wc-icon-button>
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
@IndividualComponent
export class Toolbar extends LitElement {
  static styles = [styles, colorStyles];

  /**
   * Visual and layout variant of the toolbar.
   * - `"docked"`: A full-width bar attached to the edge of the screen (default).
   * - `"floating"`: A detached pill-shaped toolbar that floats over content.
   */
  @property({ type: String, reflect: true })
  variant: 'docked' | 'floating' = 'docked';

  /**
   * Orientation of the toolbar content.
   * - `"horizontal"`: Items are laid out left to right (default).
   * - `"vertical"`: Items are stacked top to bottom. Primarily useful for the floating variant.
   */
  @property({ type: String, reflect: true })
  orientation: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * Size of the docked toolbar.
    * - `"small"`: 80dp height (default).
    * - `"medium"`: 96dp height.
    * - `"large"`: 112dp height.
   */
  @property({ type: String, reflect: true })
  size: 'small' | 'medium' | 'large' = 'small';

  /**
   * Whether the toolbar is visually elevated (adds a shadow).
   */
  @property({ type: Boolean, reflect: true })
  elevated: boolean = false;

  override render() {
    const cssClasses = {
      toolbar: true,
      [`variant-${this.variant}`]: true,
      [`orientation-${this.orientation}`]: true,
      [`size-${this.size}`]: true,
      elevated: this.elevated,
    };

    if (this.variant === 'floating') {
      return Toolbar.__renderFloating(cssClasses);
    }

    return Toolbar.__renderDocked(cssClasses);
  }

  private static __renderDocked(cssClasses: Record<string, boolean>) {
    return html`
      <div class=${classMap(cssClasses)} role="toolbar">
        <div class="background"></div>
        <div class="toolbar-content">
          <slot></slot>
        </div>
      </div>
    `;
  }

  private static __renderFloating(cssClasses: Record<string, boolean>) {
    return html`
      <div class=${classMap(cssClasses)} role="toolbar">
        <wc-elevation class="elevation"></wc-elevation>
        <div class="background"></div>
        <div class="toolbar-content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
