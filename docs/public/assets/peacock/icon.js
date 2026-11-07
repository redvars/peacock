import { i, _ as __decorate, a as i$1, b, I as IndividualComponent } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { s as sanitizeSvg, o } from './sanitize-svg-zWrzQaZj.js';
import { a as fetchIcon, f as fetchSVG } from './datasource-OwvH7SVq.js';
import './directive-ZPhl09Yt.js';
import './unsafe-html-Cy_JqoPT.js';

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
 * @summary An icon by name from an icon library, Material Symbols by default, or an SVG file loaded from a URL.
 * @overview
 * <p>Set <code>name</code> for an icon from the <code>provider</code> library (Material Symbols by
 * default), or <code>src</code> for an SVG file, which is fetched and rendered inline.</p>
 * <p>Icons are decorative by default (<code>aria-hidden="true"</code> on the host). Give an icon that carries
 * meaning on its own a <code>label</code>; it then becomes <code>role="img"</code> with that accessible name. Inside a
 * labelled control (an icon button, for example) leave the icon unlabelled and name the control.</p>
 *
 * @cssprop --icon-color - Controls the color of the icon.
 * @cssprop [--icon-size=1rem] - Controls the size of the icon. Defaults to "1rem"
 *
 * @fires {CustomEvent<{name?: string, src?: string, error: Error}>} icon-error - Dispatched when the icon's SVG fails to load.
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
        /**
         * Accessible name for an icon that carries meaning on its own. With a label the icon is
         * `role="img"` named by it; without one it is decorative and hidden from assistive technology.
         */
        this.label = '';
        /** Rendered SVG markup, updated after each successful fetch. */
        this.svgContent = '';
        /** True while an SVG fetch is in-flight. */
        this.loading = false;
        /** Holds the last fetch error, if any. */
        this.error = null;
        // ── Private fields ────────────────────────────────────────────────────────
        /** Monotonically incrementing token used to discard stale fetch results. */
        this._fetchId = 0;
        /** True while the host's `role` and `aria-label` are the ones set from `label`. */
        this._labelled = false;
    }
    // ── Lifecycle ─────────────────────────────────────────────────────────────
    willUpdate(changedProperties) {
        if (!this.hasUpdated || changedProperties.has('label')) {
            this.__syncAccessibility();
        }
    }
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
    /**
     * Names the host from `label`, or hides it as decorative. An `aria-label` or `aria-labelledby`
     * the consumer put on the host is left alone, so the icon is not hidden over it.
     */
    __syncAccessibility() {
        if (this.label) {
            this.setAttribute('role', 'img');
            this.setAttribute('aria-label', this.label);
            this.removeAttribute('aria-hidden');
            this._labelled = true;
            return;
        }
        if (this._labelled) {
            this.removeAttribute('role');
            this.removeAttribute('aria-label');
            this._labelled = false;
        }
        if (!this.hasAttribute('aria-label') &&
            !this.hasAttribute('aria-labelledby')) {
            this.setAttribute('aria-hidden', 'true');
        }
    }
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
    n()
], Icon.prototype, "label", void 0);
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
