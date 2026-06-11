import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-DG7CA1et.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

var css_248z$2 = i`@charset "UTF-8";
* {
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
  --tonal-split-button-container-color: var(--color-on-surface-container);
  --tonal-split-button-label-text-color: var(--color-surface-container-high);
  --outlined-split-button-outline-color: var(--color-on-surface);
  --outlined-split-button-label-text-color: var(--color-on-surface);
}

:host([color=surface]) {
  --filled-split-button-container-color: var(--color-surface-container-high);
  --filled-split-button-label-text-color: var(--color-on-surface);
  --tonal-split-button-container-color: var(--color-surface-container-high);
  --tonal-split-button-label-text-color: var(--color-on-surface-container);
  --outlined-split-button-outline-color: var(--color-on-surface);
  --outlined-split-button-label-text-color: var(--color-on-surface);
}`;

var css_248z = i`:host([size=xs]),
:host([size=extra-small]) {
  --split-button-icon-size: 1rem;
}

:host([size=sm]),
:host([size=small]) {
  --split-button-icon-size: 1.125rem;
}

:host([size=md]),
:host([size=medium]) {
  --split-button-icon-size: 1.25rem;
}

:host([size=lg]),
:host([size=large]) {
  --split-button-icon-size: 1.5rem;
}

:host([size=xl]),
:host([size=extra-large]) {
  --split-button-icon-size: 2rem;
}`;

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
        this._menuOpen = false;
        this._menuId = `split-menu-${Math.random().toString(36).slice(2, 9)}`;
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
            if (event.key === 'ArrowDown' &&
                event.target === this._dropdownButton) {
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
    }
    focus() {
        const btn = this.shadowRoot?.querySelector('.action-button');
        btn?.focus();
    }
    _onActionClick(event) {
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
    _onDropdownClick(event) {
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
            'aria-haspopup': 'menu',
            'aria-expanded': String(this._menuOpen),
            'aria-controls': this._menuId,
            'aria-label': 'Open split button menu',
        }}
          @click=${this._onDropdownClick}
        >
          <wc-icon class="dropdown-icon" name="arrow_drop_down" aria-hidden="true"></wc-icon>
        </wc-icon-button>
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
    r()
], SplitButton.prototype, "_menuOpen", void 0);
__decorate([
    e('.dropdown-trigger')
], SplitButton.prototype, "_dropdownButton", void 0);
__decorate([
    e('wc-menu')
], SplitButton.prototype, "_menu", void 0);
SplitButton = __decorate([
    IndividualComponent
], SplitButton);

export { SplitButton };
//# sourceMappingURL=split-button.js.map
