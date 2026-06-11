import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
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

.empty-state {
  container: emptystate/inline-size;
  padding: var(--spacing-100);
  height: 100%;
  max-width: var(--container-lg);
  margin: auto;
}

.empty-state-container {
  display: flex;
  height: 100%;
  justify-content: center;
  gap: var(--spacing-500);
  align-items: center;
}

.illustration {
  height: 100%;
  display: flex;
}
.illustration .illustration-svg {
  --icon-size: 100%;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.content .headline {
  font-family: var(--typography-headline-medium-font-family) !important;
  font-size: var(--typography-headline-medium-font-size) !important;
  font-weight: var(--typography-headline-medium-font-weight) !important;
  line-height: var(--typography-headline-medium-line-height) !important;
  letter-spacing: var(--typography-headline-medium-letter-spacing) !important;
  margin-bottom: var(--spacing-200);
  color: var(--color-on-surface);
}
.content .description {
  font-family: var(--typography-body-medium-font-family) !important;
  font-size: var(--typography-body-medium-font-size) !important;
  font-weight: var(--typography-body-medium-font-weight) !important;
  line-height: var(--typography-body-medium-line-height) !important;
  letter-spacing: var(--typography-body-medium-letter-spacing) !important;
  margin-bottom: var(--spacing-400);
  color: var(--color-on-surface-variant);
}

:host(.content-center) .content {
  align-items: center;
  text-align: center;
}

@container emptystate (min-width: 672px) {
  .empty-state .illustration {
    width: 50%;
  }
  .empty-state .content {
    width: 50%;
  }
}
@container emptystate (max-width: 671px) {
  .empty-state .empty-state-container {
    flex-direction: column;
    gap: var(--spacing-150);
  }
  .empty-state .empty-state-container .illustration {
    height: auto;
    width: 100%;
    justify-content: center;
  }
  .empty-state .content .headline {
    font-family: var(--typography-headline-small-font-family) !important;
    font-size: var(--typography-headline-small-font-size) !important;
    font-weight: var(--typography-headline-small-font-weight) !important;
    line-height: var(--typography-headline-small-line-height) !important;
    letter-spacing: var(--typography-headline-small-letter-spacing) !important;
  }
}`;

/**
 * @label Empty State
 * @tag wc-empty-state
 * @rawTag empty-state
 * @summary A message that displays when there is no information to display.
 * @tags display
 *
 * @example
 * ```html
 * <wc-empty-state style="width:100%" headline="No items found"></wc-empty-state>
 * ```
 */
let EmptyState = class EmptyState extends i$1 {
    constructor() {
        super(...arguments);
        this.illustration = 'no-document';
        this.headline = '';
        this.description = '';
        /** True when the component width is below 768px; triggers a stacked layout. */
        this.vertical = false;
        this.handleResize = () => {
            // Logic equivalent to Stencil's clientWidth check
            this.vertical = this.offsetWidth < 768;
        };
    }
    connectedCallback() {
        // eslint-disable-next-line wc/guard-super-call
        super.connectedCallback();
        window.addEventListener('resize', this.handleResize);
        // Initial check
        this.handleResize();
    }
    disconnectedCallback() {
        window.removeEventListener('resize', this.handleResize);
        // eslint-disable-next-line wc/guard-super-call
        super.disconnectedCallback();
    }
    __renderTitle() {
        if (!this.headline)
            return A;
        return b `<div class="headline">${this.headline}</div>`;
    }
    __renderDescription() {
        if (!this.description)
            return A;
        return b `<div class="description">${this.description}</div>`;
    }
    render() {
        const classes = {
            'empty-state': true,
            vertical: this.vertical,
        };
        // Resolving asset paths in Lit typically uses import.meta.url or absolute paths
        const illustrationPath = new URL(`./assets/images/empty-state/${this.illustration}.svg`, import.meta.url).href;
        return b `
      <div class="${e(classes)}">
        <div class="empty-state-container">
          <div class="illustration">
            <wc-icon class="illustration-svg" src="${illustrationPath}"></wc-icon>
          </div>

          <div class="content">
            ${this.__renderTitle()} ${this.__renderDescription()}
            <div class="actions">
              <slot name="actions"></slot>
            </div>
          </div>
        </div>
      </div>
    `;
    }
};
// Lit handles styles in a static property for better performance
EmptyState.styles = [css_248z];
__decorate([
    n({ type: String, reflect: true })
], EmptyState.prototype, "illustration", void 0);
__decorate([
    n({ type: String, reflect: true })
], EmptyState.prototype, "headline", void 0);
__decorate([
    n({ type: String, reflect: true })
], EmptyState.prototype, "description", void 0);
__decorate([
    r()
], EmptyState.prototype, "vertical", void 0);
EmptyState = __decorate([
    IndividualComponent
], EmptyState);

export { EmptyState };
//# sourceMappingURL=empty-state.js.map
