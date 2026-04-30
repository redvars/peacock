import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './cb-expression.scss';

/**
 * @label CB Expression
 * @tag wc-cb-expression
 * @rawTag cb-expression
 * @summary An expression row within a condition builder, containing an operator select and a slot for value inputs.
 * @tags condition-builder
 *
 * @example
 * ```html
 * <wc-cb-expression>
 *   <wc-input placeholder="Enter value"></wc-input>
 * </wc-cb-expression>
 * ```
 */
@IndividualComponent
export class CbExpression extends LitElement {
  static styles = [styles];

  /**
   * The list of operator options to display in the operator select.
   * Each item should have at least `label` and `value` properties.
   */
  @property({ type: Array })
  operators: { label: string; value: string; icon?: string }[] = [];

  /** The currently selected operator value. */
  @property({ type: String, attribute: 'operator-value' })
  operatorValue = '';

  render() {
    return html`
      <div class="expression">
        <wc-select
          inline
          .value=${this.operatorValue}
          placeholder="Select Operator"
          .options=${this.operators}
        ></wc-select>
        <slot></slot>
      </div>
    `;
  }
}
