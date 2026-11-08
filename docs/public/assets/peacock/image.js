import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './query-CHb9Ft_d.js';
import { o as observeThemeChange } from './observe-theme-change-CkSENG98.js';
import { I as I18nController } from './i18n-controller-Cp43HjJl.js';
import './base-Cl6v8-BZ.js';
import './strings-BJPuhKJk.js';
import './locale-DEsJZCQG.js';

/**
 * Whether Peacock is showing its dark theme, the same way the tokens decide it: `data-theme="dark"`
 * or `"light"` on the root element wins; without it, the system `prefers-color-scheme` applies.
 */
function isDarkMode() {
    const { theme } = document.documentElement.dataset;
    if (theme === 'dark')
        return true;
    if (theme === 'light')
        return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

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
  background: var(--color-surface-container-highest);
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
  border-radius: var(--shape-corner-extra-small);
  cursor: auto;
}`;

/**
 * @label Image
 * @tag wc-image
 * @rawTag image
 * @summary An image that loads as it nears the viewport, with an optional dark-theme source and a click-to-enlarge preview.
 *
 * @overview
 * <p>Until the image is within 200px of the viewport a placeholder is shown in its place; then
 * the <code>&lt;img&gt;</code> is rendered. Set <code>alt</code> as on a native image, or leave it
 * empty for a decorative one.</p>
 * <p><code>dark-src</code> is used instead of <code>src</code> while the theme is dark; when the
 * theme changes the image loads again from the matching source.</p>
 * <p>With <code>preview</code>, clicking the image opens it in a modal dialog labelled from
 * Peacock's strings. Clicking the backdrop closes it.</p>
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
        /** Text alternative for the image, as on a native `<img>`. Leave empty for a decorative image. */
        this.alt = '';
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
        /** Peacock's strings for the preview dialog label. */
        this.i18n = new I18nController(this);
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
              alt=${this.alt}
              class=${this.preview ? 'clickable' : ''}
              @click=${this._handleClick}
            />`
            : b `<span class="placeholder" aria-hidden="true"></span>`}
      </div>

      <!-- Lightbox preview dialog — uses native top-layer to avoid stacking context issues -->
      <dialog
        class="preview-dialog"
        aria-label=${this.i18n.t('imagePreview')}
        @click=${this._handleDialogClick}
      >
        <img
          src=${this._activeSrc}
          alt=${this.alt}
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
    n()
], Image.prototype, "alt", void 0);
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
