import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  display: block;
}

.condition-builder {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-200);
}`;

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
let ConditionBuilder = class ConditionBuilder extends i$1 {
    render() {
        return b `
      <div class="condition-builder">
        <slot></slot>
      </div>
    `;
    }
};
ConditionBuilder.styles = [css_248z];
ConditionBuilder = __decorate([
    IndividualComponent
], ConditionBuilder);

export { ConditionBuilder };
//# sourceMappingURL=condition-builder.js.map
