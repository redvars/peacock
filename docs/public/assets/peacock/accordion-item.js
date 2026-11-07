import { i, _ as __decorate, I as IndividualComponent, a as i$1, c as __classPrivateFieldGet, d as __classPrivateFieldSet, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-NDIkZErE.js';
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
  display: block;
}

.expansion-panel {
  border: var(--_accordion-item-border, 1px solid var(--color-outline-variant));
  border-radius: var(--shape-corner-medium);
  background-color: var(--_accordion-item-background, var(--color-surface-container-low));
  overflow: hidden;
  transition: background-color var(--duration-medium1) var(--easing-standard), border-color var(--duration-medium1) var(--easing-standard);
}
.expansion-panel .header {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 3rem;
  padding: 0 var(--spacing-300);
  gap: var(--spacing-200);
  overflow: hidden;
}
.expansion-panel .header:has(.header-button:focus-visible) {
  outline: 2px solid var(--color-black);
}
.expansion-panel .header-button {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
  text-align: start;
  color: var(--color-on-surface);
  outline: none;
}
.expansion-panel .header-button::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--color-on-surface);
  opacity: 0;
  transition: opacity var(--duration-short4) var(--easing-standard);
}
.expansion-panel .header-button:not(:disabled):hover::before {
  opacity: 0.08;
}
.expansion-panel .header-button:focus-visible::before {
  opacity: 0.12;
}
.expansion-panel .header-actions {
  display: contents;
}
.expansion-panel .header-label {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: var(--spacing-150) 0;
  min-width: 0;
}
.expansion-panel .panel-title {
  font-family: var(--typography-body-large-font-family) !important;
  font-size: var(--typography-body-large-font-size) !important;
  font-weight: var(--typography-body-large-font-weight) !important;
  line-height: var(--typography-body-large-line-height) !important;
  letter-spacing: var(--typography-body-large-letter-spacing) !important;
  color: var(--color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.expansion-panel .panel-description {
  font-family: var(--typography-body-small-font-family) !important;
  font-size: var(--typography-body-small-font-size) !important;
  font-weight: var(--typography-body-small-font-weight) !important;
  line-height: var(--typography-body-small-line-height) !important;
  letter-spacing: var(--typography-body-small-letter-spacing) !important;
  color: var(--color-on-surface-variant);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.expansion-panel .panel-description[hidden] {
  display: none;
}
.expansion-panel ::slotted([slot=header-actions]) {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--spacing-100);
}
.expansion-panel .toggle-icon {
  pointer-events: none;
  --icon-size: 1.5rem;
  --icon-color: var(--color-on-surface-variant);
  flex-shrink: 0;
  transition: transform var(--duration-medium1) var(--easing-standard);
}
.expansion-panel .panel-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--duration-medium1) var(--easing-standard);
}
.expansion-panel .content-inner {
  overflow: hidden;
  min-height: 0;
  font-family: var(--typography-body-medium-font-family) !important;
  font-size: var(--typography-body-medium-font-size) !important;
  font-weight: var(--typography-body-medium-font-weight) !important;
  line-height: var(--typography-body-medium-line-height) !important;
  letter-spacing: var(--typography-body-medium-letter-spacing) !important;
  color: var(--color-on-surface-variant);
}
.expansion-panel.disabled {
  background-color: color-mix(in srgb, var(--color-surface-container-low) 38%, transparent);
  border-color: color-mix(in srgb, var(--color-outline-variant) 38%, transparent);
}
.expansion-panel.disabled .header {
  opacity: 0.38;
}
.expansion-panel.disabled .header-button {
  cursor: not-allowed;
  pointer-events: none;
}
.expansion-panel.open {
  background-color: var(--color-surface-container);
  border-color: transparent;
}
.expansion-panel.open .panel-content {
  grid-template-rows: 1fr;
  border-block-start: 1px solid var(--color-outline-variant);
}
.expansion-panel.open .content-inner {
  padding: var(--spacing-200) var(--spacing-300);
}
.expansion-panel.open .toggle-icon {
  transform: rotate(180deg);
}
.expansion-panel.disabled {
  background-color: color-mix(in srgb, var(--color-surface-container-low) 38%, transparent);
  border-color: color-mix(in srgb, var(--color-outline-variant) 38%, transparent);
}

:host-context([leading-toggle]) .toggle-icon {
  order: -1;
}`;

var _AccordionItem_id, _AccordionItem_reason;
var AccordionItem_1;
/**
 * @label Accordion Item
 * @tag wc-accordion-item
 * @rawTag accordion-item
 * @summary An expansion panel with a header that reveals or hides associated content.
 *
 * @overview
 * <p>Use it on its own, or several inside a <code>wc-accordion</code>, which moves focus between
 * their headers and can keep a single panel open.</p>
 * <p>The header is a button with <code>aria-expanded</code> that controls the content, a region
 * labelled by the header. Clicking it, or pressing Enter or Space on it, toggles
 * <code>open</code>. The <code>heading</code> slot holds the title and <code>description</code> an
 * optional subtitle. Buttons in the <code>header-actions</code> slot sit next to the header
 * button, not inside it, so they stay reachable by keyboard.</p>
 * <p><code>open</code> fires after the panel expands and <code>close</code> after it collapses, with
 * <code>reason: 'action'</code> when the person used the header and <code>'api'</code> when
 * <code>open</code> was set, including by <code>show()</code>, <code>hide()</code> and
 * <code>toggle()</code>. Neither fires for a panel that starts open. <code>disabled</code> stops
 * the header responding, and <code>hide-toggle</code> hides the arrow icon.</p>
 *
 * @slot - The body content revealed when the panel is expanded.
 * @slot heading - The panel title. Renders as `body-large` text.
 * @slot description - Optional subtitle rendered below the title. Renders as `body-small` text.
 * @slot header-actions - Actions (e.g. icon buttons) placed at the trailing end of the header, before the toggle icon.
 *
 * @part header - The header `<button>` element.
 * @part title - The title text container.
 * @part description - The description text container.
 * @part content - The expandable content region wrapper.
 *
 * @fires {CustomEvent<{ reason: 'action' | 'api' }>} open - Fired after the panel expands: `reason` is `'action'` when the person used the header, `'api'` when `open` was set (including by a single-panel `wc-accordion` closing the others).
 * @fires {CustomEvent<{ reason: 'action' | 'api' }>} close - Fired after the panel collapses, with the same `reason`.
 *
 * @example
 * ```html
 * <wc-accordion-item>
 *   <span slot="heading">Personal information</span>
 *   <span slot="description">Fill in your details</span>
 *   <p>Content goes here.</p>
 * </wc-accordion-item>
 * ```
 * @tags display
 */
let AccordionItem = AccordionItem_1 = class AccordionItem extends i$1 {
    constructor() {
        // ── Static
        super(...arguments);
        // ── Properties
        /**
         * Whether the user cannot interact with the panel.
         */
        this.disabled = false;
        /**
         * Whether the panel is expanded.
         */
        this.open = false;
        /**
         * Whether to hide the expand/collapse toggle indicator icon.
         */
        this.hideToggle = false;
        // ── State
        /** True when the `description` slot contains at least one non-empty node. */
        this._hasDescriptionSlot = false;
        // ── Private fields
        _AccordionItem_id.set(this, crypto.randomUUID());
        /** Why `open` is changing: set to `'action'` by the header button, `'api'` otherwise. */
        _AccordionItem_reason.set(this, 'api');
    }
    // ── Lifecycle
    updated(changed) {
        super.updated(changed);
        // Not on the first render: an item that starts open has not opened.
        if (changed.has('open') && changed.get('open') !== undefined) {
            const detail = { reason: __classPrivateFieldGet(this, _AccordionItem_reason, "f") };
            __classPrivateFieldSet(this, _AccordionItem_reason, 'api', "f");
            this.dispatchEvent(new CustomEvent(this.open ? 'open' : 'close', {
                bubbles: true,
                composed: true,
                detail,
            }));
        }
    }
    // ── Public
    focus(options) {
        this.headerButton?.focus(options);
    }
    blur() {
        this.headerButton?.blur();
    }
    /** Expands the panel. */
    show() {
        this.open = true;
    }
    /** Collapses the panel. */
    hide() {
        this.open = false;
    }
    /** Expands the panel when collapsed, and collapses it when expanded. */
    toggle() {
        this.open = !this.open;
    }
    // ── Private
    _handleToggle() {
        if (this.disabled)
            return;
        __classPrivateFieldSet(this, _AccordionItem_reason, 'action', "f");
        this.open = !this.open;
    }
    static _onSlotChange(e, setter) {
        const slot = e.target;
        const nodes = slot.assignedNodes({ flatten: true });
        setter(nodes.some(n => n.nodeType === Node.TEXT_NODE
            ? (n.textContent?.trim() ?? '') !== ''
            : true));
    }
    _renderToggleIcon() {
        if (this.hideToggle)
            return A;
        return b `<wc-icon
      class="toggle-icon"
      name="keyboard_arrow_down"
      aria-hidden="true"
    ></wc-icon>`;
    }
    render() {
        return b `
      <div
        class=${e$1({
            'expansion-panel': true,
            open: this.open,
            disabled: this.disabled,
        })}
      >
        <!-- The header actions sit next to the button, not inside it: interactive content inside a
             button is invalid and unreachable by keyboard. The button's state layer still covers
             the whole header, so a click anywhere but an action toggles the panel. -->
        <div part="header" class="header">
          <button
            id=${`panel-header-${__classPrivateFieldGet(this, _AccordionItem_id, "f")}`}
            class="header-button"
            aria-controls=${`panel-content-${__classPrivateFieldGet(this, _AccordionItem_id, "f")}`}
            aria-disabled=${this.disabled}
            aria-expanded=${this.open}
            ?disabled=${this.disabled}
            @click=${this._handleToggle}
          >
            <span class="header-label">
              <span part="title" class="panel-title">
                <slot name="heading"></slot>
              </span>
              <span
                part="description"
                class="panel-description"
                ?hidden=${!this._hasDescriptionSlot}
              >
                <slot
                  name="description"
                  @slotchange=${(e) => AccordionItem_1._onSlotChange(e, v => {
            this._hasDescriptionSlot = v;
        })}
                ></slot>
              </span>
            </span>
          </button>
          <div class="header-actions">
            <slot name="header-actions"></slot>
          </div>
          ${this._renderToggleIcon()}
        </div>
        <div
          id=${`panel-content-${__classPrivateFieldGet(this, _AccordionItem_id, "f")}`}
          part="content"
          class="panel-content"
          role="region"
          aria-labelledby=${`panel-header-${__classPrivateFieldGet(this, _AccordionItem_id, "f")}`}
        >
          <div class="content-inner">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
    }
};
_AccordionItem_id = new WeakMap();
_AccordionItem_reason = new WeakMap();
AccordionItem.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], AccordionItem.prototype, "disabled", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], AccordionItem.prototype, "open", void 0);
__decorate([
    n({ type: Boolean, reflect: true, attribute: 'hide-toggle' })
], AccordionItem.prototype, "hideToggle", void 0);
__decorate([
    r()
], AccordionItem.prototype, "_hasDescriptionSlot", void 0);
__decorate([
    e('.header-button')
], AccordionItem.prototype, "headerButton", void 0);
AccordionItem = AccordionItem_1 = __decorate([
    IndividualComponent
], AccordionItem);

export { AccordionItem };
//# sourceMappingURL=accordion-item.js.map
