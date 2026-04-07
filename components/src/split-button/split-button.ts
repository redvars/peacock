import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './split-button.scss';
import colorStyles from './split-button-colors.scss';
import sizeStyles from './split-button-sizes.scss';

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

  @state() private _menuOpen = false;

  @query('.dropdown-trigger') private readonly _dropdownButton!: HTMLButtonElement;

  @query('wc-menu') private readonly _menu!: HTMLElement & {
    open: boolean;
    anchorElement: HTMLElement | null;
    show: () => void;
    close: () => void;
  };

  private _menuId = `split-menu-${Math.random().toString(36).slice(2, 9)}`;

  override focus() {
    const btn =
      this.shadowRoot?.querySelector<HTMLButtonElement>('.action-button');
    btn?.focus();
  }

  private _onActionClick(event: MouseEvent) {
    if (this.disabled) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    // Close menu if open
    if (this._menuOpen) {
      this._menu?.close();
    }
  }

  private _onDropdownClick(event: MouseEvent) {
    event.stopPropagation();
    if (this.disabled) return;

    if (this._menuOpen) {
      this._menu?.close();
    } else {
      this._menu.anchorElement = this;
      this._menu?.show();
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

  private _onKeyDown = (event: KeyboardEvent) => {
    if (this.disabled) return;

    if (
      event.key === 'ArrowDown' &&
      event.target === this._dropdownButton
    ) {
      event.preventDefault();
      if (!this._menuOpen) {
        this._menu.anchorElement = this;
        this._menu?.show();
      }
      // Focus the menu so keyboard nav works
      requestAnimationFrame(() => this._menu?.focus());
    }

    if (event.key === 'Escape' && this._menuOpen) {
      this._menu?.close();
      this._dropdownButton?.focus();
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._onKeyDown);
  }

  override disconnectedCallback() {
    this.removeEventListener('keydown', this._onKeyDown);
    super.disconnectedCallback();
  }

  override render() {
    const actionClasses = {
      'action-button': true,
      'button-reset': true,
      disabled: this.disabled,
    };

    const dropdownClasses = {
      'dropdown-trigger': true,
      'button-reset': true,
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
        <button
          class=${classMap(actionClasses)}
          ?disabled=${this.disabled}
          @click=${this._onActionClick}
        >
          <wc-ripple class="ripple"></wc-ripple>
          <div class="action-content">
            <slot></slot>
          </div>
        </button>

        <div class="divider-line"></div>

        <button
          class=${classMap(dropdownClasses)}
          ?disabled=${this.disabled}
          aria-haspopup="menu"
          aria-expanded=${String(this._menuOpen)}
          aria-controls=${this._menuId}
          @click=${this._onDropdownClick}
        >
          <wc-ripple class="ripple"></wc-ripple>
          <svg class="dropdown-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>

        <wc-focus-ring class="focus-ring" for="action"></wc-focus-ring>
        <wc-elevation class="elevation"></wc-elevation>
        <div class="background"></div>
        <div class="outline"></div>
      </div>

      <wc-menu
        id=${this._menuId}
        placement="bottom-end"
        @opened=${this._onMenuOpened}
        @closed=${this._onMenuClosed}
      >
        <slot name="menu"></slot>
      </wc-menu>
    `;
  }
}
