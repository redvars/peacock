import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
:host {
  display: block;
  min-width: 0;
}

.code-group {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: var(--code-highlighter-background, var(--color-surface-container-low));
  border: 1px solid var(--code-highlighter-border-color, var(--color-outline-variant));
  border-radius: var(--code-highlighter-shape, var(--shape-corner-medium));
}

.header {
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

::slotted([hidden]) {
  display: none !important;
}`;

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
let CodeGroup = class CodeGroup extends i$1 {
    constructor() {
        // ── Static ────────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ────────────────────────────────────────────────────────────
        /** Index of the shown block. */
        this.selectedIndex = 0;
        /** The grouped code blocks, in slot order. */
        this._blocks = [];
    }
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
    updated(changed) {
        if (changed.has('selectedIndex') || changed.has('_blocks')) {
            this.__syncBlocks();
        }
    }
    // ── Private methods ───────────────────────────────────────────────────────
    /** The selected index, kept within the blocks. */
    get __activeIndex() {
        const last = this._blocks.length - 1;
        return Math.min(Math.max(0, this.selectedIndex || 0), Math.max(0, last));
    }
    /** Marks every block as grouped and shows only the selected one. */
    __syncBlocks() {
        const active = this.__activeIndex;
        this._blocks.forEach((block, index) => {
            block.setAttribute('grouped', '');
            block.toggleAttribute('hidden', index !== active);
        });
    }
    __handleSlotChange(event) {
        const slot = event.target;
        const blocks = slot
            .assignedElements({ flatten: true })
            .filter(element => element.localName === 'wc-code-highlighter');
        // Blocks moved out of the group get their own frame back.
        for (const block of this._blocks) {
            if (!blocks.includes(block)) {
                block.removeAttribute('grouped');
                block.removeAttribute('hidden');
            }
        }
        this._blocks = blocks;
    }
    __handleTabChange(event) {
        event.stopPropagation();
        const { index } = event.detail;
        if (index < 0 || index === this.__activeIndex)
            return;
        this.selectedIndex = index;
        this.dispatchEvent(new CustomEvent('change', {
            detail: { index },
            bubbles: true,
            composed: true,
        }));
    }
    // ── Render helpers ────────────────────────────────────────────────────────
    // eslint-disable-next-line class-methods-use-this
    __tabLabel(block, index) {
        return (block.label ||
            block.getAttribute('label') ||
            block.language ||
            `${index + 1}`);
    }
    // ── Render ────────────────────────────────────────────────────────────────
    render() {
        const active = this.__activeIndex;
        return b `
      <div class="code-group" part="container">
        <div class="header" part="header">
          <wc-tabs
            class="tabs"
            variant="secondary"
            @change=${this.__handleTabChange}
          >
            ${this._blocks.map((block, index) => b `<wc-tab .selected=${index === active}
                  >${this.__tabLabel(block, index)}</wc-tab
                >`)}
          </wc-tabs>
        </div>
        <slot @slotchange=${this.__handleSlotChange}></slot>
      </div>
    `;
    }
};
CodeGroup.styles = [css_248z];
__decorate([
    n({ attribute: 'selected-index', type: Number, reflect: true })
], CodeGroup.prototype, "selectedIndex", void 0);
__decorate([
    r()
], CodeGroup.prototype, "_blocks", void 0);
CodeGroup = __decorate([
    IndividualComponent
], CodeGroup);

export { CodeGroup };
//# sourceMappingURL=code-group.js.map
