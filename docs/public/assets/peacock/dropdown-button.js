import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-DG7CA1et.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  display: inline-flex;
  position: relative;
  --dropdown-button-container-shape: var(--shape-corner-medium);
}

.trigger-button {
  --button-container-shape: var(--dropdown-button-container-shape);
}

.dropdown-icon {
  transition: transform 200ms ease;
}

.trigger-button.active .dropdown-icon {
  transform: rotate(180deg);
}`;

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
let DropdownButton = class DropdownButton extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Button size.
         * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
         */
        this.size = 'sm';
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
        this.variant = 'filled';
        /**
         * Defines the primary color of the dropdown button.
         */
        this.color = 'primary';
        /**
         * Whether the dropdown button is disabled.
         */
        this.disabled = false;
        /**
         * Menu placement relative to the button.
         * Possible values are `"bottom-start"`, `"bottom-end"`, `"top-start"`, `"top-end"`. Defaults to `"bottom-start"`.
         */
        this.placement = 'bottom-start';
        this._menuOpen = false;
        this._menuId = `dropdown-menu-${Math.random().toString(36).slice(2, 9)}`;
        this._onMenuOpened = () => {
            this._menuOpen = true;
            this.dispatchEvent(new CustomEvent('toggle-menu', {
                detail: { open: true },
                bubbles: true,
                composed: true,
            }));
        };
        this._onMenuClosed = () => {
            this._menuOpen = false;
            this.dispatchEvent(new CustomEvent('toggle-menu', {
                detail: { open: false },
                bubbles: true,
                composed: true,
            }));
        };
        this._onKeyDown = (event) => {
            if (this.disabled)
                return;
            if (event.key === 'ArrowDown' && !this._menuOpen) {
                event.preventDefault();
                this._menu.anchorElement = this;
                this._menu?.show();
                requestAnimationFrame(() => this._menu?.focus());
            }
            if (event.key === 'Escape' && this._menuOpen) {
                this._menu?.close();
                this._triggerButton?.focus();
            }
        };
    }
    focus() {
        this._triggerButton?.focus();
    }
    _onButtonClick(event) {
        event.stopPropagation();
        if (this.disabled)
            return;
        if (this._menuOpen) {
            this._menu?.close();
        }
        else {
            this._menu.anchorElement = this;
            this._menu?.show();
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('keydown', this._onKeyDown);
    }
    disconnectedCallback() {
        this.removeEventListener('keydown', this._onKeyDown);
        super.disconnectedCallback();
    }
    render() {
        const buttonClasses = {
            'trigger-button': true,
            active: this._menuOpen,
            disabled: this.disabled,
        };
        return b `
      <wc-button
        class=${e$1(buttonClasses)}
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
        @opened=${this._onMenuOpened}
        @closed=${this._onMenuClosed}
      >
        <slot name="menu"></slot>
      </wc-menu>
    `;
    }
};
DropdownButton.styles = [css_248z];
__decorate([
    n({ reflect: true })
], DropdownButton.prototype, "size", void 0);
__decorate([
    n({ reflect: true })
], DropdownButton.prototype, "variant", void 0);
__decorate([
    n({ reflect: true })
], DropdownButton.prototype, "color", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], DropdownButton.prototype, "disabled", void 0);
__decorate([
    n({ reflect: true })
], DropdownButton.prototype, "placement", void 0);
__decorate([
    r()
], DropdownButton.prototype, "_menuOpen", void 0);
__decorate([
    e('.trigger-button')
], DropdownButton.prototype, "_triggerButton", void 0);
__decorate([
    e('wc-menu')
], DropdownButton.prototype, "_menu", void 0);
DropdownButton = __decorate([
    IndividualComponent
], DropdownButton);

export { DropdownButton };
//# sourceMappingURL=dropdown-button.js.map
