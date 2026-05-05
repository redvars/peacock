import { LitElement, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { isDarkMode } from '@/__internal/utils/is-dark-mode.js';
import { observeThemeChange } from '@/__internal/utils/observe-theme-change.js';

import styles from './image.scss';
import IndividualComponent from '@/IndividualComponent.js';

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
@IndividualComponent
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

  @query('.preview-dialog') private _dialog?: HTMLDialogElement;

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
      entries => {
        if (entries[0].isIntersecting) {
          this._loaded = true;
          this._intersectionObserver?.disconnect();
        }
      },
      { rootMargin: '200px' }, // start loading slightly before entering viewport
    );

    this._intersectionObserver.observe(wrapper);
  }

  private get _activeSrc(): string {
    return this._isDarkMode && this.darkSrc ? this.darkSrc : this.src;
  }

  private _handleClick() {
    if (this.preview) {
      this._dialog?.showModal();
    }
  }

  private _handleDialogClick(e: MouseEvent) {
    // Close when clicking the backdrop (target is the dialog itself, not the image)
    if (e.target === e.currentTarget) {
      (e.currentTarget as HTMLDialogElement).close();
    }
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

      <!-- Lightbox preview dialog — uses native top-layer to avoid stacking context issues -->
      <dialog
        class="preview-dialog"
        aria-label="Image preview"
        @click=${this._handleDialogClick}
      >
        <img
          src=${this._activeSrc}
          alt=${this.imageTitle}
          @click=${(e: Event) => e.stopPropagation()}
        />
      </dialog>
    `;
  }
}
