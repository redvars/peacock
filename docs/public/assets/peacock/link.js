import { i, A, b, _ as __decorate, I as IndividualComponent, a as i$1 } from './IndividualComponent-BK7XZjE2.js';
import { e } from './class-map-NDIkZErE.js';
import { N as NativeHyperlinkMixin } from './NativeHyperlinkMixin-WdY0fM-H.js';
import './directive-ZPhl09Yt.js';
import './property-B2TG3KEE.js';

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
 * @summary A text link to another page, or to a section of the current one.
 *
 * @overview
 * <p>Renders a native <code>&lt;a&gt;</code> around its content, so it behaves and is announced
 * like any link. Set <code>href</code>, and <code>target</code>, <code>rel</code> and
 * <code>download</code> as on a native anchor. Its color is set with <code>--link-color</code>.</p>
 * <p>Use a link to go somewhere. For an action that does something on the page use
 * <code>wc-button</code>, and for a link styled as a button use <code>wc-link-button</code>.</p>
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
      download=${this.download || A}
      target=${this.target}
      rel=${this.rel || A}
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
