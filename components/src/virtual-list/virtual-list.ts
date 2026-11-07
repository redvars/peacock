import { html, LitElement, nothing, render, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { virtualWindow } from '@/__internal/utils/virtual-window.js';
import styles from './virtual-list.scss';

/**
 * Renders one item. Return anything Lit can render: a `TemplateResult` (`html\`...\``), a DOM
 * node or a string. Declared as a method type so a function typed for your own item type fits.
 */
export type VirtualListRenderItem = {
  bivarianceHack(item: unknown, index: number): unknown;
}['bivarianceHack'];

/** Options of `scrollToIndex()`. */
export interface VirtualListScrollOptions {
  /**
   * Where the item lands: `start`, `center` or `end` of the list, or `nearest` (the default),
   * which scrolls only as far as needed to show it.
   */
  align?: 'start' | 'center' | 'end' | 'nearest';
  /** `smooth` animates, unless the person prefers reduced motion. Default `auto`. */
  behavior?: 'auto' | 'smooth';
}

/** Detail of the `end-reached` event. */
export interface VirtualListEndReachedDetail {
  /** How many items the list had when the end came near. */
  count: number;
}

/** Rows rendered before the list can measure its height. */
const FALLBACK_VISIBLE_ROWS = 10;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * @label Virtual List
 * @tag wc-virtual-list
 * @rawTag virtual-list
 *
 * @summary A long list that renders only the items in view, for thousands of items or infinite scroll.
 * @overview
 * <p><code>wc-virtual-list</code> takes an array of <code>items</code> and a
 * <code>renderItem</code> function, and renders only the items in view plus
 * <code>overscan</code> items on each side. Every item has the same height,
 * <code>item-height</code> pixels. The list is its own scroll container: give it a height
 * (the default is <code>20rem</code>).</p>
 * <p>Items are rendered into the list's light DOM, each in a wrapper
 * <code>&lt;div role="listitem"&gt;</code>, so page styles reach them. The list manages its
 * children: do not add your own. <code>renderItem</code> returns a Lit template, a DOM node or a
 * string; use arrow functions for event listeners in the template.</p>
 * <p>The host has <code>role="list"</code> and each rendered item <code>aria-setsize</code> and
 * <code>aria-posinset</code>, so screen readers announce the real length. A focused item stays
 * rendered when it scrolls out of view. With <code>navigable</code>, the items are one tab stop
 * and Up, Down, Page Up, Page Down, Home and End move focus through the whole list.</p>
 * <p>For infinite scroll, listen for <code>end-reached</code>, which fires once per length when
 * the last visible item is within <code>threshold</code> items of the end, and append items.
 * The scroll position is kept. Set <code>loading</code> while they load.</p>
 *
 * @fires {CustomEvent<{count: number}>} end-reached - Dispatched once per `items.length` when the end of the list comes within `threshold` items of the view. Not dispatched while `loading`.
 *
 * @example
 * ```html
 * <wc-virtual-list id="people" label="People" item-height="48" style="height: 20rem"></wc-virtual-list>
 * <script>
 *   const list = document.getElementById('people');
 *   list.items = Array.from({ length: 10000 }, (_, i) => ({ name: `Person ${i + 1}` }));
 *   list.renderItem = item => item.name;
 * </script>
 * ```
 * @tags display
 */
@IndividualComponent
export class VirtualList extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** The items to show. Replace the array (or call `requestUpdate()`) to update the list. */
  @property({ attribute: false }) items: unknown[] = [];

  /** Renders one item. Without it, an item is shown as text. */
  @property({ attribute: false }) renderItem?: VirtualListRenderItem;

  /** The height of every item, in pixels. */
  @property({ type: Number, attribute: 'item-height' }) itemHeight = 48;

  /** Items rendered beyond each edge of the view, so fast scrolling shows no gaps. */
  @property({ type: Number }) overscan = 3;

  /** How many items before the end `end-reached` fires. */
  @property({ type: Number }) threshold = 5;

  /** The accessible name, when no `aria-label` or `aria-labelledby` is set. */
  @property({ type: String }) label = '';

  /** Makes the items one tab stop that the arrow keys, Page Up/Down, Home and End move through. */
  @property({ type: Boolean, reflect: true }) navigable = false;

  /** Shows a progress indicator after the last item and sets `aria-busy`. */
  @property({ type: Boolean, reflect: true }) loading = false;

  // ── State

  /** The scroll offset, in pixels. */
  @state() private scrollPosition = 0;

  /** The height the list shows items in, in pixels. */
  @state() private viewport = 0;

  /** With `navigable`, the index of the item that holds the tab stop. */
  @state() private activeIndex = 0;

  // ── Private fields

  /** The index of the item that has focus, kept rendered while it is out of view; -1 for none. */
  private focusedIndex = -1;

  /** The `items.length` `end-reached` last fired for. */
  private endReachedAt = -1;

  /** Whether the items are being rendered into the light DOM. */
  private renderingItems = false;

  private resizeObserver?: ResizeObserver;

  private readonly i18n = new I18nController(this);

  // ── Lifecycle

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'list');
    this.addEventListener('scroll', this.__handleScroll, { passive: true });
    this.addEventListener('focusin', this.__handleFocusIn);
    this.addEventListener('focusout', this.__handleFocusOut);
    this.addEventListener('keydown', this.__handleKeyDown);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.__measure());
      this.resizeObserver.observe(this);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('scroll', this.__handleScroll);
    this.removeEventListener('focusin', this.__handleFocusIn);
    this.removeEventListener('focusout', this.__handleFocusOut);
    this.removeEventListener('keydown', this.__handleKeyDown);
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    // Until the resize observer reports, read the height here (a state set here adds no update).
    if (!this.viewport) this.viewport = this.clientHeight;
    const count = this.items.length;
    if (this.activeIndex > count - 1) this.activeIndex = Math.max(0, count - 1);
    if (this.focusedIndex > count - 1) this.focusedIndex = -1;
  }

  /** Renders the shadow DOM, then the visible items into the light DOM. */
  protected override update(changed: PropertyValues<this>) {
    super.update(changed);
    this.renderingItems = true;
    try {
      render(this.__renderItems(), this);
    } finally {
      this.renderingItems = false;
    }
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has('label')) {
      if (this.label) this.setAttribute('aria-label', this.label);
      else if (changed.get('label')) this.removeAttribute('aria-label');
    }
    if (changed.has('loading')) {
      if (this.loading) this.setAttribute('aria-busy', 'true');
      else this.removeAttribute('aria-busy');
    }
    this.__checkEnd();
  }

  // ── Public methods

  /** Scrolls the item at `index` into view. */
  scrollToIndex(index: number, options: VirtualListScrollOptions = {}) {
    const count = this.items.length;
    if (!count) return;
    const target = Math.min(Math.max(0, Math.floor(index)), count - 1);
    const height = this.__itemHeight;
    const viewport = this.clientHeight || this.viewport;
    const top = target * height;
    const current = this.scrollTop;
    let next: number;
    switch (options.align ?? 'nearest') {
      case 'start':
        next = top;
        break;
      case 'end':
        next = top + height - viewport;
        break;
      case 'center':
        next = top - (viewport - height) / 2;
        break;
      default:
        if (top < current) next = top;
        else if (top + height > current + viewport) {
          next = top + height - viewport;
        } else next = current;
    }
    next = Math.max(0, next);
    const behavior =
      options.behavior === 'smooth' && !prefersReducedMotion()
        ? 'smooth'
        : 'auto';
    if (next !== current) this.scrollTo({ top: next, behavior });
    // A smooth scroll reports its progress through scroll events.
    if (behavior === 'auto') {
      // Before layout the host cannot scroll yet: render the target's window anyway.
      this.scrollPosition = viewport ? this.scrollTop : next;
    }
  }

  // ── Private methods

  private get __itemHeight(): number {
    return this.itemHeight > 0 ? this.itemHeight : 48;
  }

  private readonly __handleScroll = () => {
    this.scrollPosition = this.scrollTop;
  };

  private __measure() {
    this.viewport = this.clientHeight;
  }

  /** The wrapper of the item at `index`, if it is rendered. */
  private __row(index: number): HTMLElement | null {
    return this.querySelector<HTMLElement>(
      `:scope > [role='listitem'][data-index='${index}']`,
    );
  }

  /** The item wrapper that contains `node`, if any. */
  private __rowOf(node: EventTarget | null): HTMLElement | null {
    if (!(node instanceof Element)) return null;
    const row = node.closest<HTMLElement>("[role='listitem'][data-index]");
    return row && row.parentElement === this ? row : null;
  }

  private readonly __handleFocusIn = (event: FocusEvent) => {
    const row = this.__rowOf(event.target);
    if (!row) return;
    const index = Number(row.dataset.index);
    this.focusedIndex = index;
    if (this.navigable && event.target === row) this.activeIndex = index;
  };

  private readonly __handleFocusOut = (event: FocusEvent) => {
    const row = this.__rowOf(event.target);
    if (!row) return;
    const next = event.relatedTarget;
    if (next instanceof Node && row.contains(next)) return;
    this.focusedIndex = -1;
    // The row may have been kept only because it had focus. A row this render removed (which
    // blurs it) is already gone.
    if (!this.renderingItems) this.requestUpdate();
  };

  private readonly __handleKeyDown = (event: KeyboardEvent) => {
    if (!this.navigable || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const row = this.__rowOf(event.target);
    // Keys inside an item's own controls belong to them.
    if (!row || event.target !== row) return;
    const index = Number(row.dataset.index);
    const page = Math.max(
      1,
      Math.floor((this.clientHeight || this.viewport) / this.__itemHeight),
    );
    const last = this.items.length - 1;
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = index + 1;
        break;
      case 'ArrowUp':
        next = index - 1;
        break;
      case 'PageDown':
        next = index + page;
        break;
      case 'PageUp':
        next = index - page;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.__focusIndex(Math.min(Math.max(0, next), last));
  };

  /** Moves the tab stop and focus to the item at `index`, scrolling it into view. */
  private async __focusIndex(index: number) {
    this.activeIndex = index;
    this.focusedIndex = index;
    this.scrollToIndex(index, { align: 'nearest' });
    await this.updateComplete;
    this.__row(index)?.focus({ preventScroll: true });
  }

  /** Fires `end-reached` when the end of the list is within `threshold` items of the view. */
  private __checkEnd() {
    const count = this.items.length;
    if (!count || this.loading || this.endReachedAt === count) return;
    const height = this.__itemHeight;
    const viewport =
      this.viewport || this.clientHeight || height * FALLBACK_VISIBLE_ROWS;
    const bottom = this.scrollPosition + viewport;
    if (bottom < (count - Math.max(0, this.threshold)) * height) return;
    this.endReachedAt = count;
    // After the update, so a listener that appends items starts a fresh one.
    queueMicrotask(() =>
      this.dispatchEvent(
        new CustomEvent<VirtualListEndReachedDetail>('end-reached', {
          bubbles: true,
          composed: true,
          detail: { count },
        }),
      ),
    );
  }

  /** Indices to render: the window, plus the focused and tab-stop items wherever they are. */
  private __renderedIndices(): number[] {
    const count = this.items.length;
    const height = this.__itemHeight;
    const { start, end } = virtualWindow(count, {
      rowHeight: height,
      scrollTop: this.scrollPosition,
      viewport: this.viewport || height * FALLBACK_VISIBLE_ROWS,
      overscan: Math.max(0, this.overscan),
    });
    const indices: number[] = [];
    for (let index = start; index < end; index += 1) indices.push(index);
    const extra = new Set<number>();
    if (this.focusedIndex >= 0) extra.add(this.focusedIndex);
    if (this.navigable && count) extra.add(this.activeIndex);
    extra.forEach(index => {
      if (index < count && (index < start || index >= end)) {
        indices.push(index);
      }
    });
    return indices.sort((a, b) => a - b);
  }

  /** The `tabindex` of an item with `navigable`: only the tab stop is in the Tab order. */
  private __tabIndex(index: number): string {
    return index === this.activeIndex ? '0' : '-1';
  }

  // ── Render helpers

  /** The light-DOM rows: one wrapper per rendered item, positioned at its offset. */
  private __renderItems() {
    const { items } = this;
    const height = this.__itemHeight;
    const size = items.length;
    return repeat(
      this.__renderedIndices(),
      index => index,
      index =>
        html`<div
          role="listitem"
          data-index=${index}
          aria-setsize=${size}
          aria-posinset=${index + 1}
          tabindex=${this.navigable ? this.__tabIndex(index) : nothing}
          style="inset-block-start: ${index *
          height}px; block-size: ${height}px"
        >
          ${this.renderItem
            ? this.renderItem(items[index], index)
            : String(items[index] ?? '')}
        </div>`,
    );
  }

  // ── Render

  render() {
    const total = this.items.length * this.__itemHeight;
    return html`<div class="content" style="block-size: ${total}px">
        <slot></slot>
      </div>
      ${this.loading
        ? html`<div class="loading" aria-hidden="true">
            <wc-circular-progress
              indeterminate
              label=${this.i18n.t('loading')}
            ></wc-circular-progress>
          </div>`
        : nothing}`;
  }
}
