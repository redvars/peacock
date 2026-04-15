import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import { sanitizeSvg } from '@/__utils/sanitize-svg.js';
import { fetchSVG } from '../icon/datasource.js';

import styles from './svg.scss';

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
export class Svg extends LitElement {
  static styles = [styles];

  /** URL of the SVG asset to fetch and render inline. */
  @property({ type: String, reflect: true }) src = '';

  /** Accessible title / alt text for the SVG. */
  @property({ attribute: 'image-title' }) imageTitle = '';

  /** Enable click-to-preview lightbox. */
  @property({ type: Boolean, reflect: true }) preview = false;

  @state() private _loaded = false;

  @state() private _previewOpen = false;

  @state() private _svgContent: string = '';

  // token to avoid stale fetch results
  private _fetchId = 0;

  private _intersectionObserver: IntersectionObserver | null = null;

  disconnectedCallback() {
    super.disconnectedCallback();
    this._intersectionObserver?.disconnect();
  }

  firstUpdated() {
    this._setupIntersectionObserver();
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('src')) {
      // Reset lazy-load state so the new src is fetched when visible
      this._loaded = false;
      this._svgContent = '';
      this._setupIntersectionObserver();
    }
  }

  private _setupIntersectionObserver() {
    this._intersectionObserver?.disconnect();

    const wrapper = this.shadowRoot?.querySelector('.svg-wrapper');
    if (!wrapper) return;

    this._intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this._loaded = true;
          this._intersectionObserver?.disconnect();
          this._fetchSvg();
        }
      },
      { rootMargin: '200px' },
    );

    this._intersectionObserver.observe(wrapper);
  }

  private async _fetchSvg() {
    if (!this.src) return;

    this._fetchId += 1;
    const currentId = this._fetchId;

    try {
      const raw = await fetchSVG(this.src);
      if (currentId !== this._fetchId) return;

      this._svgContent = raw ? sanitizeSvg(raw) : '';
    } catch {
      if (currentId === this._fetchId) {
        this._svgContent = '';
      }
    }
  }

  private _handleClick() {
    if (this.preview) {
      this._previewOpen = true;
      // Move focus into the dialog after render
      this.updateComplete.then(() => {
        const closeBtn = this.shadowRoot?.querySelector<HTMLElement>('.preview-close');
        closeBtn?.focus();
      });
    }
  }

  private _closePreview(e: Event) {
    e.stopPropagation();
    const wasOpen = this._previewOpen;
    this._previewOpen = false;
    if (wasOpen) {
      // Return focus to the trigger
      const trigger = this.shadowRoot?.querySelector<HTMLElement>('.svg-content');
      trigger?.focus();
    }
  }

  render() {
    return html`
      <div class="svg-wrapper">
        ${this._loaded && this._svgContent
          ? html`<div
              class="svg-content ${this.preview ? 'clickable' : ''}"
              role=${this.imageTitle ? 'img' : 'presentation'}
              aria-label=${this.imageTitle || ''}
              @click=${this._handleClick}
            >
              ${unsafeSVG(this._svgContent)}
            </div>`
          : html`<span class="placeholder" aria-hidden="true"></span>`}
      </div>

      <div
        class="preview-overlay ${this._previewOpen ? 'open' : ''}"
        role="dialog"
        aria-modal="true"
        aria-label=${this.imageTitle ? `Preview: ${this.imageTitle}` : 'SVG preview'}
        @click=${this._closePreview}
        @keydown=${(e: KeyboardEvent) => e.key === 'Escape' && this._closePreview(e)}
      >
        <button
          class="preview-close"
          aria-label="Close preview"
          @click=${this._closePreview}
        >&#x2715;</button>
        <div class="preview-content" @click=${(e: Event) => e.stopPropagation()}>
          ${unsafeSVG(this._svgContent)}
        </div>
      </div>
    `;
  }
}
