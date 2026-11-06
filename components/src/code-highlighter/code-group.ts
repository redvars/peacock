import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './code-group.scss';

/** Minimal shape of a grouped `wc-code-highlighter`. */
type CodeBlockElement = HTMLElement & { label?: string; language?: string };

/**
 * @label Code Group
 * @tag wc-code-group
 * @rawTag code-group
 *
 * @summary Shows several code blocks in one frame, with a tab for each block.
 * @overview
 * <p>Put <code>wc-code-highlighter</code> elements inside. Each block's <code>label</code> names its tab,
 * and only the selected block is shown. The group draws the frame, so the blocks drop their own
 * border and header, and their actions float at the top end.</p>
 *
 * @example
 * ```html
 * <wc-code-group>
 *   <wc-code-highlighter label="greeting.ts" language="typescript"><pre><code>
 *     export const greeting = 'Hello';</code></pre></wc-code-highlighter>
 *   <wc-code-highlighter label="greeting.css" language="css"><pre><code>
 *     p { color: var(--color-primary); }</code></pre></wc-code-highlighter>
 * </wc-code-group>
 * ```
 *
 * @slot - `wc-code-highlighter` elements, one per tab.
 *
 * @csspart container - The outer frame.
 * @csspart header - The tab bar.
 *
 * @fires {CustomEvent<{index: number}>} change - Dispatched when the user selects another tab.
 *
 * @tags display
 */
@IndividualComponent
export class CodeGroup extends LitElement {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ────────────────────────────────────────────────────────────

  /** Index of the shown block. */
  @property({ attribute: 'selected-index', type: Number, reflect: true })
  selectedIndex: number = 0;

  /** The grouped code blocks, in slot order. */
  @state() private _blocks: CodeBlockElement[] = [];

  // ── Private fields ────────────────────────────────────────────────────────

  /** Re-renders the tabs when a block's label changes. */
  private __labelObserver?: MutationObserver;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    this.__labelObserver = new MutationObserver(() => this.requestUpdate());
    this.__labelObserver.observe(this, {
      subtree: true,
      attributes: true,
      attributeFilter: ['label', 'language'],
    });
  }

  disconnectedCallback() {
    this.__labelObserver?.disconnect();
    super.disconnectedCallback();
  }

  protected updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has('selectedIndex') || changed.has('_blocks')) {
      this.__syncBlocks();
    }
  }

  // ── Private methods ───────────────────────────────────────────────────────

  /** The selected index, kept within the blocks. */
  private get __activeIndex(): number {
    const last = this._blocks.length - 1;
    return Math.min(Math.max(0, this.selectedIndex || 0), Math.max(0, last));
  }

  /** Marks every block as grouped and shows only the selected one. */
  private __syncBlocks() {
    const active = this.__activeIndex;
    this._blocks.forEach((block, index) => {
      block.setAttribute('grouped', '');
      block.toggleAttribute('hidden', index !== active);
    });
  }

  private __handleSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    const blocks = slot
      .assignedElements({ flatten: true })
      .filter(
        element => element.localName === 'wc-code-highlighter',
      ) as CodeBlockElement[];

    // Blocks moved out of the group get their own frame back.
    for (const block of this._blocks) {
      if (!blocks.includes(block)) {
        block.removeAttribute('grouped');
        block.removeAttribute('hidden');
      }
    }
    this._blocks = blocks;
  }

  private __handleTabChange(event: CustomEvent<{ index: number }>) {
    event.stopPropagation();
    const { index } = event.detail;
    if (index < 0 || index === this.__activeIndex) return;
    this.selectedIndex = index;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { index },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private __stopEvent(event: Event) {
    event.stopPropagation();
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  // eslint-disable-next-line class-methods-use-this
  private __tabLabel(block: CodeBlockElement, index: number): string {
    return (
      block.label ||
      block.getAttribute('label') ||
      block.language ||
      `${index + 1}`
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const active = this.__activeIndex;
    return html`
      <div class="code-group" part="container">
        <div class="header" part="header">
          <wc-tabs
            class="tabs"
            variant="secondary"
            @change=${this.__handleTabChange}
            @tab-click=${this.__stopEvent}
          >
            ${this._blocks.map(
              (block, index) =>
                html`<wc-tab .active=${index === active}
                  >${this.__tabLabel(block, index)}</wc-tab
                >`,
            )}
          </wc-tabs>
        </div>
        <slot @slotchange=${this.__handleSlotChange}></slot>
      </div>
    `;
  }
}
