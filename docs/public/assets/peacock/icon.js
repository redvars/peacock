import { i, _ as __decorate, a as i$1, b, I as IndividualComponent } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { a as fetchIcon, f as fetchSVG, s as sanitizeSvg, o } from './datasource-B2eRh6Or.js';
import './directive-ZPhl09Yt.js';
import './unsafe-html-Ct0N2_UU.js';

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
  display: inline-flex;
  vertical-align: middle;
  --icon-size: inherit;
  --icon-color: inherit;
}

.icon {
  height: var(--icon-size, 1rem);
  width: var(--icon-size, 1rem);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.icon svg {
  fill: var(--icon-color);
  height: 100%;
  width: 100%;
}`;

/**
 * @label Icon
 * @tag wc-icon
 * @rawTag icon
 * @summary Icons are visual symbols used to represent ideas, objects, or actions.
 * @overview Icons are visual symbols used to represent ideas, objects, or actions. They communicate messages at a glance, afford interactivity, and draw attention to important information.
 *
 * @cssprop --icon-color - Controls the color of the icon.
 * @cssprop [--icon-size=1rem] - Controls the size of the icon. Defaults to "1rem"
 *
 * @example
 * ```html
 * <wc-icon name="home" style="--icon-size: 2rem;"></wc-icon>
 * ```
 *
 */
let Icon = class Icon extends i$1 {
    constructor() {
        super(...arguments);
        /** Icon library provider. Defaults to `"material-symbols"`. */
        this.provider = 'material-symbols';
        /** Rendered SVG markup, updated after each successful fetch. */
        this.svgContent = '';
        /** True while an SVG fetch is in-flight. */
        this.loading = false;
        /** Holds the last fetch error, if any. */
        this.error = null;
        // ── Private fields ────────────────────────────────────────────────────────
        /** Monotonically incrementing token used to discard stale fetch results. */
        this._fetchId = 0;
    }
    // ── Lifecycle ─────────────────────────────────────────────────────────────
    firstUpdated() {
        // perform initial fetch once component is connected and rendered
        this.__scheduleUpdate();
    }
    updated(changedProperties) {
        // only refetch when name or src changed
        if (changedProperties.has('name') || changedProperties.has('src')) {
            this.__scheduleUpdate();
        }
    }
    // ── Private methods ───────────────────────────────────────────────────────
    // small debounce to coalesce rapid changes (50ms)
    __scheduleUpdate() {
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }
        // @ts-ignore - setTimeout in DOM returns number
        this._debounceTimer = window.setTimeout(() => this.__updateSvg(), 50);
    }
    /** @internal */
    async __updateSvg() {
        this._fetchId += 1;
        const currentId = this._fetchId;
        this.loading = true;
        this.error = null;
        try {
            let raw;
            if (this.name) {
                raw = await fetchIcon(this.name, this.provider);
            }
            else if (this.src) {
                raw = await fetchSVG(this.src);
            }
            else {
                raw = '';
            }
            // If another fetch started after this one, ignore this result
            if (currentId !== this._fetchId)
                return;
            if (raw) {
                this.svgContent = sanitizeSvg(raw);
            }
            else {
                this.svgContent = '';
            }
        }
        catch (err) {
            // capture and surface error, but avoid throwing
            this.error = err instanceof Error ? err : new Error(String(err));
            this.svgContent = '';
            // bubble an event so consumers can react
            this.dispatchEvent(new CustomEvent('icon-error', {
                detail: { name: this.name, src: this.src, error: this.error },
                bubbles: true,
                composed: true,
            }));
        }
        finally {
            // ensure loading is cleared unless another fetch started
            if (currentId === this._fetchId) {
                this.loading = false;
            }
        }
    }
    // ── Render ────────────────────────────────────────────────────────────────
    render() {
        // accessible wrapper; consumers can provide a fallback via <slot name="fallback">.
        return b ` <div class="icon">
      ${this.svgContent
            ? o(this.svgContent)
            : b `<slot name="fallback"></slot>`}
    </div>`;
    }
};
Icon.styles = [css_248z];
__decorate([
    n({ type: String, reflect: true })
], Icon.prototype, "name", void 0);
__decorate([
    n({ type: String, reflect: true })
], Icon.prototype, "src", void 0);
__decorate([
    n({ type: String })
], Icon.prototype, "provider", void 0);
__decorate([
    r()
], Icon.prototype, "svgContent", void 0);
__decorate([
    r() // @ts-ignore
], Icon.prototype, "loading", void 0);
__decorate([
    r()
], Icon.prototype, "error", void 0);
Icon = __decorate([
    IndividualComponent
], Icon);

export { Icon };
//# sourceMappingURL=icon.js.map
