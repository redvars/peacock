import { _ as __decorate } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { t as throttle } from './throttle-C7ZAPqtu.js';

function mixinBaseButton(base) {
    class BaseButtonElement extends base {
        constructor() {
            super(...arguments);
            this.variant = '';
            this.color = '';
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
            this.__dispatchClickWithThrottle = event => {
                this.__dispatchClick(event);
            };
        }
        firstUpdated(changedProperties) {
            super.firstUpdated(changedProperties);
            if (typeof this.throttleDelay === 'number') {
                this.__dispatchClickWithThrottle = throttle(this.__dispatchClick, this.throttleDelay);
            }
        }
    }
    __decorate([
        n({ type: String, reflect: true })
    ], BaseButtonElement.prototype, "variant", void 0);
    __decorate([
        n({ type: String, reflect: true })
    ], BaseButtonElement.prototype, "color", void 0);
    __decorate([
        n({ type: Boolean, reflect: true })
    ], BaseButtonElement.prototype, "disabled", void 0);
    __decorate([
        n({ type: Boolean, reflect: true, attribute: 'soft-disabled' })
    ], BaseButtonElement.prototype, "softDisabled", void 0);
    __decorate([
        n({ attribute: 'disabled-reason' })
    ], BaseButtonElement.prototype, "disabledReason", void 0);
    __decorate([
        n()
    ], BaseButtonElement.prototype, "throttleDelay", void 0);
    return BaseButtonElement;
}

/**
 * Mixes in hyperlink behavior for a class.
 *
 * @example
 * ```ts
 * class MyLink extends mixinHyperlink(LitElement) {}
 * ```
 *
 * @param base The class to mix functionality into.
 * @return The provided class with `Hyperlink` mixed in.
 */
function mixinHyperlink(base) {
    class HyperlinkElement extends base {
        // Mixins must have a constructor with `...args: any[]`
        // tslint:disable-next-line:no-any
        // eslint-disable-next-line no-useless-constructor
        constructor(...args) {
            super(...args);
            this.target = '_self';
            this.rel = '';
            this.download = '';
        }
    }
    __decorate([
        n()
    ], HyperlinkElement.prototype, "href", void 0);
    __decorate([
        n()
    ], HyperlinkElement.prototype, "target", void 0);
    __decorate([
        n()
    ], HyperlinkElement.prototype, "rel", void 0);
    __decorate([
        n()
    ], HyperlinkElement.prototype, "download", void 0);
    return HyperlinkElement;
}

export { mixinHyperlink as a, mixinBaseButton as m };
//# sourceMappingURL=hyperlink-DLvb6MXE.js.map
