import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  claimDropTarget,
  getActiveRule,
  releaseDropTarget,
} from './cb-drag.js';
import type { CbRule } from './cb-rule.js';
import type { CbOperator, CbRuleMoveDetail } from './cb-types.js';

const ITEM_SELECTOR = 'wc-cb-rule, wc-cb-group';

const OPERATOR_LABELS: Record<CbOperator, string> = { and: 'And', or: 'Or' };

type MenuElement = HTMLElement & {
  anchorElement: HTMLElement | null;
  show: () => void;
  close: () => void;
};

/**
 * Shared behaviour of `wc-condition-builder` and `wc-cb-group`: the And/Or
 * operator pill, the bracket joining the items, and dropping dragged rules.
 */
export class CbGroupBase extends LitElement {
  // ── Static ────────────────────────────────────────────────────────────────

  /** Viewport Y of the middle of an item's first row, where the bracket meets it. */
  private static _rowCenter(item: Element): number {
    if (item instanceof CbGroupBase) return item.firstRowCenter();
    const rect = item.getBoundingClientRect();
    return rect.top + rect.height / 2;
  }

  // ── Properties ────────────────────────────────────────────────────────────

  /** The logical operator joining the rules and groups in this group. */
  @property({ type: String, reflect: true })
  operator: CbOperator = 'and';

  // ── State ─────────────────────────────────────────────────────────────────

  /** Number of rules and groups in the default slot. */
  @state()
  private _itemCount = 0;

  /** Y of the drop indicator inside `.items`, or `null` when nothing is dragged over. */
  @state()
  private _dropIndicatorTop: number | null = null;

  /** Whether the operator menu is open. */
  @state()
  private _menuOpen = false;

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.items')
  private readonly _itemsEl?: HTMLElement;

  @query('.connector')
  private readonly _connectorEl?: HTMLElement;

  @query('.operator-pill')
  private readonly _pillEl?: HTMLElement;

  @query('wc-menu')
  private readonly _menuEl?: MenuElement;

  // ── Private fields ────────────────────────────────────────────────────────

  /** Id linking the operator pill to its menu. */
  private readonly _menuId = `cb-operator-menu-${Math.random().toString(36).slice(2, 9)}`;

  /** Re-measures the bracket when any item changes size. */
  private readonly _resizeObserver = new ResizeObserver(() =>
    this._layoutConnector(),
  );

  /** Index the dragged rule would be inserted at, or -1. */
  private _dropIndex = -1;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.items.forEach(item => this._resizeObserver.observe(item));
  }

  override disconnectedCallback() {
    this._resizeObserver.disconnect();
    super.disconnectedCallback();
  }

  override updated() {
    this._layoutConnector();
  }

  // ── Public methods ────────────────────────────────────────────────────────

  /** The rules and groups in this group, in order. */
  get items(): HTMLElement[] {
    return Array.from(this.children).filter(
      (el): el is HTMLElement => el.matches(ITEM_SELECTOR) && !el.slot,
    );
  }

  /**
   * Moves `rule` into this group at `index` (counted without the rule itself).
   * Fires a cancelable `rule-move` event first. Returns whether it moved.
   */
  moveRule(rule: CbRule, index: number): boolean {
    const others = this.items.filter(item => item !== rule);
    const target = Math.max(0, Math.min(index, others.length));
    if (rule.parentElement === this && this.items.indexOf(rule) === target) {
      return false;
    }

    const event = new CustomEvent<CbRuleMoveDetail>('rule-move', {
      detail: { rule, from: rule.parentElement, to: this, index: target },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (!this.dispatchEvent(event)) return false;

    this.insertBefore(rule, others[target] ?? null);
    return true;
  }

  /**
   * Viewport Y of the middle of this group's first row. A parent group aligns
   * its bracket to it.
   * @internal
   */
  firstRowCenter(): number {
    const [first] = this.items;
    if (first) return CbGroupBase._rowCenter(first);
    const rect = this.getBoundingClientRect();
    return rect.top + rect.height / 2;
  }

  // ── Private methods ───────────────────────────────────────────────────────

  private _onSlotChange() {
    const { items } = this;
    this._itemCount = items.length;
    this._resizeObserver.disconnect();
    items.forEach(item => this._resizeObserver.observe(item));
    this._layoutConnector();
  }

  /** Spans the bracket from the first to the last item's first row. */
  private _layoutConnector() {
    const { items } = this;
    if (items.length < 2 || !this._itemsEl || !this._connectorEl) return;

    const containerTop = this._itemsEl.getBoundingClientRect().top;
    const top = CbGroupBase._rowCenter(items[0]) - containerTop;
    const bottom =
      CbGroupBase._rowCenter(items[items.length - 1]) - containerTop;
    this._connectorEl.style.top = `${top}px`;
    this._connectorEl.style.height = `${bottom - top}px`;
  }

  private _onPillClick(event: MouseEvent) {
    event.stopPropagation();
    if (!this._menuEl || !this._pillEl) return;

    if (this._menuOpen) {
      this._menuEl.close();
    } else {
      this._menuEl.anchorElement = this._pillEl;
      this._menuEl.show();
    }
  }

  private _onMenuActivate(event: CustomEvent<{ item: { value: string } }>) {
    const operator = event.detail.item.value as CbOperator;
    if (operator === this.operator) return;

    this.operator = operator;
    this.dispatchEvent(
      new CustomEvent<{ operator: CbOperator }>('operator-change', {
        detail: { operator },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private readonly _clearDropIndicator = () => {
    this._dropIndicatorTop = null;
    this._dropIndex = -1;
  };

  private _onDragOver(event: DragEvent) {
    const rule = getActiveRule();
    if (!rule || !this._itemsEl) return;

    // Cancel both dragenter and dragover to accept the drop; the innermost
    // group under the pointer takes it.
    event.preventDefault();
    event.stopPropagation();
    const { dataTransfer } = event;
    if (dataTransfer) dataTransfer.dropEffect = 'move';
    claimDropTarget(this._clearDropIndicator);

    const others = this.items.filter(item => item !== rule);
    const index = others.findIndex(item => {
      const rect = item.getBoundingClientRect();
      return event.clientY < rect.top + rect.height / 2;
    });
    this._dropIndex = index === -1 ? others.length : index;

    const containerTop = this._itemsEl.getBoundingClientRect().top;
    const halfGap =
      (parseFloat(getComputedStyle(this._itemsEl).rowGap) || 0) / 2;
    const before = others[this._dropIndex];
    const last = others[others.length - 1];
    if (before) {
      this._dropIndicatorTop =
        before.getBoundingClientRect().top - containerTop - halfGap;
    } else if (last) {
      this._dropIndicatorTop =
        last.getBoundingClientRect().bottom - containerTop + halfGap;
    } else {
      this._dropIndicatorTop = 0;
    }
  }

  private _onDragLeave(event: DragEvent) {
    const next = event.relatedTarget as Node | null;
    if (next && (this.contains(next) || this.renderRoot.contains(next))) return;
    releaseDropTarget(this._clearDropIndicator);
  }

  private _onDrop(event: DragEvent) {
    const rule = getActiveRule();
    if (!rule || this._dropIndex < 0) return;

    event.preventDefault();
    event.stopPropagation();
    const index = this._dropIndex;
    claimDropTarget(null);
    this.moveRule(rule, index);
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  /** Content placed after the items; each group type renders its own actions. */
  protected renderFooter(): TemplateResult | typeof nothing {
    return nothing;
  }

  private _renderConnector() {
    if (this._itemCount < 2) return nothing;

    const label = OPERATOR_LABELS[this.operator] ?? this.operator;
    return html`
      <div class="connector">
        <wc-cb-divider connect-start connect-end>
          <button
            class="operator-pill"
            aria-label=${`Match conditions with ${label}`}
            aria-haspopup="menu"
            aria-expanded=${String(this._menuOpen)}
            aria-controls=${this._menuId}
            @click=${this._onPillClick}
          >
            <wc-focus-ring></wc-focus-ring>
            <span class="operator-label">${label}</span>
            <wc-icon name="arrow_drop_down" aria-hidden="true"></wc-icon>
          </button>
        </wc-cb-divider>
      </div>
    `;
  }

  private _renderOperatorMenu() {
    return html`
      <wc-menu
        id=${this._menuId}
        @opened=${() => {
          this._menuOpen = true;
        }}
        @closed=${() => {
          this._menuOpen = false;
        }}
        @menu-item-activate=${this._onMenuActivate}
      >
        ${(Object.keys(OPERATOR_LABELS) as CbOperator[]).map(
          operator => html`
            <wc-menu-item
              value=${operator}
              ?selected=${operator === this.operator}
            >
              ${OPERATOR_LABELS[operator]}
            </wc-menu-item>
          `,
        )}
      </wc-menu>
    `;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  override render() {
    return html`
      <div
        class="group"
        @dragenter=${this._onDragOver}
        @dragover=${this._onDragOver}
        @dragleave=${this._onDragLeave}
        @drop=${this._onDrop}
      >
        <div class="body">
          ${this._renderConnector()}
          <div class=${classMap({ items: true, empty: this._itemCount === 0 })}>
            <slot @slotchange=${this._onSlotChange}></slot>
            ${this._dropIndicatorTop === null
              ? nothing
              : html`<div
                  class="drop-indicator"
                  style=${styleMap({ top: `${this._dropIndicatorTop}px` })}
                ></div>`}
          </div>
        </div>
        ${this.renderFooter()}
      </div>
      ${this._renderOperatorMenu()}
    `;
  }
}
