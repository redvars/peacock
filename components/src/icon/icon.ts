import { html, LitElement, PropertyValues } from 'lit';
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
 * @summary An icon by name from an icon library, Material Symbols by default, or an SVG file loaded from a URL.
 * @overview
 * <p>Set <code>name</code> for an icon from the <code>provider</code> library (Material Symbols by
 * default), or <code>src</code> for an SVG file, which is fetched and rendered inline.</p>
 * <p>Icons are decorative by default (<code>aria-hidden="true"</code> on the host). Give an icon that carries
 * meaning on its own a <code>label</code>; it then becomes <code>role="img"</code> with that accessible name. Inside a
 * labelled control (an icon button, for example) leave the icon unlabelled and name the control.</p>
 *
 * @cssprop --icon-color - Controls the color of the icon.
 * @cssprop [--icon-size=1rem] - Controls the size of the icon. Defaults to "1rem"
 *
 * @fires {CustomEvent<{name?: string, src?: string, error: Error}>} icon-error - Dispatched when the icon's SVG fails to load.
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

  /**
   * Accessible name for an icon that carries meaning on its own. With a label the icon is
   * `role="img"` named by it; without one it is decorative and hidden from assistive technology.
   */
  @property() label = '';

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

  /** True while the host's `role` and `aria-label` are the ones set from `label`. */
  private _labelled = false;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  willUpdate(changedProperties: PropertyValues<this>) {
    if (!this.hasUpdated || changedProperties.has('label')) {
      this.__syncAccessibility();
    }
  }

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

  /**
   * Names the host from `label`, or hides it as decorative. An `aria-label` or `aria-labelledby`
   * the consumer put on the host is left alone, so the icon is not hidden over it.
   */
  private __syncAccessibility() {
    if (this.label) {
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', this.label);
      this.removeAttribute('aria-hidden');
      this._labelled = true;
      return;
    }
    if (this._labelled) {
      this.removeAttribute('role');
      this.removeAttribute('aria-label');
      this._labelled = false;
    }
    if (
      !this.hasAttribute('aria-label') &&
      !this.hasAttribute('aria-labelledby')
    ) {
      this.setAttribute('aria-hidden', 'true');
    }
  }

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
