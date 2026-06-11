import { _ as __decorate } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';

/**
 * 2. Apply the type annotation to the variable.
 */
const NativeHyperlinkMixin = (superclass) => {
    // Naming the class (BaseHyperlinkElement) instead of using 'Mixin' or anonymous
    // prevents the "__childPart" visibility error.
    class BaseHyperlinkElement extends superclass {
        constructor() {
            super(...arguments);
            /**
             * Where to display the linked URL. Maps to the native `target` attribute.
             * Possible values are `"_self"`, `"_blank"`, `"_parent"`, `"_top"`, or a custom frame name.
             * When using `"_blank"`, consider setting `rel="noopener noreferrer"` for security. Defaults to `"_self"`.
             */
            this.target = '_self';
        }
    }
    __decorate([
        n({ reflect: true })
    ], BaseHyperlinkElement.prototype, "href", void 0);
    __decorate([
        n()
    ], BaseHyperlinkElement.prototype, "target", void 0);
    __decorate([
        n()
    ], BaseHyperlinkElement.prototype, "rel", void 0);
    __decorate([
        n()
    ], BaseHyperlinkElement.prototype, "download", void 0);
    return BaseHyperlinkElement;
};

export { NativeHyperlinkMixin as N };
//# sourceMappingURL=NativeHyperlinkMixin-D9J4aBTy.js.map
