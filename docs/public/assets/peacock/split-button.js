import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-NDIkZErE.js';
import { I as I18nController } from './i18n-controller-Dxqz0Aof.js';
import { M as MenuTriggerController } from './menu-trigger-controller-DyLpTxM7.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';
import './strings-WY90FZfd.js';
import './locale-DEsJZCQG.js';

var css_248z$2 = i`@charset "UTF-8";
* {
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
  --split-button-container-shape: var(--shape-corner-medium);
  --split-button-gap: 0.125rem;
  --split-button-icon-size: 1.125rem;
}

.split-button {
  display: inline-flex;
  align-items: center;
  gap: var(--split-button-gap);
}

.action-button {
  --button-container-shape: var(--split-button-container-shape);
}

.dropdown-trigger {
  --button-container-shape: var(--split-button-container-shape);
  --button-icon-size: var(--split-button-icon-size);
}

.dropdown-icon {
  transition: transform 200ms ease;
}

.dropdown-trigger.active .dropdown-icon {
  transform: rotate(180deg);
}

/* ── Variant: Filled ────────────────────────────────────── */
.split-button.variant-filled .action-button,
.split-button.variant-filled .dropdown-trigger {
  --filled-button-container-color: var(--filled-split-button-container-color);
  --filled-button-label-text-color: var(--filled-split-button-label-text-color);
}

/* ── Variant: Tonal ─────────────────────────────────────── */
.split-button.variant-tonal .action-button,
.split-button.variant-tonal .dropdown-trigger {
  --tonal-button-container-color: var(--tonal-split-button-container-color);
  --tonal-button-label-text-color: var(--tonal-split-button-label-text-color);
}

/* ── Variant: Outlined ──────────────────────────────────── */
.split-button.variant-outlined .action-button,
.split-button.variant-outlined .dropdown-trigger {
  --outlined-button-outline-color: var(--outlined-split-button-outline-color, var(--color-outline));
  --outlined-button-label-text-color: var(--outlined-split-button-label-text-color);
}

:host([block]) {
  width: 100%;
}
:host([block]) .split-button {
  width: 100%;
}
:host([block]) .action-button {
  flex: 1;
}`;

var css_248z$1 = i`:host([color=primary]) {
  --filled-split-button-container-color: var(--color-primary);
  --filled-split-button-label-text-color: var(--color-on-primary);
  --tonal-split-button-container-color: var(--color-primary-container);
  --tonal-split-button-label-text-color: var(--color-on-primary-container);
  --outlined-split-button-outline-color: var(--color-primary);
  --outlined-split-button-label-text-color: var(--color-primary);
}

:host([color=secondary]) {
  --filled-split-button-container-color: var(--color-secondary);
  --filled-split-button-label-text-color: var(--color-on-secondary);
  --tonal-split-button-container-color: var(--color-secondary-container);
  --tonal-split-button-label-text-color: var(--color-on-secondary-container);
  --outlined-split-button-outline-color: var(--color-secondary);
  --outlined-split-button-label-text-color: var(--color-secondary);
}

:host([color=tertiary]) {
  --filled-split-button-container-color: var(--color-tertiary);
  --filled-split-button-label-text-color: var(--color-on-tertiary);
  --tonal-split-button-container-color: var(--color-tertiary-container);
  --tonal-split-button-label-text-color: var(--color-on-tertiary-container);
  --outlined-split-button-outline-color: var(--color-tertiary);
  --outlined-split-button-label-text-color: var(--color-tertiary);
}

:host([color=success]) {
  --filled-split-button-container-color: var(--color-success);
  --filled-split-button-label-text-color: var(--color-on-success);
  --tonal-split-button-container-color: var(--color-success-container);
  --tonal-split-button-label-text-color: var(--color-on-success-container);
  --outlined-split-button-outline-color: var(--color-success);
  --outlined-split-button-label-text-color: var(--color-success);
}

:host([color=danger]) {
  --filled-split-button-container-color: var(--color-error);
  --filled-split-button-label-text-color: var(--color-on-error);
  --tonal-split-button-container-color: var(--color-error-container);
  --tonal-split-button-label-text-color: var(--color-on-error-container);
  --outlined-split-button-outline-color: var(--color-error);
  --outlined-split-button-label-text-color: var(--color-error);
}

:host([color=warning]) {
  --filled-split-button-container-color: var(--color-warning);
  --filled-split-button-label-text-color: var(--color-on-warning);
  --tonal-split-button-container-color: var(--color-warning-container);
  --tonal-split-button-label-text-color: var(--color-on-warning-container);
  --outlined-split-button-outline-color: var(--color-warning);
  --outlined-split-button-label-text-color: var(--color-warning);
}

:host([color=on-surface]) {
  --filled-split-button-container-color: var(--color-on-surface);
  --filled-split-button-label-text-color: var(--color-surface);
  --tonal-split-button-container-color: var(--color-on-surface-variant);
  --tonal-split-button-label-text-color: var(--color-surface-container-high);
  --outlined-split-button-outline-color: var(--color-on-surface);
  --outlined-split-button-label-text-color: var(--color-on-surface);
}

:host([color=surface]) {
  --filled-split-button-container-color: var(--color-surface-container-high);
  --filled-split-button-label-text-color: var(--color-on-surface);
  --tonal-split-button-container-color: var(--color-surface-container-high);
  --tonal-split-button-label-text-color: var(--color-on-surface);
  --outlined-split-button-outline-color: var(--color-on-surface);
  --outlined-split-button-label-text-color: var(--color-on-surface);
}`;

var css_248z = i`:host([size=xs]) {
  --split-button-icon-size: 1rem;
}

:host([size=sm]) {
  --split-button-icon-size: 1.125rem;
}

:host([size=md]) {
  --split-button-icon-size: 1.25rem;
}

:host([size=lg]) {
  --split-button-icon-size: 1.5rem;
}

:host([size=xl]) {
  --split-button-icon-size: 2rem;
}`;

/**
 * @label Split Button
 * @tag wc-split-button
 * @rawTag split-button
 *
 * @summary A button for a default action joined to an arrow that opens a menu of related actions.
 * @overview
 * <p>The main button runs the default action; the arrow beside it opens a menu of related actions.</p>
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
let SplitButton = class SplitButton extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Button size.
         * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
         */
        this.size = 'sm';
        /**
         * The visual style of the split button.
         *
         * Possible variant values:
         * `"filled"` is a filled button.
         * `"outlined"` is an outlined button.
         * `"tonal"` is a light color button.
         */
        this.variant = 'filled';
        /**
         * Defines the primary color of the split button.
         */
        this.color = 'primary';
        /**
         * Whether the split button is disabled.
         */
        this.disabled = false;
        /** Visual variant of the menu: one surface (`"standard"`) or segmented groups (`"expressive"`). */
        this.menuVariant = 'standard';
        /**
         * Where the menu opens relative to the button: `top`, `bottom`, `start` or `end`, optionally
         * followed by `-start` or `-end` (ADR-030001). `start` and `end` follow the writing direction.
         * Defaults to `"bottom-end"`.
         */
        this.placement = 'bottom-end';
        /** Peacock's strings for the menu trigger label. */
        this.i18n = new I18nController(this);
        /** Opens and closes the menu and fires `open` / `close`. */
        this._trigger = new MenuTriggerController(this, {
            menu: () => this._menu,
            disabled: () => this.disabled,
            idPrefix: 'split-menu',
        });
    }
    focus() {
        const btn = this.shadowRoot?.querySelector('.action-button');
        btn?.focus();
    }
    /** Opens the menu and focuses its first (or last) item. */
    show(focusTarget = 'first') {
        this._trigger.show(focusTarget);
    }
    /** Closes the menu. */
    close() {
        this._trigger.close();
    }
    _onActionClick(event) {
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
    render() {
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
        return b `
      <div class=${e$1(containerClasses)}>
        <wc-button
          class=${e$1(actionClasses)}
          size=${this.size}
          variant=${this.variant}
          ?disabled=${this.disabled}
          @click=${this._onActionClick}
        >
          <slot></slot>
        </wc-button>

        <wc-icon-button
          class=${e$1(dropdownClasses)}
          size=${this.size}
          variant=${this.variant}
          ?disabled=${this.disabled}
          .configAria=${{
            ...this._trigger.triggerAria,
            'aria-label': this.i18n.t('openSplitButtonMenu'),
        }}
          @click=${this._trigger.handleTriggerClick}
          @keydown=${this._trigger.handleTriggerKeyDown}
        >
          <wc-icon
            class="dropdown-icon"
            name="arrow_drop_down"
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
};
SplitButton.styles = [css_248z$2, css_248z$1, css_248z];
__decorate([
    n({ reflect: true })
], SplitButton.prototype, "size", void 0);
__decorate([
    n({ reflect: true })
], SplitButton.prototype, "variant", void 0);
__decorate([
    n({ reflect: true })
], SplitButton.prototype, "color", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SplitButton.prototype, "disabled", void 0);
__decorate([
    n({ attribute: 'menu-variant' })
], SplitButton.prototype, "menuVariant", void 0);
__decorate([
    n({ reflect: true })
], SplitButton.prototype, "placement", void 0);
__decorate([
    e('wc-menu')
], SplitButton.prototype, "_menu", void 0);
SplitButton = __decorate([
    IndividualComponent
], SplitButton);

export { SplitButton };
//# sourceMappingURL=split-button.js.map
