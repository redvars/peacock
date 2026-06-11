import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { f as fetchSVG, s as sanitizeSvg, o } from './datasource-B2eRh6Or.js';
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
  background: rgba(0, 0, 0, 0.85);
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
  right: 1rem;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  padding: 0.25rem 0.5rem;
}
.preview-close:focus-visible {
  outline: 2px solid #fff;
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
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
  border-radius: 4px;
}`;

/**
 * @label SVG
 * @tag wc-svg
 * @rawTag svg
 * @summary An SVG component with lazy loading and optional preview support.
 * @overview Renders an inline SVG fetched from a URL, with lazy loading via IntersectionObserver and an optional click-to-preview lightbox.
 *
 * @cssprop --svg-color - Controls the fill color of the SVG.
 * @cssprop [--svg-size=1rem] - Controls the size of the SVG. Defaults to "1rem"
 *
 * @example
 * ```html
 * <wc-svg src="/icons/my-icon.svg" image-title="My icon"></wc-svg>
 * ```
 */
let Svg = class Svg extends i$1 {
    constructor() {
        super(...arguments);
        /** URL of the SVG asset to fetch and render inline. */
        this.src = '';
        /** Accessible title / alt text for the SVG. */
        this.imageTitle = '';
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
              role=${this.imageTitle ? 'img' : 'presentation'}
              aria-label=${this.imageTitle || ''}
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
        aria-label=${this.imageTitle
            ? `Preview: ${this.imageTitle}`
            : 'SVG preview'}
        @click=${this._closePreview}
        @keydown=${(e) => e.key === 'Escape' && this._closePreview(e)}
      >
        <button
          class="preview-close"
          aria-label="Close preview"
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
    n({ attribute: 'image-title' })
], Svg.prototype, "imageTitle", void 0);
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
