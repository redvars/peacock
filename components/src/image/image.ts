import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';

import { isDarkMode } from '@/__utils/is-dark-mode.js';
import { observeThemeChange } from '@/__utils/observe-theme-change.js';

import styles from './image.scss';

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
export class Image extends LitElement {
  static styles = [styles];

  /** Primary image source */
  @property({ reflect: true }) src = '';

  /** Optional dark-mode image source */
  @property({ reflect: true, attribute: 'dark-src' }) darkSrc = '';

  /** Alt text / title for the image */
  @property({ attribute: 'image-title' }) imageTitle = '';

  /** Enable click-to-preview lightbox */
  @property({ type: Boolean, reflect: true }) preview = false;

  @state() private _isDarkMode: boolean = isDarkMode();

  @state() private _loaded = false;

  @state() private _previewOpen = false;

  private _intersectionObserver: IntersectionObserver | null = null;

  private _themeCleanup: (() => void) | null = null;

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

  private _setupIntersectionObserver() {
    this._intersectionObserver?.disconnect();

    const wrapper = this.shadowRoot?.querySelector('.image-wrapper');
    if (!wrapper) return;

    this._intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this._loaded = true;
          this._intersectionObserver?.disconnect();
        }
      },
      { rootMargin: '200px' } // start loading slightly before entering viewport
    );

    this._intersectionObserver.observe(wrapper);
  }

  private get _activeSrc(): string {
    return this._isDarkMode && this.darkSrc ? this.darkSrc : this.src;
  }

  private _handleClick() {
    if (this.preview) {
      this._previewOpen = true;
    }
  }

  private _closePreview(e: Event) {
    e.stopPropagation();
    this._previewOpen = false;
  }

  render() {
    return html`
      <div class="image-wrapper">
        ${this._loaded
          ? html`<img
              src=${this._activeSrc}
              alt=${this.imageTitle}
              class=${this.preview ? 'clickable' : ''}
              @click=${this._handleClick}
            />`
          : html`<span class="placeholder" aria-hidden="true"></span>`}
      </div>

      <!-- Lightbox preview overlay (inside shadow root) -->
      <div
        class="preview-overlay ${this._previewOpen ? 'open' : ''}"
        role="dialog"
        aria-modal="true"
        aria-label="Image preview"
        @click=${this._closePreview}
        @keydown=${(e: KeyboardEvent) => e.key === 'Escape' && this._closePreview(e)}
      >
        <img src=${this._activeSrc} alt=${this.imageTitle} @click=${(e: Event) => e.stopPropagation()} />
      </div>
    `;
  }
}