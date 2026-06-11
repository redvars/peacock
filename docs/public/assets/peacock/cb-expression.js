import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';

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

.expression {
  display: flex;
  gap: var(--spacing-100);
  align-items: center;
}`;

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
let CbExpression = class CbExpression extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * The list of operator options to display in the operator select.
         * Each item should have at least `label` and `value` properties.
         */
        this.operators = [];
        /** The currently selected operator value. */
        this.operatorValue = '';
    }
    render() {
        return b `
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
};
CbExpression.styles = [css_248z];
__decorate([
    n({ type: Array })
], CbExpression.prototype, "operators", void 0);
__decorate([
    n({ type: String, attribute: 'operator-value' })
], CbExpression.prototype, "operatorValue", void 0);
CbExpression = __decorate([
    IndividualComponent
], CbExpression);

export { CbExpression };
//# sourceMappingURL=cb-expression.js.map
