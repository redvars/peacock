import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { F as FloatingController } from './floating-controller-CZYwnRVu.js';
import './floating-ui.dom-oQieRCpS.js';

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
  display: inline-block;
}`;

/**
 * @label Popover
 * @tag wc-popover
 * @rawTag popover
 * @summary Displays additional information in a floating panel anchored to a trigger element.
 * @overview
 * <p>The Popover component wraps a trigger element and a <code>wc-popover-content</code> child. It uses
 * floating-ui to compute position, keeping the panel visible inside the viewport even on scroll.</p>
 * @tags display
 *
 * @fires {CustomEvent} wc-popover--open - Fired when the popover opens.
 * @fires {CustomEvent} wc-popover--close - Fired when the popover closes.
 *
 * @example
 * ```html
 * <wc-popover trigger="click">
 *   <wc-button>Open popover</wc-button>
 *   <wc-popover-content>
 *     <p>Popover body text goes here.</p>
 *   </wc-popover-content>
 * </wc-popover>
 * ```
 */
let Popover = class Popover extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Determines how the popover is triggered.
         * Possible values are `"click"`, `"hover"`, `"manual"`.
         */
        this.trigger = 'click';
        /**
         * Preferred placement of the popover relative to the trigger element.
         * Accepts any floating-ui `Placement` string such as `"bottom"`, `"top-start"`, `"right"`, etc.
         */
        this.placement = 'bottom';
        /**
         * Whether the popover is open.
         */
        this.open = false;
        /**
         * Distance in pixels between the trigger element and the popover panel.
         */
        this.offset = 8;
        this._floating = null;
        this._contentEl = null;
        this._triggerEl = null;
    }
    _setupFloating() {
        // Tear down any existing controller
        if (this._floating) {
            this._floating = null;
        }
        // Resolve the content element
        this._contentEl = this.querySelector('wc-popover-content');
        // Resolve the trigger element: first light-DOM child that is NOT wc-popover-content
        this._triggerEl =
            Array.from(this.children).find(c => c.tagName.toLowerCase() !== 'wc-popover-content') ?? null;
        if (!this._triggerEl || !this._contentEl)
            return;
        const triggerMode = this.trigger === 'manual'
            ? 'manual'
            : this.trigger;
        this._floating = new FloatingController(this, {
            placement: this.placement,
            strategy: 'fixed',
            offset: this.offset,
            trigger: triggerMode,
            closeOnClickOutside: true,
            onOpenChange: isOpen => {
                this.open = isOpen;
                if (this._contentEl) {
                    this._contentEl.open = isOpen;
                }
                this.dispatchEvent(new CustomEvent(isOpen ? 'wc-popover--open' : 'wc-popover--close', {
                    bubbles: true,
                    composed: true,
                }));
            },
        });
        this._floating.setElements(this._triggerEl, this._contentEl);
        if (this.open) {
            this._floating.open();
            this._contentEl.open = true;
        }
    }
    connectedCallback() {
        super.connectedCallback();
    }
    firstUpdated() {
        this._setupFloating();
    }
    updated(changedProps) {
        if (changedProps.has('trigger') ||
            changedProps.has('placement') ||
            changedProps.has('offset')) {
            this._setupFloating();
        }
        if (changedProps.has('open') && this._floating) {
            if (this.open && !this._floating.isOpen) {
                this._floating.open();
                if (this._contentEl)
                    this._contentEl.open = true;
            }
            else if (!this.open && this._floating.isOpen) {
                this._floating.close();
                if (this._contentEl)
                    this._contentEl.open = false;
            }
        }
    }
    /**
     * Programmatically opens the popover.
     */
    show() {
        if (this._floating && !this._floating.isOpen) {
            this._floating.open();
        }
        else if (!this._floating) {
            this.open = true;
        }
    }
    /**
     * Programmatically closes the popover.
     */
    hide() {
        if (this._floating && this._floating.isOpen) {
            this._floating.close();
        }
        else if (!this._floating) {
            this.open = false;
        }
    }
    render() {
        return b `<slot></slot>`;
    }
};
Popover.styles = [css_248z];
__decorate([
    n({ reflect: true })
], Popover.prototype, "trigger", void 0);
__decorate([
    n({ reflect: true })
], Popover.prototype, "placement", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Popover.prototype, "open", void 0);
__decorate([
    n({ type: Number })
], Popover.prototype, "offset", void 0);
Popover = __decorate([
    IndividualComponent
], Popover);

export { Popover };
//# sourceMappingURL=popover.js.map
