import { html, LitElement } from 'lit';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './condition-builder.scss';

/**
 * @label Condition Builder
 * @tag wc-condition-builder
 * @rawTag condition-builder
 * @summary A condition builder component that allows users to construct complex filter conditions using a visual rule-based interface with predicates, compound expressions, and logical operators.
 * @tags condition-builder
 *
 * @example
 * ```html
 * <wc-condition-builder>
 *   <wc-cb-predicate condition-operator="or">
 *     <wc-cb-predicate vertical condition-operator="and">
 *       <wc-cb-compound-expression field-label="Age" condition-operator="or">
 *         <wc-cb-expression>
 *           <wc-input inline placeholder="Enter value"></wc-input>
 *         </wc-cb-expression>
 *       </wc-cb-compound-expression>
 *     </wc-cb-predicate>
 *   </wc-cb-predicate>
 * </wc-condition-builder>
 * ```
 */
@IndividualComponent
export class ConditionBuilder extends LitElement {
  static styles = [styles];

  render() {
    return html`
      <div class="condition-builder">
        <slot></slot>
      </div>
    `;
  }
}
