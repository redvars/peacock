import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './panel.scss';

/**
 * @label Panel
 * @tag wc-panel
 * @rawTag panel
 *
 * @summary One pane of a `wc-resizable-panels` split view.
 * @overview
 * <p>A panel holds one pane's content. <code>size</code> is its share of the split view in
 * percent; panels without one share what the others leave. <code>min-size</code> and
 * <code>max-size</code> bound the size while resizing. A <code>collapsible</code> panel collapses to
 * <code>collapsed-size</code> (0 by default) when it is dragged well past its minimum, or when the
 * divider is double-clicked or gets Enter; <code>collapsed</code> reflects that state and keeps
 * <code>size</code> as the size to restore. The panel scrolls its own content.</p>
 *
 * @slot - The panel's content. Another `wc-resizable-panels` nests a split inside it.
 *
 * @example
 * ```html
 * <wc-resizable-panels>
 *   <wc-panel size="30" min-size="20" collapsible label="Folders">…</wc-panel>
 *   <wc-panel>…</wc-panel>
 * </wc-resizable-panels>
 * ```
 * @tags layout
 */
@IndividualComponent
export class Panel extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Share of the split view in percent. Unset panels share what the others leave. */
  @property({ type: Number }) size?: number;

  /** Smallest size in percent while resizing. */
  @property({ type: Number, attribute: 'min-size' }) minSize = 0;

  /** Largest size in percent while resizing. */
  @property({ type: Number, attribute: 'max-size' }) maxSize = 100;

  /** Whether the panel can collapse past its minimum. */
  @property({ type: Boolean, reflect: true }) collapsible = false;

  /** Size in percent of a collapsed panel. */
  @property({ type: Number, attribute: 'collapsed-size' }) collapsedSize = 0;

  /** Whether a collapsible panel is collapsed. `size` keeps the size to restore. */
  @property({ type: Boolean, reflect: true }) collapsed = false;

  /** Names the panel; the divider before it reads "Resize <label>". */
  @property() label = '';

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    // A panel defined after the split view rendered announces itself.
    this.notifyParent();
  }

  protected override willUpdate() {
    this.style.flexGrow = String(this.effectiveSize);
  }

  protected override updated(changed: PropertyValues<this>) {
    // The split view draws the dividers' values from its panels, so it re-renders with them.
    if (changed.size > 0) this.notifyParent();
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** The size the panel takes now: `collapsed-size` while collapsed, else `size`. */
  get effectiveSize(): number {
    if (this.isCollapsed) return Math.max(0, this.collapsedSize);
    return Math.max(0, this.size ?? 0);
  }

  /** Whether the panel is collapsed right now (only a collapsible panel collapses). */
  get isCollapsed(): boolean {
    return this.collapsible && this.collapsed;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private notifyParent() {
    const parent = this.parentElement as LitElement | null;
    if (parent?.localName === 'wc-resizable-panels') {
      parent.requestUpdate?.();
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    // A panel collapsed to nothing hides its content from focus and screen readers.
    const hidden = this.isCollapsed && this.effectiveSize === 0;
    return html`<div
      class=${classMap({ content: true, hidden })}
      part="content"
      ?inert=${hidden}
    >
      <slot></slot>
    </div>`;
  }
}
