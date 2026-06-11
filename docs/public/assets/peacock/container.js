import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './class-map-DG7CA1et.js';
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

.container-wrapper {
  container: containerwrapper/inline-size;
}
.container-wrapper.size-max .container {
  max-width: var(--container-max);
}
.container-wrapper.size-xl .container {
  max-width: var(--container-xl);
}
.container-wrapper.size-sm .container {
  max-width: var(--container-sm);
}
.container-wrapper.size-md .container {
  max-width: var(--container-md);
}
.container-wrapper.size-lg .container {
  max-width: var(--container-lg);
}

.container {
  margin: auto;
  width: 100%;
}
.container .content {
  padding: var(--spacing-200);
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
 * @summary A responsive container component for layout.
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
