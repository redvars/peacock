import { LitElement, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { isDarkMode } from '@/__internal/utils/is-dark-mode.js';
import { observeThemeChange } from '@/__internal/utils/observe-theme-change.js';

import styles from './image.scss';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';

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
@IndividualComponent
export class Image extends LitElement {
  static styles = [styles];

  /** Primary image source */
  @property({ reflect: true }) src = '';

  /** Optional dark-mode image source */
  @property({ reflect: true, attribute: 'dark-src' }) darkSrc = '';

  /** Text alternative for the image, as on a native `<img>`. Leave empty for a decorative image. */
  @property() alt = '';

  /** Enable click-to-preview lightbox */
  @property({ type: Boolean, reflect: true }) preview = false;

  /** True when the OS/app theme is dark, used to select `darkSrc`. */
  @state() private _isDarkMode: boolean = isDarkMode();

  /** True once the image has entered the viewport and the `<img>` element has been rendered. */
  @state() private _loaded = false;

  @query('.preview-dialog') private _dialog?: HTMLDialogElement;

  // ── Private fields ────────────────────────────────────────────────────────

  /** IntersectionObserver for lazy-loading the image when it enters the viewport. */
  private _intersectionObserver: IntersectionObserver | null = null;

  /** Cleanup function returned by `observeThemeChange`. */
  private _themeCleanup: (() => void) | null = null;

  /** Peacock's strings for the preview dialog label. */
  private readonly i18n = new I18nController(this);

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
              alt=${this.alt}
              class=${this.preview ? 'clickable' : ''}
              @click=${this._handleClick}
            />`
          : html`<span class="placeholder" aria-hidden="true"></span>`}
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
          @click=${(e: Event) => e.stopPropagation()}
        />
      </dialog>
    `;
  }
}
