import { i, b, _ as __decorate, I as IndividualComponent, a as i$1 } from './IndividualComponent-Bdwyrvd6.js';
import { e } from './class-map-DG7CA1et.js';
import { N as NativeHyperlinkMixin } from './NativeHyperlinkMixin-D9J4aBTy.js';
import './directive-ZPhl09Yt.js';
import './property-B49QQ8pS.js';

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
  display: inline;
  color: var(--color-primary);
}

.link {
  border-radius: inherit;
  corner-shape: inherit;
  color: inherit;
  --icon-color: currentColor;
  text-decoration: none;
}
.link:hover, .link:focus-visible {
  text-decoration: underline;
}

:host(.inherit) .link {
  color: inherit;
  text-decoration: none !important;
}`;

/**
 * @label Link
 * @tag wc-link
 * @rawTag link
 * @summary The link component is used to navigate to a new page or section within the current page.
 * @cssprop --link-color - Controls the color of the link.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-link href="#">Link</wc-link>
 * ```
 */
let Link = class Link extends NativeHyperlinkMixin(i$1) {
    render() {
        return b `<a
      class=${e({
            link: true,
        })}
      href=${this.href}
      ?download=${this.download}
      target=${this.target}
      ?rel=${this.rel}
      ?tabindex=${this.parentElement?.tabIndex}
    >
      <slot></slot>
    </a>`;
    }
};
Link.styles = [css_248z];
Link = __decorate([
    IndividualComponent
], Link);

export { Link };
//# sourceMappingURL=link.js.map
