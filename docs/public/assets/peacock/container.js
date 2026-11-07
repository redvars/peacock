import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { e } from './class-map-NDIkZErE.js';
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

.container-wrapper {
  container: containerwrapper/inline-size;
}
.container-wrapper.size-max .container {
  max-width: var(--container-max-width, var(--container-max));
}
.container-wrapper.size-xl .container {
  max-width: var(--container-max-width, var(--container-xl));
}
.container-wrapper.size-sm .container {
  max-width: var(--container-max-width, var(--container-sm));
}
.container-wrapper.size-md .container {
  max-width: var(--container-max-width, var(--container-md));
}
.container-wrapper.size-lg .container {
  max-width: var(--container-max-width, var(--container-lg));
}

.container {
  margin: auto;
  width: 100%;
  max-width: var(--container-max-width, none);
}
.container .content {
  padding: var(--container-padding, var(--spacing-200));
}

:host(.debug) {
  border-width: 0 1px;
  border-color: var(--color-red);
  border-style: solid;
  background: var(--color-red-50);
}
:host(.debug) .container {
  border-width: 0 1px;
  border-color: var(--color-blue);
  border-style: solid;
  background: var(--color-blue-100);
}
:host(.debug) .container .content {
  border-width: 0 1px;
  border-color: var(--color-green);
  border-style: solid;
  background: var(--color-green-100);
}

.content {
  margin-inline: 0;
}

@container containerwrapper (min-width: 672px) {
  .content {
    margin-inline: var(--spacing-200);
  }
}
@container containerwrapper (min-width: 1056px) {
  .content {
    margin-inline: var(--spacing-200);
  }
}
@container containerwrapper (min-width: 1312px) {
  .content {
    margin-inline: var(--spacing-200);
  }
}
@container containerwrapper (min-width: 1584px) {
  .content {
    margin-inline: var(--spacing-300);
  }
}`;

/**
 * @label Container
 * @tag wc-container
 * @rawTag container
 * @summary A centred block that caps the width of page content at a breakpoint size and pads it.
 *
 * @overview
 * <p><code>size</code> sets the maximum width: <code>sm</code>, <code>md</code>, <code>lg</code>,
 * <code>xl</code> or <code>max</code>, from the matching <code>--container-*</code> tokens, or
 * <code>full</code> (the default) for no maximum. <code>--container-max-width</code> overrides the
 * width for any size. The content is centred and padded with <code>--container-padding</code>,
 * and gains side margins once the container is 672px wide or more (measured with a container
 * query, not the viewport).</p>
 * <p>It is layout only, with no behaviour or events.</p>
 * @cssprop --container-max-width - Controls the maximum width of the container.
 * @cssprop --container-padding - Controls the padding of the container.
 * @tags layout
 *
 * @example
 * ```html
 * <wc-container style="width: 80%; border: 1px dotted black;" size="md">Content</wc-container>
 * ```
 */
let Container = class Container extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Max-width breakpoint of the container.
         * Possible values are `"max"`, `"xl"`, `"lg"`, `"md"`, `"sm"`, `"full"`. Defaults to `"full"`.
         */
        this.size = 'full';
    }
    render() {
        const wrapperClasses = {
            'container-wrapper': true,
            [`size-${this.size}`]: true,
        };
        return b `
      <div class=${e(wrapperClasses)}>
        <div class="container">
          <div class="content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
    }
};
Container.styles = [css_248z];
__decorate([
    n({ type: String, reflect: true })
], Container.prototype, "size", void 0);
Container = __decorate([
    IndividualComponent
], Container);

export { Container };
//# sourceMappingURL=container.js.map
