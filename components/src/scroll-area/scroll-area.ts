import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { isRtl } from '@/__internal/i18n/locale.js';
import IndividualComponent from '@/IndividualComponent.js';

import styles from './scroll-area.scss';

/** The directions a scroll area scrolls in. */
export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

/** Where to scroll to, or by how much, as in `Element.scrollTo()`. */
export interface ScrollPosition {
  top?: number;
  left?: number;
  behavior?: 'auto' | 'instant' | 'smooth';
}

/** Which edges have more content beyond them. */
interface Overflow {
  top: boolean;
  bottom: boolean;
  start: boolean;
  end: boolean;
}

const NO_OVERFLOW: Overflow = {
  top: false,
  bottom: false,
  start: false,
  end: false,
};

/**
 * @label Scroll Area
 * @tag wc-scroll-area
 * @rawTag scroll-area
 * @summary A scroll container with thin themed scrollbars and shadows at the edges that have more content.
 *
 * @overview
 * <p><code>wc-scroll-area</code> scrolls its content natively (the browser does the scrolling,
 * so touch, wheel, keyboard and scroll snapping behave as usual) with thin scrollbars in the
 * theme's colors, and a soft shadow at each edge that has more content beyond it, so people can
 * see there is more. The shadows follow the scroll position with a scroll-driven animation where
 * the browser supports one, and a scroll listener elsewhere.</p>
 * <p>Give the scroll area a size, such as <code>block-size</code> or
 * <code>max-block-size</code> for a vertical one: it scrolls what does not fit.
 * <code>orientation</code> is <code>vertical</code> (the default), <code>horizontal</code> or
 * <code>both</code>.</p>
 * <p>When the content overflows, the scroll area is focusable (<code>tabindex="0"</code>), so
 * keyboard users can scroll it with the arrow keys, Page Up and Page Down. Give it a
 * <code>label</code> that says what it holds, such as "Terms of service": it is then a
 * <code>region</code> landmark with that name, which screen readers announce on focus.</p>
 * <p><code>scrollTo()</code> and <code>scrollBy()</code> scroll the content, and the element fires
 * <code>scroll</code> (not bubbling, like a native scroll container).</p>
 *
 * @fires {Event} scroll - Dispatched when the content scrolls. Does not bubble, like a native scroll event.
 *
 * @cssprop --scroll-area-thumb-color - Color of the scrollbar thumb.
 * @cssprop --scroll-area-track-color - Color of the scrollbar track; transparent by default.
 * @cssprop --scroll-area-shadow-color - Color of the edge shadows.
 * @cssprop --scroll-area-shadow-size - Depth of the edge shadows.
 *
 * @example
 * ```html
 * <wc-scroll-area label="Release notes" style="max-block-size: 12rem">
 *   <p>...</p>
 * </wc-scroll-area>
 * ```
 * @example
 * ```html
 * <wc-scroll-area orientation="horizontal" label="Photos">
 *   <div style="display: flex; gap: 1rem">...</div>
 * </wc-scroll-area>
 * ```
 * @tags layout
 */
@IndividualComponent
export class ScrollArea extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The directions it scrolls in: `vertical` (default), `horizontal` or `both`. */
  @property({ type: String, reflect: true })
  orientation: ScrollAreaOrientation = 'vertical';

  /** The accessible name; makes the scroll area a `region` landmark. */
  @property({ type: String })
  label = '';

  /** Edges with more content beyond them. */
  @state() private overflow: Overflow = NO_OVERFLOW;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.viewport') private viewport?: HTMLElement;

  @query('.content') private contentElement?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Re-measures when the scroll area or its content changes size. */
  private resizeObserver?: ResizeObserver;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.observe();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  protected override firstUpdated() {
    this.observe();
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has('orientation')) this.measure();
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Whether the content overflows in a direction the scroll area scrolls in. */
  get scrollable(): boolean {
    const { top, bottom, start, end } = this.overflow;
    return top || bottom || start || end;
  }

  /** Scrolls the content, like `Element.scrollTo()`: `({ top, left, behavior })` or `(x, y)`. */
  override scrollTo(optionsOrX?: ScrollPosition | number, y?: number) {
    if (typeof optionsOrX === 'number')
      this.viewport?.scrollTo(optionsOrX, y ?? 0);
    else this.viewport?.scrollTo(optionsOrX);
  }

  /** Scrolls the content by an amount, like `Element.scrollBy()`. */
  override scrollBy(optionsOrX?: ScrollPosition | number, y?: number) {
    if (typeof optionsOrX === 'number')
      this.viewport?.scrollBy(optionsOrX, y ?? 0);
    else this.viewport?.scrollBy(optionsOrX);
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private observe() {
    this.resizeObserver?.disconnect();
    if (typeof ResizeObserver === 'undefined') {
      this.measure();
      return;
    }
    this.resizeObserver = new ResizeObserver(() => this.measure());
    if (this.viewport) this.resizeObserver.observe(this.viewport);
    if (this.contentElement) this.resizeObserver.observe(this.contentElement);
    this.measure();
  }

  private handleScroll = () => {
    this.measure();
    this.dispatchEvent(new Event('scroll'));
  };

  /** Works out which edges have more content beyond them. */
  private measure() {
    const { viewport } = this;
    if (!viewport) return;
    const vertical = this.orientation !== 'horizontal';
    const horizontal = this.orientation !== 'vertical';
    const {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth,
    } = viewport;
    // `scrollLeft` is 0 at the start and negative towards the end in right-to-left content.
    const fromStart = isRtl(this) ? -scrollLeft : scrollLeft;
    const slack = 1;
    const next: Overflow = {
      top: vertical && scrollTop > slack,
      bottom: vertical && scrollTop + clientHeight < scrollHeight - slack,
      start: horizontal && fromStart > slack,
      end: horizontal && fromStart + clientWidth < scrollWidth - slack,
    };
    const current = this.overflow;
    if (
      next.top !== current.top ||
      next.bottom !== current.bottom ||
      next.start !== current.start ||
      next.end !== current.end
    ) {
      this.overflow = next;
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const { top, bottom, start, end } = this.overflow;
    const { scrollable } = this;
    return html`<div class="frame">
      <div
        class="viewport"
        part="viewport"
        role=${this.label ? 'region' : nothing}
        aria-label=${this.label || nothing}
        tabindex=${scrollable ? '0' : nothing}
        @scroll=${this.handleScroll}
      >
        <div class="content" part="content"><slot></slot></div>
      </div>
      <span
        class=${classMap({ shadow: true, top: true, visible: top })}
        aria-hidden="true"
      ></span>
      <span
        class=${classMap({ shadow: true, bottom: true, visible: bottom })}
        aria-hidden="true"
      ></span>
      <span
        class=${classMap({ shadow: true, start: true, visible: start })}
        aria-hidden="true"
      ></span>
      <span
        class=${classMap({ shadow: true, end: true, visible: end })}
        aria-hidden="true"
      ></span>
    </div>`;
  }
}
