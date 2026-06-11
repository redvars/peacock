import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b, c as __classPrivateFieldGet } from './IndividualComponent-Bdwyrvd6.js';
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
  display: block;
}

.expansion-panel {
  border: var(--_accordion-item-border, 1px solid var(--color-outline-variant));
  border-radius: var(--shape-corner-medium);
  background-color: var(--_accordion-item-background, var(--color-surface-container-low));
  overflow: hidden;
  transition: background-color var(--duration-medium1) var(--easing-standard), border-color var(--duration-medium1) var(--easing-standard);
}
.expansion-panel .header-button {
  position: relative;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  width: 100%;
  min-height: 3rem;
  padding: 0 var(--spacing-300);
  gap: var(--spacing-200);
  border: none;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
  text-align: start;
  color: var(--color-on-surface);
  overflow: hidden;
}
.expansion-panel .header-button::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--color-on-surface);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-short4) var(--easing-standard);
}
.expansion-panel .header-button:not(:disabled):hover::before {
  opacity: 0.08;
}
.expansion-panel .header-button:focus-visible {
  outline: none;
  outline: 2px solid var(--color-black);
}
.expansion-panel .header-button:focus-visible::before {
  opacity: 0.12;
}
.expansion-panel .header-content {
  display: flex;
  flex: 1;
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
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--spacing-100);
}
.expansion-panel .toggle-icon {
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
.expansion-panel.disabled .header-button {
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.38;
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

:host-context([leading-toggle]) .header-button {
  flex-direction: row;
  justify-content: flex-end;
}`;

var _AccordionItem_id;
var AccordionItem_1;
/**
 * @label Accordion Item
 * @tag wc-accordion-item
 * @rawTag accordion-item
 * @summary An expansion panel with a header that reveals or hides associated content.
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
 * @fires {CustomEvent<{ open: boolean }>} accordion-item-toggle - Fired when the panel is expanded or collapsed.
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
        super(...arguments);
        _AccordionItem_id.set(this, crypto.randomUUID());
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
        /** True when the `description` slot contains at least one non-empty node. */
        this._hasDescriptionSlot = false;
        /** True when the `heading` slot contains at least one non-empty node. */
        this._hasHeadingSlot = false;
    }
    focus() {
        this.buttonElement?.focus();
    }
    blur() {
        this.buttonElement?.blur();
    }
    _handleToggle() {
        if (this.disabled)
            return;
        this.open = !this.open;
        this.dispatchEvent(new CustomEvent('accordion-item-toggle', {
            bubbles: true,
            composed: true,
            detail: { open: this.open },
        }));
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
        <button
          id=${`panel-header-${__classPrivateFieldGet(this, _AccordionItem_id, "f")}`}
          part="header"
          class="header-button"
          tabindex=${this.disabled ? '-1' : '0'}
          aria-controls=${`panel-content-${__classPrivateFieldGet(this, _AccordionItem_id, "f")}`}
          aria-disabled=${this.disabled}
          aria-expanded=${this.open}
          ?disabled=${this.disabled}
          @click=${this._handleToggle}
        >
          ${this._renderToggleIcon()}
          <div class="header-content">
            <span class="header-label">
              <span part="title" class="panel-title">
                <slot
                  name="heading"
                  @slotchange=${(e) => AccordionItem_1._onSlotChange(e, v => {
            this._hasHeadingSlot = v;
        })}
                ></slot>
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
            <slot name="header-actions" class="header-actions"></slot>
          </div>
        </button>
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
    r()
], AccordionItem.prototype, "_hasHeadingSlot", void 0);
__decorate([
    e('.header-button')
], AccordionItem.prototype, "buttonElement", void 0);
AccordionItem = AccordionItem_1 = __decorate([
    IndividualComponent
], AccordionItem);

export { AccordionItem };
//# sourceMappingURL=accordion-item.js.map
