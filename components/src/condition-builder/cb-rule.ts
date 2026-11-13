import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { AiController } from '@/__internal/ai/ai-controller.js';
import { claimDropTarget, getActiveRule, setActiveRule } from './cb-drag.js';
import { CbGroupBase } from './cb-group-base.js';
import type { CbRuleRemoveDetail, CbRuleValue } from './cb-types.js';
import styles from './cb-rule.scss';

let ruleCount = 0;

/** The string keys announced after a keyboard move. */
type MoveMessageKey =
  | 'conditionMoved'
  | 'conditionMovedIntoGroup'
  | 'conditionMovedOutOfGroup';

/**
 * @label CB Rule
 * @tag wc-cb-rule
 * @rawTag cb-rule
 * @summary One condition row in a condition builder: a drag handle, the slotted field, operator and value controls, and a remove button.
 * @overview
 * <p>Drag the handle to reorder the rule, or to move it into another group. With the handle focused, ArrowUp and ArrowDown move the rule within its group, ArrowRight moves it into the group beside it (the one above, else the one below) and ArrowLeft moves it out of its group; each move is announced. In right-to-left text ArrowLeft and ArrowRight swap.</p>
 * <p>In the builder's <code>value</code> a rule reports its own <code>value</code> property when set, else the values of its slotted controls (keyed by <code>name</code> when every control has one).</p>
 * @tags condition-builder
 *
 * @cssprop --cb-rule-field-height - Height of the slotted fields (wc-select, wc-input…). Defaults to `2.5rem`.
 *
 * @fires {CustomEvent<{rule: CbRule, group: HTMLElement | null}>} rule-remove - Dispatched when the remove button is clicked. Cancelable: unless prevented, the rule removes itself.
 *
 * @example
 * ```html
 * <wc-cb-rule>
 *   <wc-select name="field" placeholder="Field"></wc-select>
 *   <wc-select name="operator" placeholder="Operator"></wc-select>
 *   <wc-input name="value" placeholder="Value"></wc-input>
 * </wc-cb-rule>
 * ```
 */
@IndividualComponent
export class CbRule extends LitElement {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ────────────────────────────────────────────────────────────

  /**
   * What the rule stands for in the builder's `value`, such as `{ field, operator, value }`.
   * Leave it unset to report the values of the slotted controls instead.
   */
  @property({ attribute: false })
  value: unknown = undefined;

  /** Disables the rule: no moving or removing it. Set by a disabled group too. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Hides the rule's drag handle and remove button. Set by a read-only group too. */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /**
   * The assistant wrote this rule (ADR-030002): it shows a Suggested badge until the person changes
   * one of its controls. Remove it to discard it.
   */
  @property({ type: Boolean, reflect: true })
  suggested = false;

  // ── State ─────────────────────────────────────────────────────────────────

  /** `disabled` passed down by the enclosing group. */
  @state()
  private _inheritedDisabled = false;

  /** `readonly` passed down by the enclosing group. */
  @state()
  private _inheritedReadonly = false;

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.handle')
  private readonly _handleEl?: HTMLElement;

  // ── Private fields ────────────────────────────────────────────────────────

  /** Peacock's strings for the drag handle and remove button. */
  private readonly i18n = new I18nController(this);

  /** Id of the handle's hidden description. */
  private readonly _hintId = `cb-rule-hint-${(ruleCount += 1)}`;

  private readonly _ai = new AiController(this);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('change', this._onControlChange);
    this.addEventListener('input', this._onControlChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('change', this._onControlChange);
    this.removeEventListener('input', this._onControlChange);
  }

  /** Changing a suggested rule's control makes it the person's own. */
  private _onControlChange = (event: Event) => {
    if (this.suggested && event.target !== this) this.suggested = false;
  };

  // ── Public methods ────────────────────────────────────────────────────────

  /** Whether the rule can be moved or removed: neither disabled nor read-only. */
  get locked(): boolean {
    return (
      this.disabled ||
      this.readonly ||
      this._inheritedDisabled ||
      this._inheritedReadonly
    );
  }

  /** This rule as a node of the builder's `value`. */
  toValue(): CbRuleValue {
    const node = {
      type: 'rule' as const,
      id: this.id,
      value: this.value === undefined ? this._controlValues() : this.value,
      data: { ...this.dataset } as Record<string, string>,
    };
    Object.defineProperty(node, 'element', { value: this, enumerable: false });
    return node as CbRuleValue;
  }

  /**
   * Sets the `disabled` and `readonly` passed down by the enclosing group.
   * @internal
   */
  inheritState(disabled: boolean, readonly: boolean) {
    this._inheritedDisabled = disabled;
    this._inheritedReadonly = readonly;
  }

  // ── Private methods ───────────────────────────────────────────────────────

  /** The values of the slotted controls: keyed by `name` when all have one, else in order. */
  private _controlValues(): unknown {
    const controls = Array.from(this.children).filter(
      child => 'value' in child,
    ) as (Element & { value: unknown })[];
    const names = controls.map(control => control.getAttribute('name') ?? '');
    if (controls.length && names.every(Boolean)) {
      return Object.fromEntries(
        controls.map((control, index) => [names[index], control.value]),
      );
    }
    return controls.map(control => control.value);
  }

  private _onDragStart(event: DragEvent) {
    if (this.locked) {
      event.preventDefault();
      return;
    }
    const { dataTransfer } = event;
    // A stacking context of its own while the browser paints the drag image, which happens after
    // this handler returns, with styles updated.
    this.toggleAttribute('drag-capture', true);
    if (dataTransfer) {
      dataTransfer.effectAllowed = 'move';
      // Firefox only starts a drag that carries data.
      dataTransfer.setData('text/plain', '');
      const rect = this.getBoundingClientRect();
      dataTransfer.setDragImage(
        this,
        event.clientX - rect.left,
        event.clientY - rect.top,
      );
    }
    setActiveRule(this);
    // Dim the row after the browser has captured the drag image.
    requestAnimationFrame(() => {
      this.toggleAttribute('drag-capture', false);
      this.toggleAttribute('dragging', getActiveRule() === this);
    });
  }

  private _onDragEnd() {
    setActiveRule(null);
    claimDropTarget(null);
    this.toggleAttribute('drag-capture', false);
    this.toggleAttribute('dragging', false);
  }

  private _onHandleKeyDown(event: KeyboardEvent) {
    const group = this.parentElement;
    if (this.locked || !(group instanceof CbGroupBase)) return;

    const rtl = getComputedStyle(this).direction === 'rtl';
    const inward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const outward = rtl ? 'ArrowRight' : 'ArrowLeft';
    let moved = false;
    let message: MoveMessageKey = 'conditionMoved';

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const index =
        group.items.indexOf(this) + (event.key === 'ArrowUp' ? -1 : 1);
      moved = index >= 0 && group.moveRule(this, index);
    } else if (event.key === inward) {
      event.preventDefault();
      const target = this._adjacentGroup();
      if (target && !target.locked) {
        const atEnd = target === this.previousElementSibling;
        moved = target.moveRule(this, atEnd ? target.items.length : 0);
        message = 'conditionMovedIntoGroup';
      }
    } else if (event.key === outward) {
      event.preventDefault();
      const parent = group.parentElement;
      if (parent instanceof CbGroupBase && !parent.locked) {
        moved = parent.moveRule(this, parent.items.indexOf(group) + 1);
        message = 'conditionMovedOutOfGroup';
      }
    }

    if (!moved) return;
    this._handleEl?.focus();
    const target = this.parentElement as CbGroupBase;
    this._announce(
      this.i18n.t(message)(target.items.indexOf(this) + 1, target.items.length),
    );
  }

  /** The group beside this rule that ArrowRight moves it into: the one above, else below. */
  private _adjacentGroup(): CbGroupBase | null {
    const previous = this.previousElementSibling;
    if (previous instanceof CbGroupBase && !previous.slot) return previous;
    const next = this.nextElementSibling;
    if (next instanceof CbGroupBase && !next.slot) return next;
    return null;
  }

  /** Announces through the outermost group, whose live region stays put while rules move. */
  private _announce(message: string) {
    let root: CbGroupBase | null = null;
    for (
      let el: Element | null = this.parentElement;
      el instanceof CbGroupBase;
      el = el.parentElement
    ) {
      root = el;
    }
    root?.announce(message);
  }

  private _onRemoveClick() {
    if (this.locked) return;
    const event = new CustomEvent<CbRuleRemoveDetail>('rule-remove', {
      detail: { rule: this, group: this.parentElement },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (this.dispatchEvent(event)) this.remove();
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  private _renderHandle() {
    if (this.locked) return nothing;
    return html`
      <div
        class="handle"
        role="button"
        tabindex="0"
        draggable="true"
        aria-label=${this.i18n.t('reorderCondition')}
        aria-describedby=${this._hintId}
        title=${this.i18n.t('dragToReorder')}
        @dragstart=${this._onDragStart}
        @dragend=${this._onDragEnd}
        @keydown=${this._onHandleKeyDown}
      >
        <wc-focus-ring></wc-focus-ring>
        <wc-icon name="drag_indicator" aria-hidden="true"></wc-icon>
      </div>
      <span id=${this._hintId} hidden
        >${this.i18n.t('reorderConditionHint')}</span
      >
    `;
  }

  private _renderRemove() {
    if (this.locked) return nothing;
    return html`
      <div class="remove">
        <wc-icon-button
          variant="text"
          color="on-surface"
          size="sm"
          aria-label=${this.i18n.t('removeCondition')}
          @click=${this._onRemoveClick}
        >
          <wc-icon name="delete"></wc-icon>
        </wc-icon-button>
      </div>
    `;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const disabled = this.disabled || this._inheritedDisabled;
    return html`
      <div
        class=${classMap({ rule: true, disabled, locked: this.locked })}
        aria-disabled=${disabled ? 'true' : nothing}
      >
        ${this._renderHandle()}
        <div class="content">
          <slot></slot>
        </div>
        ${this.suggested && this._ai.available
          ? html`<wc-ai-badge class="suggested-badge"></wc-ai-badge>`
          : nothing}
        ${this._renderRemove()}
      </div>
    `;
  }
}
