import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './cb-predicate.scss';

/**
 * @label CB Predicate
 * @tag wc-cb-predicate
 * @rawTag cb-predicate
 * @summary A predicate container in a condition builder that can display conditions in horizontal or vertical layout with an optional logical operator divider.
 * @tags condition-builder
 *
 * @example
 * ```html
 * <wc-cb-predicate condition-operator="and" vertical>
 *   <wc-cb-compound-expression field-label="Age">
 *     <wc-cb-expression></wc-cb-expression>
 *   </wc-cb-compound-expression>
 * </wc-cb-predicate>
 * ```
 */
@IndividualComponent
export class CbPredicate extends LitElement {
  static styles = [styles];

  /** The logical operator shown between predicates ('and' or 'or'). */
  @property({ type: String, attribute: 'condition-operator', reflect: true })
  conditionOperator?: 'and' | 'or';

  /** Whether to render the predicate in vertical layout. */
  @property({ type: Boolean, reflect: true })
  vertical = false;

  override updated() {
    if (this.vertical) {
      this.__adjustSlotEndPadding();
    }
  }

  private __adjustSlotEndPadding() {
    const slotEnd = this.renderRoot.querySelector<HTMLElement>('.slot-end');
    const operatorElm = this.renderRoot.querySelector<HTMLElement>(
      '.predicate-condition-operator',
    );
    if (slotEnd && operatorElm) {
      slotEnd.style.paddingInlineStart =
        operatorElm.getBoundingClientRect().width + 'px';
    }
  }

  private __renderHorizontalOperator() {
    if (!this.conditionOperator) return nothing;
    return html`
      <wc-cb-divider vertical class="predicate-condition-operator">
        <wc-tag color="yellow" size="sm">${this.conditionOperator}</wc-tag>
      </wc-cb-divider>
    `;
  }

  private __renderVerticalOperator() {
    if (!this.conditionOperator) return nothing;
    return html`
      <div class="predicate-condition-operator">
        <wc-cb-divider connect-start connect-end>
          <wc-tag color="green" size="sm">${this.conditionOperator}</wc-tag>
        </wc-cb-divider>
      </div>
    `;
  }

  render() {
    const classes = {
      predicate: true,
      vertical: this.vertical,
    };

    if (this.vertical) {
      return html`
        <div class=${classMap(classes)}>
          ${this.__renderVerticalOperator()}
          <div class="predicate-body">
            <slot></slot>
          </div>
        </div>
        <div class="slot-end">
          <slot name="end"></slot>
        </div>
      `;
    }

    return html`
      <div class=${classMap(classes)}>
        <div class="predicate-body">
          <slot></slot>
        </div>
        ${this.__renderHorizontalOperator()}
      </div>
    `;
  }
}
