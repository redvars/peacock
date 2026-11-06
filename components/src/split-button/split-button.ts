import { html, LitElement, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { migrateLegacySize } from '@/__internal/utils/size.js';
import styles from './split-button.scss';
import colorStyles from './split-button-colors.scss';
import sizeStyles from './split-button-sizes.scss';
import type { Menu, MenuFocusTarget } from '../menu/menu/menu.js';

/**
 * @label Split Button
 * @tag wc-split-button
 * @rawTag split-button
 *
 * @summary A split button lets users perform a default action or choose from a set of related actions via a dropdown menu.
 * @overview
 * <p>A split button combines a primary action button with a dropdown arrow that opens a menu. Following M3 Material Design, the split button provides a default action alongside a set of secondary options, reducing clutter while keeping alternative actions accessible.</p>
 *
 * @cssprop --split-button-container-shape: Defines the border radius of the split button container shape.
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
 * @fires {MouseEvent} click - Dispatched when the primary action button is clicked.
 * @fires {CustomEvent} toggle-menu - Dispatched when the dropdown menu is opened or closed.
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
   */
  @property({ reflect: true }) variant: 'filled' | 'tonal' | 'outlined' =
    'filled';

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

  @state() private _menuOpen = false;

  @query('wc-menu') private readonly _menu?: Menu;

  private _menuId = `split-menu-${Math.random().toString(36).slice(2, 9)}`;

  /** Peacock's strings for the menu trigger label. */
  private readonly i18n = new I18nController(this);

  override willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('size')) {
      const size = migrateLegacySize('wc-split-button', this.size);
      if (size) this.size = size;
    }
  }

  override focus() {
    const btn =
      this.shadowRoot?.querySelector<HTMLElement>('.action-button');
    btn?.focus();
  }

  private _onActionClick(event: MouseEvent) {
    if (this.disabled) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    // Close menu if open
    if (this._menu?.open) {
      this._menu.close();
    }
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

  private _onDropdownClick(event: MouseEvent) {
    event.stopPropagation();
    if (this.disabled) return;

    if (this._menu?.open) {
      this.close();
    } else {
      this.show();
    }
  }

  /** Arrow keys on the menu trigger open the menu on the first or last item. */
  private _onTriggerKeyDown(event: KeyboardEvent) {
    if (this.disabled) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.show(event.key === 'ArrowDown' ? 'first' : 'last');
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

  override render() {
    const actionClasses = {
      'action-button': true,
      disabled: this.disabled,
    };

    const dropdownClasses = {
      'dropdown-trigger': true,
      active: this._menuOpen,
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
          .configAria=${{
            'aria-haspopup': 'menu',
            'aria-expanded': String(this._menuOpen),
            'aria-controls': this._menuId,
            'aria-label': this.i18n.t('openSplitButtonMenu'),
          }}
          @click=${this._onDropdownClick}
          @keydown=${this._onTriggerKeyDown}
        >
          <wc-icon class="dropdown-icon" name="arrow_drop_down" aria-hidden="true"></wc-icon>
        </wc-icon-button>
      </div>

      <wc-menu
        id=${this._menuId}
        placement="bottom-end"
        variant=${this.menuVariant}
        @opened=${this._onMenuOpened}
        @closed=${this._onMenuClosed}
      >
        <slot name="menu"></slot>
      </wc-menu>
    `;
  }
}
