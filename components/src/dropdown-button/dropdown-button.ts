import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './dropdown-button.scss';
import type { Menu, MenuFocusTarget } from '../menu/menu/menu.js';

/**
 * @label Dropdown Button
 * @tag wc-dropdown-button
 * @rawTag dropdown-button
 *
 * @summary A button that opens a dropdown menu when clicked.
 * @overview
 * <p>The dropdown button combines a single button with a dropdown menu. Clicking the button toggles a menu of actions or options. It follows M3 Material Design, keeping a compact control while exposing related actions on demand.</p>
 *
 * @cssprop --dropdown-button-container-shape: Defines the border radius of the dropdown button container shape.
 *
 * @fires {CustomEvent} toggle-menu - Dispatched when the dropdown menu is opened or closed.
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
   * Menu placement relative to the button.
   * Possible values are `"bottom-start"`, `"bottom-end"`, `"top-start"`, `"top-end"`. Defaults to `"bottom-start"`.
   */
  @property({ reflect: true }) placement:
    | 'bottom-start'
    | 'bottom-end'
    | 'top-start'
    | 'top-end' = 'bottom-start';

  /** Visual variant of the menu: one surface (`"standard"`) or segmented groups (`"expressive"`). */
  @property({ attribute: 'menu-variant' }) menuVariant:
    | 'standard'
    | 'expressive' = 'standard';

  @state() private _menuOpen = false;

  @query('.trigger-button') private readonly _triggerButton?: HTMLElement;

  @query('wc-menu') private readonly _menu?: Menu;

  private _menuId = `dropdown-menu-${Math.random().toString(36).slice(2, 9)}`;

  override focus() {
    this._triggerButton?.focus();
  }

  /** Opens the menu and focuses its first (or last) item. */
  show(focusTarget: MenuFocusTarget = 'first') {
    const menu = this._menu;
    if (this.disabled || !menu) return;
    menu.anchorElement = this;
    menu.show(focusTarget);
  }

  /** Closes the menu. */
  close() {
    this._menu?.close();
  }

  private _onButtonClick(event: MouseEvent) {
    event.stopPropagation();
    if (this.disabled) return;

    // Read the menu itself, not cached state, so a toggle never acts on a stale value.
    if (this._menu?.open) {
      this.close();
    } else {
      this.show();
    }
  }

  private _onMenuOpened = () => {
    this._menuOpen = true;
    this.dispatchEvent(
      new CustomEvent('toggle-menu', {
        detail: { open: true },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _onMenuClosed = () => {
    this._menuOpen = false;
    this.dispatchEvent(
      new CustomEvent('toggle-menu', {
        detail: { open: false },
        bubbles: true,
        composed: true,
      }),
    );
  };

  /** Arrow keys on the trigger open the menu on the first or last item. */
  private _onTriggerKeyDown(event: KeyboardEvent) {
    if (this.disabled) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.show(event.key === 'ArrowDown' ? 'first' : 'last');
    }
  }

  override render() {
    const buttonClasses = {
      'trigger-button': true,
      active: this._menuOpen,
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
        .configAria=${{
          'aria-haspopup': 'menu',
          'aria-expanded': String(this._menuOpen),
          'aria-controls': this._menuId,
        }}
        @click=${this._onButtonClick}
        @keydown=${this._onTriggerKeyDown}
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
        id=${this._menuId}
        placement=${this.placement}
        variant=${this.menuVariant}
        @opened=${this._onMenuOpened}
        @closed=${this._onMenuClosed}
      >
        <slot name="menu"></slot>
      </wc-menu>
    `;
  }
}
