import { i, a as i$1, A, b, _ as __decorate, I as IndividualComponent } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { e as e$1 } from './query-CHb9Ft_d.js';
import { o } from './if-defined-D9DEJR_6.js';
import { e } from './class-map-NDIkZErE.js';
import { a as mixinBaseButton } from './base-button-Do2TUy8M.js';
import { m as mixinHyperlink } from './hyperlink-DhE9RlVS.js';
import { m as mixinElementInternals } from './element-internals-QME0yEz4.js';
import { i as isActivationClick, d as dispatchActivationClick } from './throttle-SQ9t-HL7.js';
import { i as isLink } from './is-link-Dk2OV3PM.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';
import './warn-once-BNxX1Y98.js';

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
  display: block;
  outline: none;
  position: relative;
  --_label-color: var(--menu-item-label-color, var(--color-on-surface));
  --_icon-color: var(--menu-item-icon-color, var(--color-on-surface-variant));
  --_container-color: transparent;
  --_icon-size: var(--menu-item-icon-size, 1.25rem);
  /* Expressive segment shape and shadow; wc-menu sets data-position-* on the segment edges. */
  --_segment-shape-start-start: 0;
  --_segment-shape-start-end: 0;
  --_segment-shape-end-start: 0;
  --_segment-shape-end-end: 0;
  --_segment-elevation-block-start: 0;
  --_segment-elevation-block-end: 0;
}

:host([hidden]) {
  display: none !important;
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
  display: block;
  width: 100%;
  text-align: start;
  padding-inline: var(--spacing-050);
  padding-block: 1px;
}
.menu-item .menu-item-backdrop-background {
  display: var(--_menu-item-segment-display, none);
  background-color: var(--menu-container-color, var(--color-surface-container));
  position: absolute;
  inset: 0;
  border-start-start-radius: var(--_segment-shape-start-start);
  border-start-end-radius: var(--_segment-shape-start-end);
  border-end-start-radius: var(--_segment-shape-end-start);
  border-end-end-radius: var(--_segment-shape-end-end);
}
.menu-item .menu-item-backdrop-elevation {
  display: var(--_menu-item-segment-display, none);
  --elevation-container-shape-start-start: var(--_segment-shape-start-start);
  --elevation-container-shape-start-end: var(--_segment-shape-start-end);
  --elevation-container-shape-end-start: var(--_segment-shape-end-start);
  --elevation-container-shape-end-end: var(--_segment-shape-end-end);
  --elevation-level-block-start: var(--_segment-elevation-block-start);
  --elevation-level-block-end: var(--_segment-elevation-block-end);
  --elevation-level-inline-start: 1;
  --elevation-level-inline-end: 1;
}
.menu-item .menu-item-content {
  --item-height: 1.5rem;
  --item-multiline-height: 2.5rem;
  --item-padding-inline: var(--spacing-150);
  --item-spacing: var(--spacing-150);
  --item-label-font-family: var(--typography-label-large-font-family);
  --item-label-font-size: var(--typography-label-large-font-size);
  --item-label-font-weight: var(--typography-label-large-font-weight);
  --item-label-line-height: var(--typography-label-large-line-height);
  --item-label-letter-spacing: var(--typography-label-large-letter-spacing);
  --item-label-text-color: var(--_label-color);
  --item-supporting-text-color: var(--_icon-color);
  --item-trailing-supporting-text-color: var(--_icon-color);
  --item-label-text-opacity: var(--_content-opacity, 1);
}
.menu-item .menu-item-content.no-start {
  --item-padding-inline-start: calc(
    var(--spacing-150) + var(--_menu-item-leading-space, 0px)
  );
}
.menu-item .menu-item-content .background {
  background-color: var(--_container-color);
  border-radius: var(--shape-corner-medium);
}
.menu-item .menu-item-content .focus-ring {
  --focus-ring-container-shape-start-start: var(--shape-corner-medium);
  --focus-ring-container-shape-start-end: var(--shape-corner-medium);
  --focus-ring-container-shape-end-start: var(--shape-corner-medium);
  --focus-ring-container-shape-end-end: var(--shape-corner-medium);
  --focus-ring-inset: 0px;
  z-index: 2;
}
.menu-item .menu-item-content .ripple {
  border-radius: var(--shape-corner-medium);
  --ripple-pressed-color: var(--_label-color);
}

slot[name=start]::slotted(*),
slot[name=end]::slotted(*),
.built-in {
  --icon-size: var(--_icon-size);
  --icon-color: var(--_icon-color);
  color: var(--_icon-color);
}

.built-in {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-100);
}

.indicator {
  --icon-size: var(--_icon-size);
}

:host(:dir(rtl)) .submenu-indicator {
  transform: scaleX(-1);
}

/* Expressive segment edges. */
:host([data-position-first]) {
  --_segment-shape-start-start: var(--shape-corner-large);
  --_segment-shape-start-end: var(--shape-corner-large);
  --_segment-elevation-block-start: 1;
}

:host([data-position-after-divider]) {
  --_segment-shape-start-start: var(--shape-corner-small);
  --_segment-shape-start-end: var(--shape-corner-small);
  --_segment-elevation-block-start: 1;
}

:host([data-position-before-divider]) {
  --_segment-shape-end-start: var(--shape-corner-small);
  --_segment-shape-end-end: var(--shape-corner-small);
  --_segment-elevation-block-end: 1;
}

:host([data-position-last]) {
  --_segment-shape-end-start: var(--shape-corner-large);
  --_segment-shape-end-end: var(--shape-corner-large);
  --_segment-elevation-block-end: 1;
}

:host([data-position-first]) .menu-item,
:host([data-position-after-divider]) .menu-item {
  padding-block-start: var(--spacing-050);
}

:host([data-position-last]) .menu-item,
:host([data-position-before-divider]) .menu-item {
  padding-block-end: var(--spacing-050);
}

/* States. */
:host([selected]) {
  --_container-color: var(
    --menu-item-selected-container-color,
    var(--color-secondary-container)
  );
  --_label-color: var(
    --menu-item-selected-label-color,
    var(--color-on-secondary-container)
  );
  --_icon-color: var(
    --menu-item-selected-label-color,
    var(--color-on-secondary-container)
  );
}

:host([submenu-open]:not([selected])) {
  --_container-color: var(--color-surface-container-highest);
}

:host([disabled]),
:host([soft-disabled]) {
  cursor: not-allowed;
  --_label-color: var(--color-on-surface);
  --_icon-color: var(--color-on-surface);
  --_content-opacity: 0.38;
}
:host([disabled]) .ripple,
:host([soft-disabled]) .ripple {
  display: none;
}`;

const ITEM_ROLES = {
    item: 'menuitem',
    checkbox: 'menuitemcheckbox',
    radio: 'menuitemradio',
};
/**
 * @label Menu Item
 * @tag wc-menu-item
 * @rawTag menu-item
 * @summary One action or choice in a menu; it can be a link, a checkbox or radio choice, or open a submenu.
 * @overview
 * <p>A menu item is a button, or a link when it has an <code>href</code>. A selected item shows a
 * check mark at the end; an item with a submenu shows a chevron. Put an icon in the
 * <code>start</code> slot; the menu lines up the labels of items without one.</p>
 * <p>Set <code>type="checkbox"</code> or <code>type="radio"</code> to make <code>selected</code>
 * accessible: the item becomes a <code>menuitemcheckbox</code> or <code>menuitemradio</code> with
 * <code>aria-checked</code>. A plain item only shows the check mark. Activating a checkbox item
 * toggles it and keeps the menu open; activating a radio item selects it, clears the other radio
 * items of its group (the items between the same dividers) and closes the menu.</p>
 * <p>A link item that stands for the current page sets <code>current</code>
 * (<code>aria-current="page"</code>).</p>
 *
 * @slot - The label.
 * @slot start - Leading icon or avatar.
 * @slot end - Trailing icon or content; replaces the selected check mark.
 * @slot supporting-text - A second line under the label.
 * @slot trailing-supporting-text - Short trailing text, such as a keyboard shortcut.
 * @slot overline - A line above the label.
 * @slot headline - Alternative to the default slot for the label.
 *
 * @cssprop --menu-item-icon-size - Size of leading and trailing icons. Defaults to `1.25rem`.
 *
 * @example
 * ```html
 * <wc-menu-item>Menu Item</wc-menu-item>
 * ```
 * @tags navigation
 */
let MenuItem = class MenuItem extends mixinBaseButton(mixinHyperlink(mixinElementInternals(i$1))) {
    constructor() {
        super();
        /** The value associated with this menu item, used to identify it on selection. */
        this.value = '';
        /**
         * What the item is. `"item"` (default) is an action; `"checkbox"` toggles `selected` and keeps
         * the menu open; `"radio"` selects this item and clears the other radio items of its group.
         * `"checkbox"` and `"radio"` expose `selected` as `aria-checked`.
         */
        this.type = 'item';
        /**
         * Whether this menu item is selected. Selected items show a check mark. Set `type="checkbox"` or
         * `type="radio"` so assistive technology announces the state.
         */
        this.selected = false;
        /** Marks a link item as the current page (`aria-current="page"`). */
        this.current = false;
        /** When true, the menu stays open after this item is activated. */
        this.keepOpen = false;
        /** When true, indicates this item has an associated submenu and shows a chevron. */
        this.hasSubmenu = false;
        /** Whether the associated submenu is currently open. */
        this.submenuOpen = false;
        /** MutationObserver that triggers re-render when slotted content changes. */
        this._contentObserver = new MutationObserver(() => {
            this.requestUpdate();
        });
        /** Roving tabindex value managed by the parent Menu. */
        this._rovingTabIndex = -1;
        /**
         * Handles clicks on the host: stops them for soft-disabled items and disabled links, and turns
         * a click fired at the host (`item.click()`, Enter in the menu) into a click on the inner button
         * or link, so a link item navigates.
         */
        this.__dispatchClick = (event) => {
            if (this.softDisabled || (this.disabled && isLink(this))) {
                event.stopImmediatePropagation();
                event.preventDefault();
                return;
            }
            if (!isActivationClick(event) || !this.itemElement) {
                return;
            }
            dispatchActivationClick(this.itemElement);
        };
        this.addEventListener('click', this.__dispatchClickWithThrottle);
    }
    connectedCallback() {
        // eslint-disable-next-line wc/guard-super-call
        super.connectedCallback();
        this._contentObserver.observe(this, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['slot'],
        });
    }
    disconnectedCallback() {
        this._contentObserver.disconnect();
        super.disconnectedCallback();
    }
    updated() {
        // wc-item reads which named slots it has in its own render; tell it when ours change.
        this.renderRoot.querySelector('wc-item')?.requestUpdate();
    }
    get tabIndex() {
        return this._rovingTabIndex;
    }
    set tabIndex(value) {
        this._rovingTabIndex = value;
        this.requestUpdate();
    }
    /** Whether the item shows something in its leading column. */
    get hasStartContent() {
        return this._hasNamedSlot('start') || this.renderStart() !== A;
    }
    /** Lower-cased label text the menu matches typed characters against. */
    get typeaheadText() {
        return Array.from(this.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE ||
            (node instanceof Element &&
                (!node.hasAttribute('slot') ||
                    node.getAttribute('slot') === 'headline')))
            .map(node => node.textContent ?? '')
            .join('')
            .trim()
            .toLowerCase();
    }
    focus() {
        this.itemElement?.focus();
    }
    blur() {
        this.itemElement?.blur();
    }
    /** ARIA role of the inner control. */
    get itemRole() {
        return ITEM_ROLES[this.type] ?? 'menuitem';
    }
    /** ARIA state of the inner control, such as `aria-selected` for options. */
    get itemAriaSelected() {
        return undefined;
    }
    /** `aria-checked` of the inner control: set for checkbox and radio items only. */
    get itemAriaChecked() {
        const role = this.itemRole;
        return role === 'menuitemcheckbox' || role === 'menuitemradio'
            ? String(this.selected)
            : undefined;
    }
    /** Built-in leading content shown when the `start` slot is empty. */
    renderStart() {
        return A;
    }
    /** Built-in trailing content shown when the `end` slot is empty. */
    renderEnd() {
        if (this.hasSubmenu) {
            return b `<wc-icon
        class="indicator submenu-indicator"
        name="chevron_right"
        aria-hidden="true"
      ></wc-icon>`;
        }
        if (this.selected) {
            return b `<wc-icon
        class="indicator check-indicator"
        name="check"
        aria-hidden="true"
      ></wc-icon>`;
        }
        return A;
    }
    _hasNamedSlot(...names) {
        return names.some(name => Array.from(this.children).some(child => child.getAttribute('slot') === name));
    }
    render() {
        const isElementLink = isLink(this);
        const controls = this.getAttribute('aria-controls');
        const cssClasses = {
            'menu-item': true,
            'native-button': !isElementLink,
            'native-link': isElementLink,
        };
        if (isElementLink) {
            return b `
        <a
          id="menu-item"
          class="${e(cssClasses)}"
          role="${this.itemRole}"
          href="${o(this.href)}"
          target="${this.target}"
          rel="${this.rel || A}"
          download="${this.download || A}"
          tabindex="${this.disabled ? '-1' : String(this.tabIndex)}"
          aria-selected="${o(this.itemAriaSelected)}"
          aria-checked="${o(this.itemAriaChecked)}"
          aria-current="${this.current ? 'page' : A}"
          aria-disabled="${this.disabled || this.softDisabled
                ? 'true'
                : A}"
          aria-haspopup="${this.hasSubmenu ? 'menu' : A}"
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
        role="${this.itemRole}"
        type="button"
        ?disabled="${this.disabled}"
        tabindex="${String(this.tabIndex)}"
        aria-selected="${o(this.itemAriaSelected)}"
        aria-checked="${o(this.itemAriaChecked)}"
        aria-current="${this.current ? 'page' : A}"
        aria-disabled="${this.softDisabled ? 'true' : A}"
        aria-haspopup="${this.hasSubmenu ? 'menu' : A}"
        aria-controls="${o(this.hasSubmenu && controls ? controls : undefined)}"
        aria-expanded="${o(this.hasSubmenu ? String(this.submenuOpen) : undefined)}"
      >
        ${this.renderContent()}
      </button>
    `;
    }
    renderContent() {
        const hasStartSlot = this._hasNamedSlot('start');
        const builtInStart = hasStartSlot ? A : this.renderStart();
        const hasEndSlot = this._hasNamedSlot('end');
        const builtInEnd = hasEndSlot ? A : this.renderEnd();
        const hasStart = hasStartSlot || builtInStart !== A;
        let start = A;
        if (hasStartSlot) {
            start = b `<slot name="start" slot="start"></slot>`;
        }
        else if (builtInStart !== A) {
            start = b `<span class="built-in" slot="start">${builtInStart}</span>`;
        }
        let end = A;
        if (hasEndSlot) {
            end = b `<slot name="end" slot="end"></slot>`;
        }
        else if (builtInEnd !== A) {
            end = b `<span class="built-in" slot="end">${builtInEnd}</span>`;
        }
        return b `
      <div class="menu-item-backdrop-background"></div>
      <wc-elevation class="menu-item-backdrop-elevation"></wc-elevation>

      <wc-item
        class="${e({
            'menu-item-content': true,
            'no-start': !hasStart,
        })}"
      >
        <wc-focus-ring
          class="focus-ring"
          for="menu-item"
          slot="container"
        ></wc-focus-ring>
        <div class="background" slot="container"></div>
        <wc-ripple class="ripple" for="menu-item" slot="container"></wc-ripple>

        ${start}
        ${this._hasNamedSlot('overline')
            ? b `<slot name="overline" slot="overline"></slot>`
            : A}
        ${this._hasNamedSlot('headline')
            ? b `<slot name="headline" slot="headline"></slot>`
            : A}
        <slot></slot>
        ${this._hasNamedSlot('supporting-text')
            ? b `<slot name="supporting-text" slot="supporting-text"></slot>`
            : A}
        ${this._hasNamedSlot('trailing-supporting-text')
            ? b `<slot
              name="trailing-supporting-text"
              slot="trailing-supporting-text"
            ></slot>`
            : A}
        ${end}
      </wc-item>
    `;
    }
};
MenuItem.styles = [css_248z];
__decorate([
    n({ type: String })
], MenuItem.prototype, "value", void 0);
__decorate([
    n({ type: String })
], MenuItem.prototype, "type", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], MenuItem.prototype, "selected", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], MenuItem.prototype, "current", void 0);
__decorate([
    n({ type: Boolean, attribute: 'keep-open' })
], MenuItem.prototype, "keepOpen", void 0);
__decorate([
    n({ type: Boolean, attribute: 'has-submenu', reflect: true })
], MenuItem.prototype, "hasSubmenu", void 0);
__decorate([
    n({ type: Boolean, attribute: 'submenu-open', reflect: true })
], MenuItem.prototype, "submenuOpen", void 0);
__decorate([
    e$1('#menu-item')
], MenuItem.prototype, "itemElement", void 0);
MenuItem = __decorate([
    IndividualComponent
], MenuItem);

export { MenuItem };
//# sourceMappingURL=menu-item.js.map
