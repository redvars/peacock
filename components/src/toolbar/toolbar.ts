import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './toolbar.scss';
import colorStyles from './toolbar-colors.scss';
import { observerSlotChangesWithCallback } from '@/__utils/observe-slot-change.js';

/**
 * @label Toolbar
 * @tag wc-toolbar
 * @rawTag toolbar
 *
 * @summary A Material 3 toolbar / app bar for navigation and actions.
 * @overview
 * <p>The toolbar component implements the Material 3 app bar pattern. It supports a
 * docked (attached) variant for top navigation and a floating (detached pill-shaped)
 * variant. The floating variant supports both horizontal and vertical orientations.</p>
 *
 * <p>Use the <code>start</code> slot for navigation icons or leading actions,
 * the default slot for a title or central content, and the <code>end</code> slot
 * for trailing action icons.</p>
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
 *   <wc-icon-button variant="text" slot="start" name="menu"></wc-icon-button>
 *   <span>My App</span>
 *   <wc-icon-button variant="text" slot="end" name="account_circle"></wc-icon-button>
 * </wc-toolbar>
 * ```
 *
 * @example
 * ```html
 * <!-- Floating horizontal toolbar -->
 * <wc-toolbar variant="floating" orientation="horizontal">
 *   <wc-icon-button variant="tonal" name="home"></wc-icon-button>
 *   <wc-icon-button variant="text" name="search"></wc-icon-button>
 *   <wc-icon-button variant="text" name="favorite"></wc-icon-button>
 * </wc-toolbar>
 * ```
 *
 * @example
 * ```html
 * <!-- Floating vertical toolbar -->
 * <wc-toolbar variant="floating" orientation="vertical">
 *   <wc-icon-button variant="tonal" name="home"></wc-icon-button>
 *   <wc-icon-button variant="text" name="search"></wc-icon-button>
 *   <wc-icon-button variant="text" name="favorite"></wc-icon-button>
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
   * - `"small"`: 56dp height (default).
   * - `"medium"`: 112dp height – suitable for a two-line header.
   * - `"large"`: 152dp height – suitable for a prominent header.
   */
  @property({ type: String, reflect: true })
  size: 'small' | 'medium' | 'large' = 'small';

  /**
   * Whether the toolbar is visually elevated (adds a shadow).
   */
  @property({ type: Boolean, reflect: true })
  elevated: boolean = false;

  @state()
  private startSlotHasContent: boolean = false;

  @state()
  private endSlotHasContent: boolean = false;

  override firstUpdated() {
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot[name="start"]'),
      hasContent => {
        this.startSlotHasContent = hasContent;
        this.requestUpdate();
      },
    );
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot[name="end"]'),
      hasContent => {
        this.endSlotHasContent = hasContent;
        this.requestUpdate();
      },
    );
  }

  override render() {
    const cssClasses = {
      toolbar: true,
      [`variant-${this.variant}`]: true,
      [`orientation-${this.orientation}`]: true,
      [`size-${this.size}`]: true,
      elevated: this.elevated,
      'has-start': this.startSlotHasContent,
      'has-end': this.endSlotHasContent,
    };

    if (this.variant === 'floating') {
      return this.__renderFloating(cssClasses);
    }

    return this.__renderDocked(cssClasses);
  }

  private __renderDocked(cssClasses: Record<string, boolean>) {
    return html`
      <div class=${classMap(cssClasses)} role="toolbar">
        <div class="background"></div>
        <div class="toolbar-start">
          <slot name="start"></slot>
        </div>
        <div class="toolbar-center">
          <slot></slot>
        </div>
        <div class="toolbar-end">
          <slot name="end"></slot>
        </div>
      </div>
    `;
  }

  private __renderFloating(cssClasses: Record<string, boolean>) {
    return html`
      <div class=${classMap(cssClasses)} role="toolbar">
        <div class="background"></div>
        <slot name="start"></slot>
        <slot></slot>
        <slot name="end"></slot>
      </div>
    `;
  }
}
