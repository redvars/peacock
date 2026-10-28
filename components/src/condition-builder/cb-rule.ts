import { html, LitElement } from 'lit';
import { query } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import { claimDropTarget, getActiveRule, setActiveRule } from './cb-drag.js';
import { CbGroupBase } from './cb-group-base.js';
import type { CbRuleRemoveDetail } from './cb-types.js';
import styles from './cb-rule.scss';

/**
 * @label CB Rule
 * @tag wc-cb-rule
 * @rawTag cb-rule
 * @summary One condition row in a condition builder: a drag handle, the slotted field, operator and value controls, and a remove button.
 * @overview
 * <p>Drag the handle to reorder the rule, or to move it into another group. With the handle focused, ArrowUp and ArrowDown move the rule within its group.</p>
 * @tags condition-builder
 *
 * @cssprop --cb-rule-field-height - Height of the slotted fields (wc-select, wc-input…). Defaults to `2.5rem`.
 *
 * @fires {CustomEvent<{rule: CbRule, group: HTMLElement | null}>} rule-remove - Dispatched when the remove button is clicked. Cancelable: unless prevented, the rule removes itself.
 *
 * @example
 * ```html
 * <wc-cb-rule>
 *   <wc-select placeholder="Field"></wc-select>
 *   <wc-select placeholder="Operator"></wc-select>
 *   <wc-input placeholder="Value"></wc-input>
 * </wc-cb-rule>
 * ```
 */
@IndividualComponent
export class CbRule extends LitElement {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.handle')
  private readonly _handleEl?: HTMLElement;

  // ── Private methods ───────────────────────────────────────────────────────

  private _onDragStart(event: DragEvent) {
    const { dataTransfer } = event;
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
    requestAnimationFrame(() =>
      this.toggleAttribute('dragging', getActiveRule() === this),
    );
  }

  private _onDragEnd() {
    setActiveRule(null);
    claimDropTarget(null);
    this.toggleAttribute('dragging', false);
  }

  private _onHandleKeyDown(event: KeyboardEvent) {
    const offsets: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 };
    const offset = offsets[event.key];
    const group = this.parentElement;
    if (!offset || !(group instanceof CbGroupBase)) return;

    event.preventDefault();
    const index = group.items.indexOf(this) + offset;
    if (index >= 0 && group.moveRule(this, index)) {
      this._handleEl?.focus();
    }
  }

  private _onRemoveClick() {
    const event = new CustomEvent<CbRuleRemoveDetail>('rule-remove', {
      detail: { rule: this, group: this.parentElement },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (this.dispatchEvent(event)) this.remove();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    return html`
      <div class="rule">
        <div
          class="handle"
          role="button"
          tabindex="0"
          draggable="true"
          aria-label="Reorder condition"
          title="Drag to reorder"
          @dragstart=${this._onDragStart}
          @dragend=${this._onDragEnd}
          @keydown=${this._onHandleKeyDown}
        >
          <wc-focus-ring></wc-focus-ring>
          <wc-icon name="drag_indicator" aria-hidden="true"></wc-icon>
        </div>
        <div class="content">
          <slot></slot>
        </div>
        <div class="remove">
          <wc-icon-button
            variant="text"
            color="on-surface"
            size="sm"
            aria-label="Remove condition"
            @click=${this._onRemoveClick}
          >
            <wc-icon name="delete"></wc-icon>
          </wc-icon-button>
        </div>
      </div>
    `;
  }
}
