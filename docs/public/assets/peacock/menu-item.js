import { i, _ as __decorate, a as i$1, A, b, I as IndividualComponent } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e as e$1 } from './query-CHb9Ft_d.js';
import { o } from './if-defined-BXZpRQ4P.js';
import { N as NativeHyperlinkMixin } from './NativeHyperlinkMixin-D9J4aBTy.js';
import { i as isLink } from './is-link-Dk2OV3PM.js';
import { e } from './class-map-DG7CA1et.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

var css_248z$1 = i`* {
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
  outline: none;
  position: relative;
  --menu-item-backdrop-container-shape-start-start: none;
  --menu-item-backdrop-container-shape-start-end: none;
  --menu-item-backdrop-container-shape-end-start: none;
  --menu-item-backdrop-container-shape-end-end: none;
}

/*
  * Reset native button/link styles
  */
.native-button {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  padding: 0;
}

.native-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  outline: none;
}
.native-link:link, .native-link:visited, .native-link:hover, .native-link:active {
  text-decoration: none;
  color: inherit;
}

.menu-item {
  position: relative;
  width: 100%;
  text-align: start;
  padding-top: 2px;
  padding-inline: var(--spacing-050);
}
.menu-item .menu-item-backdrop-background {
  background-color: var(--menu-item-container-color);
  position: absolute;
  inset: 0px;
  border-start-start-radius: var(--menu-item-backdrop-container-shape-start-start);
  border-start-end-radius: var(--menu-item-backdrop-container-shape-start-end);
  border-end-start-radius: var(--menu-item-backdrop-container-shape-end-start);
  border-end-end-radius: var(--menu-item-backdrop-container-shape-end-end);
}
.menu-item .menu-item-backdrop-elevation {
  --elevation-container-shape-start-start: var(
    --menu-item-backdrop-container-shape-start-start
  );
  --elevation-container-shape-start-end: var(
    --menu-item-backdrop-container-shape-start-end
  );
  --elevation-container-shape-end-start: var(
    --menu-item-backdrop-container-shape-end-start
  );
  --elevation-container-shape-end-end: var(
    --menu-item-backdrop-container-shape-end-end
  );
  --elevation-level-block-start: var(
    --menu-item-backdrop-elevation-level-block-start
  );
  --elevation-level-block-end: var(
    --menu-item-backdrop-elevation-level-block-end
  );
  --elevation-level-inline-start: var(
    --menu-item-backdrop-elevation-level-inline-start,
    1
  );
  --elevation-level-inline-end: var(
    --menu-item-backdrop-elevation-level-inline-end,
    1
  );
}
.menu-item .menu-item-content {
  --item-height: 1.5rem;
  --item-multiline-height: 3rem;
  --item-padding-inline: 10px;
  --item-container-shape-start-start: var(
    --menu-item-container-shape-start-start
  );
  --item-container-shape-start-end: var(
    --menu-item-container-shape-start-end
  );
  --item-container-shape-end-start: var(
    --menu-item-container-shape-end-start
  );
  --item-container-shape-end-end: var(--menu-item-container-shape-end-end);
  --item-container-shape-variant: none;
  --item-label-font-family: var(--typography-label-large-font-family);
  --item-label-font-size: var(--typography-label-large-font-size);
  --item-label-font-weight: var(--typography-label-large-font-weight);
  --item-label-line-height: var(--typography-label-large-line-height);
  --item-label-letter-spacing: var(--typography-label-large-letter-spacing);
  --item-label-text-color: var(--private-item-label-text-color);
  --item-leading-trailing-color: var(--private-item-label-text-color);
  --item-supporting-text-color: var(--private-item-label-text-color);
  --item-icon-size: var(--menu-item-icon-size, var(--private-item-icon-size));
}
.menu-item .menu-item-content .background {
  background-color: var(--private-item-container-color);
  opacity: var(--_container-opacity, 1);
  border-radius: var(--shape-corner-medium);
  border-start-start-radius: var(--private-item-container-shape-start-start);
  border-start-end-radius: var(--private-item-container-shape-start-end);
  border-end-start-radius: var(--private-item-container-shape-end-start);
  border-end-end-radius: var(--private-item-container-shape-end-end);
}
.menu-item .menu-item-content .focus-ring {
  --focus-ring-container-shape-start-start: var(
    --private-item-container-shape-start-start
  );
  --focus-ring-container-shape-start-end: var(
    --private-item-container-shape-start-start
  );
  --focus-ring-container-shape-end-start: var(
    --private-item-container-shape-start-start
  );
  --focus-ring-container-shape-end-end: var(
    --private-item-container-shape-start-start
  );
  z-index: 2;
  --focus-ring-inset: 0px;
}
.menu-item .menu-item-content .ripple {
  --ripple-state-opacity: var(--_container-state-opacity, 0);
  --ripple-pressed-color: var(--_container-state-color);
  border-radius: var(--shape-corner-medium);
}
.menu-item .menu-item-content .skeleton {
  z-index: 2;
  --skeleton-container-shape-start-start: var(
    --private-item-container-shape-start-start
  );
  --skeleton-container-shape-start-end: var(
    --private-item-container-shape-start-end
  );
  --skeleton-container-shape-end-start: var(
    --private-item-container-shape-end-start
  );
  --skeleton-container-shape-end-end: var(
    --private-item-container-shape-end-end
  );
}

:host {
  --private-item-container-color: var(--menu-item-container-color);
  --private-item-label-text-color: var(--menu-item-label-color);
  --private-item-container-shape-start-start: var(--shape-corner-medium);
  --private-item-container-shape-start-end: var(--shape-corner-medium);
  --private-item-container-shape-end-start: var(--shape-corner-medium);
  --private-item-container-shape-end-end: var(--shape-corner-medium);
}

:host([selected]) {
  --private-item-container-color: var(--menu-item-container-selected-color);
  --private-item-label-text-color: var(--menu-item-label-selected-color);
  --private-item-container-shape-start-start: var(--shape-corner-large);
  --private-item-container-shape-start-end: var(--shape-corner-large);
  --private-item-container-shape-end-start: var(--shape-corner-large);
  --private-item-container-shape-end-end: var(--shape-corner-large);
}

:host([disabled]),
:host([soft-disabled]) {
  cursor: not-allowed;
  --private-item-label-text-color: var(--color-on-surface);
  --_container-opacity: 0.12;
}
:host([disabled]) .ripple,
:host([soft-disabled]) .ripple {
  display: none;
}

:host-context([variant=standard]) {
  --menu-item-container-color: var(--color-surface-container);
}

:host-context([variant=vibrant]) {
  --menu-item-container-color: var(--color-tertiary-container);
}`;

var css_248z = i`:host-context([variant=standard]) {
  --menu-item-label-color: var(--color-on-surface-variant);
  --menu-item-label-selected-color: var(--color-on-tertiary-container);
  --menu-item-container-selected-color: var(--color-tertiary-container);
}

:host-context([variant=vibrant]) {
  --menu-item-label-color: var(--color-on-tertiary-container);
  --menu-item-label-selected-color: var(--color-on-tertiary);
  --menu-item-container-selected-color: var(--color-tertiary);
}`;

/**
 * 2. Apply the type annotation to the variable.
 */
const NativeButtonMixin = (superclass) => {
    // Naming the class (BaseButtonElement) instead of using 'Mixin' or anonymous
    // prevents the "__childPart" visibility error.
    class ButtonElement extends superclass {
        constructor() {
            super(...arguments);
            /**
             * The type of the underlying `<button>` element. Maps to the native `type` attribute.
             * Possible values are `"button"`, `"submit"`, `"reset"`. Defaults to `"button"`.
             */
            this.htmlType = 'button';
            /**
             * When `true`, the button is disabled and cannot be interacted with. Reflects to the `disabled` attribute. Defaults to `false`.
             */
            this.disabled = false;
            /**
             * When `true`, the button is visually styled as disabled and cannot be interacted with, but remains focusable.
             * Use this in combination with `disabledReason` to communicate why the button is unavailable.
             * Reflects to the `soft-disabled` attribute. Defaults to `false`.
             */
            this.softDisabled = false;
            /**
             * A human-readable explanation of why the button is disabled or soft-disabled.
             * Rendered as a visually hidden tooltip and linked via `aria-describedby` for accessibility.
             * Maps to the `disabled-reason` attribute.
             */
            this.disabledReason = '';
            /**
             * The `id` of the `<form>` element to associate the button with.
             * If omitted, the button is associated with its nearest ancestor form.
             * Maps to the native `form` attribute.
             */
            this.form = '';
            /**
             * The name of the button, submitted as part of a name/value pair when the associated form is submitted.
             * Maps to the native `name` attribute.
             */
            this.name = '';
            /**
             * The value of the button, submitted as part of a name/value pair when the associated form is submitted.
             * Maps to the native `value` attribute.
             */
            this.value = '';
        }
    }
    __decorate([
        n({ type: String })
    ], ButtonElement.prototype, "htmlType", void 0);
    __decorate([
        n({ type: Boolean, reflect: true })
    ], ButtonElement.prototype, "disabled", void 0);
    __decorate([
        n({ type: Boolean, reflect: true, attribute: 'soft-disabled' })
    ], ButtonElement.prototype, "softDisabled", void 0);
    __decorate([
        n({ attribute: 'disabled-reason' })
    ], ButtonElement.prototype, "disabledReason", void 0);
    __decorate([
        n()
    ], ButtonElement.prototype, "form", void 0);
    __decorate([
        n()
    ], ButtonElement.prototype, "name", void 0);
    __decorate([
        n()
    ], ButtonElement.prototype, "value", void 0);
    return ButtonElement;
};

/**
 * @label Menu Item
 * @tag wc-menu-item
 * @rawTag menu-item
 * @summary An item in a menu list.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-menu-item>Menu Item</wc-menu-item>
 * ```
 */
let MenuItem = class MenuItem extends NativeButtonMixin(NativeHyperlinkMixin(i$1)) {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        /** The value associated with this menu item, used to identify it on selection. */
        this.value = "";
        /** Whether this menu item is currently selected/highlighted. */
        this.selected = false;
        /** When true, the menu stays open after this item is activated. */
        this.keepOpen = false;
        /** When true, indicates this item has an associated submenu. */
        this.hasSubmenu = false;
        /** Whether the associated submenu is currently open. */
        this.submenuOpen = false;
        // ── Private fields ────────────────────────────────────────────────────────
        /** MutationObserver that triggers re-render when slotted content changes. */
        this._contentObserver = new MutationObserver(() => {
            this.requestUpdate();
        });
        /** Roving tabindex value managed by the parent Menu. */
        this._rovingTabIndex = -1;
    }
    connectedCallback() {
        // eslint-disable-next-line wc/guard-super-call
        super.connectedCallback();
        this._contentObserver.observe(this, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: ["slot"],
        });
    }
    disconnectedCallback() {
        this._contentObserver.disconnect();
        super.disconnectedCallback();
    }
    get tabIndex() {
        return this._rovingTabIndex;
    }
    set tabIndex(value) {
        this._rovingTabIndex = value;
        this.requestUpdate();
    }
    focus() {
        this.itemElement?.focus();
    }
    blur() {
        this.itemElement?.blur();
    }
    _hasNamedSlot(...names) {
        return names.some((name) => Array.from(this.children).some((child) => child.getAttribute("slot") === name));
    }
    _hasDefaultSlot() {
        return Array.from(this.childNodes).some((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return Boolean(node.textContent?.trim());
            }
            return (node.nodeType === Node.ELEMENT_NODE &&
                !node.hasAttribute("slot"));
        });
    }
    render() {
        const isElementLink = isLink(this);
        const controls = this.getAttribute("aria-controls");
        const cssClasses = {
            "menu-item": true,
            "native-button": !isElementLink,
            "native-link": isElementLink,
        };
        if (isElementLink) {
            return b `
        <a
          id="menu-item"
          class="${e(cssClasses)}"
          role="menuitem"
          href="${o(this.href)}"
          target="${this.target}"
          ?rel="${this.rel}"
          ?download="${this.download}"
          tabindex="${this.disabled ? "-1" : String(this.tabIndex)}"
          ?selected="${this.selected}"
          aria-disabled="${this.disabled || this.softDisabled
                ? "true"
                : A}"
          aria-haspopup="${this.hasSubmenu ? "menu" : A}"
          aria-controls="${o(this.hasSubmenu && controls ? controls : undefined)}"
          aria-expanded="${o(this.hasSubmenu ? String(this.submenuOpen) : undefined)}"
        >
          ${this.renderContent()}
        </a>
      `;
        }
        return b `
      <button
        id="menu-item"
        class="${e(cssClasses)}"
        role="menuitem"
        type="${this.htmlType}"
        ?disabled="${this.disabled}"
        tabindex="${String(this.tabIndex)}"
        ?selected="${this.selected}"
        aria-disabled="${this.softDisabled ? "true" : A}"
        aria-haspopup="${this.hasSubmenu ? "menu" : A}"
        aria-controls="${o(this.hasSubmenu && controls ? controls : undefined)}"
        aria-expanded="${o(this.hasSubmenu ? String(this.submenuOpen) : undefined)}"
      >
        ${this.renderContent()}
      </button>
    `;
    }
    renderContent() {
        return b `
      <div class="menu-item-backdrop-background"></div>
      <wc-elevation class="menu-item-backdrop-elevation"></wc-elevation>

      <wc-item class="menu-item-content">
        <wc-focus-ring
          class="focus-ring"
          for="menu-item"
          slot="container"
        ></wc-focus-ring>
        <div class="background" slot="container"></div>
        <wc-ripple class="ripple" for="menu-item" slot="container"></wc-ripple>

        <slot name="start" slot="start"></slot>
        <slot name="overline" slot="overline"></slot>
        <slot name="headline" slot="headline"></slot>
        <slot></slot>
        <slot name="supporting-text" slot="supporting-text"></slot>
        <slot
          name="trailing-supporting-text"
          slot="trailing-supporting-text"
        ></slot>
        <slot name="end" slot="end"></slot>
      </wc-item>
    `;
    }
};
MenuItem.styles = [css_248z$1, css_248z];
__decorate([
    n({ type: String })
], MenuItem.prototype, "value", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], MenuItem.prototype, "selected", void 0);
__decorate([
    n({ type: Boolean, attribute: "keep-open" })
], MenuItem.prototype, "keepOpen", void 0);
__decorate([
    n({ type: Boolean, attribute: "has-submenu" })
], MenuItem.prototype, "hasSubmenu", void 0);
__decorate([
    n({ type: Boolean, attribute: "submenu-open" })
], MenuItem.prototype, "submenuOpen", void 0);
__decorate([
    e$1("#menu-item")
], MenuItem.prototype, "itemElement", void 0);
MenuItem = __decorate([
    IndividualComponent
], MenuItem);

export { MenuItem };
//# sourceMappingURL=menu-item.js.map
