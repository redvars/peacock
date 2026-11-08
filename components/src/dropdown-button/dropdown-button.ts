import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { MenuTriggerController } from '@/__internal/menu-trigger-controller.js';
import type { OverlayPlacement } from '@/__internal/utils/placement.js';
import styles from './dropdown-button.scss';
import type { Menu, MenuFocusTarget } from '../menu/menu/menu.js';

/**
 * @label Dropdown Button
 * @tag wc-dropdown-button
 * @rawTag dropdown-button
 *
 * @summary A button that opens a menu of actions or options.
 * @overview
 * <p>Clicking the button opens its menu, and clicking it again closes it.</p>
 *
 * @cssprop --dropdown-button-container-shape: Defines the border radius of the dropdown button container shape.
 *
 * @fires {CustomEvent} open - Dispatched after the menu opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Dispatched after the menu closes: an item pick is `action`, Escape `escape`, a press outside or Tab `light-dismiss`, `close()` `api`.
 *
 * @example
 * ```html
 * <wc-dropdown-button>
 *   Actions
 *   <wc-menu-item slot="menu">Edit</wc-menu-item>
 *   <wc-menu-item slot="menu">Delete</wc-menu-item>
 * </wc-dropdown-button>
 * ```
 * @tags controls
 */
@IndividualComponent
export class DropdownButton extends LitElement {
  static override styles = [styles];

  /**
   * Button size.
   * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
   */
  @property({ reflect: true }) size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'sm';

  /**
   * The visual style of the dropdown button.
   *
   * Possible variant values:
   * `"filled"` is a filled button.
   * `"outlined"` is an outlined button.
   * `"text"` is a transparent button.
   * `"tonal"` is a light color button.
   * `"elevated"` is an elevated button.
   */
  @property({ reflect: true }) variant:
    | 'elevated'
    | 'filled'
    | 'tonal'
    | 'outlined'
    | 'text' = 'filled';

  /**
   * Defines the primary color of the dropdown button.
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
   * Whether the dropdown button is disabled.
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Where the menu opens relative to the button: `top`, `bottom`, `start` or `end`, optionally
   * followed by `-start` or `-end` (ADR-030001). `start` and `end` follow the writing direction.
   * Defaults to `"bottom-start"`.
   */
  @property({ reflect: true }) placement: OverlayPlacement = 'bottom-start';

  /** Visual variant of the menu: one surface (`"standard"`) or segmented groups (`"expressive"`). */
  @property({ attribute: 'menu-variant' }) menuVariant:
    | 'standard'
    | 'expressive' = 'standard';

  @query('.trigger-button') private readonly _triggerButton?: HTMLElement;

  @query('wc-menu') private readonly _menu?: Menu;

  /** Opens and closes the menu and fires `open` / `close`. */
  private readonly _trigger = new MenuTriggerController(this, {
    menu: () => this._menu,
    disabled: () => this.disabled,
    idPrefix: 'dropdown-menu',
  });

  override focus() {
    this._triggerButton?.focus();
  }

  /** Opens the menu and focuses its first (or last) item. */
  show(focusTarget: MenuFocusTarget = 'first') {
    this._trigger.show(focusTarget);
  }

  /** Closes the menu. */
  close() {
    this._trigger.close();
  }

  override render() {
    const buttonClasses = {
      'trigger-button': true,
      active: this._trigger.open,
      disabled: this.disabled,
    };

    return html`
      <wc-button
        class=${classMap(buttonClasses)}
        size=${this.size}
        variant=${this.variant}
        color=${this.color}
        trailing-icon
        ?disabled=${this.disabled}
        aria-haspopup="menu"
        aria-expanded=${String(this._trigger.open)}
        @click=${this._trigger.handleTriggerClick}
        @keydown=${this._trigger.handleTriggerKeyDown}
      >
        <slot></slot>
        <wc-icon
          slot="icon"
          name="arrow_drop_down"
          class="dropdown-icon"
          aria-hidden="true"
        ></wc-icon>
      </wc-button>

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
