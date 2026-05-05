import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import { sanitizeSvg } from '@/__internal/utils/sanitize-svg.js';

import { fetchIcon, fetchSVG } from './datasource.js';
import styles from './icon.scss';
import IndividualComponent from '@/IndividualComponent.js';

export type IconProvider = 'material-symbols' | 'material-icons';
/**
 * @label Icon
 * @tag wc-icon
 * @rawTag icon
 * @summary Icons are visual symbols used to represent ideas, objects, or actions.
 * @overview Icons are visual symbols used to represent ideas, objects, or actions. They communicate messages at a glance, afford interactivity, and draw attention to important information.
 *
 * @cssprop --icon-color - Controls the color of the icon.
 * @cssprop [--icon-size=1rem] - Controls the size of the icon. Defaults to "1rem"
 *
 * @example
 * ```html
 * <wc-icon name="home" style="--icon-size: 2rem;"></wc-icon>
 * ```
 *
 */
@IndividualComponent
export class Icon extends LitElement {
  static styles = [styles];

  /**
   * The identifier for the icon.
   * This name corresponds to a specific SVG asset in the icon set.
   */
  @property({ type: String, reflect: true }) name?: string;

  /** URL of an external SVG file to fetch and render inline. */
  @property({ type: String, reflect: true }) src?: string;

  /** Icon library provider. Defaults to `"material-symbols"`. */
  @property({ type: String }) provider: IconProvider = 'material-symbols';

  /** Rendered SVG markup, updated after each successful fetch. */
  @state()
  private svgContent: string = '';

  /** True while an SVG fetch is in-flight. */
  @state() // @ts-ignore
  private loading: boolean = false;

  /** Holds the last fetch error, if any. */
  @state()
  private error: Error | null = null;

  // ── Private fields ────────────────────────────────────────────────────────

  /** Monotonically incrementing token used to discard stale fetch results. */
  private _fetchId = 0;

  /** Timer handle for debouncing rapid property changes. */
  private _debounceTimer: number | undefined;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

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

  // ── Private methods ───────────────────────────────────────────────────────

  // small debounce to coalesce rapid changes (50ms)
  private __scheduleUpdate() {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer as any);
    }
    // @ts-ignore - setTimeout in DOM returns number
    this._debounceTimer = window.setTimeout(() => this.__updateSvg(), 50);
  }

  /** @internal */
  private async __updateSvg() {
    this._fetchId += 1;
    const currentId = this._fetchId;
    this.loading = true;
    this.error = null;

    try {
      let raw: string | undefined;

      if (this.name) {
        raw = await fetchIcon(this.name, this.provider);
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

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    // accessible wrapper; consumers can provide a fallback via <slot name="fallback">.
    return html` <div class="icon">
      ${this.svgContent
        ? unsafeSVG(this.svgContent)
        : html`<slot name="fallback"></slot>`}
    </div>`;
  }
}
