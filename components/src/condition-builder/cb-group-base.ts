import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  claimDropTarget,
  getActiveRule,
  releaseDropTarget,
} from './cb-drag.js';
import { CbRule } from './cb-rule.js';
import type {
  CbGroupValue,
  CbNodeValue,
  CbOperator,
  CbRuleMoveDetail,
} from './cb-types.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';

const ITEM_SELECTOR = 'wc-cb-rule, wc-cb-group';

/** The string key of each operator's label. */
const OPERATOR_LABEL_KEYS: Record<CbOperator, 'operatorAnd' | 'operatorOr'> = {
  and: 'operatorAnd',
  or: 'operatorOr',
};

/** The operator the pill swaps to. */
const otherOperator = (operator: CbOperator): CbOperator =>
  operator === 'and' ? 'or' : 'and';

/** Adds the non-enumerable `element` to a node of the `value` tree. */
function withElement<T extends object>(node: T, element: HTMLElement): T {
  Object.defineProperty(node, 'element', { value: element, enumerable: false });
  return node;
}

/**
 * Shared behaviour of `wc-condition-builder` and `wc-cb-group`: the And/Or
 * operator pill, which swaps the operator on a click, the bracket joining the items, dropping dragged rules,
 * `disabled`/`readonly` passed down to the items, and the `value` tree.
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

  /**
   * Disables the group and everything in it: no adding, removing, moving or switching the
   * operator. Slotted controls keep their own `disabled`; set it on them too.
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Makes the group and everything in it read-only: it shows the query but hides the add,
   * remove and drag controls and locks the operator.
   */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  // ── State ─────────────────────────────────────────────────────────────────

  /** Number of rules and groups in the default slot. */
  @state()
  private _itemCount = 0;

  /** Y of the drop indicator inside `.items`, or `null` when nothing is dragged over. */
  @state()
  private _dropIndicatorTop: number | null = null;

  /** `disabled` passed down by the enclosing group. */
  @state()
  private _inheritedDisabled = false;

  /** `readonly` passed down by the enclosing group. */
  @state()
  private _inheritedReadonly = false;

  /** Text of the polite live region, for keyboard moves. */
  @state()
  private _announcement = '';

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.items')
  private readonly _itemsEl?: HTMLElement;

  @query('.connector')
  private readonly _connectorEl?: HTMLElement;

  // ── Private fields ────────────────────────────────────────────────────────

  /** Re-measures the bracket when any item changes size; exists while connected. */
  private _resizeObserver?: ResizeObserver;

  /** Index the dragged rule would be inserted at, or -1. */
  private _dropIndex = -1;

  /** Peacock's strings for the operator labels and the group actions. */
  protected readonly i18n = new I18nController(this);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => this._layoutConnector());
      this.items.forEach(item => this._resizeObserver?.observe(item));
    }
  }

  override disconnectedCallback() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues) {
    super.updated(changed);
    if (
      changed.has('disabled') ||
      changed.has('readonly') ||
      changed.has('_inheritedDisabled') ||
      changed.has('_inheritedReadonly')
    ) {
      this._passStateDown();
    }
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
   * The query this group holds, as a tree of groups and rules (see `CbGroupValue` and
   * `CbRuleValue`). `JSON.stringify()` it to store or send the query; each node's `element`
   * is left out.
   */
  get value(): CbGroupValue {
    const children: CbNodeValue[] = [];
    for (const item of this.items) {
      if (item instanceof CbGroupBase) children.push(item.value);
      else if (item instanceof CbRule) children.push(item.toValue());
    }
    return withElement(
      {
        type: 'group' as const,
        id: this.id,
        operator: this.operator,
        children,
        data: { ...this.dataset } as Record<string, string>,
      },
      this,
    ) as CbGroupValue;
  }

  /** Whether this group, or a group around it, is disabled. */
  get effectiveDisabled(): boolean {
    return this.disabled || this._inheritedDisabled;
  }

  /** Whether this group, or a group around it, is read-only. */
  get effectiveReadonly(): boolean {
    return this.readonly || this._inheritedReadonly;
  }

  /** Whether the group can be changed: neither disabled nor read-only. */
  get locked(): boolean {
    return this.effectiveDisabled || this.effectiveReadonly;
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

  /**
   * Sets the `disabled` and `readonly` passed down by the enclosing group.
   * @internal
   */
  inheritState(disabled: boolean, readonly: boolean) {
    this._inheritedDisabled = disabled;
    this._inheritedReadonly = readonly;
  }

  /**
   * Reads `message` out through this group's polite live region.
   * @internal
   */
  announce(message: string) {
    // Clear first so the same message twice in a row is still read out.
    this._announcement = '';
    requestAnimationFrame(() => {
      this._announcement = message;
    });
  }

  // ── Protected methods ─────────────────────────────────────────────────────

  /** Dispatches `add-rule` or `add-group` for this group. */
  protected dispatchAdd(type: 'add-rule' | 'add-group') {
    this.dispatchEvent(
      new CustomEvent<{ group: HTMLElement }>(type, {
        detail: { group: this },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Private methods ───────────────────────────────────────────────────────

  private _onSlotChange() {
    const { items } = this;
    this._itemCount = items.length;
    this._resizeObserver?.disconnect();
    items.forEach(item => this._resizeObserver?.observe(item));
    this._passStateDown();
    this._layoutConnector();
  }

  /** Gives the items this group's effective `disabled` and `readonly`. */
  private _passStateDown() {
    const disabled = this.effectiveDisabled;
    const readonly = this.effectiveReadonly;
    for (const item of this.items) {
      if (item instanceof CbGroupBase || item instanceof CbRule) {
        item.inheritState(disabled, readonly);
      }
    }
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

  /** The pill swaps the operator: And becomes Or, Or becomes And, announced through the live region. */
  private _onPillClick(event: MouseEvent) {
    event.stopPropagation();
    if (this.locked) return;

    const operator = otherOperator(this.operator);
    this.operator = operator;
    this.announce(
      this.i18n.t('conditionsNowMatchWith')(this._operatorLabel(operator)),
    );
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
    if (!rule || !this._itemsEl || this.locked) return;

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
    if (!rule || this._dropIndex < 0 || this.locked) return;

    event.preventDefault();
    event.stopPropagation();
    const index = this._dropIndex;
    claimDropTarget(null);
    this.moveRule(rule, index);
  }

  /** The translated label of `operator`, or the operator itself when it is unknown. */
  private _operatorLabel(operator: CbOperator): string {
    const key = OPERATOR_LABEL_KEYS[operator];
    return key ? this.i18n.t(key) : operator;
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  /** Content placed after the items; each group type renders its own actions. */
  protected renderFooter(): TemplateResult | typeof nothing {
    return nothing;
  }

  private _renderConnector() {
    if (this._itemCount < 2) return nothing;

    const label = this._operatorLabel(this.operator);
    // The name says what the pill holds; the description and the tooltip what a click does.
    const swap = this.i18n.t('switchOperatorTo')(
      this._operatorLabel(otherOperator(this.operator)),
    );
    return html`
      <div class="connector">
        <wc-cb-divider connect-start connect-end>
          <button
            id="operator-pill"
            class="operator-pill"
            aria-label=${this.i18n.t('matchConditionsWith')(label)}
            aria-description=${this.locked ? nothing : swap}
            ?disabled=${this.effectiveDisabled}
            aria-readonly=${this.effectiveReadonly ? 'true' : nothing}
            @click=${this._onPillClick}
          >
            <wc-focus-ring></wc-focus-ring>
            <span class="operator-label">${label}</span>
            ${this.locked
              ? nothing
              : html`<wc-icon name="swap_vert" aria-hidden="true"></wc-icon>`}
          </button>
          ${this.locked
            ? nothing
            : html`<wc-tooltip class="operator-tooltip" for="operator-pill"
                >${swap}</wc-tooltip
              >`}
        </wc-cb-divider>
      </div>
    `;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  override render() {
    return html`
      <div
        class=${classMap({
          group: true,
          disabled: this.effectiveDisabled,
          readonly: this.effectiveReadonly,
        })}
        aria-disabled=${this.effectiveDisabled ? 'true' : nothing}
        @dragenter=${this._onDragOver}
        @dragover=${this._onDragOver}
        @dragleave=${this._onDragLeave}
        @drop=${this._onDrop}
      >
        <div class=${classMap({ body: true, connected: this._itemCount > 1 })}>
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
      <span class="sr-only" aria-live="polite">${this._announcement}</span>
    `;
  }
}
