import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { MenuTriggerController } from '@/__internal/menu-trigger-controller.js';
import type { OverlayPlacement } from '@/__internal/utils/placement.js';
import styles from './split-button.scss';
import colorStyles from './split-button-colors.scss';
import sizeStyles from './split-button-sizes.scss';
import type { Menu, MenuFocusTarget } from '../menu/menu/menu.js';

/**
 * @label Split Button
 * @tag wc-split-button
 * @rawTag split-button
 *
 * @summary A button for a default action joined to an arrow that opens a menu of related actions.
 * @overview
 * <p>The main button runs the default action; the arrow beside it opens a menu of related actions.</p>
 *
 * @cssprop --split-button-container-shape: Radius of the split button's outer corners. Defaults to fully round; the inner corners follow the M3 size tokens.
 * @cssprop --split-button-gap: Space between the main button and the menu button. Defaults to 2px.
 *
 * @cssprop --filled-split-button-container-color: Color of the filled split button container.
 * @cssprop --filled-split-button-label-text-color: Text color of the filled split button label.
 *
 * @cssprop --outlined-split-button-container-color: Color of the outlined split button container.
 * @cssprop --outlined-split-button-label-text-color: Text color of the outlined split button label.
 *
 * @cssprop --tonal-split-button-container-color: Color of the tonal split button container.
 * @cssprop --tonal-split-button-label-text-color: Text color of the tonal split button label.
 *
 * @cssprop --elevated-split-button-container-color: Color of the elevated split button container.
 * @cssprop --elevated-split-button-label-text-color: Text color of the elevated split button label.
 *
 * @fires {MouseEvent} click - Dispatched when the primary action button is clicked.
 * @fires {CustomEvent} open - Dispatched after the menu opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Dispatched after the menu closes: an item pick is `action`, Escape `escape`, a press outside or Tab `light-dismiss`, `close()` or the primary action `api`.
 *
 * @example
 * ```html
 * <wc-split-button>
 *   Save
 *   <wc-menu-item slot="menu">Save as draft</wc-menu-item>
 *   <wc-menu-item slot="menu">Save and publish</wc-menu-item>
 * </wc-split-button>
 * ```
 * @tags controls
 */
@IndividualComponent
export class SplitButton extends LitElement {
  static override styles = [styles, colorStyles, sizeStyles];

  /**
   * Button size.
   * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
   */
  @property({ reflect: true }) size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'sm';

  /**
   * The visual style of the split button.
   *
   * Possible variant values:
   * `"filled"` is a filled button.
   * `"outlined"` is an outlined button.
   * `"tonal"` is a light color button.
   * `"elevated"` is a raised button on a low surface.
   */
  @property({ reflect: true }) variant:
    | 'filled'
    | 'tonal'
    | 'elevated'
    | 'outlined' = 'filled';

  /**
   * Defines the primary color of the split button.
   */
  @property({ reflect: true }) color:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'surface'
    | 'on-surface' = 'primary';

  /**
   * Whether the split button is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Visual variant of the menu: one surface (`"standard"`) or segmented groups (`"expressive"`). */
  @property({ attribute: 'menu-variant' }) menuVariant:
    | 'standard'
    | 'expressive' = 'standard';

  /**
   * Where the menu opens relative to the button: `top`, `bottom`, `start` or `end`, optionally
   * followed by `-start` or `-end` (ADR-030001). `start` and `end` follow the writing direction.
   * Defaults to `"bottom-end"`.
   */
  @property({ reflect: true }) placement: OverlayPlacement = 'bottom-end';

  @query('wc-menu') private readonly _menu?: Menu;

  /** Peacock's strings for the menu trigger label. */
  private readonly i18n = new I18nController(this);

  /** Opens and closes the menu and fires `open` / `close`. */
  private readonly _trigger = new MenuTriggerController(this, {
    menu: () => this._menu,
    disabled: () => this.disabled,
    idPrefix: 'split-menu',
  });

  override focus() {
    const btn = this.shadowRoot?.querySelector<HTMLElement>('.action-button');
    btn?.focus();
  }

  /** Opens the menu and focuses its first (or last) item. */
  show(focusTarget: MenuFocusTarget = 'first') {
    this._trigger.show(focusTarget);
  }

  /** Closes the menu. */
  close() {
    this._trigger.close();
  }

  private _onActionClick(event: MouseEvent) {
    if (this.disabled) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    // The primary action closes the menu if it is open.
    if (this._menu?.open) {
      this._trigger.close();
    }
  }

  override render() {
    const actionClasses = {
      'action-button': true,
      disabled: this.disabled,
    };

    const dropdownClasses = {
      'dropdown-trigger': true,
      active: this._trigger.open,
      disabled: this.disabled,
    };

    const containerClasses = {
      'split-button': true,
      [`variant-${this.variant}`]: true,
      disabled: this.disabled,
    };

    return html`
      <div class=${classMap(containerClasses)}>
        <wc-button
          class=${classMap(actionClasses)}
          size=${this.size}
          variant=${this.variant}
          ?disabled=${this.disabled}
          @click=${this._onActionClick}
        >
          <slot></slot>
        </wc-button>

        <wc-icon-button
          class=${classMap(dropdownClasses)}
          size=${this.size}
          variant=${this.variant}
          ?disabled=${this.disabled}
          aria-label=${this.i18n.t('openSplitButtonMenu')}
          aria-haspopup="menu"
          aria-expanded=${String(this._trigger.open)}
          @click=${this._trigger.handleTriggerClick}
          @keydown=${this._trigger.handleTriggerKeyDown}
        >
          <wc-icon
            class="dropdown-icon"
            name="keyboard_arrow_down"
            aria-hidden="true"
          ></wc-icon>
        </wc-icon-button>
      </div>

      <wc-menu
        id=${this._trigger.menuId}
        .placement=${this.placement}
        variant=${this.menuVariant}
        @open=${this._trigger.handleMenuOpen}
        @close=${this._trigger.handleMenuClose}
      >
        <slot name="menu"></slot>
      </wc-menu>
    `;
  }
}
