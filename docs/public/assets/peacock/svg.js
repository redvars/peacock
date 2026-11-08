import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { s as sanitizeSvg, o } from './sanitize-svg-zWrzQaZj.js';
import { f as fetchSVG } from './datasource-OwvH7SVq.js';
import { I as I18nController } from './i18n-controller-DJHsE1YH.js';
import './directive-ZPhl09Yt.js';
import './unsafe-html-Cy_JqoPT.js';
import './strings-DnYjGbbc.js';
import './locale-DEsJZCQG.js';

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
  --svg-size: inherit;
  --svg-color: inherit;
}

.svg-wrapper {
  height: var(--svg-size, 1rem);
  width: var(--svg-size, 1rem);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.svg-content {
  height: 100%;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.svg-content svg {
  fill: var(--svg-color);
  height: 100%;
  width: 100%;
}

.svg-content.clickable {
  cursor: zoom-in;
}

.placeholder {
  display: block;
  height: 100%;
  width: 100%;
}

.preview-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: color-mix(in srgb, var(--color-scrim) 85%, transparent);
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.preview-overlay.open {
  display: flex;
}

.preview-close {
  position: absolute;
  top: 1rem;
  inset-inline-end: 1rem;
  background: transparent;
  border: none;
  color: var(--color-white);
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  padding: 0.25rem 0.5rem;
}
.preview-close:focus-visible {
  outline: 2px solid var(--color-white);
  outline-offset: 2px;
}

.preview-content {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}
.preview-content svg {
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 8px 40px color-mix(in srgb, var(--color-shadow) 60%, transparent);
  border-radius: var(--shape-corner-extra-small);
}`;

/**
 * @label SVG
 * @tag wc-svg
 * @rawTag svg
 * @summary An SVG image from a URL, drawn inline so it takes the text color, loaded once it scrolls into view.
 * @overview
 * <p>Renders an inline SVG fetched from a URL, with lazy loading via IntersectionObserver and an
 * optional click-to-preview lightbox.</p>
 * <ul>
 * <li><code>src</code> is the URL of the SVG. It is fetched when the element enters the viewport,
 * sanitized, and rendered inline; a placeholder shows until then.</li>
 * <li><code>alt</code> is the text alternative, as on a native <code>&lt;img&gt;</code>: with it
 * the SVG is <code>role="img"</code>; without it, it is decorative.</li>
 * <li><code>preview</code> opens the SVG enlarged in a modal lightbox on click. Focus moves to its
 * close button, Escape closes it, and focus returns to the SVG.</li>
 * <li><code>--svg-color</code>, or the inherited <code>color</code>, tints the SVG;
 * <code>--svg-size</code> sets its size.</li>
 * </ul>
 *
 * @cssprop --svg-color - Controls the fill color of the SVG.
 * @cssprop [--svg-size=1rem] - Controls the size of the SVG. Defaults to "1rem"
 *
 * @example
 * ```html
 * <wc-svg src="/icons/my-icon.svg" alt="My icon"></wc-svg>
 * ```
 */
let Svg = class Svg extends i$1 {
    constructor() {
        super(...arguments);
        /** URL of the SVG asset to fetch and render inline. */
        this.src = '';
        /**
         * Text alternative for the SVG, as `alt` on a native `<img>`. With it the SVG is `role="img"`
         * named by it; leave it empty for a decorative SVG.
         */
        this.alt = '';
        /** Enable click-to-preview lightbox. */
        this.preview = false;
        /** True once the element has entered the viewport and the SVG fetch has been initiated. */
        this._loaded = false;
        /** True when the lightbox preview overlay is visible. */
        this._previewOpen = false;
        /** Sanitized inline SVG markup ready for rendering. */
        this._svgContent = '';
        // ── Private fields ────────────────────────────────────────────────────────
        /** Monotonically incrementing token used to discard stale fetch results. */
        this._fetchId = 0;
        /** IntersectionObserver that triggers the SVG fetch when the element enters the viewport. */
        this._intersectionObserver = null;
        /** Peacock's strings for the preview dialog labels. */
        this.i18n = new I18nController(this);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._intersectionObserver?.disconnect();
    }
    firstUpdated() {
        this._setupIntersectionObserver();
    }
    updated(changedProperties) {
        if (changedProperties.has('src')) {
            // Reset lazy-load state so the new src is fetched when visible
            this._loaded = false;
            this._svgContent = '';
            this._setupIntersectionObserver();
        }
    }
    _setupIntersectionObserver() {
        this._intersectionObserver?.disconnect();
        const wrapper = this.shadowRoot?.querySelector('.svg-wrapper');
        if (!wrapper)
            return;
        this._intersectionObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                this._loaded = true;
                this._intersectionObserver?.disconnect();
                this._fetchSvg();
            }
        }, { rootMargin: '200px' });
        this._intersectionObserver.observe(wrapper);
    }
    async _fetchSvg() {
        if (!this.src)
            return;
        this._fetchId += 1;
        const currentId = this._fetchId;
        try {
            const raw = await fetchSVG(this.src);
            if (currentId !== this._fetchId)
                return;
            this._svgContent = raw ? sanitizeSvg(raw) : '';
        }
        catch {
            if (currentId === this._fetchId) {
                this._svgContent = '';
            }
        }
    }
    _handleClick() {
        if (this.preview) {
            this._previewOpen = true;
            // Move focus into the dialog after render
            this.updateComplete.then(() => {
                const closeBtn = this.shadowRoot?.querySelector('.preview-close');
                closeBtn?.focus();
            });
        }
    }
    _closePreview(e) {
        e.stopPropagation();
        const wasOpen = this._previewOpen;
        this._previewOpen = false;
        if (wasOpen) {
            // Return focus to the trigger
            const trigger = this.shadowRoot?.querySelector('.svg-content');
            trigger?.focus();
        }
    }
    render() {
        return b `
      <div class="svg-wrapper">
        ${this._loaded && this._svgContent
            ? b `<div
              class="svg-content ${this.preview ? 'clickable' : ''}"
              role=${this.alt ? 'img' : 'presentation'}
              aria-label=${this.alt || A}
              @click=${this._handleClick}
            >
              ${o(this._svgContent)}
            </div>`
            : b `<span class="placeholder" aria-hidden="true"></span>`}
      </div>

      <div
        class="preview-overlay ${this._previewOpen ? 'open' : ''}"
        role="dialog"
        aria-modal="true"
        aria-label=${this.alt
            ? this.i18n.t('previewTitle')(this.alt)
            : this.i18n.t('svgPreview')}
        @click=${this._closePreview}
        @keydown=${(e) => e.key === 'Escape' && this._closePreview(e)}
      >
        <button
          class="preview-close"
          aria-label=${this.i18n.t('closePreview')}
          @click=${this._closePreview}
        >
          &#x2715;
        </button>
        <div
          class="preview-content"
          @click=${(e) => e.stopPropagation()}
        >
          ${o(this._svgContent)}
        </div>
      </div>
    `;
    }
};
Svg.styles = [css_248z];
__decorate([
    n({ type: String, reflect: true })
], Svg.prototype, "src", void 0);
__decorate([
    n()
], Svg.prototype, "alt", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Svg.prototype, "preview", void 0);
__decorate([
    r()
], Svg.prototype, "_loaded", void 0);
__decorate([
    r()
], Svg.prototype, "_previewOpen", void 0);
__decorate([
    r()
], Svg.prototype, "_svgContent", void 0);
Svg = __decorate([
    IndividualComponent
], Svg);

export { Svg };
//# sourceMappingURL=svg.js.map
