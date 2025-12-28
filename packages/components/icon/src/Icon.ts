import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { fetchIcon, fetchSVG } from './datasource.js';
import { sanitizeSvg } from './utils.js';

/**
 * Icons are visual symbols used to represent ideas, objects, or actions.
 *
 * @cssprop --icon-color - Controls the color of the icon.
 * @cssprop --icon-size - Controls the size of the icon.
 */
export class Icon extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      line-height: 0;
      --icon-size: inherit;
      --icon-color: inherit;
    }

    .icon {
      display: inline-block;
      height: var(--icon-size, 1rem);
      width: var(--icon-size, 1rem);

      svg {
        fill: var(--icon-color);
        height: 100%;
        width: 100%;
      }
    }
  `;

  @property({ type: String }) name? = 'home';

  @property({ type: String }) src? = '';

  // optional accessible label
  @property({ type: String }) label? = '';

  @state()
  private svgContent: string = '';

  // loading + error states for consumers/tests
  @state()
  private loading: boolean = false;

  @state()
  private error: Error | null = null;

  // token to avoid race conditions when multiple fetches overlap
  private _fetchId = 0;

  // optional debounce for rapid property changes
  private _debounceTimer: number | undefined;

  firstUpdated() {
    // perform initial fetch once component is connected and rendered
    this.__scheduleUpdate();
  }

  updated(changedProperties: any) {
    // only refetch when name or src changed
    if (changedProperties.has('name') || changedProperties.has('src')) {
      this.__scheduleUpdate();
    }
  }

  // public wrapper kept for compatibility but delegates to internal guarded updater
  async fetchSvg() {
    await this.__updateSvg();
  }

  render() {
    // accessible wrapper; consumers can provide a fallback via <slot name="fallback">.
    const ariaLabel = this.label || this.name || this.src || '';
    return html` <div class="icon" role="img" aria-label=${ariaLabel}>
      ${this.svgContent
        ? unsafeSVG(this.svgContent)
        : html`<slot name="fallback"></slot>`}
    </div>`;
  }

  // small debounce to coalesce rapid changes (50ms)
  private __scheduleUpdate() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer as any);
    }
    // @ts-ignore - setTimeout in DOM returns number
    this._debounceTimer = window.setTimeout(() => this.__updateSvg(), 50);
  }

  /**
   * @internal
   */
  private async __updateSvg() {
    this._fetchId += 1;
    const currentId = this._fetchId;
    this.loading = true;
    this.error = null;

    try {
      let raw: string | undefined;

      if (this.name) {
        raw = await fetchIcon(this.name);
      } else if (this.src) {
        raw = await fetchSVG(this.src);
      } else {
        raw = '';
      }

      // If another fetch started after this one, ignore this result
      if (currentId !== this._fetchId) return;

      if (raw) {
        this.svgContent = sanitizeSvg(raw);
      } else {
        this.svgContent = '';
      }
    } catch (err: any) {
      // capture and surface error, but avoid throwing
      this.error = err instanceof Error ? err : new Error(String(err));
      this.svgContent = '';
      // bubble an event so consumers can react
      this.dispatchEvent(
        new CustomEvent('icon-error', {
          detail: { name: this.name, src: this.src, error: this.error },
          bubbles: true,
          composed: true,
        }),
      );
    } finally {
      // ensure loading is cleared unless another fetch started
      if (currentId === this._fetchId) {
        this.loading = false;
      }
    }
  }
}
