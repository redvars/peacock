import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './query-CHb9Ft_d.js';
import { i as isDarkMode, o as observeThemeChange } from './is-dark-mode-DOcaw4Yq.js';
import './base-Cl6v8-BZ.js';

var css_248z = i`@charset "UTF-8";
:host {
  display: block;
  height: 100%;
  width: 100%;
}

.image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

img {
  display: block;
  max-height: 100%;
  max-width: 100%;
}

img.clickable {
  cursor: zoom-in;
}

.placeholder {
  background: #e0e0e0;
  min-width: 100px;
  min-height: 100px;
  display: block;
}

/* Lightbox preview — native <dialog> renders in the top layer,
   bypassing any stacking context on the host page.                  */
.preview-dialog {
  background: transparent;
  border: none;
  cursor: zoom-out;
  max-height: 90dvh;
  max-width: 90dvw;
  padding: 0;
}
.preview-dialog[open] {
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-dialog::backdrop {
  background: color-mix(in srgb, var(--color-scrim), transparent 15%);
}

.preview-dialog img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  box-shadow: 0 8px 40px color-mix(in srgb, var(--color-shadow), transparent 40%);
  border-radius: 4px;
  cursor: auto;
}`;

/**
 * @label Image
 * @tag wc-image
 * @rawTag image
 * @summary An image component with lazy loading and theme support.
 * @tags media
 *
 * @example
 * ```html
 * <wc-image src="image.jpg" alt="Description"></wc-image>
 * ```
 */
let Image = class Image extends i$1 {
    constructor() {
        super(...arguments);
        /** Primary image source */
        this.src = '';
        /** Optional dark-mode image source */
        this.darkSrc = '';
        /** Alt text / title for the image */
        this.imageTitle = '';
        /** Enable click-to-preview lightbox */
        this.preview = false;
        /** True when the OS/app theme is dark, used to select `darkSrc`. */
        this._isDarkMode = isDarkMode();
        /** True once the image has entered the viewport and the `<img>` element has been rendered. */
        this._loaded = false;
        // ── Private fields ────────────────────────────────────────────────────────
        /** IntersectionObserver for lazy-loading the image when it enters the viewport. */
        this._intersectionObserver = null;
        /** Cleanup function returned by `observeThemeChange`. */
        this._themeCleanup = null;
    }
    connectedCallback() {
        super.connectedCallback();
        // Theme observation
        this._themeCleanup = observeThemeChange(() => {
            this._isDarkMode = isDarkMode();
            // Reset lazy-load state so new src is loaded when visible
            this._loaded = false;
            this._setupIntersectionObserver();
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._intersectionObserver?.disconnect();
        this._themeCleanup?.();
    }
    firstUpdated() {
        this._setupIntersectionObserver();
    }
    _setupIntersectionObserver() {
        this._intersectionObserver?.disconnect();
        const wrapper = this.shadowRoot?.querySelector('.image-wrapper');
        if (!wrapper)
            return;
        this._intersectionObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                this._loaded = true;
                this._intersectionObserver?.disconnect();
            }
        }, { rootMargin: '200px' });
        this._intersectionObserver.observe(wrapper);
    }
    get _activeSrc() {
        return this._isDarkMode && this.darkSrc ? this.darkSrc : this.src;
    }
    _handleClick() {
        if (this.preview) {
            this._dialog?.showModal();
        }
    }
    _handleDialogClick(e) {
        // Close when clicking the backdrop (target is the dialog itself, not the image)
        if (e.target === e.currentTarget) {
            e.currentTarget.close();
        }
    }
    render() {
        return b `
      <div class="image-wrapper">
        ${this._loaded
            ? b `<img
              src=${this._activeSrc}
              alt=${this.imageTitle}
              class=${this.preview ? 'clickable' : ''}
              @click=${this._handleClick}
            />`
            : b `<span class="placeholder" aria-hidden="true"></span>`}
      </div>

      <!-- Lightbox preview dialog — uses native top-layer to avoid stacking context issues -->
      <dialog
        class="preview-dialog"
        aria-label="Image preview"
        @click=${this._handleDialogClick}
      >
        <img
          src=${this._activeSrc}
          alt=${this.imageTitle}
          @click=${(e) => e.stopPropagation()}
        />
      </dialog>
    `;
    }
};
Image.styles = [css_248z];
__decorate([
    n({ reflect: true })
], Image.prototype, "src", void 0);
__decorate([
    n({ reflect: true, attribute: 'dark-src' })
], Image.prototype, "darkSrc", void 0);
__decorate([
    n({ attribute: 'image-title' })
], Image.prototype, "imageTitle", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Image.prototype, "preview", void 0);
__decorate([
    r()
], Image.prototype, "_isDarkMode", void 0);
__decorate([
    r()
], Image.prototype, "_loaded", void 0);
__decorate([
    e('.preview-dialog')
], Image.prototype, "_dialog", void 0);
Image = __decorate([
    IndividualComponent
], Image);

export { Image };
//# sourceMappingURL=image.js.map
