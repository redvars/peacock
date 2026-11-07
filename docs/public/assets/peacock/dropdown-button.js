import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-NDIkZErE.js';
import { M as MenuTriggerController } from './menu-trigger-controller-DyLpTxM7.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
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
         * Where the menu opens relative to the button: `top`, `bottom`, `start` or `end`, optionally
         * followed by `-start` or `-end` (ADR-030001). `start` and `end` follow the writing direction.
         * Defaults to `"bottom-start"`.
         */
        this.placement = 'bottom-start';
        /** Visual variant of the menu: one surface (`"standard"`) or segmented groups (`"expressive"`). */
        this.menuVariant = 'standard';
        /** Opens and closes the menu and fires `open` / `close`. */
        this._trigger = new MenuTriggerController(this, {
            menu: () => this._menu,
            disabled: () => this.disabled,
            idPrefix: 'dropdown-menu',
        });
    }
    focus() {
        this._triggerButton?.focus();
    }
    /** Opens the menu and focuses its first (or last) item. */
    show(focusTarget = 'first') {
        this._trigger.show(focusTarget);
    }
    /** Closes the menu. */
    close() {
        this._trigger.close();
    }
    render() {
        const buttonClasses = {
            'trigger-button': true,
            active: this._trigger.open,
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
        .configAria=${this._trigger.triggerAria}
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
    n({ attribute: 'menu-variant' })
], DropdownButton.prototype, "menuVariant", void 0);
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
