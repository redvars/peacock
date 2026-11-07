import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { RovingFocusController } from '@/__internal/controllers/roving-focus-controller.js';
import styles from './toolbar.scss';
import colorStyles from './toolbar-colors.scss';

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
@IndividualComponent
export class Toolbar extends LitElement {
  // ── Static
  static styles = [styles, colorStyles];

  // ── Properties

  /**
   * Visual variant of the toolbar.
   * - `"floating"`: An elevated pill that floats over content (default).
   * - `"flat"`: No container, fill or elevation; for embedding in existing chrome.
   */
  @property({ type: String, reflect: true })
  variant: 'floating' | 'flat' = 'floating';

  /**
   * Orientation of the toolbar. It sets the layout direction and the arrow keys that move focus
   * (Left/Right for horizontal, Up/Down for vertical).
   */
  @property({ type: String, reflect: true })
  orientation: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * Raises the floating toolbar to a higher elevation. Has no effect on the flat variant.
   */
  @property({ type: Boolean, reflect: true })
  elevated: boolean = false;

  // ── Private fields

  /** The toolbar's single tab stop, moved with the arrow keys along its orientation. */
  private readonly roving = new RovingFocusController(this, {
    items: () => this.__getItems(),
    orientation: () => this.orientation,
  });

  // ── Lifecycle

  override connectedCallback() {
    super.connectedCallback();
    // The role lives on the host so the host's aria-label names the toolbar.
    this.setAttribute('role', 'toolbar');
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('orientation')) {
      this.setAttribute('aria-orientation', this.orientation);
    }
  }

  // ── Private methods

  /** Actions that can take focus, in slot order. */
  private __getItems(): HTMLElement[] {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return [];
    return slot
      .assignedElements({ flatten: true })
      .filter(
        (el): el is HTMLElement =>
          el instanceof HTMLElement &&
          !el.matches(SEPARATOR_SELECTOR) &&
          !el.hasAttribute('disabled') &&
          el.getAttribute('aria-disabled') !== 'true' &&
          !el.hidden,
      );
  }

  private __handleSlotChange = () => {
    this.roving.sync();
  };

  // ── Render

  override render() {
    const floating = this.variant === 'floating';
    const cssClasses = {
      toolbar: true,
      [`variant-${this.variant}`]: true,
      [`orientation-${this.orientation}`]: true,
      elevated: floating && this.elevated,
    };

    return html`
      <div
        class=${classMap(cssClasses)}
        @keydown=${this.roving.handleKeyDown}
        @focusin=${this.roving.handleFocusIn}
      >
        ${floating
          ? html`<wc-elevation class="elevation"></wc-elevation>`
          : nothing}
        <div class="background"></div>
        <div class="toolbar-content">
          <slot @slotchange=${this.__handleSlotChange}></slot>
        </div>
      </div>
    `;
  }
}
