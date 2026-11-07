import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './stack.scss';
import IndividualComponent from '@/IndividualComponent.js';
import type { SpacingStep } from './spacing.js';

export type StackDirection = 'vertical' | 'horizontal';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

/**
 * Converts a CSS length in `px`, `rem` or `em` (a bare number is pixels) to pixels, or `null`
 * when it cannot be read.
 */
export function lengthToPixels(
  length: string,
  element: Element,
): number | null {
  const match = /^\s*(-?\d*\.?\d+)\s*(px|rem|em)?\s*$/i.exec(length);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = (match[2] ?? 'px').toLowerCase();
  if (unit === 'px') return amount;
  const fontSizeOf = (el: Element) =>
    parseFloat(getComputedStyle(el).fontSize) || 16;
  return (
    amount * fontSizeOf(unit === 'rem' ? document.documentElement : element)
  );
}

/**
 * @label Stack
 * @tag wc-stack
 * @rawTag stack
 * @summary Lays out its children in a column or a row, with a gap on the spacing scale.
 * @overview
 * <p>The stack is a flex container: the element itself has <code>display: flex</code>, so its
 * children are the flex items, with no wrapper between them. <code>direction</code> is
 * <code>vertical</code> (a column, the default) or <code>horizontal</code> (a row, which follows the
 * writing direction, so it runs right to left in RTL).</p>
 * <p><code>gap</code> takes a step of the spacing token scale: <code>gap="200"</code> is
 * <code>var(--spacing-200)</code>. The steps are <code>000</code>, <code>025</code>,
 * <code>050</code>, <code>075</code>, <code>100</code>, <code>150</code>, <code>200</code>,
 * <code>250</code>, <code>300</code>, <code>400</code>, <code>500</code>, <code>600</code>,
 * <code>800</code>, <code>1000</code>, <code>1200</code> and <code>2000</code>. Without
 * <code>gap</code> there is none. A <code>style="gap: …"</code> on the element still wins.</p>
 * <p><code>align</code> sets <code>align-items</code> and <code>justify</code> sets
 * <code>justify-content</code>; <code>wrap</code> lets the items wrap onto more lines.</p>
 * <p><code>collapse-below</code> makes a horizontal stack lay out vertically while the stack itself
 * is narrower than the given width (pixels, or a length in <code>px</code>, <code>rem</code> or
 * <code>em</code>). It measures the stack, not the viewport, so it works in sidebars and cards; the
 * <code>collapsed</code> property and the <code>:state(collapsed)</code> selector tell when it
 * applies.</p>
 *
 * @slot - The items to lay out.
 *
 * @example
 * ```html
 * <wc-stack direction="horizontal" gap="200" align="center" collapse-below="30rem">
 *   <wc-avatar name="Ada Lovelace"></wc-avatar>
 *   <wc-text>Ada Lovelace</wc-text>
 *   <wc-button>Follow</wc-button>
 * </wc-stack>
 * ```
 *
 * @tags layout
 */
@IndividualComponent
export class Stack extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static override styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Lays the items out in a column (`vertical`, default) or a row (`horizontal`). */
  @property({ type: String, reflect: true }) direction: StackDirection =
    'vertical';

  /** Space between items, as a step of the spacing token scale (for example `"200"`). */
  @property({ type: String, reflect: true }) gap?: SpacingStep;

  /** Cross-axis alignment of the items (`align-items`). */
  @property({ type: String, reflect: true }) align?: StackAlign;

  /** Main-axis distribution of the items (`justify-content`). */
  @property({ type: String, reflect: true }) justify?: StackJustify;

  /** Lets the items wrap onto more lines. */
  @property({ type: Boolean, reflect: true }) wrap = false;

  /**
   * Width below which a horizontal stack lays out vertically: pixels, or a length in `px`, `rem`
   * or `em`. Measured on the stack itself.
   */
  @property({ type: String, attribute: 'collapse-below' })
  collapseBelow?: string;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Carries the `collapsed` custom state. */
  private readonly __internals = this.attachInternals();

  /** Watches the stack's width while `collapse-below` applies. */
  private __resizeObserver: ResizeObserver | null = null;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.__syncObserver();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.__stopObserving();
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('direction') || changed.has('collapseBelow')) {
      this.__syncObserver();
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Whether a horizontal stack is currently laid out vertically because of `collapse-below`. */
  get collapsed(): boolean {
    return this.__internals.states?.has('collapsed') ?? false;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private __syncObserver() {
    if (this.direction !== 'horizontal' || !this.collapseBelow) {
      this.__stopObserving();
      this.__setCollapsed(false);
      return;
    }
    if (!this.__resizeObserver) {
      this.__resizeObserver = new ResizeObserver(entries => {
        const entry = entries[entries.length - 1];
        if (entry) this.__measure(entry.contentRect.width);
      });
      this.__resizeObserver.observe(this);
    }
    this.__measure(this.getBoundingClientRect().width);
  }

  private __stopObserving() {
    this.__resizeObserver?.disconnect();
    this.__resizeObserver = null;
  }

  private __measure(width: number) {
    const limit = this.collapseBelow
      ? lengthToPixels(this.collapseBelow, this)
      : null;
    this.__setCollapsed(limit !== null && width > 0 && width < limit);
  }

  private __setCollapsed(collapsed: boolean) {
    const { states } = this.__internals;
    if (!states || states.has('collapsed') === collapsed) return;
    if (collapsed) states.add('collapsed');
    else states.delete('collapsed');
  }

  // ── Render ───────────────────────────────────────────────────────────────

  override render() {
    return html`<slot></slot>`;
  }
}
