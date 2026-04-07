import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './cb-compound-expression.scss';

/**
 * @label CB Compound Expression
 * @tag wc-cb-compound-expression
 * @rawTag cb-compound-expression
 * @summary A compound expression group in a condition builder that displays a field label, an optional condition operator divider, and slots for child expressions.
 * @tags condition-builder
 * @parentRawTag compound-builder
 *
 * @example
 * ```html
 * <wc-cb-compound-expression field-label="Age" condition-operator="or">
 *   <wc-cb-expression>
 *     <wc-input placeholder="Enter value"></wc-input>
 *   </wc-cb-expression>
 * </wc-cb-compound-expression>
 * ```
 */
@IndividualComponent
export class CbCompoundExpression extends LitElement {
  static styles = [styles];

  /** The logical operator joining conditions in this group ('and' or 'or'). */
  @property({ type: String, attribute: 'condition-operator', reflect: true })
  conditionOperator?: 'and' | 'or';

  /** The field name for the compound expression. */
  @property({ type: String, attribute: 'field-name' })
  fieldName = '';

  /** The display label for the field. */
  @property({ type: String, attribute: 'field-label' })
  fieldLabel = '';

  override updated() {
    this.__adjustSlotEndPadding();
  }

  private __adjustSlotEndPadding() {
    const slotEnd = this.renderRoot.querySelector<HTMLElement>('.slot-end');
    const fieldNameContainer =
      this.renderRoot.querySelector<HTMLElement>('.field-name-container');
    if (slotEnd && fieldNameContainer) {
      slotEnd.style.paddingInlineStart =
        fieldNameContainer.getBoundingClientRect().width + 'px';
    }
  }

  private __renderOperatorDivider() {
    if (!this.conditionOperator) return nothing;
    return html`
      <wc-cb-divider connect-end>
        <wc-tag color="yellow" size="sm">${this.conditionOperator}</wc-tag>
      </wc-cb-divider>
    `;
  }

  render() {
    return html`
      <div class="compound-expression" field-name=${this.fieldName}>
        <div class="field-name-container">
          <span class="field-label">${this.fieldLabel}</span>
          <div class="field-compound-type">
            ${this.__renderOperatorDivider()}
          </div>
        </div>
        <div class="conditions">
          <slot></slot>
        </div>
      </div>
      <div class="slot-end">
        <slot name="end"></slot>
      </div>
    `;
  }
}
